# users/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

User = get_user_model()

class UserAdmin(BaseUserAdmin):
    """Custom admin for the User model with additional fields"""
    fieldsets = BaseUserAdmin.fieldsets + (
        ('SciQurio Info', {'fields': ('student_id', 'college', 'labels_count')}),
    )
    list_display = ('username', 'email', 'student_id', 'college', 'labels_count', 'is_staff')
    search_fields = ('username', 'email', 'student_id')
    list_filter = ('college', 'is_staff', 'is_active')

admin.site.register(User, UserAdmin)