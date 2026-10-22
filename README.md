# 🛒 Mojicart — Bharat Ka Trusted Multi-Vendor E-Commerce Marketplace
### Amazon & Meesho Style Architecture for Indian Commerce

Mojicart is an enterprise-grade, scalable, multi-vendor e-commerce marketplace built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. It unites the expansive shopping variety of Amazon with the direct-from-manufacturer affordability of Meesho.

---

## 🌟 Key Functional Pillars

### 1. Customer Storefront
- **Dynamic Homepage CMS**: Driven directly by the Admin Panel (Promotional Hero Sliders, Category Tiles, Deals of the Day, and Meesho-Style Budget Zones: Under ₹199 and Under ₹499).
- **Delivery Pincode Selector**: Live delivery speed estimator and serviceable pincode validation.
- **Omnibox Search Engine**: Real product search with keyword matching, category filters, price sliders, star ratings, and sorting options.
- **Product Detail Page (PDP)**: High-resolution image galleries, variant matrix (Size/Color) with dynamic price/MRP/stock recomputation, technical specifications, and verified-purchase review submission.
- **Shopping Cart**: Real-time stock revalidation, live price checks, free delivery milestone progress bar, and coupon validation engine.
- **Multi-Step Checkout**: Addresses book, cash on delivery (COD), UPI (GPay/PhonePe), and card payments (Razorpay sandbox).
- **Order Tracking & Account**: Real-time shipment status stepper (Confirmed -> Packed -> Shipped -> Out for Delivery -> Delivered) with tracking AWB numbers and invoice breakdowns.

### 2. Multi-Vendor Seller Dashboard (`/seller`)
- **Seller Onboarding & KYC**: Business registration with GSTIN, PAN, and bank settlement account details.
- **Executive Vendor Dashboard**: Real-time gross sales, platform commission deductions, net earnings, pending dispatch queue, and low-stock alerts.
- **Catalog Management**: Add, edit, and submit product listings with multi-variants, SKUs, and imagery for admin quality approval.
- **Order Fulfillment**: Dedicated suborder queue with seller data isolation (vendors only see their own items), packing slips, and carrier AWB dispatch confirmation.
- **Financial Settlements**: Gross merchandise value (GMV), platform commission deductions, GST TDS tracking, and bank payout history.

### 3. Super Admin Operations Panel (`/admin`)
- **Real-Time Executive Analytics**: GMV, net sales, orders placed/fulfilled/cancelled, total customer registrations, active sellers, and platform commission revenues.
- **Product Catalog Moderation**: Review and approve/reject vendor submissions, assign promotional "Featured" and "BestSeller" badges, and audit inventory.
- **Multi-Vendor Management**: Verify vendor KYC, suspend/reactivate seller accounts, and override per-vendor commission rates.
- **Global Order Operations**: State machine transitions with strict transition validation and internal audit logs.
- **Category Hierarchy & Taxonomies**: Multi-level category tree with display order and category-level commission rates.
- **Homepage CMS Editor**: Add, deactivate, and reschedule hero banners and toggle homepage product rails without writing code.
- **Global Marketplace Configuration**: Baseline commission rates, free shipping thresholds, COD eligibility, and customer support numbers.

---

## 🔑 Seeded Demo Credentials

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin** | `admin@mojicart.com` | `admin123` | `/admin` |
| **🏷️ Catalog Manager** | `catalog@mojicart.com` | `password123` | `/admin/products` |
| **📦 Order Manager** | `orders@mojicart.com` | `password123` | `/admin/orders` |
| **🏪 Vendor 1 (Ethnic Wear)** | `seller1@desivogue.in` | `password123` | `/seller` |
| **🏪 Vendor 2 (Electronics)** | `seller2@bharatelec.in` | `password123` | `/seller` |
| **🏪 Vendor 3 (Home Decor)** | `seller3@gharshringar.in` | `password123` | `/seller` |
| **🛍️ Customer 1 (Priya)** | `priya@gmail.com` | `password123` | Storefront & `/account/orders` |
| **🛍️ Customer 2 (Rahul)** | `rahul@gmail.com` | `password123` | Storefront & `/account/orders` |

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment
Copy `.env.example` to `.env`:
\`\`\`bash
cp .env.example .env
\`\`\`

### 3. Initialize & Seed Database
\`\`\`bash
# Push schema to SQLite database (or Postgres)
npm run db:push

# Seed with rich Indian multi-vendor demo data
npm run db:seed
\`\`\`

### 4. Run Automated Test Suite
\`\`\`bash
npm test
\`\`\`

### 5. Launch Development Server
\`\`\`bash
npm run dev
\`\`\`
Visit `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

---

## 🐳 Docker Production Deployment

To run the entire marketplace alongside a PostgreSQL database:
\`\`\`bash
docker-compose up -d --build
\`\`\`

---

## 🛡️ Automated Tests & Security Verification

All critical business rules have automated test coverage (`tests/marketplace.test.mjs`):
1. **Price & Discount**: Validates MRP vs selling price calculations.
2. **Multi-Vendor Commission**: Validates marketplace percentage deductions and seller net payout.
3. **Coupon Engine**: Validates percentage discounts with maximum caps and minimum order value thresholds.
4. **Order State Machine**: Enforces valid status transitions and rejects illegal backwards transitions.
5. **Inventory Concurrency**: Tests atomic stock deductions on order and automatic stock restorations on cancellation.
6. **RBAC Security**: Enforces Super Admin vs Seller vs Customer permissions.
7. **Free Shipping Tier**: Verifies the ₹499 order threshold rule.
