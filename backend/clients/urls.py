from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, ClientContextViewSet

router = DefaultRouter()
router.register(r"", ClientViewSet, basename="client")
router.register(r"context", ClientContextViewSet, basename="client-context")

urlpatterns = [path("", include(router.urls))]
