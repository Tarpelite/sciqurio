# hypotheses/models.py
from django.db import models
from django.conf import settings
from videos.models import Video

class AIHypothesis(models.Model):
    """
    Model to store AI-generated hypotheses for videos
    """
    DIFFICULTY_CHOICES = [
        ('Foundational', '基础理解'),
        ('Advanced', '进阶探究'),
        ('Exploratory', '探索性/新颖联系'),
        ('Violating', '违背科学原理'),
    ]
    
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='ai_hypotheses')
    content = models.TextField()
    ai_model = models.TextField(blank=True, null=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    justification = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['difficulty']
    
    def __str__(self):
        return f"{self.get_difficulty_display()} hypothesis for {self.video.title}"

class UserHypothesis(models.Model):
    """
    Model to store user-generated hypotheses
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hypotheses')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='user_hypotheses')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}'s hypothesis for {self.video.title}"


class HypothesisComparison(models.Model):
    """
    Model to store user selections/comparisons between hypotheses
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comparisons')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comparisons')
    user_hypothesis = models.ForeignKey(UserHypothesis, on_delete=models.CASCADE, related_name='comparisons')
    selected_hypothesis = models.ForeignKey(AIHypothesis, on_delete=models.CASCADE, related_name='selections')
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}'s comparison for {self.video.title}"