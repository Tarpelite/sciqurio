# videos/views.py
from rest_framework import generics, permissions
from django.http import FileResponse, Http404
from .models import Video
from .serializers import VideoSerializer
import os
from rest_framework.response import Response

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

class RandomVideoView(generics.RetrieveAPIView):
    """API endpoint for getting a random video (for 'next question' functionality)"""
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        # Get a random video
        video = Video.objects.order_by('?').first()
        if not video:
            return Response({"error": "No videos available"}, status=404)
        
        serializer = self.get_serializer(video)
        return Response(serializer.data)

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
