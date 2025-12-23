# Quick Start Guide - Distributor Dashboard

## Setup Instructions

### 1. Backend Server (Should already be running)
If not running, start the backend server:
```powershell
cd "c:\Users\STEPPER LAPTOP\Desktop\B2B2C"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm start
```
Backend should be running at: http://localhost:5000

### 2. Frontend Setup (First Time Only)
```powershell
cd "c:\Users\STEPPER LAPTOP\Desktop\B2B2C\frontend"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

### 3. Start Frontend Development Server
```powershell
cd "c:\Users\STEPPER LAPTOP\Desktop\B2B2C\frontend"
npm start
```
Frontend will open automatically at: http://localhost:3000

## Testing the Dashboard

### 1. Register a Distributor Account
- Navigate to http://localhost:3000/register
- Fill in the registration form:
  - Personal info: Name, email, password, phone
  - Company info: Company name, business address, city, state, zip, country
- Click "Register"
- You'll see a message that your account is pending approval

### 2. Approve the Distributor (Backend Admin Task)
You'll need to approve the distributor through the database or admin panel:

**Option A: Using PostgreSQL directly**
```sql
-- Connect to your database
psql -U your_username -d b2b2c_ecommerce

-- Find the user
SELECT id, email, first_name, last_name FROM users WHERE user_type = 'distributor';

-- Approve the distributor
UPDATE users 
SET distributor_approval_status = 'approved', 
    distributor_approved_at = NOW() 
WHERE email = 'your_distributor_email@example.com';
```

**Option B: Using backend API** (if admin routes exist)
Make a PUT request to approve the distributor.

### 3. Login
- Navigate to http://localhost:3000/login
- Enter your email and password
- Click "Login"
- You'll be redirected to the dashboard

### 4. Explore Features

#### Dashboard (/dashboard)
- View account status (approved/pending)
- See statistics: total orders, pending orders, total spent, active products
- View recent orders
- Read announcements

#### Products (/products)
- Browse all products
- Use filters: category, price range, tags
- Search for products
- See distributor pricing (if approved)
- Add products to cart

#### Special Sections
- On Sale: /products/on-sale
- New Arrivals: /products/new-arrivals
- Special Offers: /products/special-offers

#### Shopping Cart (/cart)
- View cart items
- Update quantities
- Remove items
- Proceed to checkout

#### Checkout (/checkout)
- Enter shipping information
- Review order summary
- Place order

#### Order History (/orders)
- View all past orders
- Search by order number
- Filter by status
- View order details

#### Profile (/profile)
- Update personal information
- Update company information
- Change password

#### Announcements (/announcements)
- View all announcements
- Filter important announcements

## Troubleshooting

### Backend Connection Issues
If you see network errors:
1. Verify backend is running: http://localhost:5000/api
2. Check `.env` file in frontend folder has:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
3. Restart frontend server after changing `.env`

### PowerShell Execution Policy
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Port Already in Use
If port 3000 is already in use:
- Press 'Y' when prompted to use a different port
- Or kill the process using port 3000:
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Database Not Connected
If backend shows "Database: Not configured":
1. Ensure PostgreSQL is running
2. Check `.env` file in backend folder
3. Restart backend server

## Default Test Data

### Sample Products (Backend should create these)
You can add sample products through the backend API or database:

```sql
-- Insert sample products
INSERT INTO products (name, description, retail_price, distributor_price, stock_quantity, category, tags, is_active, is_on_sale, is_new)
VALUES 
  ('Premium Widget', 'High-quality widget for professionals', 99.99, 79.99, 100, 'Electronics', ARRAY['new-arrivals', 'premium'], true, false, true),
  ('Standard Gadget', 'Reliable gadget for everyday use', 49.99, 39.99, 200, 'Electronics', ARRAY['on-sale', 'best-seller'], true, true, false),
  ('Deluxe Tool Set', 'Complete tool set for professionals', 199.99, 159.99, 50, 'Tools', ARRAY['special-offers', 'premium'], true, true, false);
```

## Development Workflow

1. **Start Backend**: `npm start` in root directory
2. **Start Frontend**: `npm start` in frontend directory
3. **Make Changes**: Edit files in `frontend/src/`
4. **Auto Reload**: Changes reflect automatically (hot reload)
5. **Test**: Use browser DevTools for debugging

## Production Build

To create a production build:
```powershell
cd frontend
npm run build
```

This creates an optimized build in the `frontend/build/` directory.

## Component Overview

### Key Components Created

1. **Navbar** - Main navigation with cart badge
2. **Dashboard** - Overview with stats and recent activity
3. **ProductList** - Product catalog with filters
4. **ProductCard** - Individual product display
5. **ProductFilters** - Filter sidebar
6. **Cart** - Shopping cart view
7. **OrderPlacement** - Checkout form
8. **OrderHistory** - Order list with details
9. **Profile** - User profile management
10. **Announcements** - Announcement viewer
11. **Login** - Login form
12. **Register** - Registration form
13. **PrivateRoute** - Route protection

### Context Providers

1. **AuthContext** - Manages authentication state
2. **CartContext** - Manages shopping cart state

### Services

1. **api.js** - Axios instance with interceptors
2. **authService.js** - Authentication API calls
3. **productService.js** - Product API calls
4. **distributorService.js** - Distributor API calls

## Next Steps

1. **Add Products**: Create products through backend API
2. **Test Ordering**: Place test orders
3. **Customize Styling**: Modify CSS files for branding
4. **Add Features**: Extend functionality as needed
5. **Deploy**: Configure for production environment

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs
3. Verify database connections
4. Review API responses in Network tab

## Screenshots & Demo

Once running, you'll see:
- ✅ Beautiful gradient navbar
- ✅ Responsive dashboard with stats cards
- ✅ Product grid with images and pricing
- ✅ Functional shopping cart
- ✅ Order history with search
- ✅ Profile management forms
- ✅ Mobile-friendly design

Enjoy your new distributor dashboard! 🎉
