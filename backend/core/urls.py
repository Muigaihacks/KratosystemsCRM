"""
URL configuration for Kratos CRM backend
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "Kratos Systems"
admin.site.site_title = "Kratos CRM"
admin.site.index_title = "Operations Dashboard"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/clients/", include("clients.urls")),
    path("api/pipeline/", include("pipeline.urls")),
    path("api/sessions/", include("sessions.urls")),
    path("api/proposals/", include("proposals.urls")),
    path("api/invoices/", include("invoices.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
