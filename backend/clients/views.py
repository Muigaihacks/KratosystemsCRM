from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Client, ClientContext, PipelineStage
from .serializers import ClientSerializer, ClientListSerializer, ClientContextSerializer


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().select_related("assigned_developer")

    def get_serializer_class(self):
        if self.action == "list":
            return ClientListSerializer
        return ClientSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        stage = self.request.query_params.get("stage")
        if stage:
            qs = qs.filter(stage=stage)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(company_name__icontains=search)
        return qs

    @action(detail=True, methods=["post"], url_path="move-stage")
    def move_stage(self, request, pk=None):
        """Move client to a new pipeline stage"""
        client = self.get_object()
        new_stage = request.data.get("stage")
        if new_stage not in [s.value for s in PipelineStage]:
            return Response({"error": "Invalid stage"}, status=status.HTTP_400_BAD_REQUEST)
        client.stage = new_stage
        client.save()
        return Response(ClientListSerializer(client).data)

    @action(detail=False, methods=["get"], url_path="kanban")
    def kanban(self, request):
        """Returns all clients grouped by pipeline stage for the Kanban board"""
        stages = [s.value for s in PipelineStage if s.value != PipelineStage.CLOSED_LOST]
        result = {}
        for stage in stages:
            clients = Client.objects.filter(stage=stage, is_active=True).select_related("assigned_developer")
            result[stage] = ClientListSerializer(clients, many=True).data
        return Response(result)

    @action(detail=False, methods=["get"], url_path="pipeline-summary")
    def pipeline_summary(self, request):
        """Total pipeline value and count per stage"""
        from django.db.models import Sum, Count
        summary = (
            Client.objects
            .filter(is_active=True)
            .values("stage")
            .annotate(count=Count("id"), total_kes=Sum("pipeline_value_kes"))
            .order_by("stage")
        )
        total = Client.objects.filter(is_active=True).aggregate(
            total=Sum("pipeline_value_kes"), count=Count("id")
        )
        return Response({"by_stage": list(summary), "total": total})


class ClientContextViewSet(viewsets.ModelViewSet):
    queryset = ClientContext.objects.all().select_related("client", "created_by", "session")
    serializer_class = ClientContextSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
