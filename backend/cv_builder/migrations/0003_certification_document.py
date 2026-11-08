from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cv_builder', '0002_alter_certification_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='certification',
            name='document',
            field=models.FileField(blank=True, null=True, upload_to='certificates/%Y/%m/'),
        ),
    ]
