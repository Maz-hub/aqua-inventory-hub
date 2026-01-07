# Aqua Inventory Hub - Project Structure & Requirements

## Homepage Design

After login, users see two main sections:
```
┌─────────────────────────────────────┐
│        AQUA INVENTORY HUB           │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐  ┌─────────────┐   │
│  │   📦 GIFTS  │  │ 👕 APPAREL │   │
│  │  INVENTORY  │  │  INVENTORY  │   │
│  └─────────────┘  └─────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Gifts Inventory Section

### Access Rules:
- **Visible to:** All authenticated users
- **Permissions:** All users can VIEW / ADD / EDIT / DELETE

### Features:
- Click on Gifts box → Navigate to Gifts Inventory page
- Display all gifts/items in grid/list view (ecommerce-style)
- **Category filter** at top of page
- Each item shows:
  - Product image
  - Product name
  - Category
  - Quantity in stock
  - Quick actions (edit/delete buttons)

### Data Structure:
- Product image
- Product name
- Category (filterable dropdown)
- Quantity stock
- Description
- Material
- Unit price
- HS code
- Country of origin
- Supplier information (name, email, address)
- System tracking (created_at, created_by, updated_at, updated_by)
- Minimum stock level
- Internal notes

---

## Apparel Inventory Section

### Access Rules:
- **Visible to:** All authenticated users (box appears on homepage)
- **Click access:** Only users with special permissions (managed via Django admin panel)
- **Permissions:** Authorized users can VIEW / ADD / EDIT / DELETE

### Features:
- Click on Apparel box → Check permissions:
  - ✅ Has permission → Navigate to Apparel Inventory page
  - ❌ No permission → Show "Access Denied" message
- Display 361 brand clothing items
- Includes full customs/shipping data for international shipments

### Data Structure:
- Similar to Gifts, but tailored for apparel
- Additional fields for clothing (sizes, colors, brand specifics)
- Enhanced customs/shipping information

---

## Permission System

### Implementation:
- Use Django's built-in Groups and Permissions system
- Create groups via Django admin panel:
  - `Gifts Managers` (currently not needed - all have access)
  - `Apparel Managers` (Jamie + 2-3 designated people)

### Configuration:
- Assign users to groups through Django admin (`/admin/`)
- Frontend checks user permissions before allowing access
- Backend enforces permissions on API endpoints

---

## Current Status

### ✅ Completed:
- Backend API for Gifts inventory
- User authentication (registration/login)
- JWT token management
- Protected routes
- World Aquatics branding (colors, fonts, logo)
- Form components with brand styling

### 🚧 In Progress:
- Homepage layout with two sections
- Gifts inventory list/detail pages

### ⏳ To Do:
- Gifts inventory CRUD interface
- Category filtering system
- Apparel backend models
- Apparel inventory interface
- Permission-based access control
- Image upload functionality

---

## Technical Stack

### Backend:
- Django 6.0
- Django REST Framework
- JWT Authentication (SimpleJWT)
- PostgreSQL (production) / SQLite (development)

### Frontend:
- React (Vite)
- React Router DOM
- Axios (API calls)
- Tailwind CSS v4
- World Aquatics brand assets

### Development:
- GitHub Codespaces (Linux environment)
- Git version control
- Environment variables for configuration

---

## World Aquatics Branding

### Colors:
- Navy: `#023E73` (primary dark)
- Blue: `#055BA6` (primary)
- Ocean: `#048ABF` (bright blue)
- Cyan: `#0DB3D9` (accent)
- Black: `#0D0D0D` (text)

### Font:
- Termina (all weights: Regular, Medium, Bold, Black)

### Logo:
- Located: `frontend/src/assets/images/`
- Usage: Header, login/register forms

---

## API Endpoints

### Authentication:
- `POST /api/user/register/` - User registration
- `POST /api/token/` - Login (get tokens)
- `POST /api/token/refresh/` - Refresh access token

### Gifts Inventory:
- `GET /api/gifts/` - List all gifts
- `POST /api/gifts/` - Create new gift
- `DELETE /api/gifts/delete/<id>/` - Delete gift
- `GET /api/categories/` - List all categories

### Admin:
- `/admin/` - Django admin panel

---

## Future Enhancements

### Phase 1:
- Complete Gifts inventory interface
- Add pagination for large inventories
- Implement search functionality

### Phase 2:
- Build Apparel inventory backend
- Implement permission-based access
- Add role management UI

### Phase 3:
- Low stock alerts
- Inventory reports/analytics
- Export functionality (CSV/Excel)
- Batch operations (bulk delete/update)

---

## Notes & Reminders

- **Codespaces URLs change** - Update `.env` when restarting Codespace
- **Ports must be public** - Set port 5173 and 8000 to public visibility
- **Virtual environment** - Must activate before running Django: `source env/bin/activate`
- **Git workflow** - Commit frequently with clear messages
- **Image storage** - Images stored in filesystem, paths in database

---

**Last Updated:** January 7, 2026