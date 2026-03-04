# Pharmacy Management System — System Scope & Function Documentation

## 1. Introduction

The Pharmacy Management System is a full-stack, web-based Enterprise Resource Planning (ERP) application purpose-built for pharmacy operations. It provides end-to-end management of medicine inventory, batch tracking, point-of-sale transactions, patient records, prescriptions, financial reporting, and system administration.

The system is built on a **React.js** frontend and a **NestJS** (Node.js/TypeScript) backend, communicating over a RESTful API secured with **JWT-based authentication** and a granular **Role-Based Access Control (RBAC)** permission model.

---

## 2. User Roles & Permissions

The system supports four distinct user roles. Each role determines which navigation items are visible and which actions (Create, Update, Delete) are permitted on each entity.

| Role | Description |
| :--- | :--- |
| **ADMIN** | Full system access. Can manage users, view audit logs, access system settings, create/delete all entities, and generate all reports. |
| **PHARMACIST** | Can manage medicines, batches, patients, prescriptions, and process sales. Can view alerts, sales logs, and reports. Cannot access system administration or audit logs. |
| **CASHIER** | Can view medicines, process sales via POS, and register patients. Cannot manage batches, prescriptions, alerts, or reports. |
| **AUDITOR** | Read-only access to the Dashboard, Sales Log, Reports, and Audit Logs for compliance and oversight purposes. Cannot create, update, or delete any entity. |

### Permission Matrix (Entity-Level)

| Entity | Create | Update | Delete |
| :--- | :--- | :--- | :--- |
| Medicines | Admin, Pharmacist | Admin, Pharmacist | Admin |
| Batches | Admin, Pharmacist | Admin, Pharmacist | Admin |
| Patients | Admin, Pharmacist | Admin, Pharmacist | Admin |
| Prescriptions | Admin, Pharmacist | Admin, Pharmacist | Admin |
| Sales | Admin, Pharmacist, Cashier | — | — |

---

## 3. System Modules (Backend)

The backend is organized into **13 independent NestJS modules**, each encapsulating its own entities, services, controllers, and DTOs.

| # | Module | Key Entities | Primary Functions |
| :--- | :--- | :--- | :--- |
| 1 | **Auth** | User (via JWT) | Login, JWT token issuance, password validation, session management. |
| 2 | **Users** | User | User registration, profile management, role assignment. |
| 3 | **Medicines** | Medicine | CRUD operations for medicine records. Supports bulk import from Excel files (`.xlsx`). Tracks name, generic name, category, unit, minimum stock level, and controlled substance flag. |
| 4 | **Batches** | Batch | CRUD operations for medicine batches. Each batch is linked to a medicine and has a unique batch number, expiry date, purchase price, selling price, initial quantity, and quantity remaining. Supports bulk import from Excel. |
| 5 | **Stock** | StockTransaction | Core stock engine using **FIFO (First-In, First-Out)** logic for stock issuance. Records every stock-in and stock-out as an immutable transaction ledger. Automatically skips expired batches during issuance. Provides transaction history and per-medicine stock aggregation. |
| 6 | **Sales** | Sale, SaleItem | Processes point-of-sale transactions. Links each sale to a patient (optional), records payment method, calculates totals, and triggers stock deductions via the Stock module. Triggers in-app notifications upon successful sale. |
| 7 | **Patients** | Patient | Patient registration and profile management. Stores name, phone, age, gender, address, and allergies. Provides a `/patients/:id/history` endpoint that aggregates all prescriptions and sales for a given patient into a unified timeline. |
| 8 | **Prescriptions** | Prescription, PrescriptionItem | Digital prescribing linked to patients and medicines. Each prescription records the prescribing doctor, date, and a list of prescribed items with dosage and duration information. |
| 9 | **Alerts** | Alert | Automated monitoring system that detects **Low Stock** (medicine stock below minimum level) and **Near Expiry** (batches expiring within a configurable window) conditions. Creates alert records and triggers in-app notifications. Alerts can be individually resolved by authorized users. |
| 10 | **Notifications** | Notification | In-app notification system. Stores notifications with a title, message, type (LOW_STOCK, EXPIRING, SALE, SYSTEM, INFO), read status, and optional user targeting. Supports broadcast notifications (user_id = null). Provides endpoints for fetching, marking as read (individual and bulk), and deleting notifications. |
| 11 | **Reporting** | — (cross-module queries) | Comprehensive analytics and report generation engine with **27 service methods**. Generates dashboard statistics, profit/loss reports, medicine inventory reports, batch status reports, sales summaries, trending/least-selling medicines, sales trends, and revenue comparisons. Every report type supports export in **Excel** (ExcelJS), **PDF** (PDFKit), and **Word** (docx) formats. Also provides stock movement and expiry reports. |
| 12 | **Audit** | AuditLog | Immutable audit trail that records every significant system action (CREATE, UPDATE, DELETE, SELL) with the acting user, target entity, entity ID, old/new values, and timestamp. |
| 13 | **System** | — | Admin-only system administration. Provides server health status (uptime, memory usage, Node.js version, platform), database backup creation, backup listing, and database restoration from backup files. |

---

## 4. Frontend Pages & Features

The frontend is a single-page application built with **React.js**, **React Router**, and **Tailwind CSS**. It features a responsive sidebar navigation that collapses into a hamburger menu on mobile devices.

### 4.1 Login Page (`Login.tsx`)
- Secure authentication form with username and password fields.
- Stores JWT token and user profile in `localStorage` upon successful login.
- Redirects to the Dashboard after authentication.

### 4.2 Dashboard (`Dashboard.tsx`)
- **Summary Widgets**: Displays total medicine count, low stock alerts, expiring batch warnings, and today's sales total in visually distinct stat cards.
- **Top Selling Medicines Chart**: An interactive bar chart (using Recharts) showing the most frequently sold medicines.
- **Revenue Comparison**: Side-by-side revenue figures for Today, Yesterday, and This Week.
- **Recent Activity**: Quick-access links to critical areas like alerts and sales.
- **Quick Navigation**: Clickable cards that link to Medicines, Batches, POS, and Reports.

### 4.3 Medicines Management (`Medicines.tsx`)
- **Full CRUD**: Add, edit, and delete medicine records via modal forms.
- **Column Filtering**: Multi-select dropdown filters on Medicine Name, Category, Stock Level, Min. Level, and Status columns. Filters combine with AND logic.
- **Search**: Real-time text search by medicine name.
- **Status Indicators**: Color-coded badges showing "In Stock", "Low Stock", or "Out of Stock" based on current quantity vs. minimum stock level.
- **Excel Import**: Upload `.xlsx` files to bulk-import medicines. Shows import results with created, updated, and error counts.
- **Sticky Headers**: Table headers remain visible during scrolling.

### 4.4 Batch Management (`Batches.tsx`)
- **Full CRUD**: Add, edit, and delete batch records linked to specific medicines.
- **Column Filtering**: Multi-select filters on Medicine (linked medicine name) and Status (Active, Expiring Soon, Expired).
- **Search**: Real-time text search across batch number, medicine name, and status.
- **Expiry Tracking**: Automatic status classification—Active (>30 days), Expiring Soon (≤30 days), or Expired (past expiry date).
- **Excel Import**: Bulk import batches with validation that medicine names must match existing records.
- **Clear All Filters**: One-click button to reset all active column filters.

### 4.5 Point of Sale — POS (`POS.tsx`)
- **Product Search**: Search available medicines by name with real-time results.
- **Shopping Cart**: Add medicines to a virtual cart, adjust quantities (with stock validation), and remove items.
- **Price Calculation**: Automatic subtotal and grand total computation.
- **Payment Processing**: Select payment method (Cash, Card, Mobile) and optional patient linking.
- **Checkout**: Submits the sale, deducts stock via FIFO logic, generates a receipt number, and triggers a notification.

### 4.6 Sales Log (`SalesLog.tsx`)
- **Transaction History**: Displays all completed sales with receipt number, date, patient, items, payment method, and total amount.
- **Column Filtering**: Multi-select filters on Patient, Payment Method, and User (cashier) columns.
- **Date Range Filtering**: Filter sales by start and end date.
- **Search**: Text search across receipt numbers, patient names, and cashier usernames.
- **Expandable Rows**: Click to view itemized sale details (medicine, quantity, unit price, subtotal).

### 4.7 Reports (`Reports.tsx`)
- **Tabbed Interface**: Four report categories accessible via tabs:
  - **Profit & Loss**: Date-range selectable P&L analysis showing total revenue, total cost, gross profit, and profit margin. Includes per-medicine breakdown.
  - **Sales Summary**: Detailed daily sales data within a selected date range.
  - **Medicine Inventory**: Full inventory listing with stock levels, categories, and valuation.
  - **Batch Status**: All batches with expiry dates, remaining quantities, and status indicators.
- **Multi-Format Export**: Each report can be downloaded in three formats:
  - **Excel (.xlsx)**: Formatted spreadsheets for data analysis.
  - **PDF (.pdf)**: Print-ready professional documents.
  - **Word (.docx)**: Editable documents for meeting notes and records.
- **Data Preview**: In-page tables and summary statistics before downloading.

### 4.8 Patient Management (`Patients.tsx`)
- **Two-Tab Layout**:
  - **Patient Directory**: Card-based display of all registered patients with name, age, gender, phone, address, and allergies. Supports search and delete operations.
  - **Prescriptions**: List of all issued prescriptions with patient name, doctor, date, and itemized medications.
- **Patient History Modal**: Clicking a patient card opens a detailed timeline view that merges all prescriptions and sales for that patient, sorted chronologically. Each entry shows the type (Prescription or Sale), date, items, and financial details.
- **Register Patient**: Modal form to add new patients with full demographic and allergy information.
- **New Prescription**: Modal form to issue prescriptions by selecting a patient, entering the doctor's name, and adding multiple medicine items with dosage and duration.

### 4.9 Prescriptions (`Prescriptions.tsx`)
- **Standalone Prescriptions View**: A dedicated page listing all prescriptions in the system.
- **Search**: Filter prescriptions by patient name or doctor name.
- **Detailed View**: Each prescription shows the prescribing doctor, date, and all prescribed items with medicine name, dosage, and duration.

### 4.10 System Alerts (`Alerts.tsx`)
- **Active Alert Display**: Shows all unresolved Low Stock and Near Expiry alerts with severity-appropriate styling (red for low stock, amber for expiring).
- **Alert Resolution**: Authorized users can mark individual alerts as resolved, removing them from the active list.
- **Detection Timestamp**: Each alert shows when the condition was first detected.

### 4.11 Audit Logs (`AuditLogs.tsx`)
- **Immutable Activity Trail**: Displays all recorded system actions in a table format.
- **Columns**: Timestamp, Username, Action (CREATE/DELETE/SELL with color-coded badges), Entity (target component), and a truncated record hash for verification.
- **Security Indicator**: A "Secured Logging Active" badge confirms audit integrity.

### 4.12 System Administration (`System.tsx`) — Admin Only
- **Server Health**: Displays real-time server uptime, memory usage (RSS and heap), Node.js version, and operating system platform.
- **Database Backup**: One-click database backup creation with progress feedback.
- **Backup History**: Lists all available backup files with timestamps and file sizes.
- **Database Restore**: Restore the database from any previously created backup file.

---

## 5. Shared Components

| Component | Purpose |
| :--- | :--- |
| `ColumnFilter.tsx` | Reusable multi-select dropdown filter for table columns. Supports search within options, select all/clear, active filter count badge, and dynamic z-indexing to prevent UI clipping. |
| `NotificationBell.tsx` | Header notification icon with unread count badge, dropdown panel, mark-as-read (individual and bulk), delete, and auto-refresh (every 10 seconds). |
| `Modal.tsx` | Generic modal overlay component used across all CRUD forms. |
| `ProtectedRoute.tsx` | Route guard that redirects unauthenticated users to the login page. |
| `OfflineBanner.tsx` | Displays a persistent banner when the user loses internet connectivity. |

---

## 6. Application Layout (`DashboardLayout.tsx`)

- **Sidebar Navigation**: Dark indigo sidebar with icon + label menu items. Active page is highlighted with a white border accent.
- **Role-Based Menu Filtering**: Menu items are dynamically shown/hidden based on the authenticated user's role.
- **User Profile Widget**: Displays the current user's avatar initial, username, and a color-coded role badge (Admin=red, Pharmacist=green, Cashier=amber, Auditor=sky blue).
- **Responsive Design**: Sidebar collapses off-screen on mobile devices and is toggled via a hamburger menu button. An overlay backdrop appears when the mobile sidebar is open.
- **Header Bar**: Contains the system title, current session role indicator, notification bell, and user avatar.

---

## 7. Technical Architecture

### Backend Stack
| Technology | Purpose |
| :--- | :--- |
| NestJS | Application framework (modular, dependency injection) |
| TypeORM | ORM for database operations |
| PostgreSQL | Primary relational database |
| Passport.js + JWT | Authentication and session management |
| ExcelJS | Excel file generation and parsing |
| PDFKit | PDF document generation |
| docx | Microsoft Word document generation |
| Multer | File upload handling (for Excel import) |

### Frontend Stack
| Technology | Purpose |
| :--- | :--- |
| React.js (Vite) | UI framework and build tool |
| React Router v6 | Client-side routing and navigation |
| Tailwind CSS | Utility-first CSS styling |
| Recharts | Interactive chart visualizations |
| Lucide React | Icon library |
| Axios | HTTP client for API communication |

### Data Flow
```
User → React Frontend → Axios HTTP Client → NestJS REST API → TypeORM → PostgreSQL
                                                 ↓
                                          JWT Auth Guard
                                          Roles Guard
                                          Audit Logger
```

### Stock Issuance Logic (FIFO)
When a sale is processed, the system automatically:
1. Finds all batches for the requested medicine with remaining stock.
2. Sorts batches by expiry date (earliest first).
3. Skips any expired batches.
4. Deducts from the earliest-expiring batch first, moving to the next batch if needed.
5. Records each deduction as an immutable stock transaction.
6. Rejects the sale if total available non-expired stock is insufficient.

---

## 8. Security Features

- **JWT Authentication**: Stateless token-based authentication. Tokens are issued upon login and validated on every API request.
- **Role-Based Guards**: Every API endpoint is protected by both `JwtAuthGuard` (authentication) and `RolesGuard` (authorization) with explicit role annotations.
- **Frontend Permission Checks**: UI elements (buttons, menu items) are conditionally rendered based on the user's role using the `useAuth()` context hook.
- **Audit Trail**: All significant operations are logged with user identity, action type, affected entity, and timestamp.
- **Session Persistence**: User sessions survive page refreshes via `localStorage`. Cross-tab session synchronization is supported via the `storage` event listener.

---

## 9. API Endpoint Summary

| Method | Endpoint | Module | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/login` | Auth | Authenticate user and receive JWT |
| GET/POST | `/medicines` | Medicines | List all / Create medicine |
| POST | `/medicines/import` | Medicines | Bulk import from Excel |
| PUT/DELETE | `/medicines/:id` | Medicines | Update / Delete medicine |
| GET/POST | `/batches` | Batches | List all / Create batch |
| POST | `/batches/import` | Batches | Bulk import from Excel |
| PUT/DELETE | `/batches/:id` | Batches | Update / Delete batch |
| GET/POST | `/sales` | Sales | List all / Create sale |
| GET | `/sales/:id` | Sales | Get sale details |
| GET/POST | `/patients` | Patients | List all / Create patient |
| GET | `/patients/:id/history` | Patients | Get patient's full history |
| DELETE | `/patients/:id` | Patients | Delete patient |
| GET/POST | `/prescriptions` | Prescriptions | List all / Create prescription |
| GET | `/alerts/active` | Alerts | List active alerts |
| PATCH | `/alerts/:id/resolve` | Alerts | Resolve an alert |
| GET | `/notifications` | Notifications | List user's notifications |
| GET | `/notifications/unread-count` | Notifications | Get unread count |
| PATCH | `/notifications/:id/read` | Notifications | Mark notification as read |
| PATCH | `/notifications/read-all` | Notifications | Mark all as read |
| DELETE | `/notifications/:id` | Notifications | Delete notification |
| GET | `/reporting/dashboard` | Reporting | Dashboard statistics |
| GET | `/reporting/profit-loss` | Reporting | P&L report data |
| GET | `/reporting/medicines` | Reporting | Medicine inventory report |
| GET | `/reporting/batches` | Reporting | Batch status report |
| GET | `/reporting/sales` | Reporting | Sales summary report |
| GET | `/reporting/trending` | Reporting | Top selling medicines |
| GET | `/reporting/sales-trend` | Reporting | Daily sales trend |
| GET | `/reporting/revenue` | Reporting | Revenue comparison |
| GET | `/reporting/*/excel\|pdf\|word` | Reporting | Export in various formats |
| GET | `/audit` | Audit | List audit logs |
| GET | `/system/status` | System | Server health status |
| POST | `/system/backup` | System | Create database backup |
| GET | `/system/backups` | System | List available backups |
| POST | `/system/restore/:filename` | System | Restore from backup |
| GET | `/stock/transactions` | Stock | Stock transaction history |
| GET | `/stock/medicine/:id` | Stock | Medicine stock level |
