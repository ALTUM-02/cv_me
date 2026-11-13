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


class ActivityLog(models.Model):
    """Everything users (and admins) do on the website, shown on the admin dashboard."""

    TYPE_CHOICES = (
        ('auth', 'Sign in / sign up'),
        ('create', 'Created'),
        ('edit', 'Edited'),
        ('publish', 'Published'),
        ('delete', 'Deleted'),
        ('upload', 'Upload'),
        ('admin', 'Admin action'),
    )

    # Plain ids (not foreign keys) so the history survives when users or CVs are deleted.
    user_id = models.IntegerField(null=True, blank=True, db_index=True)
    user_label = models.CharField(max_length=255, blank=True)
    action = models.CharField(max_length=255)
    detail = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='edit', db_index=True)
    cv_id = models.IntegerField(null=True, blank=True)
    sections = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'activity log entry'
        verbose_name_plural = 'activity log'

    def __str__(self):
        return f'{self.user_label} {self.action}'


class SiteSettings(models.Model):
    """Website-wide settings that admins manage from the dashboard (single row)."""

    ANNOUNCEMENT_LEVELS = (('info', 'Info'), ('success', 'Success'), ('warning', 'Warning'))

    site_name = models.CharField(max_length=100, default='ResumeForge')
    announcement = models.TextField(blank=True)
    announcement_level = models.CharField(max_length=10, choices=ANNOUNCEMENT_LEVELS, default='info')
    allow_registration = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(
        default=False, help_text='When on, only admins can sign in.'
    )
    maintenance_message = models.CharField(
        max_length=255, blank=True,
        default='The website is under maintenance. Please try again later.',
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'site settings'
        verbose_name_plural = 'site settings'

    def __str__(self):
        return 'Site settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
