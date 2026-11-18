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

        from django.conf import settings
        draft = ""

        prompt_text = f"""You are the senior legal and technical contract architect at Kratos Systems Ltd.
Based on the client details and discovery context below, draft a formal, legally grounded 
"SOFTWARE DEVELOPMENT & IMPLEMENTATION AGREEMENT" in clean markdown format following Kratos Systems' official 14-page contract template.

CLIENT DETAILS:
- Company / Legal Entity: {client.company_name} ({client.get_industry_display()})
- Contact Person: {client.contact_name} ({client.contact_role})
- Contact Email: {client.contact_email}

DISCOVERY CONTEXT & NOTES:
{context_text}

STRUCTURE TO GENERATE (Follow strictly):
# KRATOS SYSTEMS | SOFTWARE DEVELOPMENT & IMPLEMENTATION
## SOFTWARE DEVELOPMENT & IMPLEMENTATION AGREEMENT
### {client.company_name} Operations & Digital Platform

**SERVICE PROVIDER:** Tyrese Muigai trading as Kratos Systems, a sole proprietorship of WAMU APARTMENTS JUJA, Business Name Registration No. BN-2OSJW6VA, KRA PIN A018866725K
**CLIENT:** [FULL REGISTERED LEGAL NAME OF {client.company_name.upper()}]
**AGREEMENT DATE:** [INSERT DATE]
**PROJECT FEE:** KShs [ESTIMATED OR INSERT AMOUNT] (Subject to Schedule B tax election)

---
### RECITALS & BACKGROUND
Provide background recitals (A, B, C) detailing the client's operational context, problem statement, and appointment of Kratos Systems.

### CORE OPERATIVE CLAUSES
Include the standard 18 formal clauses:
1. DEFINITIONS AND INTERPRETATION (Acceptance Criteria, Business Day, Deliverables, Third-Party Services)
2. APPOINTMENT AND TERM (Commencement upon receipt of Tranche 1)
3. SCOPE OF SERVICES AND CHANGE CONTROL (Formal Change Request mechanism)
4. PROJECT PLAN AND DELIVERY (Phased rollout with milestones)
5. CLIENT RESPONSIBILITIES AND DEPENDENCIES (M-Pesa Paybill/B2C, GCP/AWS access, operational readiness)
6. FEES, INVOICING AND PAYMENT (Two-tranche structure: Tranche 1 upon execution, Tranche 2 upon UAT; 14-day grace period, 2% interest on overdue amounts, NCBA Bank Kenya payment terms)
7. DELIVERY, TESTING AND ACCEPTANCE (7 business days UAT, deemed acceptance provisions)
8. DEPLOYMENT, THIRD-PARTY COSTS AND SERVICE AVAILABILITY (Client directly funds cloud/SMS/APIs)
9. TRAINING, WARRANTY AND SUPPORT (90-day defect warranty, first 3 calendar months post-delivery support included at no additional fee)
10. INTELLECTUAL PROPERTY AND HANDOVER (Client owns Client Data; perpetual internal license; source-code handover upon full payment)
11. CONFIDENTIALITY AND DATA PROTECTION (Kenyan Data Protection Act 2019 / ODPC controller-processor allocation)
12. SECURITY AND OPERATIONAL LIMITATIONS (RBAC, HTTPS, encrypted secrets, automated daily cloud database backups)
13. WARRANTIES, DISCLAIMERS AND LIABILITY (Liability capped at total contract fee; indirect loss exclusion)
14. SUSPENSION
15. TERMINATION AND CONSEQUENCES (30 days written notice; Tranche 1 non-refundable once development starts)
16. DISPUTE RESOLUTION AND GOVERNING LAW (Arbitration in Nairobi under Kenyan Arbitration Act 1995; laws of Kenya)
17. NOTICES (Provider: KRATOS SYSTEMS / TYRESE MUIGAI, P.O. BOX 9643-00100, INFO@KRATOSYSTEMS.AFRICA)
18. GENERAL (Entire agreement, severability, execution in counterparts)

### SIGNATURE BLOCKS
Include formal execution blocks for Tyrese Muigai (Provider) and the Client's Authorized Signatory.

### SCHEDULE A — STATEMENT OF WORK
- A1. Project Objective
- A2. Confirmed Modules and Functionality (Break down specific modules based on discovery notes)
- A3. Technical Architecture Table (Frontend: Next.js/React, Backend: Django REST, DB: PostgreSQL, Automations: n8n, Security)
- A4. Data Onboarding and Migration
- A5. Third-Party Services and Cost Allocation
- A6. Delivery Milestones and Acceptance Criteria Table
- A7. Client Dependencies & Assumptions
- A8. Exclusions

### SCHEDULE B — COMMERCIAL SCHEDULE & PAYMENT TERMS
- B1. Fixed Fee & Two-Tranche Milestone Payment Structure (Tranche 1 commencement 50%, Tranche 2 completion 50%)
- B2. Tax Treatment Checkboxes (Inclusive vs Exclusive of VAT)
- B3. Payment Instructions (NCBA BANK KENYA, Account Name: Kratos Systems, Account No: 1012773263, or M-Pesa Paybill)
- B4. Commercial Contact Details (Client contact and Tyrese Muigai - 0718004282 - tyresemuigai09@gmail.com)

Draft this with complete precision, legal gravity, and technical exactness."""

        if getattr(settings, "OPENAI_API_KEY", None):
            import openai
            client_ai = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client_ai.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt_text}],
                temperature=0.7,
            )
            draft = response.choices[0].message.content
        elif getattr(settings, "ANTHROPIC_API_KEY", None):
            import anthropic
            anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            message = anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt_text}],
            )
            draft = message.content[0].text
        else:
            return Response({"error": "No AI API key (OpenAI or Anthropic) configured."}, status=500)
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
