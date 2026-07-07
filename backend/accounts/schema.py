import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model
from graphql_jwt.shortcuts import get_token
from graphql_jwt import relay as jwt_relay

User = get_user_model()


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'avatar', 
                  'date_joined', 'last_login', 'is_active')


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


class Query(graphene.ObjectType):
    viewer = graphene.Field(UserType)
    all_users = graphene.List(UserType)
    
    def resolve_viewer(self, info):
        user = get_user_from_token(info)
        return user
    
    def resolve_all_users(self, info):
        user = get_user_from_token(info)
        if not user or user.role != 'admin':
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
        if User.objects.filter(email=email).exists():
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
        user = User.objects.filter(email=email).first()
        if not user:
            return TokenAuth(token=None, payload=None, refresh_expires_in=0)
        
        if not user.check_password(password):
            return TokenAuth(token=None, payload=None, refresh_expires_in=0)
        
        if not user.is_active:
            return TokenAuth(token=None, payload=None, refresh_expires_in=0)
        
        token = get_token(user)
        return TokenAuth(
            token=token,
            payload={'user_id': user.id, 'email': user.email},
            refresh_expires_in=30
        )


# ==================== OTP-BASED AUTH ====================

class SendOtp(graphene.Mutation):
    """Store an OTP code for the given email. 
    The frontend generates the OTP, sends it via email, and stores it here for verification."""
    class Arguments:
        email = graphene.String(required=True)
        code = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, email, code):
        from accounts.models import OtpCode
        
        # Invalidate previous unused OTPs for this email
        OtpCode.objects.filter(email=email, is_used=False).update(is_used=True)
        
        from django.utils import timezone
        import datetime
        
        expires_at = timezone.now() + datetime.timedelta(minutes=10)
        
        OtpCode.objects.create(
            email=email,
            code=code,
            expires_at=expires_at,
        )
        
        return SendOtp(success=True, message='OTP stored successfully')


class VerifyOtp(graphene.Mutation):
    """Verify OTP and return JWT token for existing users (login via OTP)."""
    class Arguments:
        email = graphene.String(required=True)
        code = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, email, code):
        from accounts.models import OtpCode
        otp = OtpCode.objects.filter(
            email=email, code=code, is_used=False
        ).order_by('-created_at').first()

        if not otp:
            return VerifyOtp(success=False, message='Invalid or expired OTP')

        if otp.is_expired():
            otp.is_used = True
            otp.save()
            return VerifyOtp(success=False, message='OTP has expired')

        # Mark OTP as used
        otp.is_used = True
        otp.save()

        # Get or create user
        user = User.objects.filter(email=email).first()
        if not user:
            return VerifyOtp(success=False, message='No account found. Please register first.')

        token = get_token(user)
        return VerifyOtp(success=True, message='Login successful', token=token, user=user)


class RegisterWithOtp(graphene.Mutation):
    """Register a new user after OTP verification. Creates account with password."""
    class Arguments:
        email = graphene.String(required=True)
        code = graphene.String(required=True)
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, email, code, first_name, last_name, password):
        from accounts.models import OtpCode

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return RegisterWithOtp(success=False, message='Email already registered')

        # Verify OTP
        otp = OtpCode.objects.filter(
            email=email, code=code, is_used=False
        ).order_by('-created_at').first()

        if not otp:
            return RegisterWithOtp(success=False, message='Invalid or expired OTP')

        if otp.is_expired():
            otp.is_used = True
            otp.save()
            return RegisterWithOtp(success=False, message='OTP has expired')

        # Mark OTP as used
        otp.is_used = True
        otp.save()

        # Create user with password
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

        token = get_token(user)
        return RegisterWithOtp(
            success=True,
            message='Registration successful',
            token=token,
            user=user,
        )


# ==================== ADMIN MUTATIONS ====================

class DeleteUser(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, id):
        user = info.context.user
        if not user.is_authenticated or user.role != 'admin':
            return DeleteUser(success=False, message='Permission denied')
        
        try:
            target_user = User.objects.get(id=id)
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
    user = graphene.Field(UserType)
    
    def mutate(self, info, id, role):
        user = info.context.user
        if not user.is_authenticated or user.role != 'admin':
            return UpdateUserRole(success=False)
        
        try:
            target_user = User.objects.get(id=id)
            target_user.role = role
            target_user.save()
            return UpdateUserRole(success=True, user=target_user)
        except User.DoesNotExist:
            return UpdateUserRole(success=False)


# ==================== ROOT MUTATION ====================

class Mutation(graphene.ObjectType):
    # Password-based
    register_user = RegisterUser.Field()
    token_auth = TokenAuth.Field()
    # OTP-based
    send_otp = SendOtp.Field()
    verify_otp = VerifyOtp.Field()
    register_with_otp = RegisterWithOtp.Field()
    # JWT
    verify_token = jwt_relay.Verify.Field()
    refresh_token = jwt_relay.Refresh.Field()
    # Admin
    delete_user = DeleteUser.Field()
    update_user_role = UpdateUserRole.Field()
