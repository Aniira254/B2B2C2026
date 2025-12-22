# Product Catalog API Documentation

## Overview

The Product Catalog system provides comprehensive product management with dual pricing, role-based access control, filtering, search, and image gallery management.

## Key Features

### 🎯 Dual Pricing System
- **Retail Customers**: See `retail_price`
- **Approved Distributors**: See `distributor_price` (requires approval)
- **Sales Representatives**: See both prices for management

### 🏷️ Product Tags
- `is_on_sale` - Products on sale
- `is_new_arrival` - New products
- `is_special_offer` - Special offer products

### 🔍 Advanced Search & Filtering
- Filter by category, price range, and tags
- Full-text search across name, description, category, and SKU
- Pagination support

## API Endpoints

### Public Endpoints

#### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `category` (string) - Filter by category
- `isOnSale` (boolean) - Filter on-sale products
- `isNewArrival` (boolean) - Filter new arrivals
- `isSpecialOffer` (boolean) - Filter special offers
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `search` (string) - Search term
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)

**Example Request:**
```bash
curl "http://localhost:5000/api/products?category=Electronics&isOnSale=true&page=1&limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "sku": "PROD-001",
        "name": "Premium Laptop",
        "description": "High-performance laptop",
        "category": "Electronics",
        "price": 999.99,
        "priceType": "retail",
        "finalPrice": "899.99",
        "savings": "100.00",
        "stock_quantity": 50,
        "is_on_sale": true,
        "is_new_arrival": false,
        "is_special_offer": false,
        "sale_discount_percentage": 10,
        "images": [
          {
            "id": 1,
            "imageUrl": "https://example.com/image1.jpg",
            "altText": "Laptop front view",
            "isPrimary": true,
            "displayOrder": 0
          }
        ]
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

#### Get Product by ID
```http
GET /api/products/:id
```

**Example Request:**
```bash
curl http://localhost:5000/api/products/1
```

**Pricing Logic:**
- Unauthenticated users see `retail_price`
- Retail customers see `retail_price`
- Approved distributors see `distributor_price`
- Pending/rejected distributors see `retail_price`
- Sales reps see both prices

#### Get Categories
```http
GET /api/products/categories
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Electronics",
      "product_count": "45"
    },
    {
      "category": "Clothing",
      "product_count": "32"
    }
  ]
}
```

#### Get Product Images
```http
GET /api/products/:id/images
```

### Admin Endpoints (Sales Representative Only)

#### Create Product
```http
POST /api/products
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "sku": "PROD-002",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "category": "Electronics",
  "retailPrice": 29.99,
  "distributorPrice": 19.99,
  "stockQuantity": 100,
  "isOnSale": false,
  "isNewArrival": true,
  "isSpecialOffer": false
}
```

#### Update Product
```http
PUT /api/products/:id
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "retailPrice": 34.99,
  "distributorPrice": 24.99,
  "isOnSale": true,
  "saleDiscountPercentage": 15
}
```

#### Delete Product
```http
DELETE /api/products/:id
Authorization: Bearer {token}
```

Note: This performs a soft delete (sets `is_active` to `false`)

#### Update Stock
```http
PATCH /api/products/:id/stock
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "quantity": 50
}
```

Note: Quantity can be positive (add) or negative (reduce)

### Image Management Endpoints (Admin Only)

#### Add Image to Product
```http
POST /api/products/:id/images
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "imageUrl": "https://example.com/product-image.jpg",
  "altText": "Product image description",
  "isPrimary": true,
  "displayOrder": 0
}
```

#### Set Primary Image
```http
PUT /api/products/:id/images/:imageId/primary
Authorization: Bearer {token}
```

#### Update Image
```http
PUT /api/products/images/:imageId
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "altText": "Updated alt text",
  "displayOrder": 1
}
```

#### Delete Image
```http
DELETE /api/products/images/:imageId
Authorization: Bearer {token}
```

#### Reorder Images
```http
POST /api/products/images/reorder
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "imageOrders": [
    { "imageId": 1, "displayOrder": 0 },
    { "imageId": 2, "displayOrder": 1 },
    { "imageId": 3, "displayOrder": 2 }
  ]
}
```

## Example Use Cases

### 1. Customer Browsing Products
```bash
# Get all products on sale
curl "http://localhost:5000/api/products?isOnSale=true"

# Search for products
curl "http://localhost:5000/api/products?search=laptop"

# Filter by category and price range
curl "http://localhost:5000/api/products?category=Electronics&minPrice=100&maxPrice=500"
```

### 2. Distributor Viewing Products
```bash
# Login first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "distributor@example.com", "password": "password"}'

# Get products (will see distributor prices if approved)
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer {access_token}"
```

### 3. Admin Managing Products
```bash
# Create new product
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "LAPTOP-001",
    "name": "Gaming Laptop",
    "description": "High-end gaming laptop",
    "category": "Electronics",
    "retailPrice": 1499.99,
    "distributorPrice": 1199.99,
    "stockQuantity": 25,
    "isNewArrival": true
  }'

# Add product images
curl -X POST http://localhost:5000/api/products/1/images \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.example.com/laptop-main.jpg",
    "altText": "Gaming laptop main view",
    "isPrimary": true
  }'

# Update stock
curl -X PATCH http://localhost:5000/api/products/1/stock \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"quantity": -5}'
```

## Pricing Logic Details

### Price Display Rules

1. **Unauthenticated Users**
   - See: `retail_price`
   - Response includes: `price`, `priceType: "retail"`, `finalPrice`

2. **Retail Customers**
   - See: `retail_price`
   - Response includes: `price`, `priceType: "retail"`, `finalPrice`

3. **Distributors (Pending)**
   - See: `retail_price`
   - Cannot access distributor pricing until approved

4. **Distributors (Approved)**
   - See: `distributor_price`
   - Response includes: `price`, `priceType: "distributor"`, `finalPrice`

5. **Sales Representatives**
   - See: Both `retail_price` AND `distributor_price`
   - Full product management access

### Sale Price Calculation

When `is_on_sale = true` and `sale_discount_percentage` is set:
```javascript
finalPrice = price - (price * sale_discount_percentage / 100)
savings = price * sale_discount_percentage / 100
```

Example:
- Original price: $100
- Discount: 20%
- Final price: $80
- Savings: $20

## Data Models

### Product
```javascript
{
  id: integer,
  sku: string (unique),
  name: string,
  description: text,
  category: string,
  retail_price: decimal,
  distributor_price: decimal,
  stock_quantity: integer,
  is_on_sale: boolean,
  is_new_arrival: boolean,
  is_special_offer: boolean,
  sale_discount_percentage: decimal,
  is_active: boolean,
  created_at: timestamp,
  updated_at: timestamp,
  images: array
}
```

### Product Image
```javascript
{
  id: integer,
  product_id: integer,
  image_url: string,
  alt_text: string,
  is_primary: boolean,
  display_order: integer,
  created_at: timestamp
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "retailPrice",
      "message": "Retail price must be a positive number"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

## Best Practices

1. **Pagination**: Always use pagination for product lists to improve performance
2. **Caching**: Consider caching product lists and categories
3. **Image URLs**: Store images on CDN for better performance
4. **Stock Management**: Use the stock update endpoint with negative values for sales
5. **Search**: Use specific filters to narrow down results before full-text search

## Security Notes

- Product creation/update/delete requires Sales Representative role
- Distributor pricing only visible to approved distributors
- Image management restricted to administrators
- All admin operations require valid JWT token
- Rate limiting applied to all endpoints
