from datetime import timedelta

import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from graphql_jwt.shortcuts import get_token
from graphql_jwt import relay as jwt_relay
from django.db.models import Q

from .activity import display_name, log_activity
from .models import ActivityLog, SiteSettings

User = get_user_model()


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'avatar',
                  'date_joined', 'last_login', 'is_active', 'is_staff', 'is_superuser')

    created_at = graphene.DateTime()
    cv_count = graphene.Int()

    def resolve_created_at(self, info):
        return self.date_joined

    def resolve_cv_count(self, info):
        return self.cvs.count()


def get_user_from_token(info):
    """Extract user from JWT token in request header."""
    auth_header = info.context.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('JWT '):
        return None
    
    token = auth_header[4:]
    try:
        from graphql_jwt.shortcuts import get_user_by_token
        user = get_user_by_token(token)
        return user if user is not None and user.is_active else None
    except Exception:
        return None


def get_admin_from_token(info):
    user = get_user_from_token(info)
    if user is None or not user.is_active or user.role != 'admin':
        return None
    return user


class UserGrowthPoint(graphene.ObjectType):
    month = graphene.String()
    users = graphene.Int()
    cvs = graphene.Int()


class TemplateUsagePoint(graphene.ObjectType):
    name = graphene.String()
    value = graphene.Int()
    color = graphene.String()


class DailyActivityPoint(graphene.ObjectType):
    day = graphene.String()
    logins = graphene.Int()
    cvs_created = graphene.Int()


class ActivityItem(graphene.ObjectType):
    id = graphene.String()
    user = graphene.String()
    action = graphene.String()
    detail = graphene.String()
    time = graphene.String()
    type = graphene.String()


class DashboardStats(graphene.ObjectType):
    total_users = graphene.Int()
    total_c_vs = graphene.Int(name='totalCVs')
    active_today = graphene.Int()
    published_cvs = graphene.Int()
    user_growth_data = graphene.List(UserGrowthPoint)
    template_usage_data = graphene.List(TemplateUsagePoint)
    daily_activity_data = graphene.List(DailyActivityPoint)
    recent_activity = graphene.List(ActivityItem)


TEMPLATE_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#4b5563']


def _display_name(user):
    name = f'{user.first_name} {user.last_name}'.strip()
    return name or user.email


def _months_back(today, count):
    """First day of each of the last `count` months, oldest first."""
    year, month = today.year, today.month
    months = []
    for _ in range(count):
        months.append(today.replace(year=year, month=month, day=1))
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return list(reversed(months))


def build_dashboard_stats():
    from cv_builder.models import CV

    now = timezone.now()
    today = timezone.localdate()

    # Users and CVs added per month, last 6 months
    months = _months_back(today, 6)
    start = timezone.make_aware(timezone.datetime(months[0].year, months[0].month, 1))
    users_by_month = dict(
        User.objects.filter(date_joined__gte=start)
        .annotate(m=TruncMonth('date_joined')).values('m')
        .annotate(n=Count('id')).values_list('m', 'n')
    )
    cvs_by_month = dict(
        CV.objects.filter(created_at__gte=start)
        .annotate(m=TruncMonth('created_at')).values('m')
        .annotate(n=Count('id')).values_list('m', 'n')
    )
    users_by_month = {k.date() if hasattr(k, 'date') else k: v for k, v in users_by_month.items()}
    cvs_by_month = {k.date() if hasattr(k, 'date') else k: v for k, v in cvs_by_month.items()}
    user_growth = [
        UserGrowthPoint(month=m.strftime('%b'), users=users_by_month.get(m, 0), cvs=cvs_by_month.get(m, 0))
        for m in months
    ]

    # Template usage
    labels = dict(CV.TEMPLATE_CHOICES)
    template_usage = [
        TemplateUsagePoint(
            name=labels.get(row['template_id'], row['template_id']),
            value=row['n'],
            color=TEMPLATE_COLORS[i % len(TEMPLATE_COLORS)],
        )
        for i, row in enumerate(
            CV.objects.values('template_id').annotate(n=Count('id')).order_by('-n')
        )
    ]

    # Last 7 days: users whose most recent login was that day, and CVs created
    week_start = now - timedelta(days=6)
    days = [today - timedelta(days=offset) for offset in range(6, -1, -1)]
    logins = dict(
        User.objects.filter(last_login__gte=week_start)
        .annotate(d=TruncDate('last_login')).values('d')
        .annotate(n=Count('id')).values_list('d', 'n')
    )
    created = dict(
        CV.objects.filter(created_at__gte=week_start)
        .annotate(d=TruncDate('created_at')).values('d')
        .annotate(n=Count('id')).values_list('d', 'n')
    )
    daily_activity = [
        DailyActivityPoint(day=d.strftime('%a'), logins=logins.get(d, 0), cvs_created=created.get(d, 0))
        for d in days
    ]

    # Recent activity from the activity log
    recent = [
        ActivityItem(
            id=str(entry.pk), user=entry.user_label, action=entry.action,
            detail=entry.detail, type=entry.type,
            time=timezone.localtime(entry.updated_at).strftime('%d %b %Y, %H:%M'),
        )
        for entry in ActivityLog.objects.all()[:15]
    ]

    return DashboardStats(
        total_users=User.objects.count(),
        total_c_vs=CV.objects.count(),
        active_today=User.objects.filter(last_login__date=today).count(),
        published_cvs=CV.objects.filter(status='published').count(),
        user_growth_data=user_growth,
        template_usage_data=template_usage,
        daily_activity_data=daily_activity,
        recent_activity=recent,
    )


# ==================== ADMIN MANAGEMENT TYPES ====================

class ActivityLogType(DjangoObjectType):
    class Meta:
        model = ActivityLog
        fields = ('id', 'user_id', 'user_label', 'action', 'detail', 'type', 'cv_id',
                  'created_at', 'updated_at')

    user_id = graphene.ID()
    cv_id = graphene.ID()


class SiteSettingsType(DjangoObjectType):
    class Meta:
        model = SiteSettings
        fields = ('site_name', 'announcement', 'announcement_level', 'allow_registration',
                  'maintenance_mode', 'maintenance_message', 'updated_at')

    announcement_level = graphene.String()


class AdminCVType(graphene.ObjectType):
    id = graphene.ID()
    title = graphene.String()
    status = graphene.String()
    template_id = graphene.String()
    created_at = graphene.DateTime()
    last_modified = graphene.DateTime()
    owner_id = graphene.ID()
    owner_name = graphene.String()
    owner_email = graphene.String()
    full_name = graphene.String()
    headline = graphene.String()
    photo = graphene.String()
    experience_count = graphene.Int()
    education_count = graphene.Int()
    skill_count = graphene.Int()
    certification_count = graphene.Int()
    project_count = graphene.Int()


def _admin_cv(cv):
    info = getattr(cv, 'personal_info', None)
    photo = ''
    if info is not None:
        photo = info.photo_file.url if info.photo_file else (info.photo or '')
    return AdminCVType(
        id=cv.pk, title=cv.title, status=cv.status, template_id=cv.template_id,
        created_at=cv.created_at, last_modified=cv.last_modified,
        owner_id=cv.user_id, owner_name=display_name(cv.user), owner_email=cv.user.email,
        full_name=f"{getattr(info, 'first_name', '')} {getattr(info, 'last_name', '')}".strip(),
        headline=(getattr(info, 'summary', '') or '')[:160],
        photo=photo,
        experience_count=cv.experiences.count(),
        education_count=cv.education.count(),
        skill_count=cv.skills.count(),
        certification_count=cv.certifications.count(),
        project_count=cv.projects.count(),
    )


class Query(graphene.ObjectType):
    viewer = graphene.Field(UserType)
    all_users = graphene.List(UserType)
    dashboard_stats = graphene.Field(DashboardStats)
    activity_log = graphene.List(
        ActivityLogType, limit=graphene.Int(), user_id=graphene.ID(), type=graphene.String(),
        search=graphene.String(),
    )
    admin_cvs = graphene.List(AdminCVType, user_id=graphene.ID(), search=graphene.String())
    site_settings = graphene.Field(SiteSettingsType)

    def resolve_activity_log(self, info, limit=100, user_id=None, type=None, search=None):
        if get_admin_from_token(info) is None:
            return []
        qs = ActivityLog.objects.all()
        if user_id:
            qs = qs.filter(user_id=user_id)
        if type:
            qs = qs.filter(type=type)
        if search:
            qs = qs.filter(Q(user_label__icontains=search) | Q(detail__icontains=search)
                           | Q(action__icontains=search))
        return qs[:max(1, min(limit or 100, 500))]

    def resolve_admin_cvs(self, info, user_id=None, search=None):
        if get_admin_from_token(info) is None:
            return []
        from cv_builder.models import CV
        qs = CV.objects.select_related('user', 'personal_info')
        if user_id:
            qs = qs.filter(user_id=user_id)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(user__email__icontains=search)
                           | Q(user__first_name__icontains=search)
                           | Q(user__last_name__icontains=search))
        return [_admin_cv(cv) for cv in qs[:300]]

    def resolve_site_settings(self, info):
        # Public: the website reads the announcement and sign-up/maintenance flags.
        return SiteSettings.load()

    def resolve_dashboard_stats(self, info):
        if get_admin_from_token(info) is None:
            return None
        return build_dashboard_stats()
    
    def resolve_viewer(self, info):
        user = get_user_from_token(info)
        return user
    
    def resolve_all_users(self, info):
        if get_admin_from_token(info) is None:
            return User.objects.none()
        return User.objects.all()


# ==================== PASSWORD-BASED AUTH ====================

class RegisterUser(graphene.Mutation):
    """Register a new user with email and password (no OTP required)."""
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)
    
    def mutate(self, info, email, password, first_name, last_name):
        email = email.strip().lower()
        try:
            validate_email(email)
        except ValidationError:
            return RegisterUser(success=False, message='Enter a valid email address')

        if len(password) < 6:
            return RegisterUser(success=False, message='Password must be at least 6 characters')

        if not SiteSettings.load().allow_registration:
            return RegisterUser(success=False, message='New sign-ups are currently closed.')

        if User.objects.filter(email__iexact=email).exists():
            return RegisterUser(success=False, message='Email already registered')
        
        user = User(
            email=email,
            username=email,
            first_name=first_name,
            last_name=last_name,
            role='user',
            is_active=True,
        )
        user.set_password(password)
        user.save()
        log_activity(user, 'signed up', user.email, 'auth')

        return RegisterUser(
            success=True,
            message='User registered successfully',
            user=user
        )


class TokenAuth(graphene.Mutation):
    """Login with email and password, returns JWT token."""
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
    
    token = graphene.String()
    payload = graphene.JSONString()
    refresh_expires_in = graphene.Int()
    
    def mutate(self, info, email, password):
        user = User.objects.filter(email__iexact=email.strip()).first()
        if not user:
            return TokenAuth(token=None, payload=None, refresh_expires_in=0)
        
        if not user.check_password(password):
            return TokenAuth(token=None, payload=None, refresh_expires_in=0)
        
        if not user.is_active:
            return TokenAuth(token=None, payload=None, refresh_expires_in=0)

        site = SiteSettings.load()
        if site.maintenance_mode and user.role != 'admin':
            from graphql import GraphQLError
            raise GraphQLError(site.maintenance_message or 'The website is under maintenance.')

        update_last_login(None, user)
        log_activity(user, 'signed in', user.email, 'auth')
        token = get_token(user)
        return TokenAuth(
            token=token,
            payload={'user_id': user.id, 'email': user.email},
            refresh_expires_in=30
        )


# ==================== ADMIN MUTATIONS ====================

class DeleteUser(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, id):
        user = get_admin_from_token(info)
        if user is None:
            return DeleteUser(success=False, message='Permission denied')

        try:
            target_user = User.objects.get(id=id)
            if target_user.pk == user.pk:
                return DeleteUser(success=False, message='You cannot delete your own account here')
            if target_user.role == 'admin':
                return DeleteUser(success=False, message='Cannot delete admin users')
            label = f'{display_name(target_user)} ({target_user.email})'
            target_user.delete()
            log_activity(user, 'deleted a user', label, 'admin')
            return DeleteUser(success=True, message='User deleted successfully')
        except User.DoesNotExist:
            return DeleteUser(success=False, message='User not found')


class UpdateUserRole(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        role = graphene.String(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, id, role):
        user = get_admin_from_token(info)
        if user is None:
            return UpdateUserRole(success=False, message='Permission denied')
        if role not in ('user', 'admin'):
            return UpdateUserRole(success=False, message='Unknown role')

        try:
            target_user = User.objects.get(id=id)
        except User.DoesNotExist:
            return UpdateUserRole(success=False, message='User not found')
        if target_user.pk == user.pk:
            return UpdateUserRole(success=False, message='You cannot change your own role')

        # Website admins are also Django admin superusers (see User.sync_admin_flags).
        is_admin = role == 'admin'
        target_user.role = role
        target_user.is_staff = is_admin
        target_user.is_superuser = is_admin
        target_user.save()
        log_activity(
            user, 'made a user admin' if is_admin else 'removed admin access',
            f'{display_name(target_user)} ({target_user.email})', 'admin',
        )
        return UpdateUserRole(success=True, message='Role updated', user=target_user)


class UpdateUserStatus(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        is_active = graphene.Boolean(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, id, is_active):
        admin_user = get_admin_from_token(info)
        if admin_user is None:
            return UpdateUserStatus(success=False, message='Permission denied')
        try:
            target_user = User.objects.get(pk=id)
        except User.DoesNotExist:
            return UpdateUserStatus(success=False, message='User not found')
        if target_user.pk == admin_user.pk:
            return UpdateUserStatus(success=False, message='You cannot suspend your own account')
        if target_user.is_staff or target_user.is_superuser:
            return UpdateUserStatus(
                success=False,
                message='Change admin access before changing an administrator account status',
            )

        target_user.is_active = is_active
        target_user.save(update_fields=['is_active'])
        message = 'User activated' if is_active else 'User suspended'
        log_activity(admin_user, 'activated a user' if is_active else 'suspended a user',
                     f'{display_name(target_user)} ({target_user.email})', 'admin')
        return UpdateUserStatus(success=True, message=message, user=target_user)


class AdminUpdateUser(graphene.Mutation):
    """Edit a user's name and email."""
    class Arguments:
        id = graphene.ID(required=True)
        first_name = graphene.String()
        last_name = graphene.String()
        email = graphene.String()

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, id, first_name=None, last_name=None, email=None):
        admin = get_admin_from_token(info)
        if admin is None:
            return AdminUpdateUser(success=False, message='Permission denied')
        target = User.objects.filter(pk=id).first()
        if target is None:
            return AdminUpdateUser(success=False, message='User not found')
        if email is not None:
            email = email.strip().lower()
            try:
                validate_email(email)
            except ValidationError:
                return AdminUpdateUser(success=False, message='Enter a valid email address')
            if User.objects.filter(email__iexact=email).exclude(pk=target.pk).exists():
                return AdminUpdateUser(success=False, message='That email is already used')
            target.email = email
            target.username = email
        if first_name is not None:
            target.first_name = first_name.strip()
        if last_name is not None:
            target.last_name = last_name.strip()
        target.save()
        log_activity(admin, 'edited a user', f'{display_name(target)} ({target.email})', 'admin')
        return AdminUpdateUser(success=True, message='User updated', user=target)


class AdminSetCvStatus(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        status = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id, status):
        admin = get_admin_from_token(info)
        if admin is None:
            return AdminSetCvStatus(success=False, message='Permission denied')
        if status not in ('draft', 'published'):
            return AdminSetCvStatus(success=False, message='Unknown status')
        from cv_builder.models import CV
        cv = CV.objects.select_related('user').filter(pk=id).first()
        if cv is None:
            return AdminSetCvStatus(success=False, message='CV not found')
        CV.objects.filter(pk=cv.pk).update(status=status)
        log_activity(admin, 'published a CV' if status == 'published' else 'unpublished a CV',
                     f'{cv.title} (owner: {cv.user.email})', 'admin', cv.pk)
        return AdminSetCvStatus(success=True, message=f'CV set to {status}')


class AdminDeleteCv(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        admin = get_admin_from_token(info)
        if admin is None:
            return AdminDeleteCv(success=False, message='Permission denied')
        from cv_builder.models import CV
        cv = CV.objects.select_related('user').filter(pk=id).first()
        if cv is None:
            return AdminDeleteCv(success=False, message='CV not found')
        label = f'{cv.title} (owner: {cv.user.email})'
        cv.delete()
        log_activity(admin, 'deleted a CV', label, 'admin', int(id))
        return AdminDeleteCv(success=True, message='CV deleted')


class UpdateSiteSettings(graphene.Mutation):
    class Arguments:
        site_name = graphene.String()
        announcement = graphene.String()
        announcement_level = graphene.String()
        allow_registration = graphene.Boolean()
        maintenance_mode = graphene.Boolean()
        maintenance_message = graphene.String()

    success = graphene.Boolean()
    message = graphene.String()
    settings = graphene.Field(SiteSettingsType)

    def mutate(self, info, **changes):
        admin = get_admin_from_token(info)
        if admin is None:
            return UpdateSiteSettings(success=False, message='Permission denied')
        site = SiteSettings.load()
        level = changes.get('announcement_level')
        if level is not None and level not in dict(SiteSettings.ANNOUNCEMENT_LEVELS):
            return UpdateSiteSettings(success=False, message='Unknown announcement level')
        for field, value in changes.items():
            if value is not None:
                setattr(site, field, value.strip() if isinstance(value, str) else value)
        site.save()
        log_activity(admin, 'updated website settings', ', '.join(sorted(changes)), 'admin')
        return UpdateSiteSettings(success=True, message='Website settings saved', settings=site)


# ==================== ROOT MUTATION ====================

class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    token_auth = TokenAuth.Field()
    # JWT
    verify_token = jwt_relay.Verify.Field()
    refresh_token = jwt_relay.Refresh.Field()
    # Admin
    delete_user = DeleteUser.Field()
    update_user_role = UpdateUserRole.Field()
    admin_update_user = AdminUpdateUser.Field()
    admin_set_cv_status = AdminSetCvStatus.Field()
    admin_delete_cv = AdminDeleteCv.Field()
    update_site_settings = UpdateSiteSettings.Field()
    update_user_status = UpdateUserStatus.Field()
