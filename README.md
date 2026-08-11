# Medifly — Emergency & Subscription Medicine Delivery Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-v5.2.1-blue.svg)](https://expressjs.com/)
[![React Version](https://img.shields.io/badge/react-v19.0.0-61dafb.svg)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/vite-v6.4.2-646cff.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%20Supabase-blue.svg)](https://supabase.com/)
[![Socket.io](https://img.shields.io/badge/socket.io-v4.8.3-black.svg)](https://socket.io/)
[![JWT Auth](https://img.shields.io/badge/auth-JWT%20Bearer-orange.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

> **Medifly** is an enterprise-grade, real-time emergency healthcare delivery & prescription auto-refill platform built with Express v5, React 19, and **PostgreSQL (Supabase)**. Medifly hosts over **254,000+ authentic medicines** and **11,800+ bioequivalent chemical salts**, featuring **30-Minute Ultra-Express Delivery**, GIN trigram indexed SQL search, salt comparison matching, cold-chain handling, automated subscription refills, and role-based access portals (Patient, Pharmacist, Delivery Rider, System Admin).

---

## ⚡ Primary Brand Motto & Delivery Timeframe Architecture

### ⚡ **"Medicines Delivered in 30 Minutes"**
Medifly's primary mission is to deliver emergency healthcare and acute medications to doorstep within **30 Minutes**.

### 📦 Structured Delivery SLA Matrix

| Delivery Tier | Target SLA | Applicable Categories & Features |
| :--- | :--- | :--- |
| ⚡ **30-Min Ultra Express** | **30 Minutes** | Emergency acute care, pain relievers, fever meds, asthma inhalers, allergy relief, first-aid kits |
| 🚀 **1-Hour Priority Standard** | **60 Minutes** | General daily doctor prescriptions & OTC medicines from local licensed partner pharmacies |
| ❄️ **Same-Day Cold Chain** | **2–8°C Insulated** | Temperature-monitored transportation for insulin, vaccines, growth hormones & biological injections |
| 🔄 **Scheduled Auto-Refill** | **Recurring 30 Days** | Automated monthly refills for chronic conditions (BP, diabetes, heart care) delivered 3 days before stock ends |

---

## 🔑 Quick Links & Role Credentials

- **GitHub Repository**: [https://github.com/em-srs/Medifly](https://github.com/em-srs/Medifly)
- **API Documentation**: [Exhaustive API Reference](#exhaustive-api-reference--calling-guide)

### Demo Portal Credentials & 1-Click Role Presets

Navigate to `/login` and click **⚡ Demo Roles** for instant 1-click portal testing:

| Portal / Role | Email Address | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Patient (`user`)** | `user@medifly.com` | `user123` | Search 254k+ meds, Cart, 30-Min Checkout, Rx Upload, Orders, Auto-Refill |
| **Pharmacist (`pharmacy`)** | `pharma@medifly.com` | `pharma123` | Pharmacy Workstation, Prescription Verification, Inventory Stock Management |
| **Fleet Rider (`rider`)** | `rider@medifly.com` | `rider123` | Fleet Dispatch Terminal, Live GPS Location Updates, Order Delivery Updates |
| **System Admin (`admin`)** | `admin@medifly.com` | `admin123` | Admin Command Center, Live PostgreSQL Revenue Analytics, Low-Stock Alerts |

---

## Key Features & Platform Highlights

### 1. 254,000+ Medicine Dataset & PostgreSQL Engine
- **Enterprise Dataset**: Pre-seeded with **254,023 authentic medicines** and **11,850 chemical salt compositions**.
- **PostgreSQL GIN Trigram Indexing (`pg_trgm`)**: Sub-millisecond indexed SQL search across brand names, generic compositions, and manufacturers.
- **Fast Estimated Count Caching**: Instant response time (< 100ms) for high-scale pagination.

### 2. Multi-Role Portal Engine (RBAC)
- **Patient Workspace**: Interactive 30-min express medicine browser, hero live search widget, salt comparison tool, prescription vault, order tracker, and auto-refill subscriptions.
- **Pharmacist Workstation**: Prescription document review terminal (`PENDING` -> `VERIFIED` / `REJECTED`) and stock management.
- **Fleet Rider Terminal**: Real-time dispatch interface to update live GPS coordinates (`lat`/`lng`) and switch availability.
- **Admin Command Center**: Real-time PostgreSQL database analytics summarizing total revenue, total orders, active users, and low-stock alerts.

### 3. Salt Comparison & Generic Alternative Engine
- **Bioequivalent Matching**: Queries the `salts` and `medicines` relational SQL tables to locate medicines sharing identical active chemical compositions.
- **Cost Savings Sorting**: Presents generic alternatives sorted by price ascending, enabling users to save up to 70% on medication costs.

### 4. Dynamic Multi-Tier Pricing Engine
- Calculates items subtotal, 5% Goods and Services Tax (GST), platform fee, delivery fee, cold-chain handling fee, emergency surcharge, and late-night surcharge.
- **Subscription Discounts**: Platform fee reduced to ₹2.00, cold-chain fee discounted, late-night fees waived for active subscribers.

### 5. Real-Time WebSockets (`Socket.io`)
- `priceChanged`: Broadcasts instant price updates when medicine prices change.
- `inventoryChanged`: Pushes real-time stock availability when orders are placed.
- `orderStatusChanged`: Delivers live status updates (`pending` -> `verified` -> `assigned` -> `picked_up` -> `delivered`).
- `riderLocationUpdated`: Streams live rider GPS coordinates directly to the customer map tracker.

---

## Architecture & System Flow

### System Layer Architecture (Text Diagram)

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 19 Single Page Application (Vite 6) + React Router v7 + Lucide React Icons |
|  Context Providers: AuthContext (JWT/Role) | CartContext | SocketContext (WS)     |
+-----------------------------------------------------------------------------------+
                                         |
                                HTTP / REST & WebSockets
                                         |
+-----------------------------------------------------------------------------------+
|                                 SERVER TIER                                       |
|  Node.js + Express v5 Web Application Server                                      |
|  Middlewares: Auth Middleware (JWT Protect) | Role Middleware (RBAC Guard)        |
|  Controllers: Auth, Medicine, Order, Prescription, Pharmacy, Rider, Subscription, Admin |
|  Services: PricingService | CronService | RiderAssignmentService | SaltComparison  |
|  Socket.io Engine: Real-Time Event Dispatcher & Room Management                   |
+-----------------------------------------------------------------------------------+
                                         |
                                node-postgres (pg Pool Driver)
                                         |
+-----------------------------------------------------------------------------------+
|                                DATABASE TIER                                      |
|  PostgreSQL Database (Supabase Cloud / Local)                                     |
|  Tables: users, medicines, salts, orders, order_items, prescriptions,             |
|          pharmacies, riders, subscriptions, subscription_items                    |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Local Setup & Installation

### 1️⃣ Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Git**
- **PostgreSQL Database** (Supabase Cloud or Local PostgreSQL)

### 2️⃣ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/em-srs/Medifly.git
cd Medifly

# Install all root, backend, and frontend dependencies
npm run install:all
```

### 3️⃣ Configure Environment Variables

Create `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres.ehdyoeznrfzbrsclpdpo:sql%40srs%40123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
PGHOST=aws-0-ap-northeast-1.pooler.supabase.com
PGUSER=postgres.ehdyoeznrfzbrsclpdpo
PGPASSWORD=sql@srs@123
PGDATABASE=postgres
PGPORT=6543
PGSSL=true
JWT_SECRET=supersecretjwtkey_for_medifly
JWT_EXPIRES_IN=7d
```

Create `frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:5000
```

### 4️⃣ Run the Application

From the root directory, start both backend and frontend concurrently:

```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://127.0.0.1:5000`

---

## Exhaustive API Reference & Calling Guide

### Endpoints Summary Table

| Category | Method | URL Path | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | All | Register a new user account |
| **Auth** | `POST` | `/api/auth/login` | Public | All | Authenticate user & return JWT token |
| **Auth** | `GET` | `/api/auth/profile` | Private | All Logged In | Get current user profile |
| **Medicines** | `GET` | `/api/medicines` | Public | All | Search 254k+ meds with keyword, category, page & sort |
| **Medicines** | `GET` | `/api/medicines/:id` | Public | All | Fetch single medicine details |
| **Medicines** | `GET` | `/api/medicines/salt-comparison/:id` | Public | All | Compare bioequivalent salts & generic alternatives |
| **Medicines** | `PUT` | `/api/medicines/:id/price` | Private | Admin / Pharmacy | Update medicine price & trigger WS broadcast |
| **Orders** | `POST` | `/api/orders` | Private | `user` | Create order with stock/Rx checks & rider assignment |
| **Orders** | `GET` | `/api/orders/myorders` | Private | `user` | Fetch user's order history |
| **Prescriptions**| `POST` | `/api/prescriptions` | Private | `user` | Upload prescription document |
| **Prescriptions**| `PUT` | `/api/prescriptions/:id/verify` | Private | `pharmacy`, `admin` | Verify/reject prescription |
| **Subscriptions**| `POST` | `/api/subscriptions` | Private | `user` | Create 30-day auto-refill schedule |
| **Pharmacy** | `GET` | `/api/pharmacy/dashboard` | Private | `pharmacy`, `admin` | Get pharmacy store workstation metrics |
| **Riders** | `PUT` | `/api/riders/location` | Private | `rider` | Update live rider GPS location |
| **Admin** | `GET` | `/api/admin/dashboard` | Private | `admin` | Get PostgreSQL platform analytics & low-stock alerts |

---

## License

This project is licensed under the ISC License.
