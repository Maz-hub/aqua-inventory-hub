# Aqua Inventory Hub

A Django REST API backend with React frontend for managing dual-inventory systems with role-based access control and comprehensive audit tracking.

## Overview

Full-stack inventory management application designed for organizational use. Features separate inventory sections for promotional items and apparel, with user authentication, dynamic category management, and detailed product tracking including supplier information and customs data.

## Tech Stack

**Backend:**
- **Framework:** Django 6.0
- **API:** Django REST Framework
- **Authentication:** JWT (Simple JWT)
- **Database:** SQLite (development) / PostgreSQL (production)
- **Python:** 3.12+
- **Image Processing:** Pillow 12.0.0

**Frontend:**
- React (upcoming)

## Features

### User Authentication
- JWT-based authentication with access and refresh tokens
- Secure user registration and login endpoints
- Token refresh mechanism (30-minute access, 1-day refresh)

### Inventory Management
- Dual inventory system (Gifts & Apparel sections)
- Dynamic category management through Django admin
- Product tracking with images, pricing, and stock levels
- Minimum stock level alerts
- Comprehensive product information (material, HS codes, country of origin)

### Audit Tracking
- Automatic timestamp recording (created/updated)
- User attribution for all inventory changes (created_by, updated_by)
- Historical data preservation (records survive user deletion)

### Supplier & Customs Data
- Supplier contact information (name, email, address)
- HS codes for customs documentation
- Country of origin tracking
- Material specifications

## Project Structure
```
aqua-inventory-hub/
├── backend/                  # Django backend
│   ├── backend/             # Project configuration
│   │   ├── settings.py     # Django settings
│   │   └── urls.py         # Main URL routing
│   ├── api/                # Core application
│   │   ├── models.py       # Database models (Gift, GiftCategory)
│   │   ├── serializers.py  # Data serialization (JSON conversion)
│   │   ├── views.py        # Business logic (CRUD operations)
│   │   └── urls.py         # API endpoint routing
│   ├── media/              # Uploaded images storage
│   │   └── gift_images/    # Product images
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend (coming soon)
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Installation & Setup

### Prerequisites

- Python 3.12 or higher
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
   # On Codespaces (Linux): source env/bin/activate
```

3. **Install dependencies**
```bash
   cd backend
   pip install -r requirements.txt
```

4. **Apply migrations**
```bash
   python manage.py migrate
```

5. **Create superuser (optional)**
```bash
   python manage.py createsuperuser
```

6. **Run development server**
```bash
   python manage.py runserver
```

The API will be available at `http://localhost:8000`

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
| DELETE | `/api/gifts/delete/<id>/` | Delete specific gift | Yes |
| GET | `/api/categories/` | List all gift categories | Yes |

### Administration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/` | Django admin panel |

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

**Inventory Management:**
- `minimum_stock_level` - Alert threshold (default: 10)
- `notes` - Internal notes

## API Data Format

### Category Response Example
```json
{
  "id": 1,
  "name": "Apparel"
}
```

### Gift Response Example
```json
{
  "id": 1,
  "product_image": "/media/gift_images/blue_hat.jpg",
  "product_name": "Blue Hat",
  "category": {
    "id": 1,
    "name": "Apparel"
  },
  "qty_stock": 50,
  "description": "Official blue hat with logo",
  "material": "100% Cotton",
  "unit_price": "12.00",
  "hs_code": "6505.00.30",
  "country_of_origin": "China",
  "supplier_name": "Acme Textiles",
  "supplier_email": "orders@acmetextiles.com",
  "supplier_address": "123 Factory St, Guangzhou, China",
  "created_at": "2025-12-22T10:30:00Z",
  "created_by": 1,
  "updated_at": "2025-12-22T14:15:00Z",
  "updated_by": 1,
  "minimum_stock_level": 10,
  "notes": "Reorder when below 10 units"
}
```

### Creating a Gift (POST Request)
```json
{
  "product_name": "Blue Hat",
  "category_id": 1,
  "qty_stock": 50,
  "unit_price": "12.00",
  "material": "100% Cotton",
  "description": "Official blue hat with logo",
  "minimum_stock_level": 10
}
```

## Configuration

### JWT Token Settings (`settings.py`)
```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}
```

### CORS Configuration
Currently configured for development (allows all origins):
```python
CORS_ALLOW_ALL_ORIGINS = True
```
**⚠️ Must be restricted in production**

### Image Upload Settings
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Accessing Admin Panel
1. Navigate to `/admin/`
2. Log in with superuser credentials
3. Manage:
   - Users and permissions
   - Gift categories
   - Inventory data

### Adding Categories
1. Access Django admin at `/admin/`
2. Navigate to "Gift Categories"
3. Add new categories (e.g., Deco, Office, Drinkware)
4. Categories appear automatically in API dropdown

## Git Workflow

### Daily Workflow
```bash
# Activate virtual environment
source env/bin/activate

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

### Commit Message Guidelines
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Examples:
  - `"Create Gift and GiftCategory models with audit tracking"`
  - `"Add Gift CRUD views and category list endpoint"`
  - `"Configure API URLs for gift operations"`

## Security Notes

- Passwords automatically hashed using Django's built-in hashers
- JWT tokens provide stateless authentication
- Sensitive settings use environment variables in production
- Image uploads validated by Pillow library
- Audit trail tracks all inventory changes
- `on_delete=SET_NULL` preserves inventory records if users deleted

## Troubleshooting

### Pylance Import Warnings in VS Code
**Issue:** Yellow squiggles on imports despite successful installation

**Solution:** This is a known Codespaces issue. If `python manage.py check` passes, ignore the warnings.

### Virtual Environment Issues
**Issue:** Commands not found or wrong Python version

**Solution:** Ensure virtual environment is activated:
```bash
source env/bin/activate  # Look for (env) in prompt
```

### Image Upload Errors
**Issue:** `Cannot use ImageField because Pillow is not installed`

**Solution:**
```bash
pip install Pillow
pip freeze > requirements.txt
```

## Future Enhancements

**Phase 1 (In Progress):**
- [ ] React frontend implementation
- [ ] User interface for inventory management
- [ ] Image upload through web interface

**Phase 2:**
- [ ] Apparel inventory model
- [ ] Role-based permission system (Gifts Managers, Apparel Managers)
- [ ] Low stock alert notifications
- [ ] Inventory reporting and analytics

**Phase 3:**
- [ ] PostgreSQL database integration
- [ ] Production deployment
- [ ] Automated backup system
- [ ] Export functionality (CSV, Excel)

## Dependencies

Full list in `requirements.txt`. Key dependencies:
```
Django==6.0
djangorestframework==3.16.1
djangorestframework-simplejwt==5.5.1
django-cors-headers==4.9.0
Pillow==12.0.0
psycopg2-binary==2.9.11
python-dotenv==1.2.1
```

## Contributing

1. Create a feature branch from `main`
2. Make changes with clear, incremental commits
3. Test thoroughly in development
4. Submit pull request with description
5. Code review before merging

## License

[Specify your license here]

---

## Notes

**Development Environment:** GitHub Codespaces (Linux)
- Use Mac/Linux commands in terminal
- Virtual environment must be activated for each session
- CORS configured for development (restrict in production)

**Image Storage:**
- Development: Local filesystem in `backend/media/`
- Production: Cloud storage (AWS S3, Cloudflare R2, etc.)

**Database:**
- Development: SQLite (`db.sqlite3`)
- Production: PostgreSQL (to be configured)

---

**Current Status:** Backend API complete. Frontend development in progress.

**Last Updated:** December 22, 2025