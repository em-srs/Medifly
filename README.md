# Medifly — Emergency & Subscription Medicine Delivery Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-v5.2.1-blue.svg)](https://expressjs.com/)
[![React Version](https://img.shields.io/badge/react-v19.0.0-61dafb.svg)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/vite-v6.4.2-646cff.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%20Supabase-blue.svg)](https://supabase.com/)
[![Socket.io](https://img.shields.io/badge/socket.io-v4.8.3-black.svg)](https://socket.io/)
[![JWT Auth](https://img.shields.io/badge/auth-JWT%20Bearer-orange.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

> **Medifly** is an enterprise-grade, real-time emergency healthcare delivery & prescription auto-refill platform built on Node.js Express v5, React 19, and **PostgreSQL (Supabase)**. Medifly hosts over **254,000+ authentic medicines** and **11,800+ bioequivalent chemical salts**, featuring **30-Minute Ultra-Express Delivery**, GIN trigram indexed SQL search, salt comparison matching engine, cold-chain handling, automated subscription refills, and role-based access portals for Patients, Pharmacists, Delivery Riders, and System Administrators.

---

## Quick Links & Demo Credentials

- **GitHub Repository**: [https://github.com/em-srs/Medifly](https://github.com/em-srs/Medifly)
- **API Documentation**: [Exhaustive API Reference](#exhaustive-api-reference--calling-guide)

### Demo Portal Credentials & 1-Click Role Presets

| Portal / Role | Email Address | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Regular Patient (`user`)** | `user@medifly.com` | `user123` | Search 254k+ meds, Cart, 30-Min Express Checkout, Rx Upload, Orders, Auto-Refill |
| **Pharmacist (`pharmacy`)** | `pharma@medifly.com` | `pharma123` | Pharmacy Workstation, Rx Document Verification (`VERIFIED` / `REJECTED`), Inventory Stock Updates |
| **Fleet Rider (`rider`)** | `rider@medifly.com` | `rider123` | Fleet Dispatch Terminal, Live GPS Location Updates (`lat`/`lng`), Active Order Deliveries |
| **System Admin (`admin`)** | `admin@medifly.com` | `admin123` | Admin Command Center, Live PostgreSQL Revenue Analytics, System Overrides, Low-Stock Alerts |

---

## ⚡ Primary Brand Motto & Delivery SLA Architecture

### ⚡ **"Medicines Delivered in 30 Minutes"**
Medifly's primary mission across every page, header, and order dispatch service is **"Medicines Delivered in 30 Minutes"**.

### 📦 Structured Delivery Speed SLA Matrix

| Delivery Tier | Target SLA | Applicable Categories & Features |
| :--- | :--- | :--- |
| ⚡ **30-Min Ultra Express** | **30 Minutes** | Emergency acute care, pain relievers, fever meds, asthma inhalers, allergy relief, first-aid kits |
| 🚀 **1-Hour Priority Standard** | **60 Minutes** | General daily doctor prescriptions & OTC medicines from local licensed partner pharmacies |
| ❄️ **Same-Day Cold Chain** | **2–8°C Insulated** | Temperature-monitored transportation for insulin, vaccines, growth hormones & biological injections |
| 🔄 **Scheduled Auto-Refill** | **Recurring 30 Days** | Automated monthly refills for chronic conditions (BP, diabetes, heart care) delivered 3 days before stock ends |

---

## Key Features & UI Highlights

### 1. 254,000+ Medicine Dataset & PostgreSQL Engine
- **Enterprise Dataset**: Pre-seeded with **254,023 authentic medicines** and **11,850 chemical salt compositions**.
- **PostgreSQL GIN Trigram Indexing (`pg_trgm`)**: Sub-millisecond indexed SQL search across brand names, generic compositions, and manufacturers.
- **Fast Estimated Count Caching**: Instant response time (< 100ms) for high-scale pagination.

### 2. Multi-Role Portal Engine (RBAC)
- **Patient Workspace**: Interactive 30-min express medicine browser, hero live search widget, salt comparison tool, prescription vault, order tracker, and auto-refill subscriptions.
- **Pharmacist Workstation**: Verification terminal to review uploaded prescription documents (`PENDING` -> `VERIFIED` / `REJECTED`) and manage pharmacy inventory stock.
- **Fleet Rider Terminal**: Real-time dispatch interface to update live GPS coordinates (`lat`/`lng`) and switch availability status (`OFFLINE` -> `ONLINE` -> `ON_DELIVERY`).
- **Admin Command Center**: Real-time PostgreSQL database analytics summarizing total revenue, total orders, active user counts, and automated low-stock alerts (`inventoryCount < 10`).

### 3. Salt Comparison & Generic Alternative Engine
- **Bioequivalent Matching**: Queries the `salts` and `medicines` relational SQL tables to locate medicines sharing identical active chemical compositions.
- **Cost Savings Sorting**: Automatically presents generic alternatives sorted by price ascending, enabling users to save up to 70% on medication costs.

### 4. Dynamic Multi-Tier Pricing Engine (`PricingService`)
- Calculates items subtotal, 5% Goods and Services Tax (GST), platform fee, delivery fee, cold-chain handling fee, emergency surcharge, and late-night surcharge.
- **Subscription Discounts**:
  - **Platform Fee**: Reduced from ₹6.00 to ₹2.00 for subscribers.
  - **Cold-Chain Fee**: Discounted from ₹25.00 to ₹15.00 for cold-storage medications.
  - **Emergency Surcharge**: Reduced by 50% from ₹50.00 to ₹25.00.
  - **Late-Night Delivery Fee**: Fully waived (₹0 vs ₹20.00 for non-subscribers between 10 PM and 6 AM).

### 5. Automated Subscription & Refill Engine (`CronService`)
- **Cron Scheduler**: Inspects active subscriptions daily where `nextDeliveryDate <= Today`.
- **Zero-Touch Order Generation**: Automatically instantiates verified orders, applies subscriber perks, decrements inventory stock, and calculates next delivery date based on frequency (`WEEKLY`, `BIWEEKLY`, `MONTHLY`).

### 6. Real-Time WebSockets (`Socket.io`)
- `priceChanged`: Broadcasts instant price updates across all connected clients when a medicine price is updated.
- `inventoryChanged`: Pushes real-time stock availability and inventory counts when orders are placed.
- `orderStatusChanged`: Delivers live status updates (`pending` -> `verified` -> `assigned` -> `picked_up` -> `delivered`) to the user's private WebSocket room.
- `riderLocationUpdated`: Streams live rider GPS coordinates directly to the user awaiting delivery.
- `prescriptionVerified`: Notifies the patient as soon as a pharmacist approves or rejects their prescription.

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
|  Middlewares: Auth Middleware (JWT Protect) | Role Middleware (RBAC Authorization)|
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

### High-Level Architecture Diagram (Mermaid)

```mermaid
graph TB
    subgraph Client Tier
        UI["React 19 Frontend SPA"]
        AC["AuthContext (JWT & Role)"]
        CC["CartContext (State)"]
        SC["SocketContext (WS Client)"]
    end

    subgraph Server Tier
        EX["Express.js v5 Web Server"]
        MW_A["authMiddleware (protect)"]
        MW_R["roleMiddleware (authorize)"]
        
        subgraph Business Services
            PS["PricingService"]
            CS["CronService"]
            RAS["RiderAssignmentService"]
            SCS["SaltComparisonService"]
        end
        
        SIO["Socket.io Server Engine"]
    end

    subgraph Database Tier
        DB[("PostgreSQL Database (Supabase)")]
    end

    UI -->|REST API Requests| EX
    UI <-->|WebSocket Events| SIO
    EX --> MW_A
    MW_A --> MW_R
    MW_R --> PS
    MW_R --> CS
    MW_R --> RAS
    MW_R --> SCS
    PS --> DB
    CS --> DB
    RAS --> DB
    SCS --> DB
    EX --> SIO
```

---

## System Data Flow Diagram

```mermaid
graph TD
    A["HTTP Request / Client Action"] --> B["Frontend State (Auth / Cart Context)"]
    B --> C["API Client (Fetch / HTTP Client)"]
    C --> D["Express.js Server Middleware Stack"]
    D --> E{"JWT Protect Guard (authMiddleware)"}
    E -- "Missing / Invalid Token" --> F["401 Unauthorized Response"]
    E -- "Valid JWT Token" --> G{"RBAC Guard (roleMiddleware)"}
    G -- "Role Mismatch" --> H["403 Forbidden Response"]
    G -- "Authorized Role" --> I["Controller / Business Services"]
    I --> J["PricingService / SaltService / RiderService"]
    J --> K["node-postgres pg Pool Driver"]
    K --> L[("PostgreSQL Database")]
    L --> K
    K --> M["Real-Time Socket.io Event Emission"]
    M --> N["HTTP 200/201 JSON Response to Client"]
```

---

## User Flow & Journey Diagram

```mermaid
flowchart TD
    Start(["User Enters Medifly Platform"]) --> Choice{"Is User Logged In?"}
    
    Choice -- "No (Guest)" --> GuestFlow["Browse Medicine Catalog & Salt Comparison"]
    GuestFlow --> LoginReq["Prompt Login / Register"]
    LoginReq --> AuthPage["POST /api/auth/login or POST /api/auth/register"]
    
    Choice -- "Yes" --> RoleCheck{"Check User Role"}
    AuthPage --> RoleCheck
    
    RoleCheck -- "Role: user" --> UserJourney["Patient Journey"]
    UserJourney --> SearchMed["Search Medicines / Filter Category"]
    SearchMed --> AddCart["Add Items to Cart"]
    AddCart --> RxCheck{"Does Any Item Require Prescription?"}
    RxCheck -- "Yes" --> UploadRx["Upload Prescription Document"]
    UploadRx --> WaitVerify["Wait for Pharmacist Verification"]
    WaitVerify --> PlaceOrder["Place 30-Min Order & Select Payment Method"]
    RxCheck -- "No" --> PlaceOrder
    PlaceOrder --> OrderTrack["Real-Time Order & Live Rider Map Tracker"]

    RoleCheck -- "Role: pharmacy" --> PharmaJourney["Pharmacist Workstation"]
    PharmaJourney --> ReviewRx["Review Uploaded Prescriptions"]
    ReviewRx --> ApproveRx["PUT /api/prescriptions/{id}/verify"]
    ApproveRx --> StockManage["Update Medicine Inventory Stock"]

    RoleCheck -- "Role: rider" --> RiderJourney["Rider Terminal"]
    RiderJourney --> ToggleStatus["Set Status to ONLINE"]
    ToggleStatus --> ReceiveOrder["Auto-Assigned Delivery Order"]
    ReceiveOrder --> UpdateGPS["PUT /api/riders/location (Live GPS)"]
    UpdateGPS --> CompleteDelivery["Mark Order Delivered"]

    RoleCheck -- "Role: admin" --> AdminJourney["Admin Command Center"]
    AdminJourney --> ViewStats["GET /api/admin/dashboard"]
    ViewStats --> MonitorRevenue["Track PostgreSQL Revenue & Low Stock Alerts"]
```

---

## Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ orders : "places"
    users ||--o{ prescriptions : "uploads"
    users ||--o{ subscriptions : "subscribes"
    users ||--o| pharmacies : "operates"
    users ||--o| riders : "drives"

    salts ||--o{ medicines : "composes"
    medicines ||--o{ order_items : "contained_in"
    orders ||--|{ order_items : "includes"
    subscriptions ||--|{ subscription_items : "contains"
    medicines ||--o{ subscription_items : "referenced_in"
    
    users {
        BIGSERIAL id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR password
        VARCHAR phone
        VARCHAR role "enum: user, pharmacy, rider, admin"
        JSONB address "street, city, state, postalCode"
        BOOLEAN is_subscribed
        VARCHAR subscription_plan "enum: none, monthly, yearly"
        TIMESTAMP subscription_expiry
        TIMESTAMP created_at
    }

    salts {
        BIGSERIAL id PK
        VARCHAR salt_name UK
        TEXT description
        JSONB medical_uses
        JSONB common_side_effects
        TEXT precautions
    }

    medicines {
        BIGSERIAL id PK
        VARCHAR medicine_id UK
        VARCHAR brand_name
        VARCHAR generic_name
        BIGINT salt_id FK
        VARCHAR category
        VARCHAR dosage_form
        VARCHAR strength
        VARCHAR manufacturer
        VARCHAR schedule_type "enum: OTC, H, H1"
        BOOLEAN requires_prescription
        BOOLEAN cold_chain_required
        VARCHAR pack_size
        NUMERIC price
        BOOLEAN stock
        INTEGER inventory_count
    }

    orders {
        BIGSERIAL id PK
        BIGINT user_id FK
        JSONB shipping_address
        VARCHAR payment_method
        JSONB payment_result
        NUMERIC items_price
        NUMERIC tax_price
        NUMERIC platform_fee
        NUMERIC delivery_fee
        NUMERIC cold_chain_fee
        NUMERIC emergency_fee
        NUMERIC late_night_fee
        NUMERIC total_price
        BOOLEAN is_paid
        TIMESTAMP paid_at
        BOOLEAN is_delivered
        TIMESTAMP delivered_at
        VARCHAR status "enum: pending, verified, assigned, picked_up, delivered"
        BIGINT rider_id FK
        TIMESTAMP created_at
    }

    order_items {
        BIGSERIAL id PK
        BIGINT order_id FK
        BIGINT medicine_id FK
        INTEGER qty
        NUMERIC price
    }

    prescriptions {
        BIGSERIAL id PK
        BIGINT user_id FK
        VARCHAR document_url
        TIMESTAMP upload_date
        VARCHAR status "enum: PENDING, VERIFIED, REJECTED"
        TEXT reviewer_notes
        BIGINT pharmacist_id FK
        TIMESTAMP verified_at
    }

    pharmacies {
        BIGSERIAL id PK
        BIGINT user_id FK
        VARCHAR name
        VARCHAR license_number
        JSONB address
        VARCHAR status "enum: PENDING, VERIFIED, BANNED"
    }

    riders {
        BIGSERIAL id PK
        BIGINT user_id FK
        JSONB vehicle_detail
        JSONB current_location "lat, lng"
        BOOLEAN is_available
        VARCHAR status "enum: OFFLINE, ONLINE, ON_DELIVERY"
        BIGINT active_order_id FK
        NUMERIC rating
    }

    subscriptions {
        BIGSERIAL id PK
        BIGINT user_id FK
        VARCHAR frequency "enum: WEEKLY, BIWEEKLY, MONTHLY"
        TIMESTAMP next_delivery_date
        VARCHAR status "enum: ACTIVE, PAUSED, CANCELLED"
        TEXT delivery_address
        TIMESTAMP created_at
    }
```

---

## JWT Authentication & Security Section

Medifly implements stateless security utilizing JSON Web Tokens (JWT) and Bcrypt password hashing.

### 1. Password Hashing
User passwords are encrypted before persistent storage in PostgreSQL using **Bcrypt.js** with 10 salt rounds:
```javascript
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

### 2. Token Payload Claims
Upon authentication, the server signs a JWT containing the user's primary key:
```json
{
  "id": 1,
  "iat": 1770438000,
  "exp": 1773030000
}
```

### 3. Header Transmission
Clients pass the JWT token in the HTTP `Authorization` request header:
```http
Authorization: Bearer <JWT_TOKEN_STRING>
```

### JWT Authentication Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Client as React Client SPA
    participant AuthCtrl as authController
    participant Middleware as authMiddleware & roleMiddleware
    participant DB as PostgreSQL Database

    Note over Client, DB: Phase 1: Authentication & Token Issuance
    Client->>AuthCtrl: POST /api/auth/login { email, password }
    AuthCtrl->>DB: SELECT * FROM users WHERE email = $1
    DB-->>AuthCtrl: User Record (with hashed password)
    AuthCtrl->>AuthCtrl: bcrypt.compare(password, user.password)
    AuthCtrl-->>Client: HTTP 200 OK { id, name, email, role, token }
    Client->>Client: Save token to localStorage

    Note over Client, DB: Phase 2: Accessing Protected Endpoint
    Client->>Middleware: GET /api/admin/dashboard (Header: Authorization: Bearer <token>)
    Middleware->>Middleware: jwt.verify(token, JWT_SECRET)
    Middleware->>DB: SELECT * FROM users WHERE id = $1
    DB-->>Middleware: req.user object
    Middleware->>Middleware: authorize('admin') -> req.user.role === 'admin'
    Middleware-->>Client: Proceed to Controller & Return HTTP 200 JSON Data
```

---

## Project Directory Structure

```ascii
medifly-mern/
├── README.md                          # Main Repository Documentation
├── notes.md                           # Technical Interview Prep & Revision Notebook
├── package.json                       # Root Workspace Package Configuration
├── .gitignore                         # Repository Git Ignore Rules
│
├── backend/                           # Node.js + Express v5 Application Server
│   ├── .env                           # Environment Variables (PORT, DATABASE_URL, JWT_SECRET)
│   ├── package.json                   # Backend Dependencies (Express 5, pg, Socket.io)
│   ├── server.js                      # Express App Initialization, Route Mounts & Error Handler
│   ├── socket.js                      # Socket.io Singleton Engine & Room Handler
│   ├── config/
│   │   ├── db.js                      # PostgreSQL node-postgres (pg Pool) Connection Setup
│   │   └── auth.js                    # JWT Configuration Parameters
│   ├── controllers/                   # HTTP Request Handlers & Business Logic
│   │   ├── adminController.js         # Administrative Analytics & Low-Stock Dashboard
│   │   ├── authController.js          # User Registration, Login & Profile Handlers
│   │   ├── medicineController.js      # Medicine Catalog, Salt Comparison & Price Updates
│   │   ├── orderController.js         # Order Creation, Rx Checks, Pricing & Stock Decrement
│   │   ├── pharmacyController.js      # Pharmacy Registration & Workstation Dashboard
│   │   ├── prescriptionController.js  # Prescription Upload & Pharmacist Verification
│   │   ├── riderController.js         # Rider Registration & Real-Time GPS Tracking
│   │   └── subscriptionController.js  # Refill Subscription Management
│   ├── middleware/                    # Security & Protection Middleware
│   │   ├── authMiddleware.js          # JWT Verification Guard
│   │   └── roleMiddleware.js          # Role-Based Access Control (RBAC) Guard
│   ├── routes/                        # Express API Route Mapping Definitions
│   │   ├── adminRoutes.js             # /api/admin Endpoints
│   │   ├── authRoutes.js              # /api/auth Endpoints
│   │   ├── medicineRoutes.js          # /api/medicines Endpoints
│   │   ├── orderRoutes.js             # /api/orders Endpoints
│   │   ├── pharmacyRoutes.js          # /api/pharmacy Endpoints
│   │   ├── prescriptionRoutes.js      # /api/prescriptions Endpoints
│   │   ├── riderRoutes.js             # /api/riders Endpoints
│   │   └── subscriptionRoutes.js      # /api/subscriptions Endpoints
│   ├── services/                      # Decoupled Domain Business Logic
│   │   ├── cronService.js             # Subscription Auto-Refill Scheduler
│   │   ├── pricingService.js          # Multi-Tier Tax, Fee & Surcharge Calculator
│   │   ├── riderAssignmentService.js  # Automated Rider Dispatch Logic
│   │   └── saltComparisonService.js   # Bioequivalent Alternative Matcher
│   └── scripts/
│       ├── seedPostgres.js            # Initial PostgreSQL Schema & User Seeding Script
│       └── seedLargeDataset.js        # High-Scale 254k Medicine Dataset Seeder
│
└── frontend/                          # React 19 + Vite Frontend SPA Application
    ├── package.json                   # Frontend Dependencies (React 19, Vite 6, Lucide)
    ├── vite.config.js                 # Vite Bundler Setup & Path Aliasing (@ -> /src)
    ├── index.html                     # HTML Template Entrypoint
    └── src/
        ├── main.jsx                   # React DOM Entrypoint
        ├── App.jsx                    # React Router v7 Routes & App Shell Layout
        ├── index.css                  # Global CSS Design Tokens & Utilities
        ├── components/                # Modular Reusable UI Components
        │   ├── Header.jsx             # Navigation Bar with Role Links & Cart Trigger
        │   ├── Footer.jsx             # App Footer with Links & Platform Info
        │   ├── CartSidebar.jsx        # Slide-over Shopping Cart & Fee Summary
        │   └── MedicineCard.jsx       # Interactive Medicine Display Card
        ├── context/                   # Global React Context State Providers
        │   ├── AuthContext.jsx        # Auth Session & Role Management Context
        │   ├── CartContext.jsx        # Shopping Cart State & Items Management
        │   └── SocketContext.jsx      # WebSocket Real-Time Event Listener Context
        └── pages/                     # Application Page Components
            ├── HomePage.jsx           # Landing Page with Hero, 30-Min Motto & SLA Matrix
            ├── MedicinesPage.jsx      # 254k+ Medicine Browser with GIN Trigram Search
            ├── PrescriptionsPage.jsx  # Rx Upload & Verification Status Page
            ├── SubscriptionPage.jsx   # Recurring Subscription Refill Manager
            ├── CheckoutPage.jsx       # Order Checkout & Multi-Tier Fee Review
            ├── OrdersPage.jsx         # User Order History & Real-Time Map Tracking
            ├── SaltComparePage.jsx    # Generic Bioequivalent Salt Alternative Tool
            ├── DashboardPage.jsx      # User Overview Dashboard
            ├── AdminPage.jsx          # Admin System Analytics & Stock Alerts
            ├── PharmacyPage.jsx       # Pharmacist Verification Terminal
            ├── RiderPage.jsx          # Rider Dispatch & GPS Tracker Terminal
            ├── ProfilePage.jsx        # User Account Profile Manager
            └── SettingsPage.jsx       # User Settings Panel
```

---

## Exhaustive API Reference & Calling Guide

### Endpoints Summary Table

| Category | Method | URL Path | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | All | Register a new user account |
| **Auth** | `POST` | `/api/auth/login` | Public | All | Authenticate user & return JWT token |
| **Auth** | `GET` | `/api/auth/profile` | Private | All Logged In | Get current authenticated user profile |
| **Medicines** | `GET` | `/api/medicines` | Public | All | Search 254k+ meds with keyword, category, page & sort |
| **Medicines** | `GET` | `/api/medicines/:id` | Public | All | Fetch single medicine details |
| **Medicines** | `GET` | `/api/medicines/salt-comparison/:id` | Public | All | Compare bioequivalent salts & generic alternatives |
| **Medicines** | `PUT` | `/api/medicines/:id/price` | Private | Admin / Pharmacy | Update medicine price & trigger WS broadcast |
| **Orders** | `POST` | `/api/orders` | Private | `user` | Create order with stock/Rx checks & rider assignment |
| **Orders** | `GET` | `/api/orders/myorders` | Private | `user` | Fetch logged-in user's order history |
| **Orders** | `GET` | `/api/orders/:id` | Private | `user`, `admin` | Fetch order details by ID |
| **Orders** | `PUT` | `/api/orders/:id/pay` | Private | `user` | Update order payment status to paid |
| **Prescriptions**| `POST` | `/api/prescriptions` | Private | `user` | Upload a new prescription document |
| **Prescriptions**| `GET` | `/api/prescriptions/my` | Private | `user` | Fetch logged-in user's prescriptions |
| **Prescriptions**| `PUT` | `/api/prescriptions/:id/verify` | Private | `pharmacy`, `admin` | Verify/reject uploaded prescription |
| **Subscriptions**| `POST` | `/api/subscriptions` | Private | `user` | Create auto-refill delivery subscription |
| **Subscriptions**| `GET` | `/api/subscriptions` | Private | `user` | Fetch user's active subscriptions |
| **Pharmacy** | `POST` | `/api/pharmacy` | Private | `user` | Register a new pharmacy store |
| **Pharmacy** | `GET` | `/api/pharmacy/dashboard` | Private | `pharmacy`, `admin` | Get pharmacy workstation dashboard details |
| **Riders** | `POST` | `/api/riders` | Private | `user` | Register a new fleet rider |
| **Riders** | `PUT` | `/api/riders/location` | Private | `rider` | Update live rider GPS location |
| **Admin** | `GET` | `/api/admin/dashboard` | Private | `admin` | Get platform analytics & stock alerts |

---

### Detailed Endpoint Specifications

#### 1. Auth Service

##### `POST /api/auth/register`
- **Description**: Registers a new user account.
- **Auth Required**: Public (No Token)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+919876543210"
}
```
- **Response `201 Created`**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### `POST /api/auth/login`
- **Description**: Authenticates user credentials and returns JWT token.
- **Auth Required**: Public (No Token)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "user@medifly.com",
  "password": "user123"
}
```
- **Response `200 OK`**:
```json
{
  "id": 1,
  "name": "Test User",
  "email": "user@medifly.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 2. Medicines Service

##### `GET /api/medicines`
- **Description**: Queries 254,000+ medicines with GIN trigram SQL index.
- **Auth Required**: Public
- **Query Parameters**:
  | Parameter | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `keyword` | String | None | Search brand name, generic composition, or manufacturer |
  | `category` | String | None | Category filter (e.g., `analgesics`, `diabetes`, `cardiac`) |
  | `page` | Number | 1 | Page number for pagination |
  | `pageSize` | Number | 20 | Items per page |
  | `sort` | String | name | Sort parameter (`name`, `price_asc`, `price_desc`) |
- **Response `200 OK`**:
```json
{
  "medicines": [
    {
      "id": 101,
      "medicineId": "MED-101",
      "brandName": "Paracetamol 650",
      "genericName": "Paracetamol",
      "category": "Analgesics",
      "price": 32.50,
      "stock": true,
      "inventoryCount": 150
    }
  ],
  "page": 1,
  "pages": 12702,
  "total": 254023
}
```

---

#### 3. Orders Service

##### `POST /api/orders`
- **Description**: Creates order, verifies inventory/Rx, calculates fee breakdown, and dispatches rider.
- **Auth Required**: Private (`Authorization: Bearer <token>`)
- **Request Body**:
```json
{
  "orderItems": [
    { "medicine": 101, "qty": 2 }
  ],
  "shippingAddress": {
    "address": "123 Health St",
    "city": "Mumbai",
    "postalCode": "400058",
    "country": "India"
  },
  "paymentMethod": "Razorpay",
  "isEmergency": true
}
```
- **Response `201 Created`**:
```json
{
  "id": 501,
  "user_id": 1,
  "itemsPrice": 65.00,
  "taxPrice": 3.25,
  "platformFee": 6.00,
  "deliveryFee": 30.00,
  "coldChainFee": 0.00,
  "emergencyFee": 50.00,
  "totalPrice": 154.25,
  "status": "assigned",
  "isPaid": false
}
```

---

## 🚀 Local Setup & Installation Guide

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

- **Frontend Application**: `http://localhost:5173`
- **Backend Express API**: `http://127.0.0.1:5000`

---

## License

This project is licensed under the ISC License.
