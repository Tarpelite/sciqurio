# videos/models.py
from django.db import models

class Video(models.Model):
    """
    Model to store video metadata from The-Well dataset
    """
    title = models.CharField(max_length=200)
    file_path = models.FileField(upload_to='videos/')
    description = models.TextField()
    dataset = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']