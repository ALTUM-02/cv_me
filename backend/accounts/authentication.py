from graphql_jwt.backends import JSONWebTokenBackend
from graphql_jwt.mixins import JSONWebTokenMixin
from django.contrib.auth import get_user_model
from graphql_jwt.settings import jwt_settings
from graphql_jwt.shortcuts import get_user_by_token

User = get_user_model()


class JWTAuthentication:
    """Custom JWT authentication for GraphQL."""
    
    def __init__(self, context):
        self.context = context
    
    def authenticate(self):
        """Authenticate the user from the JWT token in the request header."""
        auth_header = self.context.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('JWT '):
            return None
        
        token = auth_header[4:]  # Remove 'JWT ' prefix
        
        try:
            user = get_user_by_token(token)
            return user
        except Exception:
            return None
    
    def authenticate_by_token(self, token):
        """Authenticate user by token string."""
        try:
            return get_user_by_token(token)
        except Exception:
            return None
