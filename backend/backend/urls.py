"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import RedirectView
try:
    from graphene_django.views import GraphQLView
except Exception:
    GraphQLView = None
from django.conf.urls.static import static 
from django.conf import settings
from accounts.views import send_email
from cv_builder.views import (
    download_certification_document,
    remove_profile_photo,
    upload_certifications,
    upload_profile_photo,
)

urlpatterns = [
    path(
        '',
        RedirectView.as_view(url=settings.FRONTEND_URL, permanent=False),
        name='home',
    ),
    path(
        'favicon.ico',
        RedirectView.as_view(
            url=f'{settings.STATIC_URL.rstrip("/")}/favicon.svg',
            permanent=False,
        ),
        name='favicon',
    ),
    path('admin/', admin.site.urls),
    path('api/email/send/', send_email, name='send_email'),
    path('api/certifications/upload/', upload_certifications, name='upload_certifications'),
    path(
        'api/cvs/<int:cv_id>/profile-photo/',
        upload_profile_photo,
        name='upload_profile_photo',
    ),
    path(
        'api/cvs/<int:cv_id>/profile-photo/remove/',
        remove_profile_photo,
        name='remove_profile_photo',
    ),
    path(
        'api/certifications/<int:certification_id>/document/',
        download_certification_document,
        name='download_certification_document',
    ),
]

if GraphQLView is not None:
    urlpatterns += [
        path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True)))
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)