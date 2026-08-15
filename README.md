# 🚀 Medifly

**Enterprise-Grade Emergency Healthcare Delivery & Automated Prescription Refill Platform**

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-v5.2.1-blue.svg)](https://expressjs.com/)
[![React Version](https://img.shields.io/badge/react-v19.0.0-61dafb.svg)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/vite-v6.2.0-646cff.svg)](https://vitejs.dev/)
[![Clerk Auth](https://img.shields.io/badge/auth-Clerk%20SSO%20%26%20Multi--Tenancy-6C47FF.svg)](https://clerk.com/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%20Supabase-blue.svg)](https://supabase.com/)
[![Socket.io](https://img.shields.io/badge/socket.io-v4.8.3-black.svg)](https://socket.io/)
[![Isolation Test](https://img.shields.io/badge/account%20isolation-100%25%20passed-success.svg)](backend/scripts/testCrossAccountIsolation.js)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

> **Medifly** is an enterprise-grade, real-time emergency healthcare delivery & prescription auto-refill platform built on Node.js **Express v5**, **React 19**, **Vite 6**, **Clerk Authentication & Multi-Tenancy**, and **PostgreSQL (Supabase Cloud)**. Medifly hosts over **254,023 authentic medicines** and **11,850 bioequivalent chemical salts**, featuring **30-Minute Ultra-Express Delivery**, `pg_trgm` GIN trigram indexed SQL search, a bioequivalent salt comparison engine (saving up to 70% on generics), cold-chain insulated logistics, automated subscription refills (`node-cron`), a family prescription vault with 10-minute signed file URLs, and role-based access portals for Patients, Pharmacists, Delivery Riders, and System Administrators.

---

## 🌐 Live Demo & Credentials

- **Live Backend API**: [https://medifly-api.onrender.com](https://medifly-api.onrender.com)
- **API Health Check**: `GET https://medifly-api.onrender.com/health`
- **GitHub Repository**: [https://github.com/em-srs/Medifly](https://github.com/em-srs/Medifly)

### Demo Credentials & Portal Roles

| Portal / Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Regular Patient (`user`)** | `user@medifly.com` | `user123` | Search 254k+ meds, Cart, 30-Min Express SLA, Family Vault, Orders, Auto-Refill |
| **Pharmacist (`pharmacy`)** | `pharma@medifly.com` | `pharma123` | Pharmacy Workstation, Prescription Document Review (`VERIFIED`/`REJECTED`), Inventory Updates |
| **Fleet Rider (`rider`)** | `rider@medifly.com` | `rider123` | Fleet Dispatch Terminal, Live GPS Location Updates (`lat`/`lng`), Active Order Deliveries |
| **System Admin (`admin`)** | `admin@medifly.com` | `admin123` | Admin Command Center, PostgreSQL Revenue Analytics, System Overrides, Low-Stock Alerts |
| **Super Admin (`super_admin`)** | `superadmin@medifly.com`| `superadmin123`| Full System Governance, Executive Dashboard, Super Admin Management (SQL Isolated) |

---

## ✨ Key Features

### 👤 Patient Portal (`user`)
- **254k+ Medicine Dataset**: Sub-millisecond SQL search using `pg_trgm` GIN trigram indexing across brand names, generic formulas, and manufacturers.
- **Salt Comparison Engine**: Bioequivalent chemical matching (`compareSalts`) displaying generic alternatives sorted ascending by price (up to 70% cheaper).
- **30-Minute Ultra-Express SLA**: Dynamic multi-tier pricing (`PricingService`) calculating GST, platform fee, cold-chain handling, emergency surcharges, and late-night waivers.
- **Prescription Vault**: Multi-profile family records (`Self`, `Spouse`, `Child`, `Parent`), signed 10-minute file URLs, and server-side ownership security (`account_owner_id`).
- **Auto-Refill Subscriptions**: Scheduled recurring deliveries (`WEEKLY`, `BIWEEKLY`, `MONTHLY`) executed via daily background cron runner (`CronService`).

### 🩺 Pharmacist Workstation (`pharmacy`)
- **Prescription Document Verification**: Review terminal to inspect patient uploads and update prescription status (`PENDING` -> `VERIFIED` or `REJECTED`) with reviewer notes.
- **Inventory & Stock Management**: Modify medicine prices and inventory stock counts with instant WebSockets broadcast (`priceChanged`, `inventoryChanged`).

### 🛵 Fleet Rider Terminal (`rider`)
- **Live Dispatch Terminal**: Fetch assigned delivery orders (`GET /api/riders/deliveries`) and toggle availability status (`OFFLINE` -> `ONLINE` -> `ON_DELIVERY`).
- **Real-Time GPS Tracking**: Stream live latitude/longitude coordinates (`PUT /api/riders/location`) directly to patient tracking screens via WebSockets.

### 🛡️ Admin Command Center (`admin` & `super_admin`)
- **Real-Time PostgreSQL Analytics**: Aggregate statistics for total revenue, total orders, active user count, and automated low-stock warnings (`inventory_count < 10`).
- **SQL-Level Role Isolation**: `admin` accounts query system users via SQL filters excluding `super_admin` records (`WHERE role != 'super_admin'`) to enforce governance hierarchy.

---

## 🏛️ Architecture & System Diagrams

### 1. High-Level Architecture

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 19 SPA (Vite 6) + React Router v7 + Clerk SSO (@clerk/react) + Lucide      |
|  Context Providers: AuthContext | CartContext | SocketContext (socket.io-client) |
+-----------------------------------------------------------------------------------+
                                         |
                            HTTP REST API & WebSockets
                                         |
+-----------------------------------------------------------------------------------+
|                             API GATEWAY & SERVER TIER                             |
|  Node.js + Express v5 Web Application Server                                      |
|  Middlewares: authMiddleware (Clerk/JWT Protect) | roleMiddleware (RBAC Guard)    |
|  Services: PricingService | CronService | RiderAssignment | StorageService        |
|  WebSockets Engine: Socket.io Event Dispatcher & Room Manager                     |
+-----------------------------------------------------------------------------------+
                                         |
                                Database Queries & Storage
                                         |
+-----------------------------------------------------------------------------------+
|                            DATABASE & STORAGE TIER                                |
|  PostgreSQL Database on Supabase Cloud (pg Pool, 254k+ Meds, GIN Trigram Index)  |
|  Supabase Storage (Private 'prescriptions' Bucket + 10-Min Signed File URLs)     |
+-----------------------------------------------------------------------------------+
```

```mermaid
graph TB
    subgraph "Client Tier (Browser SPA)"
        UI["React 19 SPA (Vite 6)"]
        AC["AuthContext (Clerk SSO + JWT)"]
        CC["CartContext (State & Items)"]
        SC["SocketContext (WebSocket Client)"]
    end

    subgraph "API Gateway & Server Tier"
        EX["Express.js v5 Web Server"]
        CORS["CORS & Body Parser Middleware"]
        MW_A["authMiddleware (Protect Guard)"]
        MW_R["roleMiddleware (Authorize Guard)"]
        
        subgraph "Business Services Layer"
            PS["PricingService"]
            CS["CronService (Node-Cron)"]
            RAS["RiderAssignmentService"]
            SCS["SaltComparisonService"]
            SS["StorageService (Supabase Storage)"]
        end
        
        SIO["Socket.io Real-Time Engine"]
    end

    subgraph "Database & Storage Tier"
        DB[("PostgreSQL Database (Supabase Cloud)")]
        ST[("Supabase Storage ('prescriptions' Private Bucket)")]
    end

    UI -->|"HTTP / REST API Requests"| CORS
    UI <-->|"WebSocket Events (socket.io-client)"| SIO
    CORS --> EX
    EX --> MW_A
    MW_A --> MW_R
    MW_R --> PS
    MW_R --> CS
    MW_R --> RAS
    MW_R --> SCS
    MW_R --> SS
    PS --> DB
    CS --> DB
    RAS --> DB
    SCS --> DB
    SS --> ST
    EX --> SIO
```

---

### 2. System Data Flow Diagram

```mermaid
graph TD
    A["User Action (Checkout / Upload / Status Update)"] --> B["Frontend Context State (AuthContext & CartContext)"]
    B --> C["API Request (Authorization: Bearer <token> & x-clerk-id)"]
    C --> D["Express.js Middleware Parser"]
    D --> E{"Protect Guard (authMiddleware)"}
    E -- "Missing / Invalid Token" --> F["HTTP 401 Unauthorized Response"]
    E -- "Valid Identity Token" --> G{"Role Guard (roleMiddleware)"}
    G -- "Role Mismatch" --> H["HTTP 403 Forbidden Response"]
    G -- "Authorized Role" --> I["Controller Handler Execution"]
    I --> J["Business Services (PricingService / StorageService)"]
    J --> K["pg Connection Pool & Supabase Client"]
    K --> L["PostgreSQL Transaction (SQL Execution & Commit)"]
    L --> K
    K --> M["Socket.io Event Broadcast (priceChanged, orderStatusChanged)"]
    M --> N["HTTP 200/201 JSON Success Response"]
```

---

### 3. User Flow & Journey Flowchart

```mermaid
flowchart TD
    Start(["User Enters Medifly Platform"]) --> Choice{"Is User Authenticated?"}
    
    Choice -- "Guest User" --> GuestFlow["Browse 254k+ Medicines & Compare Salts"]
    GuestFlow --> LoginReq["Prompt Clerk SSO Login / Sign Up"]
    LoginReq --> ClerkAuth["Clerk SSO Authentication"]
    ClerkAuth --> DBCheck{"User Record Exists in PostgreSQL?"}
    DBCheck -- "No" --> AutoSync["Auto-Insert User (Role: 'user', Phone: NULL)"]
    DBCheck -- "Yes" --> OnboardCheck{"Is Required Phone Present?"}
    AutoSync --> OnboardCheck
    
    OnboardCheck -- "Missing Phone" --> OnboardPage["Redirect to /onboarding (Collect Phone & Address)"]
    OnboardPage --> RoleCheck{"Check User Role in DB"}
    OnboardCheck -- "Phone Present" --> RoleCheck
    Choice -- "Authenticated" --> OnboardCheck

    RoleCheck -- "Role: user" --> PatientFlow["Patient Journey"]
    PatientFlow --> SearchMed["Search Medicines (GIN Trigram Index)"]
    SearchMed --> AddCart["Add Items to Cart"]
    AddCart --> RxCheck{"Requires Prescription?"}
    RxCheck -- "Yes" --> UploadRx["Upload Prescription Document to Vault"]
    UploadRx --> WaitVerify["Wait for Pharmacist Verification"]
    WaitVerify --> PlaceOrder["Checkout & Place Order (30-Min SLA)"]
    RxCheck -- "No" --> PlaceOrder
    PlaceOrder --> TrackOrder["Real-Time Order & Rider GPS Tracking"]

    RoleCheck -- "Role: pharmacy" --> PharmaFlow["Pharmacist Workstation"]
    PharmaFlow --> ReviewRx["Review Uploaded Prescriptions"]
    ReviewRx --> ApproveRx["PATCH /api/vault/prescriptions/{id} (VERIFIED / REJECTED)"]
    ApproveRx --> StockManage["Update Medicine Inventory Stock"]

    RoleCheck -- "Role: rider" --> RiderFlow["Rider Dispatch Terminal"]
    RiderFlow --> ToggleStatus["Set Status to ONLINE"]
    ToggleStatus --> ReceiveOrder["GET /api/riders/deliveries (Assigned Orders)"]
    ReceiveOrder --> UpdateGPS["PUT /api/riders/location (Live GPS lat/lng)"]
    UpdateGPS --> CompleteDelivery["Mark Order Delivered"]

    RoleCheck -- "Role: admin / super_admin" --> AdminFlow["Admin Command Center"]
    AdminFlow --> ViewStats["GET /api/admin/dashboard (Revenue & Orders)"]
    ViewStats --> MonitorStock["Monitor Low Stock Alerts"]
    AdminFlow --> ManageUsers["GET /api/admin/users (SQL Isolated Role View)"]
```

---

### 4. JWT Authentication & RBAC Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Client as "React Client SPA (@clerk/react)"
    participant AuthMW as "authMiddleware (Express)"
    participant RoleMW as "roleMiddleware (RBAC Guard)"
    participant Controller as "Express Controller"
    participant DB as "PostgreSQL (Supabase Cloud)"

    Note over Client, DB: Phase 1: SSO Authentication & Identity Verification
    Client->>Client: User logs in via Clerk <SignIn /> / <SignUp /> widget
    Client->>Client: Obtain Clerk User ID & Session JWT Token

    Note over Client, DB: Phase 2: Protected Request & RBAC Verification
    Client->>AuthMW: GET /api/admin/dashboard (Headers: Bearer <token>, x-clerk-id: <clerk_id>)
    AuthMW->>AuthMW: Decode token or parse x-clerk-id / x-user-email headers
    AuthMW->>DB: SELECT * FROM users WHERE clerk_id = $1 OR email = $2 OR id = $3
    
    alt User record found
        DB-->>AuthMW: User record (id, email, role: 'admin')
    else User record missing
        AuthMW->>DB: INSERT INTO users (name, email, role, clerk_id) VALUES (...)
        DB-->>AuthMW: Newly created user record
    end

    AuthMW->>AuthMW: Attach user object to req.user
    AuthMW->>RoleMW: Pass to roleMiddleware authorize('admin', 'super_admin')
    
    alt User role matches allowed roles
        RoleMW->>Controller: Pass control to Controller Handler
        Controller->>DB: SELECT aggregate dashboard statistics
        DB-->>Controller: Return stats rows
        Controller-->>Client: HTTP 200 OK JSON Dashboard Data
    else User role unauthorized
        RoleMW-->>Client: HTTP 403 Forbidden { message: "Not authorized — admin access required" }
    end
```

---

## 📂 Project Structure

```
medifly-mern/
├── backend/
│   ├── config/             # PostgreSQL Pool setup & table auto-init (db.js)
│   ├── controllers/        # Express controllers (auth, medicine, order, vault, etc.)
│   ├── middleware/         # authMiddleware (Clerk/JWT) & roleMiddleware (RBAC)
│   ├── models/             # Schema structures & references
│   ├── routes/             # Express API route modules
│   ├── services/           # PricingService, CronService, RiderAssignment, StorageService
│   ├── scripts/            # Database verification & test scripts (verifyDb.js, testCrossAccountIsolation.js)
│   ├── socket.js           # Socket.io real-time event engine
│   └── server.js           # Express app setup & server entry point
├── frontend/
│   ├── public/             # Static web assets & icons
│   └── src/
│       ├── components/     # Header, Footer, CartSidebar, MedicineCard, ProtectedRoute
│       ├── context/        # AuthContext, CartContext, SocketContext
│       ├── pages/          # HomePage, MedicinesPage, PrescriptionsPage, ProfilePage,
│       │                   # AdminPage, PharmacyPage, RiderPage, SaltComparePage,
│       │                   # SubscriptionPage, OnboardingPage, AboutPage, CheckoutPage
│       ├── utils/          # getMedicineImage visual resolver & formatting helpers
│       ├── App.jsx         # React Router v7 layout & route mappings
│       └── main.jsx        # ClerkProvider & root mounting
├── notes.md                # Technical interview preparation & revision guide
└── README.md               # Production documentation & project reference
```

---

## 🗄️ Database Schema & Design Decisions

### PostgreSQL Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ PRESCRIPTIONS : "uploads"
    USERS ||--o{ SUBSCRIPTIONS : "subscribes"
    USERS ||--o{ FAMILY_MEMBERS : "owns"
    USERS ||--o| PHARMACIES : "operates"
    USERS ||--o| RIDERS : "drives"

    SALTS ||--o{ MEDICINES : "composes"
    MEDICINES ||--o{ ORDER_ITEMS : "contained_in"
    ORDERS ||--|{ ORDER_ITEMS : "includes"
    MEDICINES ||--o{ SUBSCRIPTION_ITEMS : "included_in"
    SUBSCRIPTIONS ||--|{ SUBSCRIPTION_ITEMS : "contains"
    FAMILY_MEMBERS ||--o{ PRESCRIPTIONS : "belongs_to"
    FAMILY_MEMBERS ||--o{ ORDERS : "for_member"
    PRESCRIPTIONS ||--o{ ORDERS : "authorizes"

    USERS {
        INTEGER id PK "Primary Key"
        VARCHAR name "Full User Name"
        VARCHAR email UK "Unique Email Address"
        VARCHAR password "Hashed Password / Clerk SSO Token"
        VARCHAR phone "Optional 10-digit Phone Number"
        VARCHAR clerk_id UK "Unique Clerk SSO Identifier"
        VARCHAR role "user, pharmacy, rider, admin, super_admin"
        BOOLEAN is_subscribed "Subscription Flag"
        VARCHAR subscription_plan "none, monthly, yearly"
        TIMESTAMP created_at "Account Creation Timestamp"
    }

    SALTS {
        INTEGER id PK "Primary Key"
        VARCHAR salt_name UK "Unique Chemical Salt Name"
        TEXT description "Salt Description"
        TEXT_ARRAY medical_uses "Array of Medical Uses"
        TEXT_ARRAY common_side_effects "Array of Side Effects"
        TEXT precautions "Precautions & Warnings"
    }

    MEDICINES {
        INTEGER id PK "Primary Key"
        VARCHAR medicine_id UK "Unique SKU/Item Identifier"
        VARCHAR brand_name "Brand Name"
        VARCHAR generic_name "Generic Formula Name"
        INTEGER salt_id FK "References salts(id)"
        VARCHAR category "Medicine Category"
        VARCHAR dosage_form "Tablet, Capsule, Injection, etc."
        VARCHAR strength "Dosage Strength"
        VARCHAR manufacturer "Manufacturer Name"
        VARCHAR schedule_type "OTC, H, H1"
        BOOLEAN requires_prescription "Prescription Required Flag"
        BOOLEAN cold_chain_required "Cold Storage Logistics Flag"
        VARCHAR pack_size "Package Units"
        NUMERIC price "Price in INR"
        BOOLEAN stock "In Stock Flag"
        INTEGER inventory_count "Current Stock Units"
    }

    ORDERS {
        INTEGER id PK "Primary Key"
        INTEGER user_id FK "References users(id)"
        INTEGER rider_id FK "References users(id)"
        INTEGER family_member_id FK "References family_members(id)"
        INTEGER prescription_id FK "References prescriptions(id)"
        VARCHAR payment_method "Razorpay, Cash"
        JSONB payment_result "Payment Gateway Payload"
        NUMERIC items_price "Items Subtotal"
        NUMERIC tax_price "5% GST Amount"
        NUMERIC platform_fee "Platform Service Fee"
        NUMERIC delivery_fee "30-Min Delivery SLA Fee"
        NUMERIC cold_chain_fee "Cold Logistics Fee"
        NUMERIC emergency_fee "Emergency Surcharge"
        NUMERIC late_night_fee "Late Night Delivery Fee"
        NUMERIC total_price "Grand Total Price"
        BOOLEAN is_paid "Payment Status Flag"
        TIMESTAMP paid_at "Payment Timestamp"
        BOOLEAN is_delivered "Delivery Status Flag"
        TIMESTAMP delivered_at "Delivery Timestamp"
        VARCHAR status "pending, verified, assigned, picked_up, delivered"
        JSONB shipping_address "Shipping Address JSON"
        TIMESTAMP created_at "Order Creation Timestamp"
    }

    ORDER_ITEMS {
        INTEGER id PK "Primary Key"
        INTEGER order_id FK "References orders(id)"
        INTEGER medicine_id FK "References medicines(id)"
        VARCHAR name "Snapshot Brand Name"
        INTEGER qty "Purchased Quantity"
        VARCHAR image "Product Image Asset URL"
        NUMERIC price "Snapshot Unit Price"
    }

    FAMILY_MEMBERS {
        INTEGER id PK "Primary Key"
        INTEGER account_owner_id FK "References users(id)"
        VARCHAR name "Member Full Name"
        VARCHAR relation "Self, Spouse, Child, Parent, Sibling"
        VARCHAR dob "Date of Birth"
        VARCHAR blood_group "Blood Group"
        TIMESTAMP created_at "Member Created Timestamp"
    }

    PRESCRIPTIONS {
        INTEGER id PK "Primary Key"
        INTEGER user_id FK "References users(id)"
        INTEGER family_member_id FK "References family_members(id)"
        INTEGER uploaded_by_user_id FK "References users(id)"
        INTEGER pharmacist_id FK "References users(id)"
        VARCHAR title "Prescription Document Title"
        VARCHAR doctor_name "Doctor Name"
        VARCHAR specialty_hospital "Hospital / Clinic"
        TEXT file_url "Private Bucket File Path"
        VARCHAR file_type "MIME Type (PDF/PNG/JPG)"
        BIGINT file_size_bytes "File Size in Bytes"
        VARCHAR status "PENDING, VERIFIED, REJECTED"
        TEXT reviewer_notes "Pharmacist Reviewer Notes"
        TIMESTAMP verified_at "Verification Timestamp"
        TIMESTAMP created_at "Uploaded Timestamp"
    }

    PHARMACIES {
        INTEGER id PK "Primary Key"
        INTEGER user_id FK "References users(id)"
        VARCHAR name "Pharmacy Store Name"
        VARCHAR license_number UK "Drug License Number"
        VARCHAR street "Street Address"
        VARCHAR city "City"
        VARCHAR state "State"
        VARCHAR zip_code "Postal Code"
        DOUBLE_PRECISION lat "Latitude Coordinates"
        DOUBLE_PRECISION lng "Longitude Coordinates"
        VARCHAR status "PENDING, VERIFIED, BANNED"
    }

    RIDERS {
        INTEGER id PK "Primary Key"
        INTEGER user_id FK "References users(id)"
        VARCHAR vehicle_make "Vehicle Make"
        VARCHAR vehicle_model "Vehicle Model"
        VARCHAR vehicle_reg_number "Registration Number"
        DOUBLE_PRECISION lat "Live Latitude"
        DOUBLE_PRECISION lng "Live Longitude"
        BOOLEAN is_available "Rider Availability Flag"
        VARCHAR status "OFFLINE, ONLINE, ON_DELIVERY"
        INTEGER active_order_id FK "References orders(id)"
        NUMERIC rating "Average Rating"
    }

    SUBSCRIPTIONS {
        INTEGER id PK "Primary Key"
        INTEGER user_id FK "References users(id)"
        VARCHAR frequency "WEEKLY, BIWEEKLY, MONTHLY"
        TIMESTAMP next_delivery_date "Scheduled Next Refill Date"
        VARCHAR status "ACTIVE, PAUSED, CANCELLED"
        TEXT delivery_address "Default Delivery Address"
    }

    SUBSCRIPTION_ITEMS {
        INTEGER id PK "Primary Key"
        INTEGER subscription_id FK "References subscriptions(id)"
        INTEGER medicine_id FK "References medicines(id)"
        INTEGER quantity "Refill Units Quantity"
    }

    SUPPORT_REQUESTS {
        INTEGER id PK "Primary Key"
        VARCHAR name "Sender Name"
        VARCHAR email "Sender Email"
        VARCHAR category "Support Category"
        TEXT message "Inquiry Message"
        VARCHAR status "PENDING, RESOLVED"
    }
```

### Key Database Design Decisions
1. **Price Snapshotting in `order_items.price`**: Prices change over time. When an order is placed, unit price is snapshotted into `order_items`, ensuring historical financial auditing accuracy regardless of future catalog price edits.
2. **Salt Composition Normalization**: Brand-name medicines (`medicines`) reference `salts.id` via foreign key. This allows rapid bioequivalent queries (`compareSalts`) sorted ascending by price.
3. **Phone Constraint Relaxation**: Executed `ALTER TABLE users ALTER COLUMN phone DROP NOT NULL` to support seamless Clerk SSO onboarding before phone number collection.
4. **SQL-Level Role Isolation**: `GET /api/admin/users` filters out `super_admin` rows (`WHERE role != 'super_admin'`) when queried by a standard `admin`, enforcing administrative hierarchy at the database query level.

---

## 📡 API Reference

### API Summary Matrix

| Endpoint | Method | Protected? | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | No | Public | Authenticate user credentials & return JWT |
| `/api/users/me` | `GET` | Yes | All Authenticated | Fetch current logged-in PostgreSQL profile |
| `/api/users/me` | `PUT` | Yes | All Authenticated | Update user profile (Name, Phone, Address) |
| `/api/medicines` | `GET` | No | Public | Search 254k+ medicines with GIN trigram index |
| `/api/medicines/:id` | `GET` | No | Public | Fetch single medicine details |
| `/api/medicines/salt-comparison/:id`| `GET` | No | Public | Compare bioequivalent generic alternatives |
| `/api/orders` | `POST` | Yes | `user` | Create order & calculate SLA delivery pricing |
| `/api/orders/myorders` | `GET` | Yes | `user` | List user order history |
| `/api/vault/members` | `GET` | Yes | `user` | List family member profiles |
| `/api/vault/members/:id/prescriptions`| `POST`| Yes | `user` | Upload prescription file to Supabase |
| `/api/vault/prescriptions/:id/file` | `GET` | Yes | `user`, `pharmacy`, `admin` | Stream 10-minute temporary signed file URL |
| `/api/prescriptions/:id/verify` | `PUT` | Yes | `pharmacy`, `admin` | Verify prescription document status |
| `/api/subscriptions` | `POST` | Yes | `user` | Create automated recurring refill plan |
| `/api/riders/location` | `PUT` | Yes | `rider` | Update live rider GPS coordinates |
| `/api/admin/dashboard` | `GET` | Yes | `admin`, `super_admin` | Platform analytics & revenue dashboard |

---

### Detailed Endpoint Specifications

#### `POST /api/orders` (Create Order & Apply SLA Pricing)
- **Headers**: `Authorization: Bearer <token>`
- **Request Payload**:
```json
{
  "orderItems": [
    { "medicineId": 102, "qty": 2, "name": "Telma 40 Tablet", "price": 85.50 }
  ],
  "shippingAddress": {
    "street": "123 Healthcare Way",
    "city": "Bengaluru",
    "state": "Karnataka",
    "zipCode": "560001"
  },
  "paymentMethod": "Razorpay",
  "prescriptionId": 14,
  "isEmergency": true
}
```
- **Response (`201 Created`)**:
```json
{
  "id": 801,
  "user_id": 1,
  "items_price": 171.00,
  "tax_price": 8.55,
  "platform_fee": 2.00,
  "delivery_fee": 30.00,
  "cold_chain_fee": 0.00,
  "emergency_fee": 25.00,
  "late_night_fee": 0.00,
  "total_price": 236.55,
  "status": "pending",
  "is_paid": false,
  "created_at": "2026-08-16T00:00:00.000Z"
}
```
- **Implemented Error Responses**:
  - `401 Unauthorized`: `{ "message": "Not authorized, no token available" }`
  - `400 Bad Request`: `{ "message": "No order items provided" }`
  - `500 Server Error`: `{ "message": "Failed to create order", "error": "..." }`

---

## 🛠️ Installation & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL Database**: Local PostgreSQL or Supabase Cloud credentials

### 1. Installation
```bash
git clone https://github.com/em-srs/Medifly.git
cd Medifly

# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Environment Variables Configuration

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
PGSSL=true
JWT_SECRET=medifly_secret_key_2026
SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
SUPABASE_KEY=[YOUR_SUPABASE_SERVICE_KEY]
```

Create `frontend/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_[YOUR_CLERK_KEY]
VITE_API_URL=http://localhost:5000
```

### 3. Launch Application
```bash
# Start backend (Port 5000) and Vite frontend (Port 5173) concurrently
npm run dev
```

---

## 🧪 Testing & Verification

Automated backend verification scripts validate database health, storage upload, and account data isolation:

```bash
# Run database schema & record count check (254k+ meds, 11k+ salts)
node backend/scripts/verifyDb.js

# Run 100% Cross-Account Data Isolation Test (5/5 checks passed)
node backend/scripts/testCrossAccountIsolation.js

# Run Vault & Signed URL End-to-End Verification (6/6 checks passed)
node backend/scripts/testVaultEndToEnd.js
```

### Verified Test Results:
- **`verifyDb.js`**: Verified 254,023 authentic medicines and 11,850 salts across 12 PostgreSQL tables.
- **`testCrossAccountIsolation.js`**: **5/5 checks passed** verifying user accounts cannot access foreign family profiles, orders, or subscriptions.
- **`testVaultEndToEnd.js`**: **6/6 checks passed** verifying private bucket file upload and signed URL generation.

---

## ☁️ Deployment Architecture

| Layer | Provider | Live URL / Config | Key Configuration File |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | Vercel / Netlify | Static Vite Build (`dist/`) | `frontend/package.json` |
| **Backend Server API** | Render | [https://medifly-api.onrender.com](https://medifly-api.onrender.com) | `backend/server.js` |
| **Uptime Monitor** | UptimeRobot | Pings `GET /health` every 5 min | `backend/server.js` |
| **Database Engine** | Supabase Cloud | PostgreSQL 15 Pool (`pg_trgm`) | `backend/config/db.js` |
| **File Vault Storage**| Supabase Storage | Private `prescriptions` Bucket | `backend/services/storageService.js` |

---

## 🤖 AI Usage & Ownership Disclosure

- **Human Direction & Conceptual Ownership (Sunny Kumar / Su)**: Architecture design, tech stack selection (Express v5, React 19, PostgreSQL Supabase, Clerk SSO), UI/UX vision, multi-tier delivery SLA pricing logic, and implementation strategy.
- **Claude (Anthropic) — Planning, Architecture & Strategy**: Requirements analysis, schema normalization strategy, prompt engineering, and architectural refactoring strategy.
- **Antigravity AI Agent — Hands-On In-IDE Execution**: Hands-on code generation, PostgreSQL Supabase pool setup (`backend/config/db.js`), Clerk authentication middleware (`authMiddleware.js`), family vault signed URL streaming (`vaultController.js`), SLA pricing service (`pricingService.js`), auto-refill cron scanner (`cronService.js`), verification test suites, and documentation updates.

```git
Co-authored-by: Antigravity AI <antigravity-agent@noreply.invalid>
Co-authored-by: Claude AI <claude-agent@noreply.invalid>
```

---

## ⚠️ Known Limitations

1. **Simulated Payment Gateway**: Razorpay payment integration currently accepts test gateway payloads (`payment_result`) rather than validating live webhook RSA signatures.
2. **Simulated Cold-Chain Telemetry**: Insulated cold-chain container telemetry currently renders target 2–8°C ranges rather than connecting to physical IoT sensors.
3. **Rider Routing Dispatch**: Dynamic rider dispatch auto-assigns the nearest online rider based on availability status rather than calculating full road network turn-by-turn routing distances.

---

## 📄 Documentation & Deliverables

- **[notes.md](file:///d:/CODINGBRO/medifly%20mern/notes.md)**: Technical Interview Preparation & Revision Guide
- **[db.js](file:///d:/CODINGBRO/medifly%20mern/backend/config/db.js)**: PostgreSQL Schema & Pool Setup
- **[testCrossAccountIsolation.js](file:///d:/CODINGBRO/medifly%20mern/backend/scripts/testCrossAccountIsolation.js)**: Cross-Account Isolation Test Suite

---

## 📜 License

This project is open-source software licensed under the **[ISC License](LICENSE)**.
