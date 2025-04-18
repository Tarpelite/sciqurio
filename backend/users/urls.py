# users/urls.py
from django.urls import path
from .views import LoginView, RegisterView, ProfileView, LeaderboardView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]
