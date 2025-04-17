# hypotheses/serializers.py
from rest_framework import serializers
from .models import AIHypothesis, UserHypothesis, HypothesisComparison

class AIHypothesisSerializer(serializers.ModelSerializer):
    """Serializer for AI-generated hypotheses"""
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    
    class Meta:
        model = AIHypothesis
        fields = ['id', 'video', 'content', 'ai_model', 'difficulty', 
                  'difficulty_display', 'justification', 'created_at']

class UserHypothesisSerializer(serializers.ModelSerializer):
    """Serializer for user-generated hypotheses"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserHypothesis
        fields = ['id', 'user', 'username', 'video', 'content', 'created_at']
        read_only_fields = ['user']

class HypothesisComparisonSerializer(serializers.ModelSerializer):
    """Serializer for hypothesis comparisons"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = HypothesisComparison
        fields = ['id', 'user', 'username', 'video', 'user_hypothesis', 
                  'selected_hypothesis', 'reason', 'created_at']
        read_only_fields = ['user']