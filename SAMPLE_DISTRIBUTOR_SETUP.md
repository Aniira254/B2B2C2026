# Sample Distributor Setup Instructions

## Option 1: Start PostgreSQL and Run the Script (Recommended)

1. **Start PostgreSQL Service:**
   - Open pgAdmin or your PostgreSQL installation
   - Start the PostgreSQL server
   - OR use Windows Services to start the PostgreSQL service

2. **Run the setup script:**
   ```powershell
   cd "c:\Users\STEPPER LAPTOP\Desktop\B2B2C"
   node addSampleDistributor.js
   ```

3. **Login with these credentials:**
   - Email: `distributor@test.com`
   - Password: `Distributor123!`
   - URL: http://localhost:3000/login

---

## Option 2: Manual Database Setup (If you have psql)

Run this SQL file in your PostgreSQL database:

```powershell
psql -U postgres -d b2b2c_ecommerce -f add_sample_distributor.sql
```

Or open pgAdmin and execute the SQL from `add_sample_distributor.sql`

---

## Option 3: Use the Frontend Registration Form

1. Go to: http://localhost:3000/register

2. Fill in the form with these details:
   - **First Name:** John
   - **Last Name:** Doe
   - **Email:** your-email@test.com
   - **Password:** Must include:
     - At least 8 characters
     - One uppercase letter (A-Z)
     - One lowercase letter (a-z)
     - One number (0-9)
     - One special character (!@#$%^&*)
     - Example: `Distributor123!`
   - **Phone:** +1-555-0123
   - **Company Name:** Your Company Name
   - **Business Address:** 123 Main Street
   - **City, State, Zip, Country:** Fill as needed

3. After registration, approve the distributor:
   - Start PostgreSQL
   - Run this SQL:
     ```sql
     UPDATE users 
     SET distributor_approval_status = 'approved',
         distributor_approved_at = NOW()
     WHERE email = 'your-email@test.com';
     ```
   - Or use pgAdmin to update the user record

---

## Pre-Created Sample Account Details

Once PostgreSQL is running and you execute the script, you'll have:

**Login Credentials:**
- Email: `distributor@test.com`
- Password: `Distributor123!`

**Company Details:**
- Company: ABC Distributors Inc.
- Address: 456 Commerce Street, New York, NY 10001, USA
- Status: **Already Approved** ✓

**What you can do:**
- Login immediately
- View distributor pricing on products
- Add products to cart
- Place orders
- View order history
- Manage profile

---

## Troubleshooting

### PostgreSQL Not Running
```powershell
# Check if PostgreSQL is installed
Get-Service -Name "*postgres*"

# Or check processes
Get-Process -Name "*postgres*"
```

If PostgreSQL is not running:
1. Open **pgAdmin 4**
2. Start the server from the dashboard
3. OR find PostgreSQL in Windows Services and start it
4. Then run the script again

### Backend Server Not Running
```powershell
# Check if backend is running
netstat -ano | findstr ":5000"

# If not running, start it:
cd "c:\Users\STEPPER LAPTOP\Desktop\B2B2C"
npm start
```

### Frontend Server Not Running
```powershell
# Check if frontend is running
netstat -ano | findstr ":3000"

# If not running, start it:
cd "c:\Users\STEPPER LAPTOP\Desktop\B2B2C\frontend"
npm start
```
