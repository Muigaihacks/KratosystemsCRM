from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from clients.models import Client, PipelineStage


class PipelineStatsView(APIView):
    def get(self, request):
        active_clients = Client.objects.filter(is_active=True)
        total_pipeline_kes = active_clients.aggregate(total=Sum("pipeline_value_kes"))["total"] or 0
        total_clients = active_clients.count()

        by_stage = {}
        for stage in PipelineStage:
            if stage == PipelineStage.CLOSED_LOST:
                continue
            qs = active_clients.filter(stage=stage.value)
            by_stage[stage.value] = {
                "count": qs.count(),
                "total_kes": float(qs.aggregate(t=Sum("pipeline_value_kes"))["t"] or 0),
                "label": stage.label,
            }

        return Response({
            "total_pipeline_kes": float(total_pipeline_kes),
            "total_clients": total_clients,
            "by_stage": by_stage,
        })
