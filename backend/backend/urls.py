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
from pathlib import Path
import mimetypes

from django.contrib import admin
from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import RedirectView
try:
    from graphene_django.views import GraphQLView
except Exception:
    GraphQLView = None
from django.conf.urls.static import static 
from django.conf import settings
from accounts.views import send_email
from accounts.authentication import JWTAuthentication
from django.contrib.auth import login as session_login
from django.http import FileResponse, Http404, JsonResponse
from django.core.exceptions import SuspiciousFileOperation
from django.utils._os import safe_join
from cv_builder.views import (
    download_certification_document,
    remove_profile_photo,
    upload_certifications,
    upload_profile_photo,
)


def public_profile_photo(request, path):
    """Serve public CV headshots in production (Django's static serve is DEBUG-only)."""
    try:
        file_path = safe_join(str(settings.MEDIA_ROOT), path)
    except (ValueError, SuspiciousFileOperation):
        raise Http404
    if not path.startswith('profile-photos/') or not Path(file_path).is_file():
        raise Http404
    content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
    return FileResponse(open(file_path, 'rb'), content_type=content_type)


@csrf_exempt
def admin_session_login(request):
    """Exchange the website JWT for a Django admin session."""
    if request.method != 'POST':
        return JsonResponse({'message': 'POST required.'}, status=405)
    token = request.POST.get('token', '')
    request.META['HTTP_AUTHORIZATION'] = f'JWT {token}'
    user = JWTAuthentication(request).authenticate()
    if user is None or not user.is_active or not user.is_staff:
        return JsonResponse({'message': 'Admin access required.'}, status=403)
    session_login(request, user, backend='django.contrib.auth.backends.ModelBackend')
    from django.shortcuts import redirect
    next_path = request.GET.get('next', '/admin/')
    if not next_path.startswith('/admin/') or next_path.startswith('//'):
        next_path = '/admin/'
    return redirect(next_path)

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
    path('admin-session-login/', admin_session_login, name='admin_session_login'),
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
else:
    # Profile photos are public (they appear on the CV). Serve them from Django so
    # they load in production without a separate web-server media mapping.
    # Certificates stay private and are only served by the authenticated view above.
    urlpatterns += [
        re_path(
            r'^media/(?P<path>profile-photos/.+)$',
            public_profile_photo,
        ),
    ]
