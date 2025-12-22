-- B2B2C Ecommerce Platform Database Schema
-- PostgreSQL Database Design

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_type_enum AS ENUM ('retail_customer', 'distributor', 'sales_representative');
CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE leave_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE suggestion_visibility_enum AS ENUM ('anonymous', 'revealed');

-- ============================================
-- USERS TABLE (Base table for all user types)
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type user_type_enum NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================
-- RETAIL CUSTOMERS TABLE
-- ============================================

CREATE TABLE retail_customers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shipping_address TEXT,
    billing_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_retail_customers_user_id ON retail_customers(user_id);

-- ============================================
-- DISTRIBUTORS TABLE
-- ============================================

CREATE TABLE distributors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    business_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    approval_status approval_status_enum DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_distributors_user_id ON distributors(user_id);
CREATE INDEX idx_distributors_status ON distributors(approval_status);
CREATE INDEX idx_distributors_approved_by ON distributors(approved_by);

-- ============================================
-- SALES REPRESENTATIVES TABLE
-- ============================================

CREATE TABLE sales_representatives (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    territory VARCHAR(100),
    manager_id INTEGER REFERENCES sales_representatives(id),
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_reps_user_id ON sales_representatives(user_id);
CREATE INDEX idx_sales_reps_employee_id ON sales_representatives(employee_id);
CREATE INDEX idx_sales_reps_manager ON sales_representatives(manager_id);

-- ============================================
-- PRODUCTS TABLE
-- ============================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    retail_price DECIMAL(10, 2) NOT NULL,
    distributor_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_on_sale BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_special_offer BOOLEAN DEFAULT false,
    sale_discount_percentage DECIMAL(5, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_prices CHECK (retail_price >= 0 AND distributor_price >= 0),
    CONSTRAINT check_stock CHECK (stock_quantity >= 0),
    CONSTRAINT check_discount CHECK (sale_discount_percentage >= 0 AND sale_discount_percentage <= 100)
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_on_sale ON products(is_on_sale);
CREATE INDEX idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX idx_products_special_offer ON products(is_special_offer);

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    order_status order_status_enum DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    CONSTRAINT check_amounts CHECK (
        subtotal >= 0 AND 
        tax_amount >= 0 AND 
        shipping_cost >= 0 AND 
        discount_amount >= 0 AND 
        total_amount >= 0
    )
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_quantity CHECK (quantity > 0),
    CONSTRAINT check_order_item_amounts CHECK (unit_price >= 0 AND subtotal >= 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- DISTRIBUTOR ANNOUNCEMENTS TABLE
-- ============================================

CREATE TABLE distributor_announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    is_published BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dist_announcements_published ON distributor_announcements(is_published);
CREATE INDEX idx_dist_announcements_created_by ON distributor_announcements(created_by);
CREATE INDEX idx_dist_announcements_published_at ON distributor_announcements(published_at);

-- ============================================
-- SALES REP ANNOUNCEMENTS TABLE
-- ============================================

CREATE TABLE sales_rep_announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    is_published BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_announcements_published ON sales_rep_announcements(is_published);
CREATE INDEX idx_sales_announcements_created_by ON sales_rep_announcements(created_by);
CREATE INDEX idx_sales_announcements_published_at ON sales_rep_announcements(published_at);

-- ============================================
-- LEAVE REQUESTS TABLE (for Sales Reps)
-- ============================================

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    sales_rep_id INTEGER NOT NULL REFERENCES sales_representatives(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    status leave_status_enum DEFAULT 'pending',
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT check_total_days CHECK (total_days > 0)
);

CREATE INDEX idx_leave_requests_sales_rep ON leave_requests(sales_rep_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- ============================================
-- SUGGESTIONS TABLE
-- ============================================

CREATE TABLE suggestions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    visibility suggestion_visibility_enum NOT NULL,
    category VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    response TEXT,
    responded_by INTEGER REFERENCES users(id),
    responded_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX idx_suggestions_visibility ON suggestions(visibility);
CREATE INDEX idx_suggestions_category ON suggestions(category);
CREATE INDEX idx_suggestions_archived ON suggestions(is_archived);

-- ============================================
-- PRODUCT IMAGES TABLE (optional but useful)
-- ============================================

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(is_primary);

-- ============================================
-- SHOPPING CART TABLE (optional but useful)
-- ============================================

CREATE TABLE shopping_cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_cart_quantity CHECK (quantity > 0),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX idx_shopping_cart_product_id ON shopping_cart(product_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributors_updated_at BEFORE UPDATE ON distributors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suggestions_updated_at BEFORE UPDATE ON suggestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON shopping_cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA INSERTION (Optional)
-- ============================================

-- Insert sample admin user
-- INSERT INTO users (email, password_hash, user_type, first_name, last_name) 
-- VALUES ('admin@example.com', 'hashed_password_here', 'sales_representative', 'Admin', 'User');

-- ============================================
-- VIEWS FOR CONVENIENCE
-- ============================================

-- View for approved distributors
CREATE VIEW approved_distributors AS
SELECT 
    d.id,
    d.company_name,
    d.business_registration_number,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    d.business_address,
    d.city,
    d.state,
    d.country
FROM distributors d
JOIN users u ON d.user_id = u.id
WHERE d.approval_status = 'approved' AND u.is_active = true;

-- View for pending distributor approvals
CREATE VIEW pending_distributor_approvals AS
SELECT 
    d.id,
    d.company_name,
    d.business_registration_number,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    d.created_at
FROM distributors d
JOIN users u ON d.user_id = u.id
WHERE d.approval_status = 'pending';

-- View for order summaries
CREATE VIEW order_summaries AS
SELECT 
    o.id,
    o.order_number,
    o.order_status,
    u.user_type,
    u.first_name,
    u.last_name,
    u.email,
    o.total_amount,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.order_status, u.user_type, u.first_name, u.last_name, u.email, o.total_amount, o.created_at;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Base table for all user types in the system';
COMMENT ON TABLE distributors IS 'Distributor-specific information with approval workflow';
COMMENT ON TABLE products IS 'Products with dual pricing for retail and distributor customers';
COMMENT ON TABLE orders IS 'Orders from both retail customers and distributors';
COMMENT ON TABLE leave_requests IS 'Leave management system for sales representatives';
COMMENT ON TABLE suggestions IS 'Suggestion box with anonymous/revealed visibility options';
