# hypotheses/admin.py
from django.contrib import admin
from .models import AIHypothesis, UserHypothesis, HypothesisComparison

@admin.register(AIHypothesis)
class AIHypothesisAdmin(admin.ModelAdmin):
    """Admin for AIHypothesis model"""
    list_display = ('video', 'difficulty', 'created_at')
    list_filter = ('difficulty', 'created_at')
    search_fields = ('content', 'video__title')
    readonly_fields = ('created_at',)

@admin.register(UserHypothesis)
class UserHypothesisAdmin(admin.ModelAdmin):
    """Admin for UserHypothesis model"""
    list_display = ('user', 'video', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'user__username', 'video__title')
    readonly_fields = ('created_at',)

@admin.register(HypothesisComparison)
class HypothesisComparisonAdmin(admin.ModelAdmin):
    """Admin for HypothesisComparison model"""
    list_display = ('user', 'video', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('reason', 'user__username', 'video__title')
    readonly_fields = ('created_at',)
