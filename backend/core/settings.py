"""
Django settings for Kratos Systems CRM
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Compatibility: Allow local PostgreSQL 14 with Django 6.1
from django.db.backends.postgresql.base import DatabaseWrapper
DatabaseWrapper.check_database_version_supported = lambda self: None

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-in-production")
DEBUG = os.environ.get("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Application definition
INSTALLED_APPS = [
    # Unfold admin (must be before django.contrib.admin)
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.forms",
    "unfold.contrib.inlines",
    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "corsheaders",
    # Kratos apps
    "clients",
    "pipeline",
    "sessions",
    "proposals",
    "invoices",
    "team",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "kratos_crm"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", ""),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}

# CORS — allow Next.js frontend
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")
CORS_ALLOW_CREDENTIALS = True

# Static & Media
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

# Cloudflare R2
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME", "kratos-crm-files")
R2_PUBLIC_URL = os.environ.get("R2_PUBLIC_URL", "")

# Clerk (JWT verification)
CLERK_SECRET_KEY = os.environ.get("CLERK_SECRET_KEY", "")
CLERK_PUBLISHABLE_KEY = os.environ.get("CLERK_PUBLISHABLE_KEY", "")

# Anthropic (Claude API)
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# Recall.ai
RECALL_API_KEY = os.environ.get("RECALL_API_KEY", "")

# AssemblyAI
ASSEMBLYAI_API_KEY = os.environ.get("ASSEMBLYAI_API_KEY", "")

# Resend (email)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "crm@kratosystems.africa")

# eTIMS (KRA)
ETIMS_API_URL = os.environ.get("ETIMS_API_URL", "https://etims-api.kra.go.ke")
ETIMS_PIN = os.environ.get("ETIMS_PIN", "")
ETIMS_DEVICE_SERIAL = os.environ.get("ETIMS_DEVICE_SERIAL", "")

# Django Unfold Admin Theme
UNFOLD = {
    "SITE_TITLE": "Kratos CRM Admin",
    "SITE_HEADER": "Kratos Systems",
    "SITE_SYMBOL": "hub",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "THEME": "dark",
    "COLORS": {
        "primary": {
            "50": "240 253 250",
            "100": "204 251 241",
            "200": "153 246 228",
            "300": "94 240 184",
            "400": "52 211 153",
            "500": "31 142 134",   # kratos-500 teal
            "600": "13 148 136",
            "700": "15 118 110",
            "800": "17 94 89",
            "900": "19 78 74",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Business Development",
                "separator": True,
                "items": [
                    {"title": "Clients", "icon": "people", "link": "/admin/clients/client/"},
                    {"title": "Pipeline", "icon": "view_kanban", "link": "/admin/pipeline/pipelinestage/"},
                    {"title": "Client Sessions", "icon": "video_call", "link": "/admin/sessions/clientsession/"},
                ],
            },
            {
                "title": "Deals",
                "separator": True,
                "items": [
                    {"title": "Proposals", "icon": "description", "link": "/admin/proposals/proposal/"},
                    {"title": "Invoices", "icon": "receipt", "link": "/admin/invoices/invoice/"},
                ],
            },
            {
                "title": "System",
                "separator": True,
                "items": [
                    {"title": "Users", "icon": "manage_accounts", "link": "/admin/auth/user/"},
                ],
            },
        ],
    },
}
