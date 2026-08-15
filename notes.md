# 📑 Medifly — Interview Notes & Revision Guide

> **Document Purpose**: Senior Technical Lead & Candidate Interview Preparation Notebook for **Medifly** — Enterprise Emergency & Subscription Medicine Delivery Platform. Encoded in UTF-8.

---

## 📌 Executive Summary & 30-Second Elevator Pitch

> "**Medifly** is an enterprise-grade emergency healthcare delivery and automated prescription refill platform built using Node.js **Express v5**, **React 19**, **Vite 6**, **Clerk Authentication & Multi-Tenancy**, and **PostgreSQL (Supabase Cloud)**. Designed for high-concurrency real-time logistics, Medifly hosts over **254,023 authentic medicines** with `pg_trgm` GIN trigram indexing, a bioequivalent **Salt Comparison Engine** that automatically matches branded medications with cheaper generic alternatives (saving up to 70%), a **Prescription Vault** with family member profiles and server-side ownership security (`account_owner_id`), a **Multi-Tier Dynamic Pricing Engine** (`PricingService`) computing subscriber discounts, cold-chain handling, emergency surcharges, and late-night fees, and an automated **Cron Refill Engine** (`CronService`) managing recurring subscriptions. Medifly uses **Socket.io** for real-time inventory alerts, order status tracking, and fleet rider GPS updates, backed by Clerk multi-tenancy authentication, strict **Role-Based Access Control (RBAC)**, and 100% account data isolation."

---

## 🌐 Live URLs & Credentials

- **Live Production API**: [https://medifly-api.onrender.com](https://medifly-api.onrender.com)
- **Production Health Check**: `GET https://medifly-api.onrender.com/health`
- **GitHub Repository**: [https://github.com/em-srs/Medifly](https://github.com/em-srs/Medifly)

| Portal / Role | Email Address | Password | Key Scope |
| :--- | :--- | :--- | :--- |
| **Regular Patient (`user`)** | `user@medifly.com` | `user123` | Search 254k+ meds, Cart, 30-Min SLA, Family Vault, Orders, Refills |
| **Pharmacist (`pharmacy`)** | `pharma@medifly.com` | `pharma123` | Prescription Document Verification, Stock Updates |
| **Fleet Rider (`rider`)** | `rider@medifly.com` | `rider123` | Live GPS Updates (`lat`/`lng`), Active Order Deliveries |
| **System Admin (`admin`)** | `admin@medifly.com` | `admin123` | Revenue Analytics, System Overrides, Low-Stock Alerts |
| **Super Admin (`super_admin`)** | `superadmin@medifly.com`| `superadmin123`| Executive Governance, Super Admin User Management |

---

## 🏛️ Comprehensive Architecture & Diagrams

### 1. High-Level System Architecture

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

*Architectural Reasoning*: Decoupling the React 19 SPA from the Express v5 web server provides clean state isolation (`AuthContext`, `CartContext`, `SocketContext`), enabling rapid WebSocket event broadcasting without SSR hydration overhead.

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

*Architectural Reasoning*: Enforcing dual-middleware authentication guards (`authMiddleware` followed by `roleMiddleware`) before invoking controller logic guarantees that unauthorized requests are rejected early at the middleware boundary.

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

*Architectural Reasoning*: Post-signup onboarding guarantees mandatory 10-digit phone collection before patient ordering, while custom role branching directs users to specialized workspaces.

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

*Architectural Reasoning*: Auto-inserting first-time Clerk SSO users into PostgreSQL with `NULL` phone numbers prevents schema errors while ensuring complete role attribution.

---

### 5. Entity Relationship Diagram (ERD)

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
        DOUBLE_PRECISION lng "Longitude Coordinates"
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

*Architectural Reasoning*: Relational normalization (`salts.id REFERENCES medicines.salt_id`) supports fast bioequivalent alternative queries, while price snapshotting inside `order_items.price` guarantees financial audit immutability.

---

## 💻 Frontend Deep-Dive

### Real Stack
- **Framework**: React 19 SPA + Vite 6
- **Routing**: React Router v7
- **Auth Provider**: `@clerk/react` v6 + `AuthContext`
- **State Management**: `CartContext`, `SocketContext` (WebSockets)
- **Styling**: Vanilla CSS Modules + HSL CSS variable architecture

### Component Tree Breakdown

| Component File | Primary Architectural Role |
| :--- | :--- |
| [`ProtectedRoute.jsx`](file:///d:/CODINGBRO/medifly%20mern/frontend/src/components/ProtectedRoute.jsx) | Client-side route guard handling auth checks, missing phone redirects to `/onboarding`, and RBAC role validation |
| [`Header.jsx`](file:///d:/CODINGBRO/medifly%20mern/frontend/src/components/Header.jsx) | Navigation bar with Clerk `<UserButton />`, active cart counter badge, live SLA indicators, and role-based links |
| [`CartSidebar.jsx`](file:///d:/CODINGBRO/medifly%20mern/frontend/src/components/CartSidebar.jsx) | Slide-out cart drawer computing subtotal, tax, delivery fee, subscriber discounts, and prescription requirement warnings |
| [`MedicineCard.jsx`](file:///d:/CODINGBRO/medifly%20mern/frontend/src/components/MedicineCard.jsx) | Medicine product card with dynamic dosage image resolver, salt comparison trigger, and stock availability badge |

### Key Code Snippets from Codebase

#### 1. Onboarding & Role Guard Clause (`ProtectedRoute.jsx`)
```javascript
// Excerpt from frontend/src/components/ProtectedRoute.jsx
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoaded } = useUser();
  const { dbUser } = useAuth();

  if (!isLoaded) return <div className="loading-spinner">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Redirect to onboarding if phone is missing
  if (dbUser && !dbUser.phone && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // RBAC Role Check
  if (allowedRoles.length > 0 && dbUser && !allowedRoles.includes(dbUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

#### 2. Physical Appearance Asset Resolver (`getMedicineImage.js`)
```javascript
// Excerpt from frontend/src/utils/getMedicineImage.js
export const getMedicineImage = (dosageForm, isColdChain = false) => {
  if (isColdChain) return '/assets/medicines/cold-chain-insulin.png';
  const form = (dosageForm || '').toLowerCase();
  if (form.includes('tablet')) return '/assets/medicines/tablet-strip.png';
  if (form.includes('capsule')) return '/assets/medicines/capsule-blister.png';
  if (form.includes('syrup') || form.includes('liquid')) return '/assets/medicines/syrup-bottle.png';
  if (form.includes('injection')) return '/assets/medicines/injection-vial.png';
  if (form.includes('inhaler')) return '/assets/medicines/inhaler-device.png';
  return '/assets/medicines/generic-medicine.png';
};
```

---

## ⚙️ Backend Deep-Dive

### Real Stack
- **Web Framework**: Express v5.2.1 on Node.js
- **Database Client**: `pg` Pool (`Pool` from `pg` v8.23) on Supabase Cloud
- **Background Jobs**: `node-cron` v4.2
- **WebSockets**: `socket.io` v4.8
- **File Storage**: `@supabase/supabase-js` v2.112 (Private `prescriptions` bucket)

### Key Backend Services & Snippets

#### 1. Multi-Tier Dynamic SLA Pricing Engine (`pricingService.js`)
```javascript
// Excerpt from backend/services/pricingService.js
class PricingService {
  static calculateOrderPricing({ items, isSubscribed, isEmergency, isColdChain, orderHour }) {
    const itemsPrice = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    
    // Subscriber Discounts
    const platformFee = isSubscribed ? 2.00 : 6.00;
    const deliveryFee = 30.00; // Flat 30-Min SLA Fee
    const coldChainFee = isColdChain ? (isSubscribed ? 15.00 : 25.00) : 0.00;
    const emergencyFee = isEmergency ? (isSubscribed ? 25.00 : 50.00) : 0.00;
    
    // Late Night Surcharge (10 PM to 6 AM)
    const isLateNight = orderHour >= 22 || orderHour < 6;
    const lateNightFee = isLateNight ? (isSubscribed ? 0.00 : 20.00) : 0.00;

    const totalPrice = Number((itemsPrice + taxPrice + platformFee + deliveryFee + coldChainFee + emergencyFee + lateNightFee).toFixed(2));
    
    return { itemsPrice, taxPrice, platformFee, deliveryFee, coldChainFee, emergencyFee, lateNightFee, totalPrice };
  }
}
```

#### 2. Auto-Refill Subscription Scanner (`cronService.js`)
```javascript
// Excerpt from backend/services/cronService.js
const startCronJobs = () => {
  // Midnight Cron Job: 0 0 * * *
  cron.schedule('0 0 * * *', async () => {
    try {
      const dueRes = await query(
        `SELECT s.*, u.is_subscribed 
         FROM subscriptions s
         JOIN users u ON s.user_id = u.id
         WHERE s.status = 'ACTIVE' AND s.next_delivery_date <= CURRENT_TIMESTAMP`
      );

      for (const sub of dueRes.rows) {
        // Auto-generate order & update next delivery date based on sub.frequency
      }
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });
};
```

---

## 🔒 Security & Auth Deep-Dive

### 1. Clerk SSO & Token Scheme
- Authentication is handled via Clerk (`@clerk/react`). Front-end API requests attach JWT tokens in the `Authorization: Bearer <token>` header or provide `x-clerk-id` headers.
- `authMiddleware.js` extracts the user identifier, queries PostgreSQL (`SELECT * FROM users WHERE clerk_id = $1 OR email = $2 OR id = $3`), and auto-creates missing users with `NULL` phone numbers.

### 2. Dual-Tier RBAC & SQL Isolation
- **Role Enforcement**: `roleMiddleware.js` enforces role boundaries (`authorize('pharmacy', 'admin')`).
- **SQL Visibility Isolation**: `GET /api/admin/users` filters out `super_admin` records (`WHERE role != 'super_admin'`) when queried by a standard `admin`.

### 3. Server-Side Family Vault Security
- Family members are bound to `account_owner_id`. When querying member prescriptions (`GET /api/vault/members/:id/prescriptions`), the controller verifies server-side that `member.account_owner_id === req.user.id`.

---

## 📡 API Reference Recap

| Method | Endpoint | Protected? | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | No | Public | Authenticate user credentials & return JWT |
| `GET` | `/api/users/me` | Yes | All Authenticated | Fetch current logged-in PostgreSQL profile |
| `GET` | `/api/medicines` | No | Public | Search 254k+ medicines (`pg_trgm` GIN index) |
| `GET` | `/api/medicines/salt-comparison/:id`| No | Public | Compare bioequivalent generic alternatives |
| `POST` | `/api/orders` | Yes | `user` | Create order & calculate SLA delivery pricing |
| `GET` | `/api/vault/members` | Yes | `user` | List family member profiles |
| `POST` | `/api/vault/members/:id/prescriptions`| Yes | `user` | Upload prescription file to Supabase |
| `GET` | `/api/vault/prescriptions/:id/file` | Yes | `user`, `pharmacy`, `admin` | Stream 10-minute temporary signed file URL |
| `PUT` | `/api/prescriptions/:id/verify` | Yes | `pharmacy`, `admin` | Verify prescription document status |
| `POST` | `/api/subscriptions` | Yes | `user` | Create automated recurring refill plan |
| `PUT` | `/api/riders/location` | Yes | `rider` | Update live rider GPS coordinates |
| `GET` | `/api/admin/dashboard` | Yes | `admin`, `super_admin` | Platform analytics & revenue dashboard |

---

## 🎯 Technical Interview Q&A & Talking Points

### Question 1: Framework & Database Selection Rationale
**Q: Why choose Express.js v5 with Node.js and PostgreSQL (Supabase) over MongoDB or Next.js?**
> **Answer**: Express v5 on Node.js provides non-blocking, event-driven I/O ideal for real-time WebSocket communication via Socket.io. For a high-scale medicine catalog (254,023 items), PostgreSQL with `pg_trgm` GIN trigram indexing far outperforms MongoDB in structured relational queries, join performance, and transactional safety. A decoupled React 19 SPA served via Vite offers clean client-side state isolation (`AuthContext`, `CartContext`, `SocketContext`) without SSR hydration overhead.

### Question 2: Concurrency & Stock Depletion Guards
**Q: How does Medifly handle race conditions, simultaneous stock depletion, and inventory integrity during order creation?**
> **Answer**: During order placement (`POST /api/orders`), Medifly executes atomic inventory updates in PostgreSQL inside explicit SQL transactions:
> ```sql
> UPDATE medicines 
> SET inventory_count = inventory_count - $1 
> WHERE id = $2 AND inventory_count >= $1;
> ```
> By adding `AND inventory_count >= $1` directly inside the `UPDATE` statement, PostgreSQL guarantees thread-safe atomic decrements without race conditions. If the row count affected is 0, the transaction rolls back, returning an out-of-stock error. Furthermore, Socket.io broadcasts `inventoryChanged` events to instantly update connected browser clients.

### Question 3: Role-Based Access Control (RBAC) Enforcement
**Q: How is Role-Based Access Control enforced across both backend and frontend layers?**
> **Answer**: Medifly enforces a defense-in-depth security model:
> 1. **Backend Guard**: Protected Express endpoints chain `protect` with `authorize(...roles)` middleware.
> 2. **SQL Isolation**: For user management (`GET /api/admin/users`), `admin` users are restricted at the SQL layer (`WHERE role != 'super_admin'`) so they can never view or modify `super_admin` accounts.
> 3. **Frontend Guard**: `ProtectedRoute.jsx` checks `user.role` from `AuthContext` to restrict client-side page rendering and route navigation.

### Question 4: Schema Normalization & Design Choices
**Q: Why separate the `salts` table from `medicines`, and why snapshot prices inside `order_items`?**
> **Answer**: 
> - **Salt Normalization**: Brand-name medicines (`medicines`) reference `salts.id` via foreign key. This allows rapid bioequivalent generic alternative queries (`compareSalts`) sorted ascending by price (up to 70% cheaper).
> - **Price Snapshotting**: Catalog item prices fluctuate over time. Storing `price` directly inside `order_items` at order creation time preserves historical financial auditing integrity, ensuring past receipts remain accurate regardless of future catalog price edits.

### Question 5: Testing Strategy & Verification
**Q: How did you approach testing and data isolation verification?**
> **Answer**: Core business logic services (`PricingService`, `SaltComparisonService`, `RiderAssignmentService`) were written as pure functions decoupled from Express HTTP objects. Automated test scripts (`testCrossAccountIsolation.js` and `testVaultEndToEnd.js`) were executed against Supabase PostgreSQL, verifying 100% pass rates across 5 cross-account isolation checks and 6 storage vault end-to-end checks.

### Question 6: Price Snapshotting & Historical Integrity
**Q: How does price snapshotting or historical data preservation work in Medifly?**
> **Answer**: When an order is placed (`POST /api/orders`), the unit price of each item at that exact millisecond is snapshotted into `order_items.price`. Subsequent catalog updates via `PUT /api/medicines/:id/price` do not mutate past `order_items` records, preserving financial auditing accuracy.

### Question 7: Cloud Deployments & Infrastructure Setup
**Q: How are cloud deployments and environment variables managed in production?**
> **Answer**: The React SPA is built via Vite (`npm run build`) and deployed to Vercel/Netlify. The Express backend is hosted on Render as a Node.js process with WebSocket support enabled, pinged every 5 minutes at `GET /health` by UptimeRobot to eliminate 15-minute inactivity spin-downs. Database and file storage are hosted on Supabase Cloud (PostgreSQL with `pg_trgm` GIN indexing and private storage buckets).
