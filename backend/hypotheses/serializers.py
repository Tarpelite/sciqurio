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

    def validate(self, data):
        print("Validating data:", data)
        return data

    def create(self, validated_data):
        print("Creating UserHypothesis with data:", validated_data)
        return UserHypothesis.objects.create(**validated_data)  # Call the model's create method directly


class HypothesisComparisonSerializer(serializers.ModelSerializer):
    """Serializer for hypothesis comparisons"""
    class Meta:
        model = HypothesisComparison
        fields = ['id', 'user', 'video', 'user_hypothesis', 'selected_hypothesis', 'reason', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        # Set the user field from the context
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
