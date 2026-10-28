from rest_framework import serializers
from .models import TeamMember, TeamRole, MemberStatus


class TeamMemberSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    is_locked = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "name",
            "email",
            "role",
            "role_display",
            "status",
            "status_display",
            "password_change_count",
            "is_active",
            "is_locked",
            "phone",
            "notes",
            "permissions",
            "last_active_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "is_locked", "permissions"]

    def get_is_locked(self, obj):
        return obj.password_change_count >= 3 or obj.status == MemberStatus.LOCKED

    def get_permissions(self, obj):
        if obj.role == TeamRole.ADMIN:
            return {
                "dashboard": True,
                "hit_list": True,
                "pipeline": True,
                "clients": True,
                "sessions": True,
                "proposals": True,
                "invoices": True,
                "analytics": True,
                "team_management": True,
                "export_data": True,
            }
        elif obj.role == TeamRole.BD:
            return {
                "dashboard": True,
                "hit_list": True,
                "pipeline": True,
                "clients": True,
                "sessions": True,
                "proposals": True,
                "invoices": False,
                "analytics": True,
                "team_management": False,
                "export_data": False,
            }
        else:  # DEVELOPER
            return {
                "dashboard": True,
                "hit_list": False,
                "pipeline": True,
                "clients": True,  # assigned only
                "sessions": True,
                "proposals": False,
                "invoices": False,
                "analytics": False,
                "team_management": False,
                "export_data": False,
            }
