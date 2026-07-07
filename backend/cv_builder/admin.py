# Register your models here.
from django.contrib import admin
from .models import (
    CV, PersonalInfo, Experience, Education, Skill, 
    Language, Certification, Project, Customization, QRConfig
)


class PersonalInfoInline(admin.StackedInline):
    model = PersonalInfo
    extra = 0


class ExperienceInline(admin.TabularInline):
    model = Experience
    extra = 0


class EducationInline(admin.TabularInline):
    model = Education
    extra = 0


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 0


class LanguageInline(admin.TabularInline):
    model = Language
    extra = 0


class CertificationInline(admin.TabularInline):
    model = Certification
    extra = 0


class ProjectInline(admin.TabularInline):
    model = Project
    extra = 0


class CustomizationInline(admin.StackedInline):
    model = Customization
    extra = 0


class QRConfigInline(admin.StackedInline):
    model = QRConfig
    extra = 0


@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'template_id', 'last_modified', 'created_at')
    list_filter = ('status', 'template_id', 'created_at')
    search_fields = ('title', 'user__email', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)
    inlines = [
        PersonalInfoInline, ExperienceInline, EducationInline, SkillInline,
        LanguageInline, CertificationInline, ProjectInline,
        CustomizationInline, QRConfigInline
    ]
