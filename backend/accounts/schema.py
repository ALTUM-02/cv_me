import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
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
    register_user = RegisterUser.Field()
    token_auth = TokenAuth.Field()
    # JWT
    verify_token = jwt_relay.Verify.Field()
    refresh_token = jwt_relay.Refresh.Field()
    # Admin
    delete_user = DeleteUser.Field()
    update_user_role = UpdateUserRole.Field()
