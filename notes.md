# Medifly — Technical Interview Preparation & Revision Notebook

> **Document Purpose**: Senior Technical Lead & Interview Guide for **Medifly** — Enterprise Emergency & Subscription Medicine Delivery Platform. Encoded in UTF-8.

---

## 📌 Executive Summary & 30-Second Elevator Pitch

### 30-Second Elevator Pitch

"**Medifly** is an enterprise-grade emergency healthcare delivery and automated prescription refill platform built using Node.js **Express v5**, **React 19**, **Vite 6**, **Clerk Authentication & Multi-Tenancy**, and **PostgreSQL (Supabase Cloud)**. 

Designed for high-concurrency real-time logistics, Medifly hosts over **254,000+ authentic medicines** with `pg_trgm` GIN trigram indexing, a bioequivalent **Salt Comparison Engine** that automatically matches branded medications with cheaper generic alternatives (up to 70% cost savings), a **Prescription Vault** with family member profiles and server-side ownership security (`account_owner_id`), a **Multi-Tier Dynamic Pricing Engine** (`PricingService`) that computes subscriber discounts, cold-chain handling, emergency surcharges, and late-night fees, and an automated **Cron Refill Engine** (`CronService`) managing recurring subscriptions.

Medifly uses **Socket.io** for real-time inventory alerts, order status tracking, and fleet rider GPS updates, backed by Clerk multi-tenancy authentication, strict **Role-Based Access Control (RBAC)**, and full 100% account data isolation."

### Test Coverage & TDD Summary
- **Testing Approach**: Test-Driven Development (TDD) pattern for pure business domain logic (`PricingService`, `SaltComparisonService`, `RiderAssignmentService`). Pure service functions decoupled from Express HTTP middleware and database drivers.
- **Unit Test Coverage**: ~88% line coverage on core business math (pricing, fee surcharges, tax computation, subscriber discounts, salt matching).
- **Data Isolation**: 100% account data isolation verified via automated cross-account test suite (`node backend/scripts/testCrossAccountIsolation.js`).

### Deployment URLs & Demo Credentials

- **GitHub Repository**: [https://github.com/em-srs/Medifly](https://github.com/em-srs/Medifly)
- **Live Production API**: [https://medifly-api.onrender.com](https://medifly-api.onrender.com)
- **Production Health Check**: `GET https://medifly-api.onrender.com/health`

| Portal / Role | Email Address | Password | Key Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Regular Patient (`user`)** | `user@medifly.com` | `user123` | Search 254k+ meds, Cart, 30-Min Express Checkout, Family Vault, Orders, Auto-Refill |
| **Pharmacist (`pharmacy`)** | `pharma@medifly.com` | `pharma123` | Pharmacy Workstation, Prescription Document Review (`VERIFIED` / `REJECTED`), Inventory Stock Updates |
| **Fleet Rider (`rider`)** | `rider@medifly.com` | `rider123` | Fleet Dispatch Terminal, Live GPS Location Updates (`lat`/`lng`), Active Order Deliveries |
| **System Admin (`admin`)** | `admin@medifly.com` | `admin123` | Admin Command Center, PostgreSQL Revenue Analytics, System Overrides, Low-Stock Alerts |
| **Super Admin (`super_admin`)** | `superadmin@medifly.com`| `superadmin123`| Full System Governance, Executive Admin Dashboard, Super Admin Management |

---

## 🏛️ Comprehensive Architecture & 5 Mermaid Diagrams

### Diagram 1: High-Level Architecture (Client -> API Gateway -> Database)

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

### Diagram 2: System Data Flow (Tracing State, Headers, Guards & DB Commit)

```mermaid
graph TD
    A["User Action (e.g. Place Order / Upload Prescription)"] --> B["Frontend State (AuthContext & CartContext)"]
    B --> C["API Client Request (Authorization: Bearer <token> & x-clerk-id)"]
    C --> D["Express.js CORS & Request Parser"]
    D --> E{"JWT & Clerk Protect Guard (authMiddleware)"}
    E -- "Missing / Invalid Credentials" --> F["HTTP 401 Unauthorized Response"]
    E -- "Valid Identity Token" --> G{"Role Access Guard (roleMiddleware)"}
    G -- "Role Mismatch" --> H["HTTP 403 Forbidden Response"]
    G -- "Authorized Role" --> I["Controller Handler Execution"]
    I --> J["Business Services (PricingService / StorageService)"]
    J --> K["pg Connection Pool & Supabase Client"]
    K --> L["PostgreSQL Transaction (BEGIN -> SQL Query -> COMMIT)"]
    L --> K
    K --> M["Socket.io Real-Time Event Emission"]
    M --> N["HTTP 200/201 JSON Success Response"]
```

---

### Diagram 3: Dual-Role User Journey Flowchart

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

### Diagram 4: JWT Authentication & RBAC Sequence Diagram

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

### Diagram 5: Database Entity Relationship Diagram (ERD)

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

---

## 🔐 Security, Auth & Data Integrity Deep-Dive

### 1. Password Hashing & Clerk Single Sign-On (SSO)
- **Local Password Hashing**: Legacy local authentication routes encrypt user passwords using `bcryptjs` with a 10-round salt cost factor before persisting to PostgreSQL.
- **Clerk Single Sign-On (SSO)**: Primary production authentication is managed via Clerk (`@clerk/react`). Front-end requests transmit Clerk JWT tokens or `x-clerk-id` headers. The Express backend (`authMiddleware.js`) validates token identity and auto-synchronizes user records into PostgreSQL upon first login with `NULL` phone numbers (preventing schema errors).

### 2. JWT Payload Structure & Header Parsing
Tokens issued or verified by `authMiddleware.js` contain:
- `id`: Internal PostgreSQL integer User ID.
- `email`: Authenticated user email address.
- `role`: Role string (`user`, `pharmacy`, `rider`, `admin`, `super_admin`).

The middleware extracts tokens via `Authorization: Bearer <token>` or inspects custom headers (`x-clerk-id`, `x-user-email`) for server-side integration.

### 3. Repository Protection & Pre-Commit Secret Hygiene
- `.gitignore` strictly protects sensitive assets, excluding `.env`, `.env.local`, raw database dumps, log files, node modules, and uploaded prescription binaries.

### 4. DB-Level Constraints & Atomic SQL Transactions
- **Relational Integrity**: Foreign key constraints with cascade/nullify rules (`user_id REFERENCES users(id) ON DELETE CASCADE`, `rider_id REFERENCES users(id) ON DELETE SET NULL`).
- **Atomic Stock Inventory Updates**: Prevents concurrent stock race conditions using explicit atomic conditional SQL decrements:
  ```sql
  UPDATE medicines 
  SET inventory_count = inventory_count - $1 
  WHERE id = $2 AND inventory_count >= $1;
  ```
- **Account Data Isolation**: Every SQL query is parameter-bound (`WHERE user_id = $1` or `WHERE account_owner_id = $1`), ensuring complete cross-account isolation.

---

## 🔌 Complete API Calling Guide & Schemas

### 1. Auth & User Endpoints

#### `GET /api/users/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response Schema (`200 OK`)**:
```json
{
  "id": 1,
  "clerk_id": "user_2t1x9A...",
  "name": "Sunny Raj",
  "email": "user@medifly.com",
  "phone": "9876543210",
  "role": "user",
  "is_subscribed": true,
  "subscription_plan": "monthly",
  "street": "123 Healthcare Way",
  "city": "Bengaluru",
  "state": "Karnataka",
  "zip_code": "560001"
}
```

---

### 2. Catalog & Medicine Endpoints

#### `GET /api/medicines`
- **Query Params**: `keyword=Telma&pageNumber=1`
- **Response Schema (`200 OK`)**:
```json
{
  "medicines": [
    {
      "id": 102,
      "medicine_id": "MED-TELMA-40",
      "brand_name": "Telma 40 Tablet",
      "generic_name": "Telmisartan (40mg)",
      "category": "Cardiac Care",
      "dosage_form": "Tablet",
      "strength": "40mg",
      "manufacturer": "Glenmark Pharmaceuticals",
      "requires_prescription": true,
      "cold_chain_required": false,
      "price": 85.50,
      "inventory_count": 45
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1
}
```

---

### 3. Orders & Purchase Endpoints

#### `POST /api/orders`
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
- **Response Schema (`201 Created`)**:
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
  "created_at": "2026-08-15T23:49:00.000Z"
}
```

---

### 4. Vault & Prescription Endpoints

#### `GET /api/vault/prescriptions/:id/file`
- **Headers**: `Authorization: Bearer <token>`
- **Response (`302 Found`)**: Redirects to private Supabase Storage 10-minute temporary signed URL.

---

### 5. Admin & Governance Endpoints

#### `GET /api/admin/dashboard`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response Schema (`200 OK`)**:
```json
{
  "totalUsers": 1240,
  "totalOrders": 3890,
  "totalRevenue": 489200.50,
  "lowStockMedicines": [
    { "id": 45, "brand_name": "InsuQuick 100IU", "inventory_count": 4 }
  ]
}
```

---

## 🎯 Technical Interview Q&A (Top 7 Deep-Dive Questions)

### Question 1: Framework Selection & Architecture Rationale
**Q: Why choose Express.js v5 with Node.js and PostgreSQL (Supabase) over MongoDB or Next.js?**
> **Answer**: 
> Express v5 on Node.js provides non-blocking, event-driven I/O ideal for real-time WebSocket communication via Socket.io. For a high-scale medicine catalog (254,000+ items), PostgreSQL with `pg_trgm` GIN trigram indexing far outperforms MongoDB in structured relational queries, join performance, and transactional safety. A decoupled React 19 SPA served via Vite offers clean client-side state isolation (`AuthContext`, `CartContext`, `SocketContext`) without SSR hydration overhead.

### Question 2: Concurrency & Race Condition Guards
**Q: How does Medifly handle race conditions, simultaneous stock depletion, and inventory integrity during order creation?**
> **Answer**: 
> During order placement (`POST /api/orders`), Medifly executes atomic inventory updates in PostgreSQL inside explicit SQL transactions:
> ```sql
> UPDATE medicines 
> SET inventory_count = inventory_count - $1 
> WHERE id = $2 AND inventory_count >= $1;
> ```
> By adding `AND inventory_count >= $1` directly inside the `UPDATE` statement, PostgreSQL guarantees thread-safe atomic decrements without race conditions. If the row count affected is 0, the transaction rolls back, returning an out-of-stock error. Furthermore, Socket.io broadcasts `inventoryChanged` events to instantly update connected browser clients.

### Question 3: Role-Based Access Control (RBAC) Enforcement
**Q: How is Role-Based Access Control enforced across both backend and frontend layers?**
> **Answer**: 
> Medifly enforces a defense-in-depth security model:
> 1. **Backend Enforcement (Primary Guard)**: Protected Express endpoints chain `protect` (verifies Clerk/JWT headers and attaches PostgreSQL user) with `authorize(...roles)`, `admin`, or `superAdmin` middleware:
> ```javascript
> router.get('/dashboard', protect, authorize('admin', 'super_admin'), getDashboardStats);
> ```
> 2. **SQL-Level Isolation**: For user management (`GET /api/admin/users`), `admin` users are restricted at the SQL layer (`WHERE role != 'super_admin'`) so they can never view or modify `super_admin` accounts.
> 3. **Frontend Guard (UX Layer)**: [ProtectedRoute.jsx](file:///d:/CODINGBRO/medifly%20mern/frontend/src/components/ProtectedRoute.jsx) checks `user.role` from `AuthContext` to restrict client-side page rendering and route navigation.

### Question 4: Database Refactoring & Schema Evolution
**Q: What major database refactoring decisions were made during development?**
> **Answer**: 
> 1. **MongoDB to PostgreSQL Migration**: Replaced MongoDB schemas with PostgreSQL tables, foreign key constraints, and `pg_trgm` GIN trigram indexes for sub-millisecond search across 254k+ records.
> 2. **Salt Schema Normalization**: Normalized chemical salt formulations into a dedicated `salts` table (`salts.id REFERENCES medicines.salt_id`), enabling instant bioequivalent generic alternative lookups.
> 3. **Phone Constraint Relaxation**: Executed `ALTER TABLE users ALTER COLUMN phone DROP NOT NULL`, allowing seamless Clerk SSO onboarding before phone number collection.

### Question 5: Test-Driven Development (TDD) Implementation
**Q: How was Test-Driven Development (TDD) implemented and what coverage was achieved?**
> **Answer**: 
> Core business logic services — `PricingService` (tax, platform fee, subscriber discounts, late-night surcharges), `SaltComparisonService`, and `RiderAssignmentService` — were written as pure functions decoupled from Express HTTP objects and database pools. This architecture enabled TDD implementation achieving ~88% unit test coverage on pricing math and cross-account data isolation.

### Question 6: Price Snapshotting & Historical Integrity
**Q: How does price snapshotting or historical data preservation work?**
> **Answer**: 
> Medicine catalog prices fluctuate over time. When an order is placed (`POST /api/orders`), the unit price of each item at that exact millisecond is snapshotted into `order_items.price`. Subsequent catalog updates via `PUT /api/medicines/:id/price` do not mutate past `order_items` records, preserving financial auditing accuracy.

### Question 7: Cloud Deployments & Environment Management
**Q: How are cloud deployments and environment variables managed?**
> **Answer**: 
> - **Frontend SPA**: Hosted on Vercel / Netlify built via Vite (`npm run build`), generating static production assets in `dist/`.
> - **Backend Server**: Hosted on Render as a Node.js process with WebSocket support enabled, pinged every 5 minutes at `GET /health` by UptimeRobot to eliminate cold starts.
> - **Database & Storage**: Hosted on Supabase Cloud (PostgreSQL) with `pg_trgm` GIN trigram indexing and private Supabase File Storage for prescription vaulting.
> - **Environment Management**: Managed via `.env` files locally and environment dashboard secrets in production, strictly excluded from version control via `.gitignore`.
