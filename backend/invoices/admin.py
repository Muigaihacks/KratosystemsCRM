from unfold.admin import ModelAdmin
from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(ModelAdmin):
    list_display = [
        "invoice_number", "client", "total_kes", "status",
        "etims_submitted", "due_date", "sent_at", "created_at"
    ]
    list_filter = ["status", "etims_submitted"]
    search_fields = ["invoice_number", "client__company_name", "description"]
    readonly_fields = ["id", "invoice_number", "created_at", "updated_at"]
    fieldsets = [
        ("Invoice Info", {"fields": ["client", "proposal", "invoice_number", "status"]}),
        ("Amounts (KES)", {"fields": ["subtotal_kes", "vat_kes", "total_kes"]}),
        ("Details", {"fields": ["description", "line_items", "due_date", "paid_at"]}),
        ("eTIMS (KRA)", {"fields": ["etims_submitted", "etims_invoice_number", "etims_qr_code_url", "etims_submitted_at"]}),
        ("Document & Email", {"fields": ["pdf_url", "sent_to", "sent_at"]}),
        ("Metadata", {"fields": ["id", "created_at", "updated_at"], "classes": ["collapse"]}),
    ]
