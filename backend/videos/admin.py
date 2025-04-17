# videos/admin.py
from django.contrib import admin
from .models import Video

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    """Admin for Video model"""
    list_display = ('title', 'dataset', 'created_at')
    search_fields = ('title', 'description', 'dataset')
    list_filter = ('dataset', 'created_at')
    readonly_fields = ('created_at',)
