from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from cv_builder.models import (
    CV,
    PersonalInfo,
    Experience,
    Education,
    Skill,
    Language,
    Certification,
    Project,
    Customization,
    QRConfig,
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        admin_user, created = User.objects.get_or_create(
            email='admin@resumeforge.com',
            defaults={
                'username': 'admin@resumeforge.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user: admin@resumeforge.com / admin123'))

        regular_user, created = User.objects.get_or_create(
            email='john@example.com',
            defaults={
                'username': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'user',
            },
        )
        if created:
            regular_user.set_password('password123')
            regular_user.save()
            self.stdout.write(self.style.SUCCESS('Created regular user: john@example.com / password123'))

        cv, created = CV.objects.get_or_create(
            user=regular_user,
            title='Software Engineer CV',
            defaults={
                'status': 'published',
                'template_id': 'modern',
            },
        )

        if created:
            PersonalInfo.objects.create(
                cv=cv,
                first_name='John',
                last_name='Doe',
                email='john@example.com',
                phone='+1 (555) 123-4567',
                city='San Francisco',
                country='United States',
                linkedin_url='https://linkedin.com/in/johndoe',
                portfolio_url='https://johndoe.dev',
                summary='Passionate full-stack developer with 5+ years of experience building scalable web applications.',
            )

            Experience.objects.create(
                cv=cv,
                company='TechCorp Inc.',
                position='Senior Full-Stack Developer',
                location='San Francisco, CA',
                start_date='2022-01',
                current=True,
                description='Lead development of microservices architecture serving 1M+ users.',
                highlights=['Reduced API response time by 40%', 'Led team of 5 developers', 'Implemented CI/CD pipeline'],
                order=0,
            )

            Experience.objects.create(
                cv=cv,
                company='StartupXYZ',
                position='Full-Stack Developer',
                location='Remote',
                start_date='2020-03',
                end_date='2021-12',
                description='Developed and maintained multiple client-facing applications.',
                highlights=['Built real-time collaboration features', 'Integrated payment systems'],
                order=1,
            )

            Education.objects.create(
                cv=cv,
                institution='University of California, Berkeley',
                degree='Bachelor of Science',
                field='Computer Science',
                start_date='2016-08',
                end_date='2020-05',
                gpa='3.8',
                order=0,
            )

            skills = [
                ('React', 95, 'Frontend'),
                ('TypeScript', 90, 'Languages'),
                ('Node.js', 88, 'Backend'),
                ('Python', 82, 'Languages'),
                ('AWS', 85, 'Cloud'),
                ('Docker', 80, 'DevOps'),
                ('PostgreSQL', 78, 'Database'),
                ('GraphQL', 75, 'APIs'),
            ]
            for i, (name, level, category) in enumerate(skills):
                Skill.objects.create(cv=cv, name=name, level=level, category=category, order=i)

            Language.objects.create(cv=cv, name='English', proficiency='native', order=0)
            Language.objects.create(cv=cv, name='Spanish', proficiency='intermediate', order=1)

            Certification.objects.create(cv=cv, name='AWS Certified Solutions Architect', issuer='Amazon Web Services', date='2023-06', order=0)
            Certification.objects.create(cv=cv, name='Google Cloud Professional Developer', issuer='Google', date='2022-09', order=1)

            Project.objects.create(
                cv=cv,
                name='E-Commerce Platform',
                description='Full-stack e-commerce solution with real-time inventory management.',
                url='https://github.com/johndoe/ecommerce',
                technologies=['React', 'Node.js', 'MongoDB', 'Stripe'],
                highlights=['Serves 10,000+ daily active users', 'Real-time inventory sync'],
                order=0,
            )

            Customization.objects.create(
                cv=cv,
                template_id='modern',
                color_primary='#2563eb',
                color_secondary='#1e40af',
                color_accent='#3b82f6',
                color_text='#1f2937',
                color_background='#ffffff',
                font_heading='Playfair Display',
                font_body='Source Sans Pro',
                font_size_heading=24,
                font_size_body=14,
                spacing_section_gap=24,
                spacing_element_gap=12,
                show_photo=False,
                photo_shape='circle',
                text_direction='ltr',
                font_style='normal',
            )

            QRConfig.objects.create(cv=cv, enabled=False, url='', size=120, style='square')

            self.stdout.write(self.style.SUCCESS(f'Created sample CV for {regular_user.email}'))

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
