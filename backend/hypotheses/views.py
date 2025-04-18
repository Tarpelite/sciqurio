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

    def post(self, request, *args, **kwargs):
        video_id = request.data.get('video')
        content = request.data.get('content')

        if not video_id or not content:
            return Response(
                {"error": "视频 ID 和内容是必填项"},
                status=status.HTTP_400_BAD_REQUEST
            )

        video = get_object_or_404(Video, id=video_id)

        serializer = self.get_serializer(data={
            "video": video.id,
            "content": content
        })
        serializer.is_valid(raise_exception=True)

        # Save the hypothesis
        hypothesis = serializer.save(user=request.user, video=video)

        # Increment user's label count
        user = request.user
        user.labels_count += 1
        user.save()

        return Response(
            self.get_serializer(hypothesis).data,
            status=status.HTTP_201_CREATED
        )


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

    def post(self, request, *args, **kwargs):
        video_id = request.data.get('video')
        user_hypothesis_id = request.data.get('user_hypothesis')
        selected_hypothesis_id = request.data.get('selected_hypothesis')
        reason = request.data.get('reason')

        if not all([video_id, user_hypothesis_id, selected_hypothesis_id, reason]):
            return Response(
                {"error": "视频 ID、用户假设、选择的假设和理由是必填项"},
                status=status.HTTP_400_BAD_REQUEST
            )

        video = get_object_or_404(Video, id=video_id)
        user_hypothesis = get_object_or_404(UserHypothesis, id=user_hypothesis_id, user=request.user)
        selected_hypothesis = get_object_or_404(AIHypothesis, id=selected_hypothesis_id)

        serializer = self.get_serializer(data={
            "video": video.id,
            "user_hypothesis": user_hypothesis.id,
            "selected_hypothesis": selected_hypothesis.id,
            "reason": reason
        })
        serializer.is_valid(raise_exception=True)

        # Save the comparison with the authenticated user
        comparison = serializer.save(user=request.user)

        return Response(
            self.get_serializer(comparison).data,
            status=status.HTTP_201_CREATED
        )


class UserHypothesisListView(generics.ListAPIView):
    """API endpoint for listing a user's hypotheses"""
    serializer_class = UserHypothesisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter hypotheses by the authenticated user"""
        return UserHypothesis.objects.filter(user=self.request.user)


class HypothesesForVideoView(generics.ListAPIView):
    """API endpoint for listing all hypotheses related to a specific video"""
    serializer_class = AIHypothesisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        video_id = self.kwargs.get('video_id')
        return AIHypothesis.objects.filter(video_id=video_id)
