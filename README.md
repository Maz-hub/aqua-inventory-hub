# Inventory Management System - Backend

A Django REST API backend for managing organizational inventory with role-based access control and comprehensive audit tracking.

## Overview

This backend provides RESTful API endpoints for a dual-inventory management system, featuring user authentication, category management, and detailed product tracking with supplier information and customs data.

## Tech Stack

- **Framework:** Django 6.0
- **API:** Django REST Framework
- **Authentication:** JWT (Simple JWT)
- **Database:** SQLite (development) / PostgreSQL (production)
- **Python:** 3.12+

## Features

- **User Authentication**
  - JWT-based authentication with access and refresh tokens
  - Secure user registration and login endpoints
  
- **Inventory Management**
  - Dual inventory system (Gifts & Apparel)
  - Dynamic category management
  - Product tracking with images, pricing, and stock levels
  
- **Audit Tracking**
  - Automatic timestamp recording (created/updated)
  - User attribution for all inventory changes
  - Historical data preservation
  
- **Supplier & Customs Data**
  - Supplier contact information
  - HS codes and country of origin tracking
  - Material specifications

## Project Structure
```
backend/
├── backend/              # Project configuration
│   ├── settings.py      # Django settings
│   └── urls.py          # Main URL routing
├── api/                 # Core application
│   ├── models.py        # Database models
│   ├── serializers.py   # Data serialization
│   ├── views.py         # Business logic
│   └── urls.py          # API endpoints
└── manage.py            # Django management script
```

## Installation

### Prerequisites

- Python 3.12 or higher
- pip package manager

### Setup

1. **Clone the repository**
```bash
   git clone <repository-url>
   cd backend
```

2. **Create virtual environment**
```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
```

3. **Install dependencies**
```bash
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/register/` | Register new user |
| POST | `/api/token/` | Login (obtain tokens) |
| POST | `/api/token/refresh/` | Refresh access token |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/` | Django admin panel |

## Database Models

### Gift

Tracks promotional items and office supplies with the following fields:

- Product identification (name, image, category)
- Stock management (quantity, minimum stock level)
- Product details (description, material, unit price)
- Customs information (HS code, country of origin)
- Supplier data (name, email, address)
- Audit fields (created/updated timestamps and user tracking)

### GiftCategory

Dynamically managed categories for gift items, editable through Django admin.

## Configuration

Key settings in `settings.py`:

- **JWT Token Lifetimes:**
  - Access token: 30 minutes
  - Refresh token: 1 day

- **CORS:** Configured for cross-origin requests (development mode)

- **Permissions:** Default authentication required for all endpoints

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

Navigate to `/admin/` and log in with superuser credentials to manage:
- Users and permissions
- Inventory categories
- Product data

## Security Notes

- Passwords are automatically hashed using Django's built-in password hashers
- JWT tokens provide stateless authentication
- Sensitive settings should use environment variables in production
- CORS configuration should be restricted in production environments

## Future Enhancements

- [ ] Apparel inventory model implementation
- [ ] Role-based permission system
- [ ] Image upload and processing
- [ ] Low stock alerts
- [ ] Inventory reporting endpoints
- [ ] PostgreSQL database integration

## Dependencies

See `requirements.txt` for full list. Key dependencies:

- Django 6.0
- djangorestframework
- djangorestframework-simplejwt
- django-cors-headers
- psycopg2-binary (PostgreSQL adapter)
- python-dotenv (environment variables)

## Contributing

1. Create a feature branch
2. Make changes and commit with clear messages
3. Submit pull request with description of changes

## License

[Specify your license here]

---

**Note:** This is a development setup. Additional configuration required for production deployment including: proper database setup, environment variables, static file serving, and security hardening.

