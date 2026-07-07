from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import secrets
import datetime


class User(AbstractUser):
    """Custom User model for ResumeForge."""
    
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    avatar = models.URLField(max_length=500, blank=True, null=True)
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class OtpCode(models.Model):
    """OTP code for email-based authentication."""
    
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'OTP code'
        verbose_name_plural = 'OTP codes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.email}: {self.code}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @classmethod
    def generate_for_email(cls, email):
        """Generate a new OTP code for the given email, invalidating any previous ones."""
        # Invalidate previous unused OTPs for this email
        cls.objects.filter(email=email, is_used=False).update(is_used=True)
        
        code = f"{secrets.randbelow(900000) + 100000}"
        expires_at = timezone.now() + datetime.timedelta(minutes=10)
        
        return cls.objects.create(
            email=email,
            code=code,
            expires_at=expires_at,
        )
