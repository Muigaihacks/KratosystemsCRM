from django.db import models
import uuid


class ProposalStatus(models.TextChoices):
    DRAFT = "draft", "Draft (AI Generated)"
    REVIEW = "review", "Under Review"
    APPROVED = "approved", "Approved"
    SENT = "sent", "Sent to Client"
    ACCEPTED = "accepted", "Accepted"
    REJECTED = "rejected", "Rejected"


class Proposal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey("clients.Client", on_delete=models.CASCADE, related_name="proposals")
    proposal_number = models.CharField(max_length=20, unique=True, help_text="e.g. KS-PROP-001")

    # Content
    title = models.CharField(max_length=255, help_text="e.g. 'Hides & Skins Business Intelligence System'")
    ai_draft_text = models.TextField(blank=True, help_text="Claude-generated draft content (markdown)")
    scope_summary = models.TextField(blank=True)
    timeline_summary = models.TextField(blank=True)

    # Commercial
    total_value_kes = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    deposit_kes = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Files
    final_pdf_url = models.URLField(blank=True, help_text="R2 URL of final approved proposal PDF")
    final_pdf_name = models.CharField(max_length=255, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=ProposalStatus.choices, default=ProposalStatus.DRAFT)
    sent_at = models.DateTimeField(null=True, blank=True)
    email_sent_to = models.EmailField(blank=True)

    # Tracking
    ai_generated_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        "auth.User", null=True, blank=True, on_delete=models.SET_NULL,
        related_name="approved_proposals"
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Proposal"
        verbose_name_plural = "Proposals"

    def __str__(self):
        return f"{self.proposal_number} — {self.client.company_name}"

    def save(self, *args, **kwargs):
        if not self.proposal_number:
            # Auto-generate: KS-PROP-001
            last = Proposal.objects.order_by("-created_at").first()
            next_num = (int(last.proposal_number.split("-")[-1]) + 1) if last else 1
            self.proposal_number = f"KS-PROP-{next_num:03d}"
        super().save(*args, **kwargs)
