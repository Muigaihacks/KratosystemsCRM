from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from .models import ClientSession, TranscriptStatus


class ClientSessionSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = ClientSession
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_client_name(self, obj):
        return obj.client.company_name


class ClientSessionViewSet(viewsets.ModelViewSet):
    queryset = ClientSession.objects.all().select_related("client")
    serializer_class = ClientSessionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    @action(detail=True, methods=["post"], url_path="dispatch-bot")
    def dispatch_bot(self, request, pk=None):
        """
        Sends Recall.ai bot to the meeting URL.
        Requires meeting_url to be set on the session.
        """
        session = self.get_object()
        if not session.meeting_url:
            return Response({"error": "No meeting URL set on this session."}, status=400)

        import requests
        from django.conf import settings

        payload = {
            "meeting_url": session.meeting_url,
            "bot_name": f"Kratos Notes — {session.session_name}",
            "recording_config": {"transcript": {"provider": {"meeting_captions": {}}}},
        }
        resp = requests.post(
            "https://us-west-2.recall.ai/api/v1/bot/",
            json=payload,
            headers={
                "Authorization": f"Token {settings.RECALL_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=15,
        )
        if resp.status_code == 201:
            bot_id = resp.json().get("id")
            session.recall_bot_id = bot_id
            session.transcript_status = TranscriptStatus.PROCESSING
            session.save()
            return Response({"bot_id": bot_id, "status": "Bot dispatched successfully"})
        return Response({"error": resp.text}, status=resp.status_code)
