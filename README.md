# Aqua Inventory Hub

A full-stack internal inventory management system built for a sports federation, using Django REST Framework on the backend and React on the frontend. It manages promotional gifts, apparel, and office/events inventory, with a staff request workflow and role-based access control.

---

## What the app does

Staff log in (via Microsoft SSO or username/password) and browse the inventory categories they have access to. They can add items to a basket and submit a single request covering multiple products across different categories. The preparation team reviews incoming requests, confirms quantities, adjusts stock, and moves each request through a status workflow until the items are collected.

Administrators manage products directly from the admin panel: adjusting stock with a recorded reason, viewing the full transaction history for any item, and editing product details including customs and supplier information.

Access to each section is controlled by permission groups assigned in Django admin. Viewer groups allow read-only browsing. Manager groups allow full inventory and request management. Nobody sees or can act on anything beyond what their groups permit.

---

## Modules

**Live:**
- **Gifts** — promotional gift products, organised by category
- **Apparel** — products with size, colour, and gender variants; stock tracked per variant
- **Office & Events** — office and events supplies, organised by category, with an optional department field for cost tracking

**Planned / future:**
- Executive Office inventory
- IT Assets inventory
- Dashboard and Settings sections in the admin panel

---

## Key features

- Three-tier role-based permissions: viewer groups (read-only), manager groups (full read/write for a category), and an admin group (full access everywhere)
- Item request workflow: staff build a basket, submit as a draft, and stock is deducted in a single all-or-nothing operation on submission; cancelling a pending request restores stock
- Full audit trail: every stock movement is recorded as a transaction with a reason, quantity, and before/after stock snapshot
- Admin panel with sidebar navigation scoped to the logged-in user's permission groups
- Microsoft SSO login (OIDC) alongside traditional username/password login; new SSO users are created automatically with baseline access
- Email notifications on request submission, sent to the inventory team and to the requester as confirmation
- Stock adjustment reasons split by direction (Add vs. Take), so the reason dropdown only shows relevant options depending on whether stock is being added or removed

---

## Tech stack

**Backend**
- Python
- Django + Django REST Framework
- SimpleJWT for authentication (access + refresh tokens)
- PyJWT for verifying Microsoft-issued tokens
- PostgreSQL in production, SQLite in development
- Pillow for image uploads
- WhiteNoise for serving static files
- django-storages (Azure backend) for media files in production
- Gunicorn as the production WSGI server

**Frontend**
- React + Vite
- React Router
- Axios for API requests
- Tailwind CSS
- MSAL (`@azure/msal-browser`, `@azure/msal-react`) for Microsoft SSO

**Deployment**
- Azure App Service (backend, serving the built frontend as static files)
- Azure Database for PostgreSQL
- Azure Blob Storage for media files (product images)
- GitHub Actions for CI/CD (builds the frontend, bundles it with the backend, and deploys to Azure App Service on push to `main`)

---

## Project structure

```
aqua-inventory-hub/
├── backend/
│   ├── config/                  # Django project settings, root URLs, WSGI
│   ├── accounts/                # User profiles, Microsoft SSO, permission classes, group setup
│   │   ├── models.py            # UserProfile (extends Django User)
│   │   ├── microsoft_auth.py    # Verifies Microsoft-issued tokens against the tenant's JWKS
│   │   ├── views.py             # MicrosoftLoginView — exchanges a Microsoft token for app JWTs
│   │   ├── permissions.py       # Custom DRF permission classes per inventory category
│   │   ├── signals.py           # Auto-creates/syncs UserProfile on user save
│   │   └── management/commands/setup_groups.py
│   ├── core/                    # Shared reference data
│   │   ├── models.py            # TakeReason, Department, StockAdjustmentReason
│   │   ├── serializers.py
│   │   └── views.py             # User registration, /api/user/me/, reasons, departments
│   ├── gifts/                   # Gifts inventory app
│   │   ├── models.py            # Gift, GiftCategory, InventoryTransaction
│   │   ├── serializers.py / views.py / urls.py
│   ├── apparel/                 # Apparel inventory app
│   │   ├── models.py            # ApparelProduct, ApparelVariant, ApparelSize, ApparelColor,
│   │   │                        # ApparelCategory, ApparelTransaction
│   │   ├── serializers.py / views.py / urls.py
│   ├── office/                  # Office & Events inventory app
│   │   ├── models.py            # OfficeItem, OfficeCategory, OfficeTransaction
│   │   ├── serializers.py / views.py / urls.py
│   ├── item_requests/           # Staff request workflow app
│   │   ├── models.py            # ItemRequest, ItemRequestItem
│   │   ├── serializers.py / views.py     # includes email notifications on submit
│   │   └── urls.py
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx / Register.jsx
    │   │   ├── Home.jsx              # Dashboard with category tiles
    │   │   ├── Gifts.jsx / Apparel.jsx / OfficeEvents.jsx
    │   │   ├── NewRequest.jsx        # Multi-step request creation
    │   │   ├── RequestConfirmation.jsx
    │   │   ├── MyRequests.jsx
    │   │   ├── AdminPanel.jsx
    │   │   └── NotFound.jsx
    │   ├── components/
    │   │   ├── admin/                # AdminRequests, AdminGifts, AdminApparel, AdminOffice
    │   │   ├── Header.jsx / Footer.jsx / ProtectedRoute.jsx / SelectionDrawer.jsx
    │   │   ├── *DetailsModal.jsx      # Gift / Apparel / Office product detail views
    │   │   ├── *RequestModal.jsx      # Add-to-request modals per category
    │   │   ├── *Form.jsx              # Add / edit forms per category
    │   │   ├── *StockAdjustModal.jsx  # Manual stock adjustment per category
    │   │   └── *HistoryModal.jsx      # Transaction history per category
    │   ├── context/
    │   │   ├── UserContext.jsx       # User info and hasAccess() helper
    │   │   └── SelectionContext.jsx  # Request basket state
    │   ├── api.js                    # Axios instance with JWT interceptor and refresh logic
    │   ├── authConfig.js              # MSAL configuration for Microsoft SSO
    │   ├── constants.js
    │   ├── main.jsx
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

---

## Permission groups

Run `python manage.py setup_groups` to create all groups in the database.

### Manager groups (full read and write access)

| Group | Access |
|---|---|
| `admin` | Full access to everything including the admin panel |
| `gifts_access` | Create, edit, and adjust stock in Gifts inventory |
| `apparel_access` | Create, edit, and adjust stock in Apparel inventory |
| `office_access` | Create, edit, and adjust stock in Office & Events inventory |
| `requests_access` | View and manage all requests in the admin panel |
| `executive_access` | Manage Executive Office inventory (planned) |
| `it_access` | Manage IT Assets inventory (planned) |
| `dashboard_access` | Access to Dashboard section (planned) |
| `settings_access` | Access to Settings section (planned) |

### Viewer groups (read-only access)

| Group | Access |
|---|---|
| `gifts_viewer` | Browse Gifts inventory, cannot create or edit |
| `apparel_viewer` | Browse Apparel inventory, cannot create or edit |
| `office_viewer` | Browse Office & Events inventory, cannot create or edit (default group for new SSO users) |
| `executive_viewer` | Browse Executive Office inventory (planned) |
| `it_viewer` | Browse IT Assets inventory (planned) |

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

Create a `.env` file in `backend/` with the variables listed below before running the server.

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### First-time setup

1. Log in to Django admin at `http://localhost:8000/admin/` with your superuser account
2. Run `setup_groups` to ensure all permission groups exist
3. Assign permission groups to users under Auth > Users
4. Add reference data (Departments, Take Reasons, Stock Adjustment Reasons, and category lists) via Django admin so the frontend dropdowns have content

---

## Environment variables

Names only — set actual values in your local `.env` file or your hosting platform's application settings. Never commit real values.

### Backend (`backend/.env`)

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Toggles debug mode |
| `WEBSITE_HOSTNAME` | Azure-provided host name, added to `ALLOWED_HOSTS` in production |
| `AZURE_POSTGRESQL_HOST` | Production database host |
| `AZURE_POSTGRESQL_NAME` | Production database name |
| `AZURE_POSTGRESQL_USER` | Production database user |
| `AZURE_POSTGRESQL_PASSWORD` | Production database password |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection string for media files |
| `MICROSOFT_CLIENT_ID` | Azure AD app registration client ID, used to verify SSO tokens |
| `MICROSOFT_TENANT_ID` | Azure AD tenant ID, restricts SSO login to the organisation's tenant |
| `EMAIL_HOST` | SMTP server host |
| `EMAIL_PORT` | SMTP server port |
| `EMAIL_USE_TLS` | Whether to use TLS for SMTP |
| `EMAIL_HOST_USER` | SMTP login username / from-address for outgoing email |
| `EMAIL_HOST_PASSWORD` | SMTP login password |

### Frontend (`frontend/.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

---

## API overview

All endpoints are under `/api/`.

| Prefix | App |
|---|---|
| `/api/gifts/` | Gifts inventory |
| `/api/apparel/` | Apparel inventory |
| `/api/office/` | Office & Events inventory |
| `/api/requests/` | Item requests (including `/api/requests/departments/`) |
| `/api/auth/microsoft/` | Microsoft SSO login — exchanges a Microsoft token for app JWTs |
| `/api/user/register/` | Create a new user account |
| `/api/user/me/` | Current user info including groups |
| `/api/token/` | Login (obtain JWT) |
| `/api/token/refresh/` | Refresh access token |
| `/api/reasons/` | Take reasons for the request form |
| `/api/stock-adjustment-reasons/` | Reasons for manual stock adjustments, filterable with `?applies_to=add` or `?applies_to=take` |
| `/api/core/departments/` | Departments (general use) |

---

## Current status

Live and in use:
- Gifts, Apparel, and Office & Events inventories (create, edit, stock adjustment, transaction history, requests)
- Item requests (full workflow from draft to completed, with email notifications)
- Admin panel with Requests, Gifts, Apparel, and Office tabs
- Permission groups and group-based access control
- Microsoft SSO login alongside username/password login

Stubbed in the admin panel sidebar but not yet implemented:
- Executive Office inventory
- IT Assets inventory
- Dashboard
- Settings

---

## Deployment

The app deploys as a single Azure App Service: the React frontend is built and copied into `backend/frontend/dist`, and Django serves it directly alongside the API (see `config/urls.py` and `startup.sh`).

A GitHub Actions workflow (`.github/workflows/main_aquainventory.yml`) builds the frontend, installs backend dependencies, and deploys to Azure App Service on every push to `main`.

`startup.sh` runs on deploy: applies migrations, collects static files, and starts Gunicorn.

Media files (product images) are stored on Azure Blob Storage in production and on the local filesystem in development. The production database is Azure Database for PostgreSQL; SQLite is used locally.

To set up permission groups on a fresh deployment, run once via the App Service console:

```bash
python manage.py setup_groups
```
