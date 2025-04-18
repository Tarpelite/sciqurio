# videos/views.py
from rest_framework import generics, permissions
from django.http import FileResponse, Http404
from .models import Video
from .serializers import VideoSerializer
import os
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import random
from rest_framework.permissions import AllowAny


class VideoListView(generics.ListAPIView):
    """API endpoint for listing videos"""
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Optional filtering by dataset"""
        queryset = Video.objects.all()
        dataset = self.request.query_params.get('dataset', None)
        if dataset:
            queryset = queryset.filter(dataset=dataset)
        return queryset


class VideoDetailView(generics.RetrieveAPIView):
    """API endpoint for retrieving a single video's details"""
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]


class RandomVideoView(APIView):
    """API endpoint to get a random video"""
    # permission_classes = [AllowAny]  # Allow access without authentication

    def get(self, request):
        videos = Video.objects.all()
        if not videos.exists():
            return Response({'error': 'No videos available'}, status=status.HTTP_404_NOT_FOUND)

        random_video = random.choice(videos)
        return Response({
            'video_url': random_video.file_path.url,
            'video_id': random_video.id,
            'title': random_video.title,
        }, status=status.HTTP_200_OK)


class VideoStreamView(generics.RetrieveAPIView):
    """API endpoint for streaming video content"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        video_id = kwargs.get('pk')
        try:
            video = Video.objects.get(pk=video_id)
            file_path = video.file_path.path

            if os.path.exists(file_path):
                return FileResponse(open(file_path, 'rb'), content_type='video/mp4')
            else:
                raise Http404("视频文件未找到")
        except Video.DoesNotExist:
            raise Http404("视频不存在")
