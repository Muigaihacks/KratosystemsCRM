from django.db import models
import uuid


class InvoiceStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SENT = "sent", "Sent"
    PAID = "paid", "Paid"
    OVERDUE = "overdue", "Overdue"
    CANCELLED = "cancelled", "Cancelled"


class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey("clients.Client", on_delete=models.CASCADE, related_name="invoices")
    proposal = models.ForeignKey(
        "proposals.Proposal", null=True, blank=True, on_delete=models.SET_NULL,
        related_name="invoices"
    )
    invoice_number = models.CharField(max_length=20, unique=True, help_text="e.g. KS-INV-001")

    # Line items
    description = models.TextField(help_text="What this invoice is for")
    line_items = models.JSONField(default=list, help_text="[{description, amount_kes}]")
    subtotal_kes = models.DecimalField(max_digits=12, decimal_places=2)
    vat_kes = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_kes = models.DecimalField(max_digits=12, decimal_places=2)

    # Status
    status = models.CharField(max_length=20, choices=InvoiceStatus.choices, default=InvoiceStatus.DRAFT)
    due_date = models.DateField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    # Files (Cloudflare R2)
    pdf_url = models.URLField(blank=True, help_text="R2 URL of invoice PDF")

    # eTIMS (KRA)
    etims_submitted = models.BooleanField(default=False)
    etims_invoice_number = models.CharField(max_length=100, blank=True)
    etims_qr_code_url = models.URLField(blank=True)
    etims_submitted_at = models.DateTimeField(null=True, blank=True)

    # Email tracking
    sent_at = models.DateTimeField(null=True, blank=True)
    sent_to = models.EmailField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"

    def __str__(self):
        return f"{self.invoice_number} — {self.client.company_name} — KES {self.total_kes:,.0f}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            last = Invoice.objects.order_by("-created_at").first()
            next_num = (int(last.invoice_number.split("-")[-1]) + 1) if last else 1
            self.invoice_number = f"KS-INV-{next_num:03d}"
        self.total_kes = self.subtotal_kes + self.vat_kes
        super().save(*args, **kwargs)
