from unfold.admin import ModelAdmin
from django.contrib import admin
from .models import Client, ClientContext


@admin.register(Client)
class ClientAdmin(ModelAdmin):
    list_display = [
        "company_name", "industry", "contact_name", "stage",
        "pipeline_value_kes", "days_in_stage", "source", "assigned_developer", "created_at"
    ]
    list_filter = ["stage", "industry", "source"]
    search_fields = ["company_name", "contact_name", "contact_email"]
    readonly_fields = ["id", "created_at", "updated_at", "stage_entered_at", "days_in_stage"]
    fieldsets = [
        ("Company", {"fields": ["company_name", "industry", "website", "location"]}),
        ("Contact", {"fields": ["contact_name", "contact_email", "contact_phone", "contact_role"]}),
        ("Pipeline", {"fields": ["stage", "pipeline_value_kes", "stage_entered_at", "days_in_stage"]}),
        ("Assignment", {"fields": ["source", "assigned_developer"]}),
        ("Status", {"fields": ["is_active", "closed_reason"]}),
        ("Metadata", {"fields": ["id", "created_at", "updated_at"], "classes": ["collapse"]}),
    ]


@admin.register(ClientContext)
class ClientContextAdmin(ModelAdmin):
    list_display = ["client", "context_type", "created_by", "created_at"]
    list_filter = ["context_type"]
    search_fields = ["client__company_name", "summary_text"]
    readonly_fields = ["id", "created_at"]
