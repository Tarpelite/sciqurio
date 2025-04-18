from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User
from users.serializers import UserSerializer, RegisterSerializer
from rest_framework.authtoken.models import Token


class UserTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword123',
            'name': 'Test User',
            'student_id': '123456',
            'college': 'Test College',
            'email': 'testuser@example.com'
        }
        self.user = User.objects.create_user(
            username='existinguser', password='password123'
        )
        self.token = Token.objects.create(user=self.user)

    def test_register_user(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])

    def test_login_user(self):
        response = self.client.post(self.login_url, {
            'username': self.user.username,
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], self.user.username)

    def test_login_invalid_credentials(self):
        response = self.client.post(self.login_url, {
            'username': self.user.username,
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_retrieve_profile(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)

    def test_update_profile(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.put(self.profile_url, {
            'username': 'updateduser',
            'email': 'updateduser@example.com'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'updateduser')
        self.assertEqual(response.data['email'], 'updateduser@example.com')
