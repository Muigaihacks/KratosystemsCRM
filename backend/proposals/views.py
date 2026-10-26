from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from .models import Proposal, ProposalStatus


class ProposalSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = "__all__"
        read_only_fields = ["id", "proposal_number", "created_at", "updated_at"]

    def get_client_name(self, obj):
        return obj.client.company_name


class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all().select_related("client", "approved_by")
    serializer_class = ProposalSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    @action(detail=True, methods=["post"], url_path="generate-draft")
    def generate_draft(self, request, pk=None):
        """
        Calls Claude API to generate a proposal draft from the client's context.
        """
        proposal = self.get_object()
        client = proposal.client

        # Gather all context entries for this client
        context_entries = client.context_entries.all().order_by("created_at")
        context_text = "\n\n".join(
            [f"[{e.get_context_type_display()} — {e.created_at.strftime('%d %b %Y')}]\n{e.summary_text}"
             for e in context_entries]
        )

        if not context_text.strip():
            return Response({"error": "No client context found. Add discovery session summaries first."}, status=400)

        import anthropic
        from django.conf import settings

        anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": f"""You are a senior software engineering consultant at Kratos Systems Ltd, 
a Nairobi-based custom software firm. Based on the client context below, 
draft a professional software development proposal in markdown format.

Client: {client.company_name} ({client.get_industry_display()})
Contact: {client.contact_name} ({client.contact_role})

Client Context & Discovery Notes:
{context_text}

Draft a professional proposal covering:
1. Executive Summary
2. Understanding of the Problem
3. Our Proposed Solution
4. Scope of Work (modules/features)
5. Technical Architecture Overview
6. Project Timeline (phased)
7. Commercial Terms (leave [PRICING TBD] as placeholder — Tyrese will fill this)
8. Why Kratos Systems

Keep it professional, specific to this client's actual business, and avoid generic filler."""
            }]
        )

        draft = message.content[0].text
        from django.utils import timezone
        proposal.ai_draft_text = draft
        proposal.ai_generated_at = timezone.now()
        proposal.status = ProposalStatus.REVIEW
        proposal.save()
        return Response({"draft": draft, "proposal_number": proposal.proposal_number})

    @action(detail=True, methods=["post"], url_path="send")
    def send_proposal(self, request, pk=None):
        """Sends the final approved proposal PDF to the client via Resend"""
        proposal = self.get_object()
        if not proposal.final_pdf_url:
            return Response({"error": "Upload the final proposal PDF first."}, status=400)
        if proposal.status != ProposalStatus.APPROVED:
            return Response({"error": "Proposal must be approved before sending."}, status=400)

        import resend
        from django.conf import settings
        from django.utils import timezone

        resend.api_key = settings.RESEND_API_KEY
        params = {
            "from": f"Tyrese Muigai <{settings.DEFAULT_FROM_EMAIL}>",
            "to": [proposal.client.contact_email],
            "subject": f"Proposal: {proposal.title} — Kratos Systems",
            "html": f"""
<p>Dear {proposal.client.contact_name},</p>
<p>Please find attached our proposal for <strong>{proposal.title}</strong>.</p>
<p>We look forward to discussing this further. Feel free to reach out with any questions.</p>
<p>Best regards,<br>Tyrese Muigai<br>Founder & CAIO — Kratos Systems Ltd</p>
""",
            "attachments": [{"filename": proposal.final_pdf_name or "Kratos_Proposal.pdf", "path": proposal.final_pdf_url}],
        }
        resend.Emails.send(params)
        proposal.status = ProposalStatus.SENT
        proposal.sent_at = timezone.now()
        proposal.email_sent_to = proposal.client.contact_email
        proposal.save()

        # Auto-advance client pipeline stage
        client = proposal.client
        from clients.models import PipelineStage
        if client.stage == PipelineStage.DISCOVERY:
            client.stage = PipelineStage.PROPOSAL_SENT
            client.save()

        return Response({"status": "Proposal sent", "sent_to": proposal.email_sent_to})
