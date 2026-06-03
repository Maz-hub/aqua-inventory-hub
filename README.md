# Aqua Inventory Hub

A full-stack inventory management system built for a sports federation. It tracks gifts, apparel, and equipment across multiple departments, handles staff item requests with a full approval workflow, and gives administrators a dedicated management panel.

---

## What the app does

Staff log in and browse inventory categories they have been granted access to. They can add items to a basket and submit a single request covering multiple products from different categories. The preparation team reviews incoming requests, confirms quantities, adjusts stock, and moves requests through a status workflow until items are collected.

Administrators manage products directly from the admin panel: adding stock, recording manual adjustments with reasons, viewing the full transaction history for any item, and editing product details including customs and supplier information.

Access to each section is controlled by permission groups assigned in Django admin. Viewer groups allow read-only browsing. Manager groups allow full inventory and request management. No user sees or can act on anything beyond what their groups permit.

---

## Tech stack

**Backend**
- Python 3.x
- Django 5.x with Django REST Framework
- SimpleJWT for authentication (access + refresh tokens)
- SQLite in development, PostgreSQL in production
- Pillow for image uploads

**Frontend**
- React 18 with Vite
- React Router v6
- Axios for API requests
- Tailwind CSS v4

**Deployment target**
- Azure App Service (backend)
- Azure Static Web Apps or App Service (frontend)
- Azure Database for PostgreSQL
- Azure Blob Storage for media files (product images)

---

## Project structure

```
aqua-inventory-hub/
├── backend/
│   ├── config/                  # Django project settings, root URLs, WSGI/ASGI
│   ├── accounts/                # User profiles, permission classes, group setup
│   │   ├── models.py            # UserProfile (extends Django User)
│   │   ├── permissions.py       # Custom DRF permission classes
│   │   ├── signals.py           # Auto-creates UserProfile on user creation
│   │   ├── admin.py             # UserProfile inline on User admin page
│   │   └── management/commands/setup_groups.py
│   ├── core/                    # Shared models and views
│   │   ├── models.py            # TakeReason, Department, StockAdjustmentReason
│   │   ├── serializers.py       # User, reason, department serializers
│   │   └── views.py             # User registration, /api/user/me/, reasons
│   ├── gifts/                   # Gifts inventory app
│   │   ├── models.py            # Gift, GiftCategory, InventoryTransaction
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── apparel/                 # Apparel inventory app
│   │   ├── models.py            # ApparelProduct, ApparelVariant, ApparelTransaction
│   │   │                        # ApparelSize, ApparelColor, ApparelCategory
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── item_requests/           # Staff request workflow app
│   │   ├── models.py            # ItemRequest, ItemRequestItem
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── db.sqlite3               # Development database
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Home.jsx          # Dashboard with category tiles
    │   │   ├── Gifts.jsx         # Gifts inventory browsing
    │   │   ├── Apparel.jsx       # Apparel inventory browsing
    │   │   ├── NewRequest.jsx    # Multi-step request creation
    │   │   ├── RequestConfirmation.jsx
    │   │   ├── MyRequests.jsx    # User's own request history
    │   │   └── AdminPanel.jsx    # Admin management interface
    │   ├── components/
    │   │   ├── admin/
    │   │   │   ├── AdminRequests.jsx
    │   │   │   ├── AdminGifts.jsx
    │   │   │   └── AdminApparel.jsx
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── SelectionDrawer.jsx
    │   │   ├── GiftDetailsModal.jsx
    │   │   ├── ApparelDetailsModal.jsx
    │   │   ├── GiftForm.jsx
    │   │   ├── AddApparelProductForm.jsx
    │   │   ├── EditApparelProductForm.jsx
    │   │   ├── StockAdjustmentModal.jsx
    │   │   ├── ApparelStockAdjustModal.jsx
    │   │   ├── TransactionHistoryModal.jsx
    │   │   └── ApparelHistoryModal.jsx
    │   ├── context/
    │   │   ├── UserContext.jsx   # User info and hasAccess() helper
    │   │   └── SelectionContext.jsx
    │   ├── api.js                # Axios instance with JWT interceptor
    │   ├── constants.js
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

---

## Features

### Gifts inventory
- Grid view with search and category filter
- Stock count and low stock badge on each card
- Add to request from the browsing page
- Admin: create, edit, delete products including customs and supplier fields
- Admin: manual stock adjustments with reason and notes
- Admin: full transaction history per product

### Apparel inventory
- Products with multiple size, colour, and gender variants
- Size badges grouped by gender, colour-coded using the product's primary colour
- Filter by category, gender, colour, clothing size, and footwear size
- Stock tracked per variant, not per product
- Add to request from the browsing page
- Admin: create and edit products with variants
- Admin: manual stock adjustments per variant
- Admin: full transaction history per product (all variants combined)

### Item requests
- Staff build a basket with items from any inventory category
- Requests are created as drafts before submission
- On submission, stock is checked and deducted in a single all-or-nothing operation
- Requests move through: Draft, Pending, In Preparation, Ready, Completed, Cancelled
- Admin can add or remove line items from any request
- Admin can confirm quantities per line item, which adjusts stock if different from what was requested
- Cancelling a pending request restores stock for all line items
- Users see their own requests with status badges, confirmed quantities, and totals

### Admin panel
- Sidebar navigation scoped to the user's permission groups
- Requests tab: expandable request cards, status workflow, admin notes, confirm quantities
- Gifts tab: table view with inline stock adjust, history, and edit
- Apparel tab: table view with low stock filter, per-variant stock adjust, history, and edit
- Each section only appears in the sidebar if the user has the required group

### Authentication and permissions
- JWT authentication with automatic token refresh
- Route-level protection via ProtectedRoute (checks token validity and group membership)
- Group-based access: viewer groups for read-only, manager groups for full access
- Admin panel link in the header only shows for users with at least one manager group
- Superusers have all access regardless of group assignments

---

## Permission groups

Run `python manage.py setup_groups` to create all groups in the database.

### Manager groups (full read and write access)

| Group | Access |
|---|---|
| `admin` | Full access to everything including the admin panel |
| `gifts_access` | Create, edit, and adjust stock in Gifts inventory |
| `apparel_access` | Create, edit, and adjust stock in Apparel inventory |
| `executive_access` | Manage Executive Office inventory (coming soon) |
| `it_access` | Manage IT Assets inventory (coming soon) |
| `requests_access` | View and manage all requests in the admin panel |
| `dashboard_access` | Access to Dashboard section (coming soon) |
| `settings_access` | Access to Settings section (coming soon) |

### Viewer groups (read-only access)

| Group | Access |
|---|---|
| `gifts_viewer` | Browse Gifts inventory, cannot create or edit |
| `apparel_viewer` | Browse Apparel inventory, cannot create or edit |
| `executive_viewer` | Browse Executive Office inventory (coming soon) |
| `it_viewer` | Browse IT Assets inventory (coming soon) |
| `office_viewer` | Browse Office and Events inventory (coming soon) |

Viewer groups allow GET requests through the backend permission classes but block POST, PATCH, PUT, and DELETE. Staff with viewer groups can still submit item requests for any inventory they can browse.

---

## Getting started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS / Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_groups
python manage.py createsuperuser
python manage.py runserver
```

The backend runs on `http://localhost:8000`.

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### First-time setup

1. Log in to Django admin at `http://localhost:8000/admin/` with your superuser account
2. Assign permission groups to users under Auth > Users
3. Use `setup_groups` to ensure all groups exist before assigning them

---

## API overview

All endpoints are under `/api/`.

| Prefix | App |
|---|---|
| `/api/gifts/` | Gifts inventory |
| `/api/apparel/` | Apparel inventory |
| `/api/requests/` | Item requests |
| `/api/user/me/` | Current user info including groups |
| `/api/token/` | Login (obtain JWT) |
| `/api/token/refresh/` | Refresh access token |
| `/api/reasons/` | Take reasons for request form |
| `/api/stock-adjustment-reasons/` | Reasons for manual stock adjustments |

---

## Current status

The following sections are live and in use:

- Gifts inventory (full create, edit, adjust, history, requests)
- Apparel inventory (full create, edit, adjust, history, requests)
- Item requests (full workflow from draft to completed)
- Admin panel with Requests, Gifts, and Apparel tabs
- Permission groups and group-based access control

The following sections are stubbed in the admin panel sidebar but not yet implemented:

- Executive Office inventory
- Office and Events inventory
- IT Assets inventory
- Dashboard
- Settings

---

## Deployment (Azure)

### Backend on Azure App Service

1. Create an Azure App Service with a Python 3.12 runtime
2. Set the startup command to `gunicorn config.wsgi:application`
3. Add the following environment variables in Application Settings:

| Variable | Value |
|---|---|
| `DJANGO_SETTINGS_MODULE` | `config.settings` |
| `SECRET_KEY` | A long random string |
| `DEBUG` | `False` |
| `DATABASE_URL` | PostgreSQL connection string |
| `ALLOWED_HOSTS` | Your App Service domain |
| `AZURE_STORAGE_CONNECTION_STRING` | Blob Storage connection string |
| `AZURE_STORAGE_CONTAINER` | Container name for uploaded images |

4. Run migrations and group setup via the App Service SSH console or a CI/CD pipeline:

```bash
python manage.py migrate
python manage.py setup_groups
```

### Database on Azure Database for PostgreSQL

Replace SQLite with the Azure PostgreSQL connection string. Install `psycopg2-binary` in requirements and configure `DATABASES` in settings to read from `DATABASE_URL`.

### Media files on Azure Blob Storage

Product images need persistent cloud storage in production. Install `django-storages[azure]` and configure the default file storage backend to use your Azure Blob container. The `AZURE_STORAGE_CONNECTION_STRING` and `AZURE_STORAGE_CONTAINER` environment variables feed into this configuration.

### Frontend on Azure Static Web Apps

Build the production bundle:

```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to Azure Static Web Apps. Set the API base URL to your App Service domain via an environment variable read into the Axios config.

Add a `staticwebapp.config.json` at the root of the build output to redirect all paths to `index.html` so React Router handles client-side navigation correctly:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```
