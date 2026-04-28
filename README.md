# Aqua Inventory Hub

A full-stack internal inventory management web application built for a sports federation, replacing manual spreadsheet-based tracking with a structured, role-based system.

Built with Django REST Framework on the backend and React on the frontend. Currently in active development.

---

## What It Does

Staff can browse inventory categories, add items to a selection, and submit formal item requests with a reason, department, and required date. The preparation team manages incoming requests through an admin panel, updating statuses and modifying items as needed. Every stock movement is recorded in an immutable audit trail.

Access to each inventory section is controlled by user groups, managed through Django Admin. Categories appear grayed out for users who do not have the relevant permission.

---

## Tech Stack

**Backend:** Python, Django REST Framework, SQLite (development) / PostgreSQL (production), JWT authentication via SimpleJWT

**Frontend:** React, Vite, Tailwind CSS, Axios

**Planned:** Microsoft Entra SSO, Azure App Service, Azure Blob Storage for images

---

## Project Structure

backend/
├── accounts/ UserProfile model, custom permissions, group setup command
├── core/ TakeReason, Department models; shared API endpoints
├── gifts/ Gift, GiftCategory, InventoryTransaction
├── apparel/ ApparelProduct, ApparelVariant, ApparelSize/Color/Category, ApparelTransaction
├── item_requests/ ItemRequest, ItemRequestItem, full request workflow
├── backend/ Django settings, main urls.py
├── media/ Uploaded images
├── db.sqlite3
└── requirements.txt

frontend/src/
├── pages/ Home, Login, Gifts, Apparel, NewRequest, RequestConfirmation,
│ MyRequests, AdminPanel, NotFound
├── components/
│ ├── admin/ AdminRequests.jsx
│ ├── Header, Footer, ProtectedRoute, SelectionDrawer
│ ├── Gift* GiftForm, EditGiftForm, GiftDetailsModal, GiftRequestModal,
│ │ TakeItemsModal, ReturnItemsModal
│ └── Apparel* AddApparelProductForm, EditApparelProductForm, ApparelDetailsModal,
│ ApparelRequestModal, AddVariantModal, TakeApparelModal, ReturnApparelModal
├── context/ UserContext, SelectionContext
├── App.jsx, api.js, constants.js

---

## Main Features

**Gifts Inventory**
Single-tier inventory with categories, stock tracking, pricing, supplier information, customs fields, and a full audit trail of every stock movement.

**Apparel Inventory**
Two-tier structure: a base product with multiple variants per size, colour, and gender. Each variant tracks its own stock level with a separate audit trail.

**Item Request Portal**
Staff browse inventory, build a selection across categories, and submit a formal request with a reason, department, and required date. Requests move through a status workflow from pending through to completed. The preparation team can modify quantities, add or remove items, and update status directly from the admin panel.

**Role-Based Access Control**
Five permission groups control which inventory sections each user can access: `gifts_access`, `apparel_access`, `executive_access`, `it_access`, and `admin`. Groups are assigned through Django Admin. The interface reflects permissions in real time, with locked sections visually grayed out.

**Admin Panel**
A Shopify-style interface with a left sidebar, accessible to admin users only. Currently manages all item requests with filtering by status, expandable detail cards, inline item editing, admin notes, and flexible status transitions.

---

## Getting Started

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_groups
python manage.py runserver
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in the frontend folder:
VITE_API_URL=http://localhost:8000/

---

## Permission Groups

After running `setup_groups`, assign users to groups through Django Admin at `/admin/`.

| Group              | Access                            |
| ------------------ | --------------------------------- |
| `gifts_access`     | Gifts inventory                   |
| `apparel_access`   | Apparel inventory                 |
| `executive_access` | Executive Office (coming soon)    |
| `it_access`        | IT Assets (coming soon)           |
| `admin`            | Everything, including Admin Panel |

---

## Status: In Development

**Working now:** Gifts inventory, Apparel inventory, Item Request submit flow, My Requests page, Admin Panel with request management.

**Coming next:** Executive Office module, IT Assets module, Microsoft SSO integration, email notifications, reporting dashboard, production deployment on Azure.

---

## Screenshots

_Screenshots will be added once the app is deployed._

---

## Notes

This is an internal tool. The repository is public for portfolio purposes. No real inventory data is included.
