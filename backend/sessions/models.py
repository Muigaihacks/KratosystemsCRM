from django.db import models
import uuid


class SessionProvider(models.TextChoices):
    GOOGLE_MEET = "google_meet", "Google Meet"
    ZOOM = "zoom", "Zoom"
    TEAMS = "teams", "Microsoft Teams"
    IN_PERSON = "in_person", "In-Person / Site Visit"


class SessionType(models.TextChoices):
    DISCOVERY = "discovery", "Discovery Session"
    NEGOTIATION = "negotiation", "Negotiation Session"
    CHECKIN = "checkin", "Check-in Session"
    REVIEW = "review", "Review Session"
    HANDOVER = "handover", "Handover Session"
    ONBOARDING = "onboarding", "Onboarding Session"


class TranscriptStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PROCESSING = "processing", "Processing"
    READY = "ready", "Ready"
    FAILED = "failed", "Failed"


class ClientSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    client = models.ForeignKey("clients.Client", on_delete=models.CASCADE, related_name="sessions")
    session_name = models.CharField(
        max_length=255,
        help_text='Use a clear name e.g. "Waiyaki — Discovery #1 — Oct 25 2026". This is what Recall.ai uses to identify the recording.'
    )
    session_type = models.CharField(max_length=30, choices=SessionType.choices, default=SessionType.DISCOVERY)
    provider = models.CharField(max_length=20, choices=SessionProvider.choices, default=SessionProvider.GOOGLE_MEET)

    # Scheduling
    meeting_url = models.URLField(blank=True, help_text="Google Meet / Zoom / Teams link")
    scheduled_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)

    # Recall.ai
    recall_bot_id = models.CharField(max_length=255, blank=True, help_text="Bot ID from Recall.ai API")
    recording_url = models.URLField(blank=True, help_text="R2 URL of recording if saved")

    # Transcription (AssemblyAI)
    transcript_status = models.CharField(
        max_length=20, choices=TranscriptStatus.choices, default=TranscriptStatus.PENDING
    )
    transcript_url = models.URLField(blank=True, help_text="R2 URL of full transcript")
    assemblyai_id = models.CharField(max_length=255, blank=True)

    # AI Summary (Claude)
    ai_summary = models.TextField(blank=True, help_text="AI-generated summary of this session")
    key_decisions = models.JSONField(default=list, blank=True, help_text="List of key decisions from the call")
    action_items = models.JSONField(default=list, blank=True, help_text="List of action items with owners")
    context_pushed = models.BooleanField(default=False, help_text="Whether summary was pushed to ClientContext")

    # Participants
    participants = models.JSONField(default=list, blank=True, help_text="List of participant names/emails")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_at", "-created_at"]
        verbose_name = "Client Session"
        verbose_name_plural = "Client Sessions"

    def __str__(self):
        return f"{self.session_name} ({self.get_session_type_display()})"
