from django.conf import settings
from django.db import models


class CV(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cvs')
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    template_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.title} ({self.user.email})'


class PersonalInfo(models.Model):
    cv = models.OneToOneField(CV, on_delete=models.CASCADE, related_name='personal_info')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    summary = models.TextField(blank=True)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'


class Experience(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    start_date = models.CharField(max_length=20)
    end_date = models.CharField(max_length=20, blank=True)
    current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    highlights = models.JSONField(default=list, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.position} at {self.company}'


class Education(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='education')
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field = models.CharField(max_length=255)
    start_date = models.CharField(max_length=20)
    end_date = models.CharField(max_length=20, blank=True)
    gpa = models.CharField(max_length=10, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.degree} at {self.institution}'


class Skill(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=255)
    level = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Language(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='languages')
    name = models.CharField(max_length=100)
    proficiency = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Certification(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255, blank=True)
    date = models.CharField(max_length=20, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Project(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    url = models.URLField(blank=True)
    technologies = models.JSONField(default=list, blank=True)
    highlights = models.JSONField(default=list, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Customization(models.Model):
    cv = models.OneToOneField(CV, on_delete=models.CASCADE, related_name='customization')
    template_id = models.CharField(max_length=100, blank=True)
    color_primary = models.CharField(max_length=20, blank=True)
    color_secondary = models.CharField(max_length=20, blank=True)
    color_accent = models.CharField(max_length=20, blank=True)
    color_text = models.CharField(max_length=20, blank=True)
    color_background = models.CharField(max_length=20, blank=True)
    font_heading = models.CharField(max_length=100, blank=True)
    font_body = models.CharField(max_length=100, blank=True)
    font_size_heading = models.PositiveIntegerField(default=24)
    font_size_body = models.PositiveIntegerField(default=14)
    spacing_section_gap = models.PositiveIntegerField(default=24)
    spacing_element_gap = models.PositiveIntegerField(default=12)
    show_photo = models.BooleanField(default=False)
    photo_shape = models.CharField(max_length=50, blank=True)
    text_direction = models.CharField(max_length=10, default='ltr')
    font_style = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f'Customization for {self.cv.title}'


class QRConfig(models.Model):
    cv = models.OneToOneField(CV, on_delete=models.CASCADE, related_name='qr_config')
    enabled = models.BooleanField(default=False)
    url = models.URLField(blank=True)
    size = models.PositiveIntegerField(default=120)
    style = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f'QR config for {self.cv.title}'
