# hypotheses/urls.py
from django.urls import path
from . import views
from .views import HypothesesForVideoView

urlpatterns = [
    path('user/', views.UserHypothesisCreateView.as_view(), name='user-hypothesis-create'),
    path('user/list/', views.UserHypothesisListView.as_view(), name='user-hypothesis-list'),
    path('ai/<int:video_id>/', views.AIHypothesesForVideoView.as_view(), name='ai-hypotheses-list'),
    path('ai/<int:video_id>/pair/', views.AIHypothesesPairView.as_view(), name='ai-hypotheses-pair'),
    path('compare/', views.HypothesisComparisonCreateView.as_view(), name='hypothesis-comparison-create'),
    path('video/<int:video_id>/', HypothesesForVideoView.as_view(), name='hypotheses-for-video'),
]
