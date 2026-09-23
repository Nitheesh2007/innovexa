# StockFlow Enterprise ERP & Intelligent Inventory Suite

StockFlow is an enterprise-grade inventory, point of sale (POS), and supply chain management platform with embedded AI copilot capabilities, real-time ML demand forecasting, and robust financial tracking.

---

## 🏛️ System Architecture

- **Frontend**: Modern React 19 SPA powered by Vite, Tailwind CSS, Framer Motion, and Recharts.
- **Backend**: Express.js REST API with modular routers, JWT authentication, role-based access control (RBAC), and MongoDB/Mongoose.
- **AI & Intelligence**: Hybrid AI copilot (Gemini / OpenAI / rule-based fallback) + Scikit-learn FastAPI ML microservice for demand forecasting.
- **Security & Compliance**: Helmet protection, audit logging, rate limiting, and Bcrypt password hashing.

---

## 🚀 Navigation & Core Modules

### 1. Operations
- **Dashboard**: Real-time KPI cards, sales trends, low stock warnings, and recent transaction activities.
- **POS Terminal**: Fast point-of-sale register with live barcode entry, customer assignment, and instant receipt billing.
- **Products Catalog**: Complete SKU management, image assets, pricing margins, category tags, and stock thresholds.
- **Inventory Ledger**: Real-time ledger of all stock-in and stock-out adjustments with audit references.
- **Sales & Orders**: Customer purchase orders, delivery status tracking, and fulfillment workflow.
- **Invoices & Billing**: Automated invoice generation, PDF exports, payment status (PAID/UNPAID), and receipt tracking.
- **Returns Management**: Customer and supplier return RMA tracking with automatic stock restoration.
- **Suppliers & Vendors**: Vendor directory, lead-time tracking, and procurement links.

### 2. Intelligence & Finance
- **StockFlow AI Copilot**: Natural language business analyst querying real-time inventory valuations, top sellers, and margin health.
- **ML Demand Forecast**: Predictive inventory modeling and stockout risk analysis.
- **Financial Ledger**: Cash flow analysis, expenses tracking, gross vs. net profit margins.
- **Reports & Analytics**: Comprehensive valuation, sales performance, and audit export reports.

### 3. Administration
- **Barcode / QR Scanner**: In-browser camera scanner for instant SKU lookup and inventory verification.
- **Staff & Access Control**: User roles (`admin`, `manager`, `user`) and permission management.
- **Audit & Compliance**: Centralized activity log recording all user transactions, logins, and data modifications.

---

## 🛠️ Quick Start

### 1. Requirements
- **Node.js**: v18+
- **Python** (Optional, for advanced ML microservice): v3.9+ with `uvicorn` and `scikit-learn`

### 2. Installation
```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### 3. Running the Application
```bash
# Launch unified ecosystem (Frontend build + Backend API on port 5000)
node start.js

# Or start backend directly in development mode:
cd backend && npm run dev
```

Open your browser at: **http://localhost:5000**

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@stockflow.com` | `Admin@12345` |
| **Staff User** | `user@stockflow.com` | `User@12345` |

---

## 📦 Maintenance & Data Scripts

All database maintenance scripts are located in `backend/scripts/`:
- `npm run seed`: Reset and seed core catalog, warehouses, and test accounts.
- `npm run seed:massive`: Generate demo catalog across 20 retail categories.
- `npm run seed:images`: Populate catalog with high-resolution imagery.
- `npm run test:integration`: Execute automated end-to-end API test suite.
