# Luxe Accessories — Deployment Guide

Complete step-by-step guide to deploy the Egyptian fashion e-commerce application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development)
3. [MongoDB Setup (Atlas)](#mongodb-atlas)
4. [Cloudinary Setup](#cloudinary)
5. [WhatsApp Cloud API](#whatsapp-cloud-api)
6. [SMS API (Unifonic)](#sms-api-unifonic)
7. [Bosta Shipping API](#bosta-shipping-api)
8. [Create Admin Account](#create-admin-account)
9. [Deploy to Vercel](#deploy-vercel)
10. [Environment Variables Reference](#env-reference)
11. [API Routes Documentation](#api-docs)

---

## 1. Prerequisites

- Node.js 18+
- Git
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- Meta Business Account (for WhatsApp API)
- Vercel account

---

## 2. Local Development Setup

```bash
# Clone and navigate
cd D:\SroShield\ecommerce

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Fill in your values in .env.local (see section below)

# Run development server
npm run dev
```

Open http://localhost:3000 for the storefront.
Open http://localhost:3000/admin for the admin panel.

---

## 3. MongoDB Setup (Atlas)

1. Go to https://cloud.mongodb.com → Create free cluster
2. Choose Egypt region (closest: Frankfurt or Paris)
3. Create database user: `Settings → Database Access → Add New User`
4. Whitelist IP: `Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)` for Vercel
5. Get connection string: `Clusters → Connect → Connect your application`
6. Copy the connection string and set in `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luxe-accessories?retryWrites=true&w=majority
```

**Indexes are created automatically** by Mongoose schema definitions.

---

## 4. Cloudinary Setup

1. Go to https://cloudinary.com → Sign up free
2. Dashboard → Copy Cloud Name, API Key, API Secret
3. Set in `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

4. Go to Settings → Upload → Enable "Unsigned uploading" (optional)
5. Create a folder called `products` in Media Library

---

## 5. WhatsApp Cloud API (Meta)

This is the **most important integration**. Follow these steps carefully:

### Step A: Create Meta Business App
1. Go to https://developers.facebook.com
2. Create App → Business → Set up WhatsApp
3. Go to WhatsApp → Getting Started

### Step B: Get credentials
- **Phone Number ID**: From WhatsApp → API Setup
- **Access Token**: Generate a permanent token from System Users
- **Business Account ID**: From Business Settings

```env
WHATSAPP_API_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=12345678901234
WHATSAPP_BUSINESS_ACCOUNT_ID=12345678901234
ADMIN_WHATSAPP_NUMBER=201XXXXXXXXX  # Your WhatsApp number (no + sign)
```

### Step C: Add test numbers
In WhatsApp → Getting Started → Add phone number to test with.

### Step D: Go Live
- Complete Business Verification on Meta
- Request "messages" permission approval
- Switch from Test to Production mode

### Test WhatsApp send:
```bash
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{"messaging_product":"whatsapp","to":"201XXXXXXXXX","type":"text","text":{"body":"Test message"}}'
```

---

## 6. SMS API (Unifonic) — Optional, WhatsApp is primary

1. Sign up at https://www.unifonic.com
2. Get App SID from Dashboard
3. Set in `.env.local`:

```env
SMS_API_KEY=your-unifonic-app-sid
SMS_SENDER_ID=LuxeStore
```

**Note**: OTP system tries WhatsApp first, falls back to SMS if WhatsApp fails.

---

## 7. Bosta Shipping API

1. Register at https://app.bosta.co → Business account
2. Go to API Settings → Generate API Key
3. Set in `.env.local`:

```env
BOSTA_API_KEY=your-bosta-api-key
BOSTA_API_URL=https://app.bosta.co/api/v2
```

### How it works:
- When admin changes order status to "Shipped", the system auto-creates a Bosta delivery
- Tracking number is stored in the order
- Customer can track via `/orders/{id}` page

### Bosta Integration:
- Sandbox: Use `https://stg-app.bosta.co/api/v2` for testing
- Production: Use `https://app.bosta.co/api/v2`

---

## 8. Create Admin Account

After setting up the database, create your first admin user:

### Option A: Direct MongoDB insert
```javascript
// In MongoDB Atlas → Data Explorer → users collection
{
  "name": "Store Admin",
  "email": "admin@yourstore.com",
  "phone": "01000000000",
  "passwordHash": "$2b$12$...",  // bcrypt hash of your password
  "role": "admin",
  "createdAt": new Date()
}
```

### Option B: API endpoint (safer)
```bash
# First create a regular user via API
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name":"Admin","email":"admin@store.com","phone":"01000000000","password":"StrongPassword123"}'

# Then manually set role to 'admin' in MongoDB Atlas
# Database → users → find your user → Edit → set role: "admin"
```

### Login to Admin Panel:
Go to http://localhost:3000/admin/login
Use the email + password you set above.

---

## 9. Deploy to Vercel

### Step A: Push to GitHub
```bash
cd D:\SroShield\ecommerce
git init
git add .
git commit -m "Initial commit: Luxe Accessories e-commerce"
git remote add origin https://github.com/yourusername/luxe-accessories
git push -u origin main
```

### Step B: Deploy on Vercel
1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. Framework Preset: **Next.js** (auto-detected)
4. Root Directory: `ecommerce` (since your project is in a subdirectory)
5. Add Environment Variables (copy from `.env.local`)
6. Click Deploy

### Step C: Set Environment Variables in Vercel
Go to Project Settings → Environment Variables → Add all variables from `.env.example`

**Important**: Set `NEXT_PUBLIC_APP_URL` to your Vercel URL:
```
NEXT_PUBLIC_APP_URL=https://your-store.vercel.app
```

### Step D: Custom Domain (Optional)
- Vercel → Project → Domains → Add Domain
- Configure DNS at your registrar

---

## 10. Environment Variables Reference

```env
# ──────────────────────────────────────────────────────────────
# APP
# ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://yourstore.vercel.app
NEXT_PUBLIC_APP_NAME=Luxe Accessories
NODE_ENV=production

# ──────────────────────────────────────────────────────────────
# DATABASE
# ──────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/luxe-accessories

# ──────────────────────────────────────────────────────────────
# AUTHENTICATION
# ──────────────────────────────────────────────────────────────
JWT_SECRET=minimum-32-character-random-string-here
JWT_EXPIRES_IN=7d

# ──────────────────────────────────────────────────────────────
# CLOUDINARY (image hosting)
# ──────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# ──────────────────────────────────────────────────────────────
# WHATSAPP CLOUD API (Meta)
# ──────────────────────────────────────────────────────────────
WHATSAPP_API_TOKEN=your-permanent-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
ADMIN_WHATSAPP_NUMBER=201XXXXXXXXX    # No + sign, Egypt format

# ──────────────────────────────────────────────────────────────
# SMS API (Unifonic - backup for OTP)
# ──────────────────────────────────────────────────────────────
SMS_API_KEY=your-unifonic-app-sid
SMS_API_URL=https://api.unifonic.com/rest/SMS/messages
SMS_SENDER_ID=LuxeStore

# ──────────────────────────────────────────────────────────────
# BOSTA SHIPPING
# ──────────────────────────────────────────────────────────────
BOSTA_API_KEY=your-bosta-api-key
BOSTA_API_URL=https://app.bosta.co/api/v2

# ──────────────────────────────────────────────────────────────
# OPTIONAL
# ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_WHATSAPP_NUMBER=201XXXXXXXXX   # For "Chat on WhatsApp" buttons
```

---

## 11. API Routes Documentation

### Products

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | Public | List products. Query: `category`, `search`, `page`, `limit`, `sort`, `featured` |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/products/:id` | Public | Get product by ID or slug |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft delete (set inactive) |

### Orders

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/orders` | Public | Create order (COD). Body: checkout form + items array |
| GET | `/api/orders` | Admin | List all orders with filters |
| GET | `/api/orders/:id` | Public/Admin | Get order details |
| PATCH | `/api/orders/:id` | Admin | Update order status |

**Create Order Body:**
```json
{
  "fullName": "أحمد محمد",
  "phone": "01012345678",
  "email": "ahmed@example.com",
  "governorate": "القاهرة",
  "city": "مدينة نصر",
  "address": "شارع 9، مبنى 5",
  "notes": "اطرق الجرس مرتين",
  "paymentMethod": "cod",
  "couponCode": "SUMMER20",
  "items": [
    { "productId": "660a...", "quantity": 2 }
  ]
}
```

### Authentication

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (Bearer token required) |

### OTP

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/otp/send` | Send OTP to phone. Body: `{ phone }` |
| POST | `/api/otp/verify` | Verify OTP. Body: `{ phone, otp }` |

### Coupons

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/coupons/validate` | Public | Validate coupon. Body: `{ code, cartTotal }` |
| GET | `/api/coupons` | Admin | List all coupons |
| POST | `/api/coupons` | Admin | Create coupon |

### Shipping

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/shipping/rates` | Get all governorate shipping fees |
| GET | `/api/shipping/track?trackingNumber=xxx` | Track Bosta shipment |

### Upload

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/upload` | Admin | Upload image to Cloudinary. Form data: `file` (max 5MB) |

### Analytics

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/analytics?days=30` | Admin | Revenue, orders by status, top products |

---

## Order Status Flow

```
pending → confirmed → shipped → delivered
   ↘          ↘          ↘
  cancelled  cancelled  cancelled
```

- **pending**: Customer placed order, waiting for admin to call and confirm
- **confirmed**: Admin confirmed order by phone, ready to ship
- **shipped**: Bosta shipment created, tracking number assigned
- **delivered**: Customer received the package, revenue collected
- **cancelled**: Order cancelled (fake, unreachable, etc.)

---

## Anti-Fake Order System

1. **Phone validation**: Must be 11 digits starting with 010/011/012/015
2. **OTP verification**: Required before order submission (via WhatsApp or SMS)
3. **Rate limiting**: Max 5 orders per IP per 24 hours
4. **Duplicate detection**: Same phone + address in last 24 hours blocked
5. **Server-side pricing**: Client prices ignored, DB prices always used
6. **Admin confirmation**: All orders start as "pending" — admin calls to confirm

---

## Monitoring & Maintenance

- **Analytics dashboard**: `/admin/analytics` — daily revenue, fake order rate
- **Order management**: `/admin/orders` — filter by status, search by phone
- **Stock alerts**: Products page shows stock levels with color coding
- **WhatsApp logs**: Check Vercel function logs for WhatsApp delivery status

---

## Common Issues

**WhatsApp messages not sending:**
- Verify `WHATSAPP_PHONE_NUMBER_ID` is correct (not the phone number, but the ID)
- Check if the token is expired — Meta tokens expire after 24h unless you create a System User token
- Test numbers must be added in Meta Developer Console

**Bosta shipment creation failing:**
- Verify city name matches Bosta's city list exactly
- Check API key permissions in Bosta dashboard

**OTP not received:**
- In development, check Vercel/server logs — OTP is printed if `NODE_ENV=development`
- WhatsApp recipient must have accepted messages from your business number

**Images not uploading:**
- Check Cloudinary API credentials
- Ensure file size < 5MB
- Supported formats: JPG, PNG, WebP only
