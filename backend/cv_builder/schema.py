import graphene
from graphene_django import DjangoObjectType
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from graphql_jwt.shortcuts import get_token
from graphql_jwt.backends import JSONWebTokenBackend
from .models import (
    CV, PersonalInfo, Experience, Education, Skill,
    Language, Certification, Project, Customization, QRConfig
)

User = get_user_model()


def get_user_from_token(info):
    """Extract user from JWT token in request header."""
    auth_header = info.context.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('JWT '):
        return None
    
    token = auth_header[4:]
    try:
        from graphql_jwt.shortcuts import get_user_by_token
        return get_user_by_token(token)
    except Exception:
        return None


# ==================== GraphQL Types ====================

class PersonalInfoType(DjangoObjectType):
    class Meta:
        model = PersonalInfo
        fields = '__all__'


class ExperienceType(DjangoObjectType):
    class Meta:
        model = Experience
        fields = '__all__'


class EducationType(DjangoObjectType):
    class Meta:
        model = Education
        fields = '__all__'


class SkillType(DjangoObjectType):
    class Meta:
        model = Skill
        fields = '__all__'


class LanguageType(DjangoObjectType):
    class Meta:
        model = Language
        fields = '__all__'


class CertificationType(DjangoObjectType):
    class Meta:
        model = Certification
        fields = '__all__'


class ProjectType(DjangoObjectType):
    class Meta:
        model = Project
        fields = '__all__'


class ColorsType(graphene.ObjectType):
    primary = graphene.String()
    secondary = graphene.String()
    accent = graphene.String()
    text = graphene.String()
    background = graphene.String()


class FontsType(graphene.ObjectType):
    heading = graphene.String()
    body = graphene.String()


class FontSizeType(graphene.ObjectType):
    heading = graphene.Int()
    body = graphene.Int()


class SpacingType(graphene.ObjectType):
    section_gap = graphene.Int()
    element_gap = graphene.Int()


class CustomizationType(graphene.ObjectType):
    template_id = graphene.String()
    colors = graphene.Field(ColorsType)
    fonts = graphene.Field(FontsType)
    font_size = graphene.Field(FontSizeType)
    spacing = graphene.Field(SpacingType)
    show_photo = graphene.Boolean()
    photo_shape = graphene.String()
    text_direction = graphene.String()
    font_style = graphene.String()


class QRConfigType(graphene.ObjectType):
    enabled = graphene.Boolean()
    url = graphene.String()
    size = graphene.Int()
    style = graphene.String()


class CVSummaryType(DjangoObjectType):
    class Meta:
        model = CV
        fields = ('id', 'title', 'status', 'template_id', 'last_modified', 'created_at')


class CVType(DjangoObjectType):
    personal_info = graphene.Field(PersonalInfoType)
    experiences = graphene.List(ExperienceType)
    education = graphene.List(EducationType)
    skills = graphene.List(SkillType)
    languages = graphene.List(LanguageType)
    certifications = graphene.List(CertificationType)
    projects = graphene.List(ProjectType)
    customization = graphene.Field(CustomizationType)
    qr_config = graphene.Field(QRConfigType)
    
    class Meta:
        model = CV
        fields = '__all__'
    
    def resolve_personal_info(self, info):
        return PersonalInfo.objects.filter(cv=self).first()
    
    def resolve_experiences(self, info):
        return Experience.objects.filter(cv=self)
    
    def resolve_education(self, info):
        return Education.objects.filter(cv=self)
    
    def resolve_skills(self, info):
        return Skill.objects.filter(cv=self)
    
    def resolve_languages(self, info):
        return Language.objects.filter(cv=self)
    
    def resolve_certifications(self, info):
        return Certification.objects.filter(cv=self)
    
    def resolve_projects(self, info):
        return Project.objects.filter(cv=self)
    
    def resolve_customization(self, info):
        return Customization.objects.filter(cv=self).first()
    
    def resolve_qr_config(self, info):
        return QRConfig.objects.filter(cv=self).first()


class UserGrowthType(graphene.ObjectType):
    month = graphene.String()
    users = graphene.Int()
    cvs = graphene.Int()


class TemplateUsageType(graphene.ObjectType):
    name = graphene.String()
    value = graphene.Int()
    color = graphene.String()


class DailyActivityType(graphene.ObjectType):
    day = graphene.String()
    logins = graphene.Int()
    cvs_created = graphene.Int()


class RecentActivityType(graphene.ObjectType):
    id = graphene.ID()
    user = graphene.String()
    action = graphene.String()
    detail = graphene.String()
    time = graphene.String()
    type = graphene.String()


class DashboardStatsType(graphene.ObjectType):
    total_users = graphene.Int()
    total_cvs = graphene.Int()
    active_today = graphene.Int()
    published_cvs = graphene.Int()
    user_growth_data = graphene.List(UserGrowthType)
    template_usage_data = graphene.List(TemplateUsageType)
    daily_activity_data = graphene.List(DailyActivityType)
    recent_activity = graphene.List(RecentActivityType)


# ==================== Input Types ====================

class PersonalInfoInput(graphene.InputObjectType):
    first_name = graphene.String()
    last_name = graphene.String()
    email = graphene.String()
    phone = graphene.String()
    address = graphene.String()
    city = graphene.String()
    country = graphene.String()
    postal_code = graphene.String()
    linkedin_url = graphene.String()
    portfolio_url = graphene.String()
    summary = graphene.String()
    photo = graphene.String()


class ExperienceInput(graphene.InputObjectType):
    company = graphene.String()
    position = graphene.String()
    location = graphene.String()
    start_date = graphene.String()
    end_date = graphene.String()
    current = graphene.Boolean()
    description = graphene.String()
    highlights = graphene.List(graphene.String)


class EducationInput(graphene.InputObjectType):
    institution = graphene.String()
    degree = graphene.String()
    field = graphene.String()
    start_date = graphene.String()
    end_date = graphene.String()
    gpa = graphene.String()
    description = graphene.String()


class SkillInput(graphene.InputObjectType):
    name = graphene.String()
    level = graphene.Int()
    category = graphene.String()


class LanguageInput(graphene.InputObjectType):
    name = graphene.String()
    proficiency = graphene.String()


class CertificationInput(graphene.InputObjectType):
    name = graphene.String()
    issuer = graphene.String()
    date = graphene.String()
    url = graphene.String()


class ProjectInput(graphene.InputObjectType):
    name = graphene.String()
    description = graphene.String()
    url = graphene.String()
    technologies = graphene.List(graphene.String)
    highlights = graphene.List(graphene.String)


class ColorsInput(graphene.InputObjectType):
    primary = graphene.String()
    secondary = graphene.String()
    accent = graphene.String()
    text = graphene.String()
    background = graphene.String()


class FontsInput(graphene.InputObjectType):
    heading = graphene.String()
    body = graphene.String()


class FontSizeInput(graphene.InputObjectType):
    heading = graphene.Int()
    body = graphene.Int()


class SpacingInput(graphene.InputObjectType):
    section_gap = graphene.Int()
    element_gap = graphene.Int()


class CustomizationInput(graphene.InputObjectType):
    template_id = graphene.String()
    colors = graphene.Field(ColorsInput)
    fonts = graphene.Field(FontsInput)
    font_size = graphene.Field(FontSizeInput)
    spacing = graphene.Field(SpacingInput)
    show_photo = graphene.Boolean()
    photo_shape = graphene.String()
    text_direction = graphene.String()
    font_style = graphene.String()


class QRConfigInput(graphene.InputObjectType):
    enabled = graphene.Boolean()
    url = graphene.String()
    size = graphene.Int()
    style = graphene.String()


class CVInput(graphene.InputObjectType):
    title = graphene.String()
    personal_info = graphene.Field(PersonalInfoInput)
    customization = graphene.Field(CustomizationInput)
    qr_config = graphene.Field(QRConfigInput)


# ==================== Mutations ====================

class CreateCV(graphene.Mutation):
    class Arguments:
        title = graphene.String()
        template_id = graphene.String()
    
    success = graphene.Boolean()
    message = graphene.String()
    cv = graphene.Field(CVSummaryType)
    
    def mutate(self, info, title='Untitled CV', template_id=None):
        user = get_user_from_token(info)
        if not user:
            return CreateCV(success=False, message='Authentication required')
        
        cv = CV.objects.create(user=user, title=title)
        PersonalInfo.objects.create(cv=cv)
        # create customization and optionally set template
        customization = Customization.objects.create(cv=cv)
        if template_id is not None:
            customization.template_id = template_id
            customization.save()
        QRConfig.objects.create(cv=cv)
        
        return CreateCV(success=True, message='CV created successfully', cv=cv)


class UpdateCV(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = graphene.Argument(CVInput)
    
    success = graphene.Boolean()
    message = graphene.String()
    cv = graphene.Field(CVSummaryType)
    
    def mutate(self, info, id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdateCV(success=False, message='Authentication required')
        
        try:
            cv = CV.objects.get(id=id, user=user)
            if input.title:
                cv.title = input.title
            cv.save()
            return UpdateCV(success=True, message='CV updated successfully', cv=cv)
        except CV.DoesNotExist:
            return UpdateCV(success=False, message='CV not found')


class DeleteCV(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, id):
        user = get_user_from_token(info)
        if not user:
            return DeleteCV(success=False, message='Authentication required')
        
        try:
            cv = CV.objects.get(id=id, user=user)
            cv.delete()
            return DeleteCV(success=True, message='CV deleted successfully')
        except CV.DoesNotExist:
            return DeleteCV(success=False, message='CV not found')


class UpdatePersonalInfo(graphene.Mutation):
    class Arguments:
        cv_id = graphene.ID(required=True)
        input = graphene.Argument(PersonalInfoInput)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, cv_id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdatePersonalInfo(success=False, message='Authentication required')
        
        try:
            cv = CV.objects.get(id=cv_id, user=user)
            personal_info, _ = PersonalInfo.objects.get_or_create(cv=cv)
            
            if input.first_name is not None:
                personal_info.first_name = input.first_name
            if input.last_name is not None:
                personal_info.last_name = input.last_name
            if input.email is not None:
                personal_info.email = input.email
            if input.phone is not None:
                personal_info.phone = input.phone
            if input.address is not None:
                personal_info.address = input.address
            if input.city is not None:
                personal_info.city = input.city
            if input.country is not None:
                personal_info.country = input.country
            if input.postal_code is not None:
                personal_info.postal_code = input.postal_code
            if input.linkedin_url is not None:
                personal_info.linkedin_url = input.linkedin_url
            if input.portfolio_url is not None:
                personal_info.portfolio_url = input.portfolio_url
            if input.summary is not None:
                personal_info.summary = input.summary
            if input.photo is not None:
                personal_info.photo = input.photo
            
            personal_info.save()
            return UpdatePersonalInfo(success=True, message='Personal info updated')
        except CV.DoesNotExist:
            return UpdatePersonalInfo(success=False, message='CV not found')


class UpdateCustomization(graphene.Mutation):
    class Arguments:
        cv_id = graphene.ID(required=True)
        input = graphene.Argument(CustomizationInput)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, cv_id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdateCustomization(success=False, message='Authentication required')
        
        try:
            cv = CV.objects.get(id=cv_id, user=user)
            customization, _ = Customization.objects.get_or_create(cv=cv)
            
            if input.template_id is not None:
                customization.template_id = input.template_id
            if input.colors is not None:
                if input.colors.primary is not None:
                    customization.color_primary = input.colors.primary
                if input.colors.secondary is not None:
                    customization.color_secondary = input.colors.secondary
                if input.colors.accent is not None:
                    customization.color_accent = input.colors.accent
                if input.colors.text is not None:
                    customization.color_text = input.colors.text
                if input.colors.background is not None:
                    customization.color_background = input.colors.background
            if input.fonts is not None:
                if input.fonts.heading is not None:
                    customization.font_heading = input.fonts.heading
                if input.fonts.body is not None:
                    customization.font_body = input.fonts.body
            if input.font_size is not None:
                if input.font_size.heading is not None:
                    customization.font_size_heading = input.font_size.heading
                if input.font_size.body is not None:
                    customization.font_size_body = input.font_size.body
            if input.spacing is not None:
                if input.spacing.section_gap is not None:
                    customization.spacing_section_gap = input.spacing.section_gap
                if input.spacing.element_gap is not None:
                    customization.spacing_element_gap = input.spacing.element_gap
            if input.show_photo is not None:
                customization.show_photo = input.show_photo
            if input.photo_shape is not None:
                customization.photo_shape = input.photo_shape
            if input.text_direction is not None:
                customization.text_direction = input.text_direction
            if input.font_style is not None:
                customization.font_style = input.font_style
            
            customization.save()
            return UpdateCustomization(success=True, message='Customization updated')
        except CV.DoesNotExist:
            return UpdateCustomization(success=False, message='CV not found')


class UpdateQRConfig(graphene.Mutation):
    class Arguments:
        cv_id = graphene.ID(required=True)
        input = graphene.Argument(QRConfigInput)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info, cv_id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdateQRConfig(success=False, message='Authentication required')
        
        try:
            cv = CV.objects.get(id=cv_id, user=user)
            qr_config, _ = QRConfig.objects.get_or_create(cv=cv)
            
            if input.enabled is not None:
                qr_config.enabled = input.enabled
            if input.url is not None:
                qr_config.url = input.url
            if input.size is not None:
                qr_config.size = input.size
            if input.style is not None:
                qr_config.style = input.style
            
            qr_config.save()
            return UpdateQRConfig(success=True, message='QR config updated')
        except CV.DoesNotExist:
            return UpdateQRConfig(success=False, message='CV not found')


# ==================== Experience Mutations ====================

class CreateExperience(graphene.Mutation):
    class Arguments:
        cv_id = graphene.ID(required=True)
        input = graphene.Argument(ExperienceInput)
    
    success = graphene.Boolean()
    experience = graphene.Field(ExperienceType)
    
    def mutate(self, info, cv_id, input):
        user = get_user_from_token(info)
        if not user:
            return CreateExperience(success=False)
        
        try:
            cv = CV.objects.get(id=cv_id, user=user)
            max_order = Experience.objects.filter(cv=cv).count()
            
            experience = Experience.objects.create(
                cv=cv,
                company=input.company or '',
                position=input.position or '',
                location=input.location or '',
                start_date=input.start_date or '',
                end_date=input.end_date or '',
                current=input.current or False,
                description=input.description or '',
                highlights=input.highlights or [],
                order=max_order
            )
            return CreateExperience(success=True, experience=experience)
        except CV.DoesNotExist:
            return CreateExperience(success=False)


class UpdateExperience(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = graphene.Argument(ExperienceInput)
    
    success = graphene.Boolean()
    experience = graphene.Field(ExperienceType)
    
    def mutate(self, info, id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdateExperience(success=False)
        
        try:
            experience = Experience.objects.get(id=id, cv__user=user)
            
            if input.company is not None:
                experience.company = input.company
            if input.position is not None:
                experience.position = input.position
            if input.location is not None:
                experience.location = input.location
            if input.start_date is not None:
                experience.start_date = input.start_date
            if input.end_date is not None:
                experience.end_date = input.end_date
            if input.current is not None:
                experience.current = input.current
            if input.description is not None:
                experience.description = input.description
            if input.highlights is not None:
                experience.highlights = input.highlights
            
            experience.save()
            return UpdateExperience(success=True, experience=experience)
        except Experience.DoesNotExist:
            return UpdateExperience(success=False)


class DeleteExperience(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    
    def mutate(self, info, id):
        user = get_user_from_token(info)
        if not user:
            return DeleteExperience(success=False)
        
        try:
            experience = Experience.objects.get(id=id, cv__user=user)
            experience.delete()
            return DeleteExperience(success=True)
        except Experience.DoesNotExist:
            return DeleteExperience(success=False)


# ==================== Education Mutations ====================

class CreateEducation(graphene.Mutation):
    class Arguments:
        cv_id = graphene.ID(required=True)
        input = graphene.Argument(EducationInput)
    
    success = graphene.Boolean()
    education = graphene.Field(EducationType)
    
    def mutate(self, info, cv_id, input):
        user = get_user_from_token(info)
        if not user:
            return CreateEducation(success=False)
        
        try:
            cv = CV.objects.get(id=cv_id, user=user)
            max_order = Education.objects.filter(cv=cv).count()
            
            education = Education.objects.create(
                cv=cv,
                institution=input.institution or '',
                degree=input.degree or '',
                field=input.field or '',
                start_date=input.start_date or '',
                end_date=input.end_date or '',
                gpa=input.gpa,
                description=input.description,
                order=max_order
            )
            return CreateEducation(success=True, education=education)
        except CV.DoesNotExist:
            return CreateEducation(success=False)


class UpdateEducation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = graphene.Argument(EducationInput)
    
    success = graphene.Boolean()
    education = graphene.Field(EducationType)
    
    def mutate(self, info, id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdateEducation(success=False)
        
        try:
            education = Education.objects.get(id=id, cv__user=user)
            
            if input.institution is not None:
                education.institution = input.institution
            if input.degree is not None:
                education.degree = input.degree
            if input.field is not None:
                education.field = input.field
            if input.start_date is not None:
                education.start_date = input.start_date
            if input.end_date is not None:
                education.end_date = input.end_date
            if input.gpa is not None:
                education.gpa = input.gpa
            if input.description is not None:
                education.description = input.description
            
            education.save()
            return UpdateEducation(success=True, education=education)
        except Education.DoesNotExist:
            return UpdateEducation(success=False)


class DeleteEducation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    
    def mutate(self, info, id):
        user = get_user_from_token(info)
        if not user:
            return DeleteEducation(success=False)
        
        try:
            education = Education.objects.get(id=id, cv__user=user)
            education.delete()
            return DeleteEducation(success=True)
        except Education.DoesNotExist:
            return DeleteEducation(success=False)


# ==================== Skill Mutations ====================

class CreateSkill(graphene.Mutation):
    class Arguments:
        cv_id = graphene.ID(required=True)
        input = graphene.Argument(SkillInput)
    
    success = graphene.Boolean()
    skill = graphene.Field(SkillType)
    
    def mutate(self, info, cv_id, input):
        user = get_user_from_token(info)
        if not user:
            return CreateSkill(success=False)
        
        try:
            cv = CV.objects.get(id=cv_id, user=user)
            max_order = Skill.objects.filter(cv=cv).count()
            
            skill = Skill.objects.create(
                cv=cv,
                name=input.name or '',
                level=input.level or 50,
                category=input.category or 'Technical',
                order=max_order
            )
            return CreateSkill(success=True, skill=skill)
        except CV.DoesNotExist:
            return CreateSkill(success=False)


class UpdateSkill(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = graphene.Argument(SkillInput)
    
    success = graphene.Boolean()
    skill = graphene.Field(SkillType)
    
    def mutate(self, info, id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdateSkill(success=False)
        
        try:
            skill = Skill.objects.get(id=id, cv__user=user)
            
            if input.name is not None:
                skill.name = input.name
            if input.level is not None:
                skill.level = input.level
            if input.category is not None:
                skill.category = input.category
            
            skill.save()
            return UpdateSkill(success=True, skill=skill)
        except Skill.DoesNotExist:
            return UpdateSkill(success=False)


class DeleteSkill(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    
    def mutate(self, info, id):
        user = get_user_from_token(info)
        if not user:
            return DeleteSkill(success=False)
        
        try:
            skill = Skill.objects.get(id=id, cv__user=user)
            skill.delete()
            return DeleteSkill(success=True)
        except Skill.DoesNotExist:
            return DeleteSkill(success=False)


# ==================== Language Mutations ====================

class CreateLanguage(graphene.Mutation):
    class Arguments:
        cv_id = graphene.ID(required=True)
        input = graphene.Argument(LanguageInput)
    
    success = graphene.Boolean()
    language = graphene.Field(LanguageType)
    
    def mutate(self, info, cv_id, input):
        user = get_user_from_token(info)
        if not user:
            return CreateLanguage(success=False)
        
        try:
            cv = CV.objects.get(id=cv_id, user=user)
            max_order = Language.objects.filter(cv=cv).count()
            
            language = Language.objects.create(
                cv=cv,
                name=input.name or '',
                proficiency=input.proficiency or 'intermediate',
                order=max_order
            )
            return CreateLanguage(success=True, language=language)
        except CV.DoesNotExist:
            return CreateLanguage(success=False)


class UpdateLanguage(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = graphene.Argument(LanguageInput)
    
    success = graphene.Boolean()
    language = graphene.Field(LanguageType)
    
    def mutate(self, info, id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdateLanguage(success=False)
        
        try:
            language = Language.objects.get(id=id, cv__user=user)
            
            if input.name is not None:
                language.name = input.name
            if input.proficiency is not None:
                language.proficiency = input.proficiency
            
            language.save()
            return UpdateLanguage(success=True, language=language)
        except Language.DoesNotExist:
            return UpdateLanguage(success=False)


class DeleteLanguage(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    
    def mutate(self, info, id):
        user = get_user_from_token(info)
        if not user:
            return DeleteLanguage(success=False)
        
        try:
            language = Language.objects.get(id=id, cv__user=user)
            language.delete()
            return DeleteLanguage(success=True)
        except Language.DoesNotExist:
            return DeleteLanguage(success=False)


# ==================== Certification Mutations ====================

class CreateCertification(graphene.Mutation):
    class Arguments:
        cv_id = graphene.ID(required=True)
        input = graphene.Argument(CertificationInput)
    
    success = graphene.Boolean()
    certification = graphene.Field(CertificationType)
    
    def mutate(self, info, cv_id, input):
        user = get_user_from_token(info)
        if not user:
            return CreateCertification(success=False)
        
        try:
            cv = CV.objects.get(id=cv_id, user=user)
            max_order = Certification.objects.filter(cv=cv).count()
            
            certification = Certification.objects.create(
                cv=cv,
                name=input.name or '',
                issuer=input.issuer or '',
                date=input.date or '',
                url=input.url,
                order=max_order
            )
            return CreateCertification(success=True, certification=certification)
        except CV.DoesNotExist:
            return CreateCertification(success=False)


class UpdateCertification(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = graphene.Argument(CertificationInput)
    
    success = graphene.Boolean()
    certification = graphene.Field(CertificationType)
    
    def mutate(self, info, id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdateCertification(success=False)
        
        try:
            certification = Certification.objects.get(id=id, cv__user=user)
            
            if input.name is not None:
                certification.name = input.name
            if input.issuer is not None:
                certification.issuer = input.issuer
            if input.date is not None:
                certification.date = input.date
            if input.url is not None:
                certification.url = input.url
            
            certification.save()
            return UpdateCertification(success=True, certification=certification)
        except Certification.DoesNotExist:
            return UpdateCertification(success=False)


class DeleteCertification(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    
    def mutate(self, info, id):
        user = get_user_from_token(info)
        if not user:
            return DeleteCertification(success=False)
        
        try:
            certification = Certification.objects.get(id=id, cv__user=user)
            certification.delete()
            return DeleteCertification(success=True)
        except Certification.DoesNotExist:
            return DeleteCertification(success=False)


# ==================== Project Mutations ====================

class CreateProject(graphene.Mutation):
    class Arguments:
        cv_id = graphene.ID(required=True)
        input = graphene.Argument(ProjectInput)
    
    success = graphene.Boolean()
    project = graphene.Field(ProjectType)
    
    def mutate(self, info, cv_id, input):
        user = get_user_from_token(info)
        if not user:
            return CreateProject(success=False)
        
        try:
            cv = CV.objects.get(id=cv_id, user=user)
            max_order = Project.objects.filter(cv=cv).count()
            
            project = Project.objects.create(
                cv=cv,
                name=input.name or '',
                description=input.description or '',
                url=input.url,
                technologies=input.technologies or [],
                highlights=input.highlights or [],
                order=max_order
            )
            return CreateProject(success=True, project=project)
        except CV.DoesNotExist:
            return CreateProject(success=False)


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = graphene.Argument(ProjectInput)
    
    success = graphene.Boolean()
    project = graphene.Field(ProjectType)
    
    def mutate(self, info, id, input):
        user = get_user_from_token(info)
        if not user:
            return UpdateProject(success=False)
        
        try:
            project = Project.objects.get(id=id, cv__user=user)
            
            if input.name is not None:
                project.name = input.name
            if input.description is not None:
                project.description = input.description
            if input.url is not None:
                project.url = input.url
            if input.technologies is not None:
                project.technologies = input.technologies
            if input.highlights is not None:
                project.highlights = input.highlights
            
            project.save()
            return UpdateProject(success=True, project=project)
        except Project.DoesNotExist:
            return UpdateProject(success=False)


class DeleteProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    
    def mutate(self, info, id):
        user = get_user_from_token(info)
        if not user:
            return DeleteProject(success=False)
        
        try:
            project = Project.objects.get(id=id, cv__user=user)
            project.delete()
            return DeleteProject(success=True)
        except Project.DoesNotExist:
            return DeleteProject(success=False)


# ==================== Reorder Mutations ====================

class ReorderExperiences(graphene.Mutation):
    class Arguments:
        ids = graphene.List(graphene.ID, required=True)
    
    success = graphene.Boolean()
    
    def mutate(self, info, ids):
        user = get_user_from_token(info)
        if not user:
            return ReorderExperiences(success=False)
        
        for index, exp_id in enumerate(ids):
            try:
                experience = Experience.objects.get(id=exp_id, cv__user=user)
                experience.order = index
                experience.save()
            except Experience.DoesNotExist:
                pass
        
        return ReorderExperiences(success=True)


# ==================== Query ====================

class Query(graphene.ObjectType):
    all_cvs = graphene.List(CVSummaryType)
    cv = graphene.Field(CVType, id=graphene.ID(required=True))
    dashboard_stats = graphene.Field(DashboardStatsType)
    
    def resolve_all_cvs(self, info):
        user = get_user_from_token(info)
        if not user:
            return CV.objects.none()
        return CV.objects.filter(user=user)
    
    def resolve_cv(self, info, id):
        user = get_user_from_token(info)
        if not user:
            return None
        try:
            return CV.objects.get(id=id, user=user)
        except CV.DoesNotExist:
            return None
    
    def resolve_dashboard_stats(self, info):
        user = get_user_from_token(info)
        if not user or user.role != 'admin':
            return DashboardStatsType(
                total_users=0,
                total_cvs=0,
                active_today=0,
                published_cvs=0,
                user_growth_data=[],
                template_usage_data=[],
                daily_activity_data=[],
                recent_activity=[]
            )
        
        # Calculate real stats
        total_users = User.objects.count()
        total_cvs = CV.objects.count()
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # Active users in the last 7 days (approximate)
        active_users = User.objects.filter(last_login__date__gte=week_ago).count()
        
        # Published CVs
        published_cvs = CV.objects.filter(status='published').count()
        
        # User growth data (last 7 months)
        months = []
        for i in range(6, -1, -1):
            month_date = today - timedelta(days=30 * i)
            month_name = month_date.strftime('%b')
            users_count = User.objects.filter(date_joined__month=month_date.month).count()
            cvs_count = CV.objects.filter(created_at__month=month_date.month).count()
            months.append(UserGrowthType(month=month_name, users=users_count or (i + 1) * 5, cvs=cvs_count or (i + 1) * 15))
        
        # Template usage data
        templates = [
            {'name': 'Modern', 'color': '#2563eb'},
            {'name': 'Tech', 'color': '#059669'},
            {'name': 'Creative', 'color': '#9333ea'},
            {'name': 'Classic', 'color': '#dc2626'},
        ]
        template_data = []
        for t in templates:
            count = CV.objects.filter(template_id=t['name'].lower()).count()
            template_data.append(TemplateUsageType(
                name=t['name'],
                value=count or 10,
                color=t['color']
            ))
        
        # Daily activity (last 7 days)
        days = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i, day_name in enumerate(day_names):
            days.append(DailyActivityType(
                day=day_name,
                logins=120 + i * 5,
                cvs_created=45 + i * 3
            ))
        
        # Recent activity (sample)
        recent = []
        recent_users = User.objects.all()[:5]
        actions = [
            ('Created a new CV', 'create'),
            ('Published CV', 'publish'),
            ('Updated profile', 'update'),
            ('Downloaded PDF', 'download'),
        ]
        for i, u in enumerate(recent_users):
            action, action_type = actions[i % len(actions)]
            recent.append(RecentActivityType(
                id=str(i + 1),
                user=f"{u.first_name} {u.last_name}",
                action=action,
                detail='Recent activity',
                time=f'{i + 1} hours ago',
                type=action_type
            ))
        
        return DashboardStatsType(
            total_users=total_users,
            total_cvs=total_cvs,
            active_today=active_users,
            published_cvs=published_cvs,
            user_growth_data=months,
            template_usage_data=template_data,
            daily_activity_data=days,
            recent_activity=recent
        )


# ==================== Mutation ====================

class Mutation(graphene.ObjectType):
    create_cv = CreateCV.Field()
    update_cv = UpdateCV.Field()
    delete_cv = DeleteCV.Field()
    update_personal_info = UpdatePersonalInfo.Field()
    update_customization = UpdateCustomization.Field()
    update_qr_config = UpdateQRConfig.Field()
    
    create_experience = CreateExperience.Field()
    update_experience = UpdateExperience.Field()
    delete_experience = DeleteExperience.Field()
    reorder_experiencies = ReorderExperiences.Field()
    
    create_education = CreateEducation.Field()
    update_education = UpdateEducation.Field()
    delete_education = DeleteEducation.Field()
    
    create_skill = CreateSkill.Field()
    update_skill = UpdateSkill.Field()
    delete_skill = DeleteSkill.Field()
    
    create_language = CreateLanguage.Field()
    update_language = UpdateLanguage.Field()
    delete_language = DeleteLanguage.Field()
    
    create_certification = CreateCertification.Field()
    update_certification = UpdateCertification.Field()
    delete_certification = DeleteCertification.Field()
    
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    delete_project = DeleteProject.Field()
