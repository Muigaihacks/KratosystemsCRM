from django.db import models
from django.contrib.auth.models import User
import uuid


class PipelineStage(models.TextChoices):
    HIT_LIST = "hit_list", "Hit List"
    ENGAGED = "engaged", "Engaged"
    DISCOVERY = "discovery", "Discovery"
    PROPOSAL_SENT = "proposal_sent", "Proposal Sent"
    NEGOTIATION = "negotiation", "Negotiation"
    CONTRACTING = "contracting", "Contracting"
    ACTIVE_BUILD = "active_build", "Active Build"
    MAINTENANCE = "maintenance", "Maintenance"
    CLOSED_LOST = "closed_lost", "Closed Lost"


class Industry(models.TextChoices):
    AGRITECH = "agritech", "Agritech"
    FINTECH = "fintech", "Fintech"
    HEALTH = "health", "Health"
    REAL_ESTATE = "real_estate", "Real Estate"
    LOGISTICS = "logistics", "Logistics"
    RETAIL = "retail", "Retail"
    HOSPITALITY = "hospitality", "Hospitality"
    MANUFACTURING = "manufacturing", "Manufacturing"
    LEGAL = "legal", "Legal"
    EDUCATION = "education", "Education"
    OTHER = "other", "Other"


class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Company details
    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=50, choices=Industry.choices, default=Industry.OTHER)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=255, blank=True)

    # Primary contact
    contact_name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_role = models.CharField(max_length=100, blank=True, help_text="e.g. CEO, CTO, Founder")

    # Pipeline
    stage = models.CharField(
        max_length=30,
        choices=PipelineStage.choices,
        default=PipelineStage.HIT_LIST
    )
    pipeline_value_kes = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="Estimated or agreed project value in KES"
    )
    stage_entered_at = models.DateTimeField(auto_now=True)

    # Assignment
    source = models.CharField(
        max_length=50,
        choices=[("chris", "Chris (Wylde)"), ("tyrese", "Tyrese"), ("referral", "Referral"), ("inbound", "Inbound")],
        default="chris"
    )
    assigned_developer = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="assigned_clients"
    )

    # Status flags
    is_active = models.BooleanField(default=True)
    closed_reason = models.TextField(blank=True, help_text="For Closed Lost only")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Client"
        verbose_name_plural = "Clients"

    def __str__(self):
        return f"{self.company_name} — {self.get_stage_display()}"

    @property
    def days_in_stage(self):
        from django.utils import timezone
        delta = timezone.now() - self.stage_entered_at
        return delta.days


class ClientContext(models.Model):
    """
    Running context log for a client — populated by AI meeting summaries
    and manual notes from Tyrese/Chris.
    """
    CONTEXT_TYPES = [
        ("manual_note", "Manual Note"),
        ("meeting_summary", "Meeting Summary (AI)"),
        ("site_visit", "Site Visit Notes"),
        ("proposal_feedback", "Proposal Feedback"),
        ("contract_note", "Contract Note"),
        ("general", "General"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="context_entries")
    context_type = models.CharField(max_length=30, choices=CONTEXT_TYPES, default="general")
    created_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    summary_text = models.TextField(help_text="Key facts and decisions — keep concise")
    full_transcript_url = models.URLField(blank=True, help_text="R2 Storage link to full transcript")
    tags = models.JSONField(default=list, blank=True)
    session = models.ForeignKey(
        "client_sessions.ClientSession", null=True, blank=True, on_delete=models.SET_NULL,
        related_name="context_entries"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Context Entry"
        verbose_name_plural = "Context Entries"

    def __str__(self):
        return f"[{self.get_context_type_display()}] {self.client.company_name} — {self.created_at.date()}"
