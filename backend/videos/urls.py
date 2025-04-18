# videos/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.VideoListView.as_view(), name='video-list'),  # List all videos
    path('random/', views.RandomVideoView.as_view(), name='random-video'),  # Fetch a random video
    path('<int:pk>/', views.VideoDetailView.as_view(), name='video-detail'),  # Retrieve video details
    path('<int:pk>/stream/', views.VideoStreamView.as_view(), name='video-stream'),  # Stream a video
]
