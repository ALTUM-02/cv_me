from django.db import migrations


def sync_admin_flags(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    for user in User.objects.all():
        is_admin = user.role == 'admin' or user.is_staff or user.is_superuser
        if is_admin and not (user.role == 'admin' and user.is_staff and user.is_superuser):
            user.role = 'admin'
            user.is_staff = True
            user.is_superuser = True
            user.save(update_fields=['role', 'is_staff', 'is_superuser'])


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0002_remove_otp_verification'),
    ]

    operations = [
        migrations.RunPython(sync_admin_flags, migrations.RunPython.noop),
    ]
