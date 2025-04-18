# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user model that extends Django's AbstractUser to add fields specific to SciQurio
    """
    username = models.CharField(max_length=150, unique=True)  # Explicit username field
    name = models.CharField(max_length=100, blank=True, null=True)  # New field for '姓名'
    student_id = models.CharField(max_length=20, blank=True, null=True)  # Existing field for '学号'
    college = models.CharField(max_length=100, blank=True, null=True)  # Existing field for '学院'
    email = models.EmailField(unique=True)  # Ensure email is unique and required
    labels_count = models.IntegerField(default=0)  # Existing field

    def __str__(self):
        return f"{self.name or self.username} - Student ID: {self.student_id or 'Not provided'} - College: {self.college or 'Not provided'}"
