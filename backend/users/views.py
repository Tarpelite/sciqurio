# users/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from .serializers import UserSerializer, RegisterSerializer
from rest_framework.permissions import AllowAny
from .models import User

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """API endpoint for user registration"""
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save the user before accessing serializer.data
        user = serializer.save(
            name=request.data.get('name'),
            student_id=request.data.get('student_id'),
            college=request.data.get('college'),
            email=request.data.get('email')
        )
        user.set_password(request.data.get('password'))
        user.save()

        # Create auth token for the new user
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data  # Access serializer.data after saving
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """API endpoint for user login"""
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "邮箱和密码是必填项"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user": UserSerializer(user).data}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "无效的邮箱或密码"}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """API endpoint for retrieving and updating user profile"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class LeaderboardView(APIView):
    """API endpoint for fetching the leaderboard"""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        users = User.objects.order_by('-labels_count')[:10]  # Top 10 users by labels_count
        leaderboard = [
            {"rank": index + 1, "name": user.name or user.username, "labels_count": user.labels_count}
            for index, user in enumerate(users)
        ]
        return Response(leaderboard)
