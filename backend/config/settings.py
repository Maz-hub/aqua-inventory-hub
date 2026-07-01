from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Edit 7.4 — SECRET_KEY read from environment; fallback is for local dev only
SECRET_KEY = os.environ.get('SECRET_KEY', 'unsafe-fallback-key-for-local-dev-only')

# Edit 7.3 — DEBUG driven by environment variable; defaults to False
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Edit 7.2 — ALLOWED_HOSTS uses Azure's automatic WEBSITE_HOSTNAME env var in production
ALLOWED_HOSTS = [
    os.environ.get('WEBSITE_HOSTNAME', 'localhost'),
    'inventory.worldaquatics.com',
]
CSRF_TRUSTED_ORIGINS = [
    'https://' + os.environ.get('WEBSITE_HOSTNAME', 'localhost'),
    'https://inventory.worldaquatics.com',
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}


INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "api",
    "core",
    "gifts",
    "apparel",
    "accounts",
    "item_requests",
    "office",
    "rest_framework",
    'import_export',
]

# Edit 7.5 — WhiteNoiseMiddleware added directly after SecurityMiddleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Edit 7.6 — Use PostgreSQL on Azure (via Service Connector Format B), SQLite locally
if 'AZURE_POSTGRESQL_HOST' in os.environ:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ['AZURE_POSTGRESQL_NAME'],
            'HOST': os.environ['AZURE_POSTGRESQL_HOST'],
            'USER': os.environ['AZURE_POSTGRESQL_USER'],
            'PASSWORD': os.environ['AZURE_POSTGRESQL_PASSWORD'],
            'PORT': '5432',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

CORS_ALLOWED_ORIGINS = [
    "https://musical-eureka-7xpwjjgv7jp2xrp7-5173.app.github.dev",
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True

# Edit 7.7 — Static and media files
# In production: static served by whitenoise, media served from Azure Blob Storage
# In development: static served normally, media served from local filesystem
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Include the React build's assets so collectstatic picks them up
STATICFILES_DIRS = [BASE_DIR / 'frontend' / 'dist']
# Serve React build files (e.g. /assets/index.js, /vite.svg) at the root URL path.
# WhiteNoise handles these before Django routing runs, so they are never caught
# by the React catch-all URL pattern.
WHITENOISE_ROOT = BASE_DIR / 'frontend' / 'dist'

if 'AZURE_STORAGE_CONNECTION_STRING' in os.environ:
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.azure_storage.AzureStorage",
            "OPTIONS": {
                "connection_string": os.environ['AZURE_STORAGE_CONNECTION_STRING'],
                "azure_container": "media",
            },
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }
    _conn = os.environ['AZURE_STORAGE_CONNECTION_STRING']
    _account_name = [p.split('=', 1)[1] for p in _conn.split(';') if p.startswith('AccountName=')][0]
    MEDIA_URL = f"https://{_account_name}.blob.core.windows.net/media/"
else:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'
