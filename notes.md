# Aqua Inventory Hub - Project Notes

**Last Updated:** April 2026

---

## 🎯 Project Overview

Internal web application for World Aquatics to replace manual spreadsheet-based inventory tracking.

**Tech Stack:**

- Backend: Django 6.0 + Django REST Framework
- Frontend: React + Vite
- Database: SQLite (development) → PostgreSQL (production)
- Authentication: JWT via djangorestframework-simplejwt
- Hosting: Microsoft Azure (pending final confirmation from EVOK)
- SSO: Microsoft Entra (planned — after hosting confirmed)

---

## ✅ Completed

### Structure & Setup

- [x] Django + React project initialised
- [x] GitHub repository: github.com/Maz-hub/aqua-inventory-hub
- [x] JWT authentication (access token 30min, refresh 1 day)
- [x] Django REST Framework configured
- [x] React frontend connected to Django backend via Axios
- [x] World Aquatics branding (Termina font, navy/blue colours, logo)
- [x] Protected routes (login required)

### App Refactor (April 2026)

- [x] Refactored from single `api/` app into domain-separated apps:
    - `core/` → TakeReason model, user registration, CurrentUserView
    - `gifts/` → all gifts models, views, serializers, urls
    - `apparel/` → all apparel models, views, serializers, urls
    - `accounts/` → user profiles, permissions, groups
    - `api/` → kept as backwards-compatible bridge only

### Gifts Inventory

- [x] GiftCategory model
- [x] Gift model (name, price, stock, HS code, supplier, images)
- [x] InventoryTransaction model (immutable audit trail)
- [x] List / Add / Edit / Delete gifts
- [x] Take / Return stock with transaction record
- [x] Category dropdown from database
- [x] Image upload

### Apparel Inventory (361°)

- [x] ApparelSize model (XS→3XL, shoe sizes, accessories)
- [x] ApparelColor model (with hex codes)
- [x] ApparelCategory model
- [x] ApparelProduct model (base product)
- [x] ApparelVariant model (size + colour + gender + stock)
- [x] ApparelTransaction model (immutable audit trail)
- [x] Full CRUD for products and variants
- [x] Take / Return stock per variant

### Shared

- [x] TakeReason model in core/ (shared across all inventory types)
- [x] applies_to field: gifts / apparel / both

### Permissions & Access Control (April 2026)

- [x] UserProfile model (extends User with department field)
- [x] 5 permission groups created via management command:
    - `gifts_access` → Gifts inventory
    - `apparel_access` → Apparel inventory
    - `executive_access` → Executive Office (future)
    - `it_access` → IT Assets (future)
    - `admin` → full access to everything
- [x] Custom permission classes (HasGiftsAccess, HasApparelAccess, etc.)
- [x] Applied permissions to gifts/ and apparel/ views
- [x] CurrentUserView endpoint: GET /api/user/me/
- [x] UserContext in React (stores groups, hasAccess helper)
- [x] Home page: categories gray out if user lacks access
- [x] Tested and working ✅

---

## 🚧 Next Steps (In Order)

### 1. UserProfile Auto-Creation (small, quick)

- [ ] Create accounts/signals.py
- [ ] Auto-create UserProfile when new User is created
- [ ] Prevents errors when Microsoft SSO creates users automatically

### 2. Item Request Portal

- [ ] Department model (dropdown for budget tracking)
- [ ] ItemRequest model (who, what, when, reason, department, status)
- [ ] ItemRequestItem model (items + quantities per request)
- [ ] Request statuses: Draft → Pending → In Preparation → Ready → Completed / Cancelled
- [ ] Email notifications (submission + ready for collection)
- [ ] Selection (basket) UI in React
- [ ] Submit request form (reason, department, date, notes)
- [ ] My Requests page (track own requests)
- [ ] Admin dashboard (manage all requests)
- [ ] Budget tracking per department

### 3. Executive Office Inventory

- [ ] Waiting for colleague input on data structure
- [ ] High-value items (watches, premium gifts, apparel)
- [ ] Restricted access (executive_access group)
- [ ] Possible: serial numbers, insurance values, brand tracking

### 4. IT Assets Inventory

- [ ] Laptops, mice, keyboards, USB keys, etc.
- [ ] Serial number tracking
- [ ] Employee assignment table (who has what)
- [ ] Spare stock tracking

### 5. Microsoft SSO

- [ ] Waiting for hosting to be confirmed first
- [ ] Work with EVOK (Alexandre) to configure Microsoft Entra
- [ ] Django side: django-allauth or python-social-auth
- [ ] Staff log in with World Aquatics Microsoft accounts

### 6. Dashboard & Reporting

- [ ] Transaction history with date range filtering
- [ ] Budget reporting per department
- [ ] Most requested items
- [ ] Low stock alerts
- [ ] Export to CSV/Excel

### 7. Custom Admin Interface

- [ ] Inventory manager role
- [ ] Add/edit categories, departments, reasons
- [ ] Manage item requests
- [ ] Without needing Django Admin access

---

## 🌐 Hosting & Infrastructure

- Platform: Microsoft Azure
- OS: Linux
- Option chosen: Option 2 (~CHF 16/month) — scalable if needed
- Subdomain: inventoryhub.worldaquatics.com (or new domain TBC)
- Database: PostgreSQL Flexible Server
- Image storage: Azure Blob Storage (~1-2GB for ~1000 items)
- Status: ⏳ Waiting for formal quote from EVOK (Alexandre)
- Anthony: approved budget in principle

### Azure Access Plan

- Marianna → Owner/Contributor
- Anthony → Owner (business continuity)
- EVOK → Contributor (technical support)

---

## 🔐 Permission System

```
groups:
├── gifts_access       → Gifts inventory (everyone)
├── apparel_access     → Apparel inventory
├── executive_access   → Executive Office
├── it_access          → IT Assets
└── admin              → everything + dashboard

Managed via: Django Admin (/admin/)
No coding needed to add/remove access
```

---

## 📁 App Structure

```
aqua-inventory-hub/
├── backend/
│   ├── core/          → TakeReason, user registration, CurrentUserView
│   ├── gifts/         → Gifts inventory domain
│   ├── apparel/       → Apparel inventory domain
│   ├── accounts/      → UserProfile, permissions, groups
│   ├── api/           → backwards-compatible bridge only
│   └── backend/       → project configuration (settings, urls)
└── frontend/
    └── src/
        ├── context/   → UserContext (groups, hasAccess)
        ├── pages/     → Home, Gifts, Apparel, Login
        └── components → Forms, Modals, ProtectedRoute
```

---

## 🌐 API Endpoints

### Authentication

- `POST /api/token/` → login, returns JWT tokens
- `POST /api/token/refresh/` → refresh access token
- `POST /api/user/register/` → new user registration
- `GET /api/user/me/` → current user info + groups

### Gifts

- `GET/POST /api/gifts/` → list / create gifts
- `PATCH /api/gifts/update-stock/<id>/` → take or return
- `PATCH /api/gifts/update/<id>/` → edit gift details
- `DELETE /api/gifts/delete/<id>/` → delete gift
- `GET /api/gifts/categories/` → list categories

### Apparel

- `GET/POST /api/apparel/products/` → list / create products
- `GET/PATCH/DELETE /api/apparel/products/<id>/` → product detail
- `GET/POST /api/apparel/variants/` → list / create variants
- `PATCH /api/apparel/variants/update-stock/<id>/` → take or return
- `GET /api/apparel/transactions/` → transaction history

### Shared

- `GET /api/reasons/` → list TakeReasons

---

## 🎨 World Aquatics Branding

### Colours

- Navy: `#023E73`
- Blue: `#055BA6`
- Ocean: `#048ABF`
- Cyan: `#0DB3D9`
- Black: `#0D0D0D`

### Font

- Termina (Regular, Medium, Bold, Black)

---

## 📝 Key Decisions Log

| Date     | Decision                    | Reason                                 |
| -------- | --------------------------- | -------------------------------------- |
| Feb 2026 | Django + React chosen       | Robust, scalable, industry standard    |
| Feb 2026 | SQLite for dev              | Simple, no setup needed locally        |
| Feb 2026 | JWT authentication          | Stateless, works well with React       |
| Apr 2026 | Refactored to multiple apps | Scalability, permissions per module    |
| Apr 2026 | Category-based permissions  | Flexible, manageable without coding    |
| Apr 2026 | Azure Option 2 chosen       | Sufficient for current needs, scalable |
| Apr 2026 | TypeScript deferred         | Finish app in JavaScript first         |
| Apr 2026 | "Item Request" naming       | Covers gifts, apparel, all categories  |
| Apr 2026 | One unified Selection       | Staff can request across categories    |

---

## ⚠️ Dev Environment Notes

- Always activate venv before running Django: `venv\Scripts\python`
- Frontend runs on: `http://localhost:5173`
- Backend runs on: `http://localhost:8000`
- Django Admin: `http://localhost:8000/admin/`
- `.env` file must point to `http://localhost:8000` for local dev
- `db.sqlite3` is NOT in GitHub (in .gitignore) — run migrations on fresh clone
- After fresh clone: `pip install -r requirements.txt` then `manage.py migrate`
