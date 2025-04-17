# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom user model that extends Django's AbstractUser to add fields specific to SciQurio
    """
    student_id = models.CharField(max_length=20, blank=True, null=True)
    college = models.CharField(max_length=100, blank=True, null=True)
    labels_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.username





