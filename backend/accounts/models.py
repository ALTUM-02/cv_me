from django.contrib.auth.models import AbstractUser
from django.db import models


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
    
    def sync_admin_flags(self):
        """Keep the website role and Django admin access in step.

        Django staff/superusers are admins on the website, and website admins
        can sign in to the Django admin site (/admin/).
        """
        if self.is_superuser or self.is_staff:
            self.role = 'admin'
        if self.role == 'admin':
            self.is_staff = True
            self.is_superuser = True

    def save(self, *args, **kwargs):
        self.sync_admin_flags()
        update_fields = kwargs.get('update_fields')
        if update_fields is not None:
            kwargs['update_fields'] = set(update_fields) | {'role', 'is_staff', 'is_superuser'}
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
