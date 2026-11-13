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

        login_response = self.client.post(
            '/graphql/',
            data=json.dumps({
                'query': '''
                    mutation Login($email: String!, $password: String!) {
                        tokenAuth(email: $email, password: $password) {
                            token
                        }
                    }
                ''',
                'variables': {
                    'email': 'NEW-USER@example.com',
                    'password': 'password123',
                },
            }),
            content_type='application/json',
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertIsNone(login_response.json().get('errors'))
        self.assertTrue(login_response.json()['data']['tokenAuth']['token'])

    def test_email_verification_endpoint_is_removed(self):
        response = self.client.post(
            '/api/email/verification-code/',
            data='{"email":"new-user@example.com"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 404)

    def test_graphql_schema_does_not_expose_otp_mutations(self):
        response = self.client.post(
            '/graphql/',
            data=json.dumps({
                'query': '{ __type(name: "Mutation") { fields { name } } }',
            }),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        fields = {
            field['name']
            for field in response.json()['data']['__type']['fields']
        }
        self.assertNotIn('verifyOtp', fields)
        self.assertNotIn('registerWithOtp', fields)

    def test_generic_email_requires_authentication(self):
        response = self.client.post(
            '/api/email/send/',
            data='{"recipient":"person@example.com","subject":"CV","html_body":"<p>CV</p>"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 401)


class AdminDashboardTests(TestCase):
    def setUp(self):
        from graphql_jwt.shortcuts import get_token
        User = get_user_model()
        self.admin = User.objects.create_user('a@x.com', 'a@x.com', 'pw123456', role='admin')
        self.user = User.objects.create_user('u@x.com', 'u@x.com', 'pw123456',
                                             first_name='Uma', last_name='User')
        self.admin_token = get_token(self.admin)
        self.user_token = get_token(self.user)

    def gql(self, query, token=None, variables=None):
        headers = {'HTTP_AUTHORIZATION': f'JWT {token}'} if token else {}
        response = self.client.post('/graphql/', data=json.dumps({'query': query, 'variables': variables or {}}),
                                    content_type='application/json', **headers)
        return response.json()

    def test_user_changes_appear_in_activity_log(self):
        cv_id = self.gql('mutation { createCv(title: "My CV") { cv { id } } }', self.user_token)['data']['createCv']['cv']['id']
        self.gql('mutation($id: ID!) { updatePersonalInfo(cvId: $id, input: {firstName: "Uma"}) { success } }',
                 self.user_token, {'id': cv_id})
        self.gql('mutation($id: ID!) { createSkill(cvId: $id, input: {name: "Python"}) { success } }',
                 self.user_token, {'id': cv_id})
        log = self.gql('{ activityLog { userLabel action detail type } }', self.admin_token)['data']['activityLog']
        actions = [e['action'] for e in log]
        self.assertIn('created a CV', actions)
        edit = next(e for e in log if e['action'] == 'edited a CV')
        self.assertIn('personal info', edit['detail'])
        self.assertIn('skills', edit['detail'])
        # Regular users cannot read the log or other people's data
        self.assertEqual(self.gql('{ activityLog { id } }', self.user_token)['data']['activityLog'], [])
        cvs = self.gql('{ adminCvs { id ownerEmail fullName } }', self.admin_token)['data']['adminCvs']
        self.assertEqual(cvs[0]['ownerEmail'], 'u@x.com')
        self.assertEqual(self.gql('query($id: ID!) { cv(id: $id) { id } }', self.admin_token, {'id': cv_id})['data']['cv']['id'], cv_id)

    def test_admin_manages_users_cvs_and_site(self):
        uid = str(self.user.pk)
        r = self.gql('mutation($id: ID!) { updateUserStatus(id: $id, isActive: false) { success } }', self.admin_token, {'id': uid})
        self.assertTrue(r['data']['updateUserStatus']['success'])
        login = self.gql('mutation { tokenAuth(email: "u@x.com", password: "pw123456") { token } }')
        self.assertIsNone(login['data']['tokenAuth']['token'])
        r = self.gql('mutation($id: ID!) { adminUpdateUser(id: $id, firstName: "New") { success user { firstName } } }',
                     self.admin_token, {'id': uid})
        self.assertEqual(r['data']['adminUpdateUser']['user']['firstName'], 'New')

        r = self.gql('mutation { updateSiteSettings(announcement: "Hello", allowRegistration: false, maintenanceMode: true) { success } }',
                     self.admin_token)
        self.assertTrue(r['data']['updateSiteSettings']['success'])
        s = self.gql('{ siteSettings { announcement allowRegistration maintenanceMode announcementLevel } }')['data']['siteSettings']
        self.assertEqual(s['announcement'], 'Hello')
        reg = self.gql('mutation { registerUser(email: "n@x.com", password: "pw123456", firstName: "N", lastName: "N") { success message } }')
        self.assertFalse(reg['data']['registerUser']['success'])
        # Non-admin users are blocked from signing in during maintenance
        self.gql('mutation($id: ID!) { updateUserStatus(id: $id, isActive: true) { success } }', self.admin_token, {'id': uid})
        login = self.gql('mutation { tokenAuth(email: "u@x.com", password: "pw123456") { token } }')
        self.assertIn('errors', login)
        # Users cannot change site settings
        r = self.gql('mutation { updateSiteSettings(announcement: "x") { success } }', self.user_token)
        self.assertFalse(r['data']['updateSiteSettings']['success'])

    def test_admin_cv_status_and_delete(self):
        from cv_builder.models import CV
        cv = CV.objects.create(user=self.user, title='T')
        r = self.gql('mutation($id: ID!) { adminSetCvStatus(id: $id, status: "published") { success } }',
                     self.admin_token, {'id': str(cv.pk)})
        self.assertTrue(r['data']['adminSetCvStatus']['success'])
        r = self.gql('mutation($id: ID!) { adminDeleteCv(id: $id) { success } }', self.admin_token, {'id': str(cv.pk)})
        self.assertTrue(r['data']['adminDeleteCv']['success'])
        self.assertFalse(CV.objects.filter(pk=cv.pk).exists())
        r = self.gql('mutation($id: ID!) { deleteUser(id: $id) { success } }', self.admin_token, {'id': str(self.user.pk)})
        self.assertTrue(r['data']['deleteUser']['success'])
