from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cv_builder', '0003_certification_document'),
    ]

    operations = [
        migrations.AddField(
            model_name='personalinfo',
            name='photo_file',
            field=models.FileField(
                blank=True,
                null=True,
                upload_to='profile-photos/%Y/%m/',
            ),
        ),
    ]
