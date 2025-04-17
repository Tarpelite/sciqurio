# hypotheses/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import AIHypothesis, UserHypothesis, HypothesisComparison
from .serializers import AIHypothesisSerializer, UserHypothesisSerializer, HypothesisComparisonSerializer
from videos.models import Video
from django.shortcuts import get_object_or_404
from django.db.models import Q

class UserHypothesisCreateView(generics.CreateAPIView):
    """API endpoint for creating a user hypothesis"""
    serializer_class = UserHypothesisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        video_id = self.request.data.get('video')
        video = get_object_or_404(Video, id=video_id)
        
        # Create the hypothesis
        hypothesis = serializer.save(user=self.request.user, video=video)
        
        # Increment user's label count
        user = self.request.user
        user.labels_count += 1
        user.save()
        
        return hypothesis

class AIHypothesesForVideoView(generics.ListAPIView):
    """API endpoint for listing AI hypotheses for a specific video"""
    serializer_class = AIHypothesisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        video_id = self.kwargs.get('video_id')
        return AIHypothesis.objects.filter(video_id=video_id)

class AIHypothesesPairView(generics.ListAPIView):
    """API endpoint for getting a pair of AI hypotheses for comparison"""
    serializer_class = AIHypothesisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        video_id = self.kwargs.get('video_id')
        # Get two random hypotheses for comparison
        # Ensure one is a valid hypothesis and one might be the "violating" one for challenge
        valid_hypotheses = AIHypothesis.objects.filter(
            video_id=video_id
        ).exclude(
            difficulty='Violating'
        ).order_by('?')[:1]
        
        violating_hypotheses = AIHypothesis.objects.filter(
            video_id=video_id, 
            difficulty='Violating'
        ).order_by('?')[:1]
        
        # Combine the querysets
        return list(valid_hypotheses) + list(violating_hypotheses)

class HypothesisComparisonCreateView(generics.CreateAPIView):
    """API endpoint for submitting a hypothesis comparison"""
    serializer_class = HypothesisComparisonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Save the comparison
        comparison = serializer.save(user=self.request.user)
        
        # Increment user's label count
        user = self.request.user
        user.labels_count += 1
        user.save()
        
        return comparison

class UserHypothesisListView(generics.ListAPIView):
    """API endpoint for listing a user's hypotheses"""
    serializer_class = UserHypothesisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter hypotheses by the authenticated user"""
        return UserHypothesis.objects.filter(user=self.request.user)