# leaderboard/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

class LeaderboardView(generics.ListAPIView):
    """API endpoint for retrieving the leaderboard"""
    permission_classes = [permissions.AllowAny]  # Public access to leaderboard
    
    def get(self, request, *args, **kwargs):
        # Get top 20 users by labels_count
        top_users = User.objects.filter(is_active=True).order_by('-labels_count')[:20]
        
        # Format data for the leaderboard
        leaderboard_data = [
            {
                'rank': i + 1,
                'name': user.username,
                'college': user.college or '未知',
                'count': user.labels_count
            }
            for i, user in enumerate(top_users)
        ]
        
        return Response(leaderboard_data)