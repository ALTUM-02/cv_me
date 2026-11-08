import logging
import mimetypes
from pathlib import PurePath

from django.db import DatabaseError, transaction
from django.http import FileResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from accounts.authentication import JWTAuthentication
from .models import CV, Certification

logger = logging.getLogger(__name__)

MAX_CERTIFICATE_SIZE = 10 * 1024 * 1024
MAX_CERTIFICATE_BATCH_COUNT = 20
MAX_CERTIFICATE_BATCH_SIZE = 50 * 1024 * 1024
CERTIFICATE_SIGNATURES = {
    '.pdf': lambda data: data.startswith(b'%PDF-'),
    '.png': lambda data: data.startswith(b'\x89PNG\r\n\x1a\n'),
    '.jpg': lambda data: data.startswith(b'\xff\xd8\xff'),
    '.jpeg': lambda data: data.startswith(b'\xff\xd8\xff'),
    '.webp': lambda data: data.startswith(b'RIFF') and data[8:12] == b'WEBP',
}


def _authenticated_user(request):
    return JWTAuthentication(request).authenticate()


def _validate_certificate_file(uploaded_file):
    suffix = PurePath(uploaded_file.name).suffix.lower()
    signature_check = CERTIFICATE_SIGNATURES.get(suffix)
    if signature_check is None:
        return 'Only PDF, PNG, JPEG, and WebP files are supported.'
    if uploaded_file.size > MAX_CERTIFICATE_SIZE:
        return 'Each certificate file must be 10 MB or smaller.'

    header = uploaded_file.read(12)
    uploaded_file.seek(0)
    if not signature_check(header):
        return 'The file contents do not match a supported certificate format.'
    return None


def _serialize_certification(certification, request):
    document_name = certification.document.name.rsplit('/', 1)[-1]
    return {
        'id': str(certification.pk),
        'name': certification.name,
        'issuer': certification.issuer,
        'date': certification.date,
        'url': certification.url or '',
        'documentUrl': request.build_absolute_uri(
            f'/api/certifications/{certification.pk}/document/'
        ),
        'documentName': document_name,
    }


@csrf_exempt
@require_POST
def upload_certifications(request):
    user = _authenticated_user(request)
    if user is None:
        return JsonResponse({'message': 'Authentication required.'}, status=401)

    files = request.FILES.getlist('files')
    if not files:
        return JsonResponse({'message': 'Select at least one certificate file.'}, status=400)
    if len(files) > MAX_CERTIFICATE_BATCH_COUNT:
        return JsonResponse(
            {'message': f'Upload no more than {MAX_CERTIFICATE_BATCH_COUNT} files at once.'},
            status=400,
        )
    if sum(uploaded_file.size for uploaded_file in files) > MAX_CERTIFICATE_BATCH_SIZE:
        return JsonResponse({'message': 'The total upload size must be 50 MB or smaller.'}, status=400)

    for uploaded_file in files:
        error = _validate_certificate_file(uploaded_file)
        if error:
            return JsonResponse({'message': error}, status=400)

    certification_id = request.POST.get('certification_id')
    cv_id = request.POST.get('cv_id')
    if certification_id:
        if len(files) != 1 or cv_id:
            return JsonResponse(
                {'message': 'Attach one file to an existing certification at a time.'},
                status=400,
            )
        certification = get_object_or_404(
            Certification.objects.select_related('cv'),
            pk=certification_id,
            cv__user=user,
        )
        certifications = [certification]
    elif cv_id:
        cv = get_object_or_404(CV, pk=cv_id, user=user)
        certifications = []
    else:
        return JsonResponse({'message': 'A CV or certification ID is required.'}, status=400)

    created_certifications = []
    previous_documents = []
    saved_documents = []
    try:
        with transaction.atomic():
            if not certification_id:
                first_order = cv.certifications.count()
                certifications = [
                    Certification.objects.create(
                        cv=cv,
                        name=PurePath(uploaded_file.name).stem[:200],
                        order=first_order + index,
                    )
                    for index, uploaded_file in enumerate(files)
                ]
                created_certifications.extend(certifications)

            for certification, uploaded_file in zip(certifications, files):
                if certification.document:
                    previous_documents.append((
                        certification.document.storage,
                        certification.document.name,
                    ))
                certification.document.save(uploaded_file.name, uploaded_file, save=True)
                saved_documents.append((
                    certification.document.storage,
                    certification.document.name,
                ))
    except (DatabaseError, OSError):
        for storage, filename in saved_documents:
            storage.delete(filename)
        for certification in created_certifications:
            certification.delete()
        logger.exception('Could not store uploaded certificate documents.')
        return JsonResponse(
            {'message': 'The certificate files could not be stored. Please try again.'},
            status=500,
        )

    for storage, filename in previous_documents:
        storage.delete(filename)

    return JsonResponse({
        'certifications': [
            _serialize_certification(certification, request)
            for certification in certifications
        ],
    })


@csrf_exempt
@require_GET
def download_certification_document(request, certification_id):
    user = _authenticated_user(request)
    if user is None:
        return JsonResponse({'message': 'Authentication required.'}, status=401)

    certification = get_object_or_404(
        Certification.objects.select_related('cv'),
        pk=certification_id,
        cv__user=user,
    )
    if not certification.document:
        return JsonResponse({'message': 'No certificate document is attached.'}, status=404)

    filename = PurePath(certification.document.name).name
    content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
    response = FileResponse(
        certification.document.open('rb'),
        as_attachment=True,
        filename=filename,
        content_type=content_type,
    )
    response['X-Content-Type-Options'] = 'nosniff'
    response['Cache-Control'] = 'private, no-store'
    return response
