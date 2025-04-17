# videos/serializers.py
from rest_framework import serializers
from .models import Video

class VideoSerializer(serializers.ModelSerializer):
    """Serializer for the Video model"""
    class Meta:
        model = Video
        fields = ['id', 'title', 'file_path', 'description',
                 'dataset', 'created_at']
