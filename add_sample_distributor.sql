-- Add Sample Distributor to Database
-- This script creates a sample distributor account that is already approved

-- Step 1: Insert the user
-- Password is: Distributor123!
-- The hash below is for testing purposes only
INSERT INTO users (
    email, 
    password_hash, 
    user_type, 
    first_name, 
    last_name, 
    phone, 
    is_active, 
    distributor_approval_status, 
    distributor_approved_at
)
VALUES (
    'distributor@test.com',
    '$2a$10$YQiTxNQGmYHEIw8VJLhKMeD5wqXJ8xzRkKp1J7vKjNzH1hNzNXzGS',
    'distributor',
    'John',
    'Doe',
    '+1-555-0123',
    true,
    'approved',
    NOW()
)
ON CONFLICT (email) DO UPDATE 
SET 
    distributor_approval_status = 'approved',
    distributor_approved_at = NOW(),
    is_active = true
RETURNING id;

-- Step 2: Get the user ID and insert distributor profile
WITH user_data AS (
    SELECT id FROM users WHERE email = 'distributor@test.com'
)
INSERT INTO distributors (
    user_id,
    company_name,
    business_address,
    city,
    state,
    zip_code,
    country
)
SELECT 
    id,
    'ABC Distributors Inc.',
    '456 Commerce Street',
    'New York',
    'NY',
    '10001',
    'USA'
FROM user_data
ON CONFLICT (user_id) DO UPDATE
SET 
    company_name = EXCLUDED.company_name,
    business_address = EXCLUDED.business_address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    zip_code = EXCLUDED.zip_code,
    country = EXCLUDED.country;

-- Verify the distributor was created
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.user_type,
    u.distributor_approval_status,
    u.is_active,
    d.company_name,
    d.business_address,
    d.city,
    d.state
FROM users u
LEFT JOIN distributors d ON u.id = d.user_id
WHERE u.email = 'distributor@test.com';
