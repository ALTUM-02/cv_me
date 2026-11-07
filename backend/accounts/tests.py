from unittest.mock import MagicMock, patch
from urllib.error import URLError

from django.core.cache import cache
from django.test import TestCase, override_settings

from accounts.models import OtpCode


class SendVerificationCodeTests(TestCase):
    def setUp(self):
        cache.clear()

    @override_settings(EMAIL_API_KEY='test-key', EMAIL_API_SECRET='test-secret')
    @patch('accounts.views.urlopen')
    def test_sends_and_stores_server_generated_code(self, mock_urlopen):
        provider_response = MagicMock()
        provider_response.status = 200
        provider_response.read.return_value = b'{"success": true}'
        mock_urlopen.return_value.__enter__.return_value = provider_response

        response = self.client.post(
            '/api/email/verification-code/',
            data='{"email":"New-User@Example.com"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        otp = OtpCode.objects.get(email='new-user@example.com')
        self.assertEqual(len(otp.code), 6)
        self.assertTrue(otp.code.isdigit())

        provider_request = mock_urlopen.call_args.args[0]
        self.assertEqual(provider_request.get_header('X-api-key'), 'test-key')
        self.assertEqual(provider_request.get_header('X-api-secret'), 'test-secret')
        self.assertIn(otp.code, provider_request.data.decode('utf-8'))
        self.assertEqual(mock_urlopen.call_args.kwargs['timeout'], 10)

    @override_settings(EMAIL_API_KEY='', EMAIL_API_SECRET='')
    def test_missing_provider_credentials_fails_without_storing_code(self):
        response = self.client.post(
            '/api/email/verification-code/',
            data='{"email":"new-user@example.com"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 503)
        self.assertFalse(response.json()['success'])
        self.assertFalse(OtpCode.objects.exists())

    @override_settings(EMAIL_API_KEY='test-key', EMAIL_API_SECRET='test-secret')
    @patch('accounts.views.urlopen', side_effect=URLError('provider unavailable'))
    def test_provider_failure_does_not_leave_a_usable_code(self, _mock_urlopen):
        response = self.client.post(
            '/api/email/verification-code/',
            data='{"email":"new-user@example.com"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 502)
        otp = OtpCode.objects.get(email='new-user@example.com')
        self.assertTrue(otp.is_used)

    def test_generic_email_requires_authentication(self):
        response = self.client.post(
            '/api/email/send/',
            data='{"recipient":"person@example.com","subject":"CV","html_body":"<p>CV</p>"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 401)
