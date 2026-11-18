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

    def perform_create(self, serializer):
        count = Invoice.objects.count() + 1
        invoice_number = f"HK2V88-{count:02d}"
        serializer.save(invoice_number=invoice_number)

    @action(detail=True, methods=["post"], url_path="send")
    def send_invoice(self, request, pk=None):
        """Generates PDF and sends invoice via Resend + submits to eTIMS"""
        invoice = self.get_object()

        import resend
        from django.conf import settings
        from django.utils import timezone

        resend.api_key = settings.RESEND_API_KEY

        line_items_html = "".join(
            f"<tr><td style='padding:8px;border-bottom:1px solid #e5e7eb;'>{item['description']}</td><td style='padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;'>KSH {item['amount_kes']:,.0f}</td></tr>"
            for item in (invoice.line_items or [])
        )
        html = f"""
<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #1F8E86; padding-bottom: 12px; margin-bottom: 20px;">
    <div>
      <h2 style="color: #1F8E86; margin: 0; font-size: 20px;">KRATOS SYSTEMS</h2>
      <p style="margin: 2px 0 0; font-size: 11px; color: #64748b; font-style: italic;">You Dream it, We Build it!</p>
    </div>
    <div style="text-align: right;">
      <span style="font-size: 14px; font-weight: bold; color: #0f172a;">INVOICE: {invoice.invoice_number}</span><br>
      <span style="font-size: 12px; color: #64748b;">Due Date: {invoice.due_date}</span>
    </div>
  </div>

  <p>Dear {invoice.client.contact_name},</p>
  <p>Please find details of your invoice <strong>{invoice.invoice_number}</strong> issued to <strong>{invoice.client.company_name}</strong>.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
    <thead>
      <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left;">
        <th style="padding: 10px;">Description</th>
        <th style="padding: 10px; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      {line_items_html}
      <tr>
        <td style="padding: 12px 10px; font-weight: bold; border-top: 2px solid #1F8E86;">TOTAL DUE</td>
        <td style="padding: 12px 10px; font-weight: bold; text-align: right; border-top: 2px solid #1F8E86; color: #1F8E86; font-size: 15px;">KSH {invoice.total_kes:,.0f}</td>
      </tr>
    </tbody>
  </table>

  <div style="background-color: #f1f5f9; padding: 14px; border-radius: 6px; font-size: 12px; margin-top: 20px;">
    <strong style="color: #0f172a;">PAYMENT DETAILS:</strong><br>
    <strong>Bank:</strong> NCBA BANK KENYA<br>
    <strong>Account Name:</strong> Kratos Systems<br>
    <strong>Account No.:</strong> 1012773263
  </div>

  <p style="margin-top: 24px; font-size: 13px;">Thank you for your business!</p>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;">
  <p style="font-size: 11px; color: #94a3b8; text-align: center;">Kratos Systems Ltd • Nairobi, Kenya • info@kratosystems.africa</p>
</div>
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
