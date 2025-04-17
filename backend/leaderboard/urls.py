# leaderboard/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.LeaderboardView.as_view(), name='leaderboard'),
]