from unittest.mock import patch
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from .models import CV, Certification


class CertificationUploadTests(TestCase):
    def setUp(self):
        self.media_directory = TemporaryDirectory()
        self.addCleanup(self.media_directory.cleanup)
        media_settings = override_settings(MEDIA_ROOT=self.media_directory.name)
        media_settings.enable()
        self.addCleanup(media_settings.disable)
        self.user = get_user_model().objects.create_user(
            username='owner',
            email='owner@example.com',
            password='test-password',
        )
        self.other_user = get_user_model().objects.create_user(
            username='other',
            email='other@example.com',
            password='test-password',
        )
        self.cv = CV.objects.create(user=self.user)
        self.other_cv = CV.objects.create(user=self.other_user)

    def _post_upload(self, data, user=None):
        with patch(
            'cv_builder.views.JWTAuthentication.authenticate',
            return_value=user or self.user,
        ):
            return self.client.post(
                '/api/certifications/upload/',
                data,
                HTTP_AUTHORIZATION='JWT test-token',
            )

    def test_batch_upload_creates_certifications_for_supported_files(self):
        response = self._post_upload({
            'cv_id': str(self.cv.pk),
            'files': [
                SimpleUploadedFile('AWS Certificate.pdf', b'%PDF-1.7 document'),
                SimpleUploadedFile('badge.png', b'\x89PNG\r\n\x1a\nimage-data'),
            ],
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['certifications']), 2)
        self.assertEqual(
            list(self.cv.certifications.values_list('name', flat=True)),
            ['AWS Certificate', 'badge'],
        )
        self.assertTrue(all(cert.document for cert in self.cv.certifications.all()))

    def test_upload_rejects_mismatched_file_content(self):
        response = self._post_upload({
            'cv_id': str(self.cv.pk),
            'files': [SimpleUploadedFile('certificate.pdf', b'not a PDF')],
        })

        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.cv.certifications.count(), 0)

    def test_upload_cannot_access_another_users_cv(self):
        response = self._post_upload({
            'cv_id': str(self.other_cv.pk),
            'files': [SimpleUploadedFile('certificate.pdf', b'%PDF-1.7 document')],
        })

        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.other_cv.certifications.count(), 0)

    def test_document_download_requires_ownership(self):
        certification = Certification.objects.create(cv=self.other_cv, name='Private')

        with patch(
            'cv_builder.views.JWTAuthentication.authenticate',
            return_value=self.user,
        ):
            response = self.client.get(
                f'/api/certifications/{certification.pk}/document/',
                HTTP_AUTHORIZATION='JWT test-token',
            )

        self.assertEqual(response.status_code, 404)
