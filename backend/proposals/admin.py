from unfold.admin import ModelAdmin
from django.contrib import admin
from .models import Proposal


@admin.register(Proposal)
class ProposalAdmin(ModelAdmin):
    list_display = [
        "proposal_number", "title", "client", "status",
        "total_value_kes", "sent_at", "created_at"
    ]
    list_filter = ["status"]
    search_fields = ["proposal_number", "title", "client__company_name"]
    readonly_fields = ["id", "proposal_number", "created_at", "updated_at"]
    fieldsets = [
        ("Proposal Details", {"fields": ["client", "proposal_number", "title", "status"]}),
        ("Commercials (KES)", {"fields": ["total_value_kes", "deposit_kes"]}),
        ("Scope & Content", {"fields": ["scope_summary", "timeline_summary", "ai_draft_text"]}),
        ("Document & Delivery", {"fields": ["final_pdf_url", "final_pdf_name", "email_sent_to", "sent_at"]}),
        ("Approval", {"fields": ["approved_by", "approved_at", "ai_generated_at"]}),
        ("Metadata", {"fields": ["id", "created_at", "updated_at"], "classes": ["collapse"]}),
    ]
