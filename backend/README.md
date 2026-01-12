# Aqua Inventory Hub

A comprehensive inventory management system for World Aquatics, featuring real-time stock tracking, transaction history, and audit trail capabilities for promotional gifts and apparel (361°).

## Overview

Full-stack web application designed for World Aquatics' internal inventory management. The system streamlines the distribution and tracking of promotional items, office supplies, and branded merchandise across the organization's 70+ employees worldwide.

**Key Features:**
- Real-time inventory visibility with low stock alerts
- Transaction history with complete audit trail
- User authentication and role-based access
- Excel export for reporting and compliance
- Responsive design (desktop, tablet, mobile)
- World Aquatics branding integration

## Tech Stack

**Backend:**
- **Framework:** Django 6.0
- **API:** Django REST Framework
- **Authentication:** JWT (Simple JWT)
- **Database:** SQLite (development) / PostgreSQL (production)
- **Python:** 3.12+
- **Image Processing:** Pillow 12.0.0
- **Export:** django-import-export

**Frontend:**
- **Framework:** React 18+ with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Typography:** Termina font family

## Features

### 🔐 User Authentication
- JWT-based authentication with access and refresh tokens
- Secure user registration and login
- Token refresh mechanism (30-minute access, 1-day refresh)
- Automatic logout on token expiration

### 📦 Inventory Management
- **Visual product catalog** with images and detailed information
- **Real-time stock tracking** with live updates
- **Search and filter** by product name or category
- **Low stock alerts** with visual badges when below minimum threshold
- **Category management** through Django admin
- **Product image uploads** with validation

### 📊 Stock Operations
- **Take Items:** Record distributions with reason tracking (Event, Office Use, External Gift, New Employee Welcome, Sample, Damaged, Other)
- **Return Items:** Log when items come back from events
- **Immediate stock updates** prevent double-booking
- **Notes field** for additional context on each transaction

### 📋 Transaction History & Audit Trail
- **Complete logs** of all inventory movements
- **Tracks:** Who, What, When, How Many, Why, Stock Before/After
- **Excel export** capability for management reporting
- **Read-only** transactions ensure data integrity
- **Cannot be edited or deleted** after creation

### ✏️ Product Management
- **Comprehensive product details:**
  - Product name, category, quantity, unit price
  - Material composition
  - Product images
  - Description
- **Customs & Logistics:**
  - HS Code (Harmonized System code)
  - Country of Origin
- **Supplier information:**
  - Supplier name, email, address
- **Internal notes** for staff reference
- **Edit functionality** with pre-filled forms

### 👨‍💼 Administrative Controls
- **Django Admin interface** for authorized personnel
- **Category management:** Add/edit/remove categories
- **User management:** Control access and permissions
- **Transaction monitoring:** View all inventory movements
- **Excel export** from admin panel

## Project Structure
```
aqua-inventory-hub/
├── backend/                      # Django backend
│   ├── backend/                 # Project configuration
│   │   ├── settings.py         # Django settings with JWT, CORS
│   │   └── urls.py             # Main URL routing
│   ├── api/                    # Core application
│   │   ├── models.py           # Database models (Gift, GiftCategory, InventoryTransaction)
│   │   ├── serializers.py      # Data serialization (JSON conversion)
│   │   ├── views.py            # Business logic (CRUD, stock updates)
│   │   ├── urls.py             # API endpoint routing
│   │   └── admin.py            # Admin panel configuration
│   ├── media/                  # Uploaded images storage
│   │   └── gift_images/        # Product images (~250-300 photos)
│   ├── manage.py               # Django management script
│   └── requirements.txt        # Python dependencies
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── api.js              # Axios API client with JWT interceptors
│   │   ├── App.jsx             # Main app component with routing
│   │   ├── components/         # Reusable components
│   │   │   ├── GiftForm.jsx            # Add new product form
│   │   │   ├── EditGiftForm.jsx        # Edit existing product
│   │   │   ├── GiftDetailsModal.jsx    # Product details view
│   │   │   ├── TakeItemsModal.jsx      # Take items with reason
│   │   │   ├── ReturnItemsModal.jsx    # Return items
│   │   │   ├── ProtectedRoute.jsx      # Auth route wrapper
│   │   │   └── Footer.jsx              # Page footer
│   │   ├── pages/              # Main pages
│   │   │   ├── Home.jsx        # Dashboard landing
│   │   │   ├── Login.jsx       # User login
│   │   │   ├── Register.jsx    # User registration
│   │   │   ├── Gifts.jsx       # Gifts inventory page
│   │   │   └── Logout.jsx      # Logout handler
│   │   └── styles/
│   │       └── index.css       # Tailwind CSS with World Aquatics colors
│   ├── package.json            # Node dependencies
│   └── vite.config.js          # Vite configuration with proxy
│
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Installation & Setup

### Prerequisites

- Python 3.12 or higher
- Node.js 18+ and npm
- pip package manager
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/Maz-hub/aqua-inventory-hub.git
cd aqua-inventory-hub
```

2. **Create virtual environment**
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Apply migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser**
```bash
python manage.py createsuperuser
```

6. **Run development server**
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

The React app will be available at `http://localhost:5173`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user/register/` | Register new user | No |
| POST | `/api/token/` | Login (obtain JWT tokens) | No |
| POST | `/api/token/refresh/` | Refresh access token | No |

### Inventory Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/gifts/` | List all gifts | Yes |
| POST | `/api/gifts/` | Create new gift | Yes |
| PATCH | `/api/gifts/update/<id>/` | Update gift details | Yes |
| PATCH | `/api/gifts/update-stock/<id>/` | Update stock (Take/Return) | Yes |
| DELETE | `/api/gifts/delete/<id>/` | Delete specific gift | Yes |
| GET | `/api/categories/` | List all gift categories | Yes |

### Administration

| Endpoint | Description |
|----------|-------------|
| `/admin/` | Django admin panel (category management, transactions, users) |

## Database Models

### GiftCategory
Stores inventory categories (editable through Django admin):
- `name` - Category name (unique)
- `created_at` - Timestamp of creation

**Examples:** Deco, Accessories, Apparel, Drinkware, Office, Edible, Other

### Gift
Comprehensive product tracking model:

**Visual Identification:**
- `product_image` - Uploaded product image
- `product_name` - Product name

**Organization & Tracking:**
- `category` - Foreign key to GiftCategory
- `qty_stock` - Current stock quantity
- `minimum_stock_level` - Alert threshold (default: 10)

**Product Details:**
- `description` - Product description
- `material` - Material composition
- `unit_price` - Price per unit (Decimal)

**Customs & Logistics:**
- `hs_code` - Harmonized System code
- `country_of_origin` - Manufacturing country

**Supplier Information:**
- `supplier_name` - Supplier company name
- `supplier_email` - Supplier contact email
- `supplier_address` - Supplier physical address

**System Tracking (Automatic):**
- `created_at` - Record creation timestamp
- `created_by` - User who created the record
- `updated_at` - Last modification timestamp
- `updated_by` - User who last modified the record
- `notes` - Internal notes

### InventoryTransaction
Tracks all inventory movements for audit trail:

**Transaction Details:**
- `gift` - Foreign key to Gift
- `transaction_type` - 'take' or 'return'
- `quantity` - Number of items taken/returned
- `reason` - Reason for taking (Event, Office Use, External Gift, New Employee Welcome, Sample, Damaged, Other)
- `notes` - Additional context (optional)

**Audit Information:**
- `created_by` - User who performed the transaction
- `created_at` - Transaction timestamp
- `stock_before` - Stock level before transaction
- `stock_after` - Stock level after transaction

**Features:**
- Read-only in admin (cannot be edited or deleted)
- Automatic creation on Take/Return operations
- Excel export capability

## Configuration

### World Aquatics Brand Colors (Tailwind CSS)
```css
--wa-navy: #002b5c;     /* Primary dark blue */
--wa-blue: #0066b3;     /* Primary blue */
--wa-ocean: #0085ca;    /* Medium blue */
--wa-cyan: #00b8d4;     /* Accent cyan */
--wa-red: #e31e24;      /* Accent red */
```

### JWT Token Settings (`backend/backend/settings.py`)
```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}
```

### CORS Configuration
Development (allows all origins):
```python
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
]
```
**⚠️ Must be restricted in production**

### Image Upload Settings
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

## User Guide

### For All Employees

**Logging In:**
1. Navigate to the application URL
2. Enter your credentials
3. Click "Login"

**Browsing Inventory:**
1. Click "Gifts / Office" on homepage
2. View all available items with photos
3. Use search bar to find specific products
4. Filter by category using dropdown
5. Click "Show Low Stock" to see items needing reorder

**Taking Items:**
1. Click "Take" button on product card
2. Enter quantity needed
3. Select reason (Event, Office Use, etc.)
4. Add notes if necessary
5. Click "Confirm"
6. Stock updates immediately

**Returning Items:**
1. Click "Return" button on product card
2. Enter quantity returned
3. Add notes about condition/event
4. Click "Confirm"
5. Stock increases immediately

**Viewing Product Details:**
1. Click "View Details" on any product
2. See full information (supplier, customs, pricing)
3. Click "Edit Product" to make changes (if authorized)

### For Administrators (Reception, Inventory Managers)

**Adding New Products:**
1. Click "+ Add New Item" button
2. Fill in all required fields (*, name, category, quantity, price)
3. Upload product image
4. Add optional details (supplier, HS code, notes)
5. Click "Create Gift"

**Editing Products:**
1. View product details
2. Click "Edit Product"
3. Modify fields as needed
4. Click "Save Changes"

**Managing Categories:**
1. Access Django Admin (`/admin/`)
2. Navigate to "Gift Categories"
3. Add/edit/delete categories as needed

**Viewing Transaction History:**
1. Access Django Admin
2. Navigate to "Inventory Transactions"
3. Filter by date, user, product, or reason
4. Click "Export" button for Excel report

**Generating Reports:**
1. In Django Admin → Inventory Transactions
2. Apply desired filters
3. Click "Export" dropdown
4. Select format (Excel, CSV)
5. Download file

## Development

### Running Tests
```bash
cd backend
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Accessing Admin Panel
1. Navigate to `http://localhost:8000/admin/`
2. Log in with superuser credentials
3. Manage categories, users, transactions

### Building for Production
```bash
cd frontend
npm run build
```

## Git Workflow

### Daily Workflow
```bash
# Activate virtual environment
source env/bin/activate

# Pull latest changes
git pull

# Make changes...

# Check status
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Description of changes"

# Push to GitHub
git push
```

### Recent Commits
- `"Add Excel export functionality to transaction history in Django admin"`
- `"Add low stock alerts with visual badges and filter toggle"`
- `"Complete Take and Return stock functionality with backend integration"`
- `"Add edit product functionality with auto-refresh after save"`
- `"Add transaction history tracking with reason and notes logging"`
- `"Add footer component to homepage with contact info and copyright"`

## Security

- ✅ Passwords automatically hashed using Django's built-in hashers
- ✅ JWT tokens provide stateless authentication
- ✅ Token expiration and refresh mechanism
- ✅ CORS configured for development (restrict in production)
- ✅ Image uploads validated by Pillow library
- ✅ Audit trail tracks all inventory changes with user attribution
- ✅ `on_delete=SET_NULL` preserves records if users deleted
- ✅ Read-only transaction history prevents tampering
- ⚠️ Use HTTPS in production
- ⚠️ Set `DEBUG=False` in production
- ⚠️ Use environment variables for secrets

## Deployment

### Recommended Hosting Options

**Option 1: Alibaba Cloud (Recommended for World Aquatics)**
- Aligns with company IT strategy
- Estimated cost: $40-60/month
- Services needed: ECS/Simple App Server, RDS PostgreSQL, OSS

**Option 2: DigitalOcean App Platform**
- Estimated cost: $35-50/month
- Includes: App hosting, Managed PostgreSQL, Spaces (file storage)

**Option 3: Railway**
- Estimated cost: $25-40/month
- Simplest deployment option

### Domain Setup
- **Recommended:** Use subdomain: `inventory.worldaquatics.com`
- **Cost:** $0 (using existing domain)
- DNS configuration needed through World Aquatics IT

### Pre-Deployment Checklist
- [ ] Set `DEBUG=False` in production settings
- [ ] Configure environment variables (SECRET_KEY, DATABASE_URL)
- [ ] Restrict CORS to production domain only
- [ ] Set up PostgreSQL database
- [ ] Configure cloud storage for media files (AWS S3 or equivalent)
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure automatic backups
- [ ] Test all functionality in staging environment

## Troubleshooting

### Backend Issues

**Virtual Environment Not Activated:**
```bash
source env/bin/activate  # Look for (env) in prompt
```

**Database Errors:**
```bash
python manage.py migrate
```

**Image Upload Errors:**
```bash
pip install Pillow
```

### Frontend Issues

**Dependencies Not Installed:**
```bash
npm install
```

**Build Errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues:**
- Ensure backend is running on port 8000
- Check Vite proxy configuration in `vite.config.js`

### JWT Token Expired
- Log out and log back in
- Access token expires after 30 minutes
- System will attempt auto-refresh if refresh token valid

## Cost-Benefit Analysis

### Annual Investment
- **Hosting:** $500-720/year
- **Maintenance:** $0-1,000/year (in-house)
- **Total:** $500-1,700/year

### Annual Benefits
- **Time savings:** 108 hours/year (reception staff) = $3,240
- **Error reduction:** Eliminate stock discrepancies = $1,600
- **Better reporting:** Automated Excel exports = $2,800
- **Improved planning:** Data-driven ordering = $1,000
- **Total savings:** $8,640/year

### ROI
- **Net benefit:** $7,440/year
- **Return on Investment:** 620%
- **Payback period:** 2 months

## Future Enhancements

### Phase 2 (Planned)
- [ ] Apparel inventory section (361° clothing)
- [ ] Size tracking (XS-XXL) for apparel
- [ ] Shopping basket system for internal requests
- [ ] Email notifications to reception
- [ ] Pickup date/time scheduling
- [ ] Request approval workflow

### Phase 3 (Long-term)
- [ ] Dashboard with analytics and charts
- [ ] Most requested items reporting
- [ ] Budget tracking and forecasting
- [ ] Mobile app (iOS/Android)
- [ ] Barcode scanning for quick inventory
- [ ] Integration with procurement systems

## Dependencies

### Backend (requirements.txt)
```
Django==6.0
djangorestframework==3.16.1
djangorestframework-simplejwt==5.5.1
django-cors-headers==4.9.0
django-import-export==4.3.3
Pillow==12.0.0
psycopg2-binary==2.9.11
python-dotenv==1.2.1
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "axios": "^1.7.9",
    "lucide-react": "^0.469.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "vite": "^6.0.5"
  }
}
```

## Support & Contact

**Project Manager:** Marianna Mirabile  
**Email:** marianna.mirabile@worldaquatics.com  
**Organization:** World Aquatics  

For technical support or feature requests, please contact the project team.

## License

Proprietary - World Aquatics Internal Use Only

---

## Project Status

**Version:** 1.0.0  
**Status:** Production-ready for Gifts Inventory  
**Development:** Active  
**Last Updated:** January 9, 2026  

**Completed Features:**
- ✅ User authentication with JWT
- ✅ Gifts inventory management
- ✅ Take/Return operations with reasons
- ✅ Transaction history with audit trail
- ✅ Excel export for reporting
- ✅ Low stock alerts
- ✅ Search and filtering
- ✅ Product image uploads
- ✅ Edit product functionality
- ✅ Responsive design for mobile

**In Progress:**
- 🔄 Apparel inventory section
- 🔄 Request basket system
- 🔄 Email notifications

---

**Development Environment:** GitHub Codespaces  
**Production Target:** Alibaba Cloud (aligned with World Aquatics IT strategy)