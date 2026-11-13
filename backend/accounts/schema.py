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
        return get_user_by_token(token)
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

    # Recent activity: newest sign-ups and CVs
    events = []
    for u in User.objects.order_by('-date_joined')[:10]:
        events.append((u.date_joined, ActivityItem(
            id=f'user-{u.pk}', user=_display_name(u), action='joined ResumeForge',
            detail=u.email, type='auth',
        )))
    for cv in CV.objects.select_related('user').order_by('-created_at')[:10]:
        events.append((cv.created_at, ActivityItem(
            id=f'cv-{cv.pk}', user=_display_name(cv.user),
            action='published a CV' if cv.status == 'published' else 'created a CV',
            detail=f'{cv.title} ({labels.get(cv.template_id, cv.template_id)} template)',
            type='publish' if cv.status == 'published' else 'create',
        )))
    events.sort(key=lambda e: e[0], reverse=True)
    recent = []
    for when, item in events[:15]:
        item.time = timezone.localtime(when).strftime('%d %b %Y, %H:%M')
        recent.append(item)

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


class Query(graphene.ObjectType):
    viewer = graphene.Field(UserType)
    all_users = graphene.List(UserType)
    dashboard_stats = graphene.Field(DashboardStats)

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
        
        update_last_login(None, user)
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
            target_user.delete()
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
        return UpdateUserRole(success=True, message='Role updated', user=target_user)


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
