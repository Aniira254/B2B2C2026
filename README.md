# B2B2C Ecommerce Platform - Authentication System

A complete authentication system with role-based access control (RBAC) for a B2B2C ecommerce platform built with Node.js, Express, PostgreSQL, and JWT.

## Features

### Authentication
- ✅ User registration with role selection (Retail Customer, Distributor, Sales Representative)
- ✅ Distributor registration with admin approval workflow
- ✅ Secure login with JWT tokens
- ✅ Refresh token mechanism for session management
- ✅ Password reset via email
- ✅ Profile management
- ✅ Logout and logout from all devices

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ JWT token verification middleware
- ✅ Distributor approval status checking
- ✅ Protected routes based on user roles

### Security
- ✅ Password hashing with bcrypt
- ✅ Password strength validation
- ✅ JWT access and refresh tokens
- ✅ Token revocation on logout
- ✅ Rate limiting on sensitive endpoints
- ✅ Helmet.js security headers
- ✅ CORS protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Email**: nodemailer
- **Security**: helmet, express-rate-limit, cors

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Steps

1. **Clone the repository** (or you're already in it)

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**

First, create the database:
```sql
CREATE DATABASE b2b2c_ecommerce;
```

Then run the schema files:
```bash
psql -U postgres -d b2b2c_ecommerce -f schema.sql
psql -U postgres -d b2b2c_ecommerce -f schema_tokens.sql
```

4. **Configure environment variables**

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=b2b2c_ecommerce
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@b2b2c.com

FRONTEND_URL=http://localhost:3000
BCRYPT_ROUNDS=10
```

5. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Public Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/register/distributor` - Register as distributor
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/password-reset-request` - Request password reset
- `POST /api/auth/password-reset` - Reset password

### Protected Endpoints (Require Authentication)

#### Profile Management
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout-all` - Logout from all devices

#### Distributor Management (Sales Rep Only)
- `GET /api/distributors/pending` - Get pending distributor approvals
- `PUT /api/distributors/:distributorId/approval` - Approve/reject distributor

#### Distributor Status (Distributor Only)
- `GET /api/distributors/status` - Check approval status

## Request Examples

### Register as Retail Customer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "userType": "retail_customer"
  }'
```

### Register as Distributor
```bash
curl -X POST http://localhost:5000/api/auth/register/distributor \
  -H "Content-Type: application/json" \
  -d '{
    "email": "distributor@example.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "userType": "distributor",
    "companyName": "ABC Distribution",
    "businessAddress": "123 Business St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123!"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## User Roles

### 1. Retail Customer (`retail_customer`)
- Can browse and purchase products at retail prices
- Full access to customer features
- No approval required

### 2. Distributor (`distributor`)
- Can purchase products at distributor prices
- **Requires admin approval** before accessing distributor features
- Approval status: `pending`, `approved`, or `rejected`

### 3. Sales Representative (`sales_representative`)
- Can approve/reject distributor applications
- Access to admin features
- Can manage announcements and view reports

## Middleware

### Authentication Middleware
- `authenticate` - Verifies JWT token and user status
- `authorize(...roles)` - Checks if user has required role(s)
- `checkDistributorApproval` - Verifies distributor approval status
- `optionalAuthenticate` - Optional auth (doesn't fail if no token)

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting
- General API: 100 requests per 15 minutes
- Login: 5 attempts per 15 minutes
- Password reset: 5 requests per 15 minutes

### Token Management
- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- Tokens are revoked on logout
- Password reset tokens expire in 1 hour

## Error Handling

All errors return a consistent format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## Development

### Project Structure
```
B2B2C/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── distributorController.js
├── middleware/
│   ├── auth.js             # Auth middleware
│   └── errorHandler.js     # Error handling
├── models/
│   ├── userModel.js        # User queries
│   ├── roleModel.js        # Role-specific queries
│   └── tokenModel.js       # Token management
├── routes/
│   ├── index.js            # API index
│   ├── authRoutes.js       # Auth routes
│   └── distributorRoutes.js
├── utils/
│   ├── jwt.js              # JWT utilities
│   ├── password.js         # Password utilities
│   ├── validation.js       # Validation rules
│   └── email.js            # Email utilities
├── schema.sql              # Database schema
├── schema_tokens.sql       # Token tables schema
├── server.js               # Main server file
├── package.json
└── .env.example
```

## Testing

You can test the API using:
- **Postman** - Import the endpoints
- **curl** - Command line examples above
- **Thunder Client** - VS Code extension

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong secrets for JWT tokens
3. Configure proper email service (not Gmail)
4. Set up SSL/TLS certificates
5. Use environment-specific database
6. Configure CORS for your domain
7. Set up logging and monitoring
8. Use PM2 or similar for process management

## License

ISC

## Support

For issues or questions, please contact the development team.
