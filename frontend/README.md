# Medifly Frontend — Single Page Application (SPA)

This is the frontend single-page application for **Medifly**, built with **React 19**, **Vite 6**, **React Router v7**, **Clerk Authentication**, and **Vanilla CSS Modules**.

## 🚀 Key Features & Components

- **254k+ Medicine Browser (`/medicines`)**: Sub-second search, category filtering, dosage-form-driven placeholder image resolution (`getMedicineImage.js`), and relevance-ranked results.
- **Prescription Vault (`/prescriptions`)**: Multi-patient family member profiles (`Self`, `Spouse`, `Father`, etc.), prescription upload, pharmacist review status, and per-family-member order history tab with order status tracking chips.
- **Bioequivalent Salt Matcher (`/salt-compare`)**: Smart chemical composition comparison for cost savings on generic alternatives.
- **Auto-Refill Subscriptions (`/subscription`)**: Chronic care recurring delivery management.
- **Checkout & Multi-Tier Pricing (`/checkout`)**: 30-Minute Ultra Express SLA, dynamic GST/delivery/cold-chain/emergency fee calculator.
- **Live Order & Rider GPS Tracker (`/orders`)**: Real-time order progress stepper and WebSocket rider map updates.
- **Merged About & Contact Page (`/about` & `/about#contact`)**: Platform mission, 30-min SLA details, partner/rider onboarding links, and direct contact form connected to PostgreSQL `support_requests`.
- **Clerk Authentication & Multi-Tenancy**: Custom branded Clerk widget (`<SignIn />` / `<SignUp />`) with role-based navigation.

## 📦 Project Setup

```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build
```

- **Dev Server**: `http://localhost:5173`
- **Build Output**: `dist/`
