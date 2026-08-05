
# 🚀 Medifly

**Instant Pharmacy Delivery Platform**

Medifly is a modern, ultra-fast medicine delivery application designed to bring essential healthcare products directly to your doorstep. Think of it as the "Blinkit for medicines"—ensuring that critical and everyday pharmaceutical needs are met with lightning-fast delivery times.

By integrating real-time rider assignment, prescription validation, subscription-based refills, and an intelligent salt comparison service to find alternative medicines, Medifly provides a comprehensive and seamless healthcare delivery ecosystem for users, pharmacies, and riders alike.
## 🌟 Features
- **Rapid Delivery System:** Optimized for emergency and quick medicine deliveries.
- **User-Friendly Interface:** Clean and responsive frontend for a seamless shopping experience.
- **Robust Backend:** Secure order management and processing.
- **Monorepo Structure:** Clean separation of frontend and backend codebases.

## 🛠️ Tech Stack
- **Frontend:** React, Vite 
- **Backend:** Node.js, Express
- **Database:** MongoDB

## 📦 Project Structure

The repository is structured as a monorepo containing both the frontend and backend codebases:

### 🖥️ Frontend (`/frontend`)
- **`src/components/`**: Reusable UI components (e.g., `CartSidebar` with cart breakdown, fees, and subscription checks).
- **`src/context/`**: React Context providers for global state management (e.g., Cart and Auth context).
- **`src/pages/`**: Page-level components defining the application's views.
- **`src/hooks/`**: Custom React hooks for shared logic.
- **`scripts/`**: Utility scripts for extracting medicine data.

### ⚙️ Backend (`/backend`)
- **`config/`**: Database connection (`db.js`) and authentication configuration (`auth.js`).
- **`controllers/`**: Request handlers managing business logic for users, admins, medicines, orders, pharmacies, prescriptions, riders, and subscriptions.
- **`models/`**: Mongoose schemas defining the database structure (e.g., `User`, `Medicine`, `Order`, `Subscription`, `Rider`, `Salt`).
- **`routes/`**: Express API endpoints mapping to their respective controllers.
- **`services/`**: Core background services including cron jobs (`cronService`), pricing calculations (`pricingService`), rider assignment (`riderAssignmentService`), and salt comparison (`saltComparisonService`).
- **`middleware/`**: Custom middleware for authentication and role-based access control.
## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local or Atlas instance)

### Installation

1. **Clone the repository:**
   bash
   git clone https://github.com/em-srs/Medifly.git
   cd Medifly
   

2. **Setup the Backend:**
   - Navigate to the backend directory:
     bash
     cd backend
     
   - Install dependencies:
     bash
     npm install
     
   - Create a `.env` file in the `backend/` directory and configure your environment variables (e.g., `PORT`, `MONGODB_URI`, `JWT_SECRET`).
   - Seed the medicine database from the CSV data:
     bash
     node scripts/seedMedicines.js
     
   - Start the backend server:
     bash
     npm run dev
     

3. **Setup the Frontend:**
   - Navigate to the frontend directory:
     bash
     cd ../frontend
     
   - Install dependencies:
     bash
     npm install
     
   - Start the development server:
     bash
     npm run dev
     
## 📄 License
All rights reserved. (Change this to MIT or another license if you decide to open-source it later).
