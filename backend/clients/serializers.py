from rest_framework import serializers
from .models import Client, ClientContext


class ClientContextSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ClientContext
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.username if obj.created_by else "AI Agent"


class ClientSerializer(serializers.ModelSerializer):
    days_in_stage = serializers.ReadOnlyField()
    context_entries = ClientContextSerializer(many=True, read_only=True)
    assigned_developer_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "stage_entered_at"]

    def get_assigned_developer_name(self, obj):
        if obj.assigned_developer:
            return obj.assigned_developer.get_full_name() or obj.assigned_developer.username
        return None


class ClientListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Kanban board cards — no nested context"""
    days_in_stage = serializers.ReadOnlyField()
    assigned_developer_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id", "company_name", "industry", "contact_name", "contact_email",
            "stage", "pipeline_value_kes", "days_in_stage", "source",
            "assigned_developer", "assigned_developer_name", "created_at",
        ]

    def get_assigned_developer_name(self, obj):
        if obj.assigned_developer:
            return obj.assigned_developer.get_full_name() or obj.assigned_developer.username
        return None
