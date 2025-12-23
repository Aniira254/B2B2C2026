# B2B2C E-Commerce Platform - Distributor Dashboard

A complete React-based distributor dashboard for the B2B2C e-commerce platform with authentication, product catalog, shopping cart, order management, and profile features.

## Features

### 🔐 Authentication
- **Login & Registration**: Secure authentication with JWT tokens
- **Role-Based Access**: Distributor-specific features and pricing
- **Approval Workflow**: Account approval status tracking
- **Protected Routes**: Automatic redirect for unauthenticated users

### 📊 Dashboard Overview
- **Statistics Cards**: Total orders, pending orders, total spent, active products
- **Recent Orders**: Quick view of latest orders with status
- **Announcements**: Important updates and notifications
- **Account Status**: Visual indicator for approval status (pending/approved/rejected)

### 🛍️ Product Catalog
- **Product Listing**: Grid view with pagination
- **Dual Pricing**: Show distributor prices for approved distributors
- **Advanced Filters**: Category, price range, and tag filters
- **Search**: Full-text product search
- **Special Sections**:
  - On Sale items with discount percentage
  - New Arrivals
  - Special Offers
- **Product Details**: Images, descriptions, tags, stock status

### 🛒 Shopping Cart
- **Add to Cart**: Quick add from product cards
- **Quantity Management**: Increase/decrease quantities
- **Remove Items**: Easy item removal
- **Price Calculation**: Real-time total updates
- **Empty State**: Helpful prompts when cart is empty

### 📦 Order Management
- **Order Placement**: Full checkout with shipping information
- **Order History**: View all past orders
- **Search & Filter**: Find orders by number or status
- **Order Details**: Modal view with complete order information
- **Status Tracking**: Visual status badges (pending, processing, shipped, delivered, cancelled)

### 👤 Profile Management
- **Personal Information**: Update name, email, phone
- **Company Details**: Manage business address and company info
- **Password Change**: Secure password update
- **Edit Mode**: Toggle between view and edit states

### 📢 Announcements
- **View Updates**: See all announcements from admin
- **Filter Important**: Quick filter for important announcements
- **Date Formatting**: Relative dates (today, yesterday, X days ago)
- **Visual Priority**: Highlighted important announcements

### 🎨 UI/UX Features
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Modern Styling**: Gradient backgrounds, smooth transitions, hover effects
- **Loading States**: User-friendly loading indicators
- **Empty States**: Helpful messages and CTAs for empty content
- **Error Handling**: Clear error messages
- **Icons**: React Icons for consistent iconography
- **Navigation**: Sticky navbar with cart badge counter
- **Mobile Menu**: Hamburger menu for mobile devices

## Tech Stack

- **React 18**: Frontend framework
- **React Router v6**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Context API**: State management (Auth & Cart)
- **React Icons**: Icon library
- **CSS3**: Custom styling with gradients and animations

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Announcements.js
│   │   ├── Announcements.css
│   │   ├── Auth.css
│   │   ├── Cart.js
│   │   ├── Cart.css
│   │   ├── Dashboard.js
│   │   ├── Dashboard.css
│   │   ├── Login.js
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   ├── OrderHistory.js
│   │   ├── OrderHistory.css
│   │   ├── OrderPlacement.js
│   │   ├── OrderPlacement.css
│   │   ├── PrivateRoute.js
│   │   ├── ProductCard.js
│   │   ├── ProductCard.css
│   │   ├── ProductFilters.js
│   │   ├── ProductFilters.css
│   │   ├── ProductList.js
│   │   ├── ProductList.css
│   │   ├── Profile.js
│   │   ├── Profile.css
│   │   ├── Register.js
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.js      # Authentication state management
│   │   └── CartContext.js       # Shopping cart state management
│   ├── services/
│   │   ├── api.js               # Axios instance with interceptors
│   │   ├── authService.js       # Authentication API calls
│   │   ├── distributorService.js # Distributor-specific API calls
│   │   └── productService.js    # Product API calls
│   ├── App.js                    # Main app with routing
│   ├── App.css                   # Global styles
│   ├── index.js                  # Entry point
│   └── index.css                 # Base styles
├── package.json
└── README.md
```

## Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Run the development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (one-way operation)

## API Integration

The frontend is configured to connect to the backend API at `http://localhost:5000/api` by default.

### API Endpoints Used

**Authentication**:
- `POST /auth/register` - Register new distributor
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout and invalidate tokens
- `POST /auth/refresh-token` - Refresh access token
- `PUT /auth/profile` - Update profile

**Products**:
- `GET /products` - Get products with filters
- `GET /products/:id` - Get single product

**Distributors**:
- `GET /distributors/status` - Get distributor status
- `GET /distributors/dashboard-stats` - Get dashboard statistics
- `GET /distributors/recent-orders` - Get recent orders
- `GET /distributors/announcements` - Get announcements

**Orders** (To be implemented on backend):
- `POST /orders` - Create new order
- `GET /orders` - Get order history
- `GET /orders/:id` - Get order details

## Features by User Type

### Unapproved Distributors
- Can register and login
- See pending approval status
- Cannot access distributor pricing
- Limited dashboard access

### Approved Distributors
- Full dashboard access
- Distributor pricing on all products
- Place orders
- View order history
- Access announcements
- Manage profile

## Styling

The application uses a modern design system:

**Colors**:
- Primary: `#667eea` → `#764ba2` (gradient)
- Success: `#28a745`
- Warning: `#ffc107`
- Danger: `#dc3545`
- Info: `#17a2b8`

**Responsive Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## State Management

### Auth Context
- User authentication state
- Login/logout functionality
- Profile updates
- Token management

### Cart Context
- Shopping cart items
- Add/remove/update cart items
- Cart total calculation
- LocalStorage persistence

## Security

- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Secure password requirements
- XSS protection

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced product filtering
- [ ] Wishlist functionality
- [ ] Order tracking with timeline
- [ ] Sales analytics dashboard
- [ ] Bulk order import
- [ ] Multi-language support
- [ ] Dark mode theme

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of the B2B2C E-Commerce Platform.

## Support

For support, please contact the development team or refer to the main project documentation.
