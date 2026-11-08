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

    def test_profile_photo_upload_stores_file_and_returns_its_url(self):
        with patch(
            'cv_builder.views.JWTAuthentication.authenticate',
            return_value=self.user,
        ):
            response = self.client.post(
                f'/api/cvs/{self.cv.pk}/profile-photo/',
                {
                    'photo': SimpleUploadedFile(
                        'profile.png',
                        b'\x89PNG\r\n\x1a\nimage-data',
                        content_type='image/png',
                    ),
                },
                HTTP_AUTHORIZATION='JWT test-token',
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['photo'].startswith('/media/profile-photos/'))
        self.assertTrue(self.cv.personal_info.photo_file)
        self.assertEqual(self.cv.personal_info.photo, '')

    def test_profile_photo_upload_rejects_mismatched_contents(self):
        with patch(
            'cv_builder.views.JWTAuthentication.authenticate',
            return_value=self.user,
        ):
            response = self.client.post(
                f'/api/cvs/{self.cv.pk}/profile-photo/',
                {
                    'photo': SimpleUploadedFile(
                        'profile.png',
                        b'not actually an image',
                        content_type='image/png',
                    ),
                },
                HTTP_AUTHORIZATION='JWT test-token',
            )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(self.cv.personal_info.photo_file)

    def test_profile_photo_upload_is_scoped_to_cv_owner(self):
        with patch(
            'cv_builder.views.JWTAuthentication.authenticate',
            return_value=self.user,
        ):
            response = self.client.post(
                f'/api/cvs/{self.other_cv.pk}/profile-photo/',
                {
                    'photo': SimpleUploadedFile(
                        'profile.png',
                        b'\x89PNG\r\n\x1a\nimage-data',
                        content_type='image/png',
                    ),
                },
                HTTP_AUTHORIZATION='JWT test-token',
            )

        self.assertEqual(response.status_code, 404)

    def test_profile_photo_can_be_removed(self):
        personal_info = self.cv.personal_info
        personal_info.photo_file.save(
            'profile.png',
            SimpleUploadedFile('profile.png', b'\x89PNG\r\n\x1a\nimage-data'),
        )

        with patch(
            'cv_builder.views.JWTAuthentication.authenticate',
            return_value=self.user,
        ):
            response = self.client.post(
                f'/api/cvs/{self.cv.pk}/profile-photo/remove/',
                HTTP_AUTHORIZATION='JWT test-token',
            )

        self.assertEqual(response.status_code, 200)
        personal_info.refresh_from_db()
        self.assertFalse(personal_info.photo_file)
        self.assertEqual(personal_info.photo, '')
