
# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active', 'last_login', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    # The role follows the "Staff status" / "Superuser status" checkboxes:
    # staff or superuser = website admin.
    readonly_fields = ('role',)

    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'avatar'),
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'first_name', 'last_name', 'is_staff', 'avatar'),
        }),
    )


from .models import ActivityLog, SiteSettings


admin.site.site_header = 'ResumeForge administration'
admin.site.site_title = 'ResumeForge Admin'
admin.site.index_title = 'Website management'


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('updated_at', 'user_label', 'action', 'detail', 'type')
    list_filter = ('type',)
    search_fields = ('user_label', 'action', 'detail')
    readonly_fields = [f.name for f in ActivityLog._meta.fields]

    def has_add_permission(self, request):
        return False


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'allow_registration', 'maintenance_mode', 'updated_at')

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
