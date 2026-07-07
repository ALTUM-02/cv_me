from django.db import models
from django.conf import settings
import json


class CV(models.Model):
    """Main CV/Resume document."""
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )
    
    TEMPLATE_CHOICES = (
        ('modern', 'Modern'),
        ('classic', 'Classic'),
        ('minimal', 'Minimal'),
        ('creative', 'Creative'),
        ('professional', 'Professional'),
        ('executive', 'Executive'),
        ('tech', 'Tech'),
        ('academic', 'Academic'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cvs')
    title = models.CharField(max_length=255, default='Untitled CV')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    template_id = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='modern')
    last_modified = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-last_modified']
    
    def __str__(self):
        return f"{self.title} ({self.user.email})"


class PersonalInfo(models.Model):
    """Personal information for a CV."""
    
    cv = models.OneToOneField(CV, on_delete=models.CASCADE, related_name='personal_info')
    first_name = models.CharField(max_length=100, blank=True, default='')
    last_name = models.CharField(max_length=100, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    postal_code = models.CharField(max_length=20, blank=True, default='')
    linkedin_url = models.URLField(max_length=500, blank=True, default='')
    portfolio_url = models.URLField(max_length=500, blank=True, default='')
    summary = models.TextField(blank=True, default='')
    photo = models.URLField(max_length=500, blank=True, null=True)
    
    class Meta:
        verbose_name_plural = 'Personal Info'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Experience(models.Model):
    """Work experience entry."""
    
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=200, blank=True, default='')
    position = models.CharField(max_length=200, blank=True, default='')
    location = models.CharField(max_length=200, blank=True, default='')
    start_date = models.CharField(max_length=20, blank=True, default='')
    end_date = models.CharField(max_length=20, blank=True, default='')
    current = models.BooleanField(default=False)
    description = models.TextField(blank=True, default='')
    highlights = models.JSONField(default=list, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Experiences'
    
    def __str__(self):
        return f"{self.position} at {self.company}"


class Education(models.Model):
    """Education entry."""
    
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='education')
    institution = models.CharField(max_length=200, blank=True, default='')
    degree = models.CharField(max_length=200, blank=True, default='')
    field = models.CharField(max_length=200, blank=True, default='')
    start_date = models.CharField(max_length=20, blank=True, default='')
    end_date = models.CharField(max_length=20, blank=True, default='')
    gpa = models.CharField(max_length=10, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Education'
    
    def __str__(self):
        return f"{self.degree} in {self.field} - {self.institution}"


class Skill(models.Model):
    """Skill entry."""
    
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100, blank=True, default='')
    level = models.IntegerField(default=50)
    category = models.CharField(max_length=100, blank=True, default='Technical')
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.name} ({self.level}%)"


class Language(models.Model):
    """Language proficiency entry."""
    
    PROFICIENCY_CHOICES = (
        ('native', 'Native'),
        ('fluent', 'Fluent'),
        ('advanced', 'Advanced'),
        ('intermediate', 'Intermediate'),
        ('basic', 'Basic'),
    )
    
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='languages')
    name = models.CharField(max_length=100, blank=True, default='')
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='intermediate')
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Languages'
    
    def __str__(self):
        return f"{self.name} - {self.proficiency}"


class Certification(models.Model):
    """Certification entry."""
    
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200, blank=True, default='')
    issuer = models.CharField(max_length=200, blank=True, default='')
    date = models.CharField(max_length=20, blank=True, default='')
    url = models.URLField(max_length=500, blank=True, null=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Certifications'
    
    def __str__(self):
        return f"{self.name} - {self.issuer}"


class Project(models.Model):
    """Project entry."""
    
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200, blank=True, default='')
    description = models.TextField(blank=True, default='')
    url = models.URLField(max_length=500, blank=True, null=True)
    technologies = models.JSONField(default=list, blank=True)
    highlights = models.JSONField(default=list, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.name


class Customization(models.Model):
    """CV customization settings."""
    
    cv = models.OneToOneField(CV, on_delete=models.CASCADE, related_name='customization')
    template_id = models.CharField(max_length=20, default='modern')
    
    # Colors
    color_primary = models.CharField(max_length=7, default='#2563eb')
    color_secondary = models.CharField(max_length=7, default='#1e40af')
    color_accent = models.CharField(max_length=7, default='#3b82f6')
    color_text = models.CharField(max_length=7, default='#1f2937')
    color_background = models.CharField(max_length=7, default='#ffffff')
    
    # Fonts
    font_heading = models.CharField(max_length=100, default='Playfair Display')
    font_body = models.CharField(max_length=100, default='Source Sans Pro')
    
    # Font sizes
    font_size_heading = models.IntegerField(default=24)
    font_size_body = models.IntegerField(default=14)
    
    # Spacing
    spacing_section_gap = models.IntegerField(default=24)
    spacing_element_gap = models.IntegerField(default=12)
    
    # Photo settings
    show_photo = models.BooleanField(default=False)
    photo_shape = models.CharField(max_length=20, default='circle')
    
    # Text settings
    text_direction = models.CharField(max_length=3, default='ltr')
    font_style = models.CharField(max_length=20, default='normal')
    
    class Meta:
        verbose_name_plural = 'Customizations'
    
    def __str__(self):
        return f"Customization for {self.cv.title}"


class QRConfig(models.Model):
    """QR Code configuration for CV."""
    
    STYLE_CHOICES = (
        ('square', 'Square'),
        ('dots', 'Dots'),
        ('rounded', 'Rounded'),
    )
    
    cv = models.OneToOneField(CV, on_delete=models.CASCADE, related_name='qr_config')
    enabled = models.BooleanField(default=False)
    url = models.URLField(max_length=500, blank=True, default='')
    size = models.IntegerField(default=120)
    style = models.CharField(max_length=20, choices=STYLE_CHOICES, default='square')
    
    def __str__(self):
        return f"QR Config for {self.cv.title}"
