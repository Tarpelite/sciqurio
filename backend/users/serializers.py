# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'student_id', 'college', 'labels_count')
        read_only_fields = ('id', 'labels_count')

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for registering new users"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'student_id', 'college')
    
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            student_id=validated_data.get('student_id', ''),
            college=validated_data.get('college', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
