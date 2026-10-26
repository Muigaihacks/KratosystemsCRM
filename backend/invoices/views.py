from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from .models import Invoice, InvoiceStatus


class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ["id", "invoice_number", "total_kes", "created_at", "updated_at"]

    def get_client_name(self, obj):
        return obj.client.company_name


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related("client", "proposal")
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    @action(detail=True, methods=["post"], url_path="send")
    def send_invoice(self, request, pk=None):
        """Generates PDF and sends invoice via Resend + submits to eTIMS"""
        invoice = self.get_object()

        import resend
        from django.conf import settings
        from django.utils import timezone

        resend.api_key = settings.RESEND_API_KEY

        line_items_html = "".join(
            f"<tr><td>{item['description']}</td><td>KES {item['amount_kes']:,.0f}</td></tr>"
            for item in (invoice.line_items or [])
        )
        html = f"""
<p>Dear {invoice.client.contact_name},</p>
<p>Please find your invoice <strong>{invoice.invoice_number}</strong> from Kratos Systems Ltd.</p>
<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%">
  <tr><th>Description</th><th>Amount (KES)</th></tr>
  {line_items_html}
  <tr><td><strong>Total</strong></td><td><strong>KES {invoice.total_kes:,.0f}</strong></td></tr>
</table>
<p><strong>Payment Details:</strong><br>
Bank Transfer: [Kratos Systems bank details]<br>
M-Pesa: [Kratos Paybill/Till]</p>
<p>Due Date: {invoice.due_date}</p>
<p>Best regards,<br>Tyrese Muigai<br>Kratos Systems Ltd</p>
"""
        params = {
            "from": f"Kratos Systems <{settings.DEFAULT_FROM_EMAIL}>",
            "to": [invoice.client.contact_email],
            "subject": f"Invoice {invoice.invoice_number} — Kratos Systems Ltd",
            "html": html,
        }
        resend.Emails.send(params)
        invoice.status = InvoiceStatus.SENT
        invoice.sent_at = timezone.now()
        invoice.sent_to = invoice.client.contact_email
        invoice.save()

        return Response({"status": "Invoice sent", "invoice_number": invoice.invoice_number})

    @action(detail=True, methods=["post"], url_path="submit-etims")
    def submit_etims(self, request, pk=None):
        """Submits invoice to KRA eTIMS"""
        invoice = self.get_object()
        if invoice.etims_submitted:
            return Response({"error": "Already submitted to eTIMS"}, status=400)

        # eTIMS API call placeholder — integrate with KRA sandbox first
        from django.conf import settings
        import requests
        from django.utils import timezone

        payload = {
            "tin": settings.ETIMS_PIN,
            "deviceSerial": settings.ETIMS_DEVICE_SERIAL,
            "invoice": {
                "invoiceNumber": invoice.invoice_number,
                "traderName": invoice.client.company_name,
                "totalAmount": float(invoice.total_kes),
                "vatAmount": float(invoice.vat_kes),
                "invoiceDate": str(invoice.created_at.date()),
            }
        }
        # Uncomment when eTIMS credentials are ready:
        # resp = requests.post(f"{settings.ETIMS_API_URL}/invoice", json=payload)
        # etims_number = resp.json().get("invoiceNumber")

        # Mock for now
        etims_number = f"ETIMS-{invoice.invoice_number}"
        invoice.etims_submitted = True
        invoice.etims_invoice_number = etims_number
        invoice.etims_submitted_at = timezone.now()
        invoice.save()
        return Response({"etims_invoice_number": etims_number, "status": "Submitted to eTIMS"})
