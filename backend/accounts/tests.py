import json

from django.contrib.auth import get_user_model
from django.test import TestCase


class PasswordRegistrationTests(TestCase):
    def test_registration_creates_account_without_email_verification(self):
        response = self.client.post(
            '/graphql/',
            data=json.dumps({
                'query': '''
                    mutation RegisterUser(
                        $email: String!,
                        $password: String!,
                        $firstName: String!,
                        $lastName: String!
                    ) {
                        registerUser(
                            email: $email,
                            password: $password,
                            firstName: $firstName,
                            lastName: $lastName
                        ) {
                            success
                            user { email firstName lastName }
                        }
                    }
                ''',
                'variables': {
                    'email': 'new-user@example.com',
                    'password': 'password123',
                    'firstName': 'New',
                    'lastName': 'User',
                },
            }),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json().get('errors'))
        self.assertTrue(response.json()['data']['registerUser']['success'])
        user = get_user_model().objects.get(email='new-user@example.com')
        self.assertTrue(user.check_password('password123'))
        self.assertTrue(user.is_active)

    def test_email_verification_endpoint_is_removed(self):
        response = self.client.post(
            '/api/email/verification-code/',
            data='{"email":"new-user@example.com"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 404)

    def test_generic_email_requires_authentication(self):
        response = self.client.post(
            '/api/email/send/',
            data='{"recipient":"person@example.com","subject":"CV","html_body":"<p>CV</p>"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 401)
