from unfold.admin import ModelAdmin
from django.contrib import admin
from .models import ClientSession


@admin.register(ClientSession)
class ClientSessionAdmin(ModelAdmin):
    list_display = [
        "session_name", "client", "session_type", "provider",
        "transcript_status", "scheduled_at", "created_at"
    ]
    list_filter = ["session_type", "provider", "transcript_status"]
    search_fields = ["session_name", "client__company_name", "recall_bot_id"]
    readonly_fields = ["id", "created_at", "updated_at"]
    fieldsets = [
        ("Session Info", {"fields": ["client", "session_name", "session_type", "provider"]}),
        ("Meeting Details", {"fields": ["meeting_url", "scheduled_at", "duration_minutes"]}),
        ("Recall.ai & Recording", {"fields": ["recall_bot_id", "recording_url"]}),
        ("Transcription & Summary", {
            "fields": ["transcript_status", "transcript_text", "summary_text", "action_items", "key_takeaways"]
        }),
        ("Metadata", {"fields": ["id", "created_at", "updated_at"], "classes": ["collapse"]}),
    ]
