# Implementation Plan — Advanced Pharmacy System Enhancements

> **Document**: `imp-adv.md` (root of `Pharmacy_system`)
> **Date**: 2026-03-03

---

## Overview

This document outlines the implementation plan for **7 major feature enhancements** to the Pharmacy Management System. Each section describes the feature, the files impacted (both frontend and backend), and the technical approach.

---

## Table of Contents

1. [Column Filtering on Data Tables](#1-column-filtering-on-data-tables)
2. [Excel Import for Medicines & Batches](#2-excel-import-for-medicines--batches)
3. [Reports Page with Multi-Format Export](#3-reports-page-with-multi-format-export)
4. [Profit & Loss Calculation](#4-profit--loss-calculation)
5. [In-App Notification System](#5-in-app-notification-system)
6. [Dashboard Trending / Analytics Visuals](#6-dashboard-trending--analytics-visuals)
7. [Merge Patient & Prescription Pages](#7-merge-patient--prescription-pages)

---

## 1. Column Filtering on Data Tables

### Description
Add dropdown-based column filtering to table views. When a user clicks a column header (e.g. "Medicine Name", "Category", "Status"), a dropdown appears with all unique values for that column. The user can select one or more values to filter by. Multiple column filters should combine (AND logic) to narrow results. The reference UI is a dropdown appearing below the column header with checkboxes or a list of values.

### Current State
- `Medicines.tsx` has a table with 6 columns: Medicine Name, Category, Stock Level, Min. Level, Status, Actions.
- Only a single text search bar exists (`searchTerm`) that does a fuzzy match on name/generic_name.
- Other table pages (`SalesLog.tsx`, `Batches.tsx`) also only use text search.

### Technical Approach

#### Frontend

##### [NEW] `frontend/src/components/ColumnFilter.tsx`
- A reusable dropdown filter component.
- **Props**: `columnKey`, `label`, `options` (unique values for the column), `selectedValues`, `onFilterChange`.
- **Behavior**: Clicking the column header toggles the dropdown. A list of checkboxes is shown. On selecting/deselecting, the `onFilterChange` callback fires with updated selections.
- Includes an "All" option to clear the filter for that column, and an "Advanced Search" link for multiple selection.
- Dropdown closes when clicking outside (use a `useRef` + `useEffect` click-outside listener).

##### [MODIFY] `frontend/src/pages/Medicines.tsx`
- Add state: `columnFilters` object with keys for each filterable column: `name`, `category`, `status`.
- Compute unique values for each column from the `medicines` array (e.g. unique categories, unique statuses like "Low Stock" / "In Stock").
- Replace `<th>` elements with `<ColumnFilter>` components.
- Update `filteredMedicines` logic to apply all active column filters (AND logic) in addition to the existing search.

##### [MODIFY] `frontend/src/pages/SalesLog.tsx`
- Add column filters for: Payment Method, Patient, User columns.
- Same approach as Medicines.

##### [MODIFY] `frontend/src/pages/Batches.tsx`
- Add column filters for: Medicine Name, Status (Expired / Expiring Soon / Good).

#### Backend
- No backend changes required. Filtering is done client-side on already-fetched data.

---

## 2. Excel Import for Medicines & Batches

### Description
Allow users to import medicine and batch data from Excel (.xlsx) files. The user clicks an "Import Excel" button, selects a file, the system parses it, validates the data, and creates records in bulk.

### Current State
- No import functionality exists anywhere.
- Backend uses NestJS with `class-validator` DTOs for validation.
- `exceljs` is already installed in the backend (`package.json`).

### Technical Approach

#### Backend

##### [MODIFY] `backend/src/modules/medicines/medicines.controller.ts`
- Add a `POST /medicines/import` endpoint.
- Accept a file upload using `@UseInterceptors(FileInterceptor('file'))` from `@nestjs/platform-express`.
- Pass the file buffer to the service for parsing.

##### [MODIFY] `backend/src/modules/medicines/medicines.service.ts`
- Add `importFromExcel(buffer: Buffer)` method.
- Use `exceljs` to parse the buffer.
- Validate rows against expected columns: `name`, `generic_name`, `category`, `unit`, `minimum_stock_level`, `is_controlled`.
- Return a summary: `{ created: number, errors: { row: number, message: string }[] }`.

##### [MODIFY] `backend/src/modules/batches/batches.controller.ts`
- Add a `POST /batches/import` endpoint with file upload.

##### [MODIFY] `backend/src/modules/batches/batches.service.ts`
- Add `importFromExcel(buffer: Buffer)` method.
- Expected columns: `medicine_name` (used to look up `medicine_id`), `batch_number`, `expiry_date`, `purchase_price`, `selling_price`, `initial_quantity`.

##### [NEW] Install `multer` types
- Run `npm install --save @types/multer` in backend (needed for file upload typing).

#### Frontend

##### [MODIFY] `frontend/src/pages/Medicines.tsx`
- Add an "Import Excel" button next to "Add Medicine".
- On click, open a hidden `<input type="file" accept=".xlsx,.xls">`.
- On file select, upload via `client.post('/medicines/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })`.
- Show a results modal with import summary (created count + error list).

##### [MODIFY] `frontend/src/pages/Batches.tsx`
- Same pattern: "Import Excel" button + file upload to `/batches/import`.

---

## 3. Reports Page with Multi-Format Export

### Description
Create a dedicated Reports page where users can generate and export reports. Report types include:
- **Profit & Loss** (with date range filters: daily, weekly, monthly, quarterly, yearly, custom)
- **Medicine Inventory** report
- **Batch Status** report
- **Sales Summary** report
- Additional report types as needed (e.g., expiring stock, patient activity)

Reports can be exported in **PDF**, **Excel**, and **Word** formats.

### Current State
- `SalesLog.tsx` has basic Excel export via `/reporting/sales/export/excel`.
- Backend `reporting.service.ts` has `generateSalesExcel()` and `generateSalesPdf()`.
- No dedicated report page exists. No Word export exists.
- `pdfkit` and `exceljs` already installed.

### Technical Approach

#### Backend

##### [NEW] Install `docx` package
- Run `npm install docx` in backend for Word document generation.

##### [MODIFY] `backend/src/modules/reporting/reporting.service.ts`
- Add `getProfitLossReport(startDate, endDate)` — queries sales with items + batch (for `purchase_price`), calculates profit per item.
- Add `getMedicineReport()` — returns all medicines with stock levels, categories, etc.
- Add `getBatchReport()` — returns all batches with status tags (Good / Expiring / Expired).
- Add `generateMedicineExcel()`, `generateBatchExcel()`, `generateProfitLossExcel()`.
- Add `generateMedicinePdf()`, `generateBatchPdf()`, `generateProfitLossPdf()`.
- Add Word export methods: `generateSalesWord()`, `generateProfitLossWord()`, etc. using the `docx` library.

##### [MODIFY] `backend/src/modules/reporting/reporting.controller.ts`
- Add endpoints:
  - `GET /reporting/profit-loss?start=&end=` — JSON profit/loss data
  - `GET /reporting/profit-loss/export/excel`
  - `GET /reporting/profit-loss/export/pdf`
  - `GET /reporting/profit-loss/export/word`
  - `GET /reporting/medicines` — JSON medicine report
  - `GET /reporting/medicines/export/excel`
  - `GET /reporting/batches` — JSON batch report
  - `GET /reporting/batches/export/excel`
  - `GET /reporting/sales/export/word`

#### Frontend

##### [NEW] `frontend/src/pages/Reports.tsx`
- A full report page with:
  1. **Report Type Selector**: Tabs or dropdown to choose report type (Profit & Loss, Sales, Medicines, Batches).
  2. **Date Range Filter**: Preset buttons (Today, This Week, This Month, This Quarter, This Year) + custom date picker (start/end inputs).
  3. **Report Preview Area**: Displays the generated report data in a table/summary format.
  4. **Export Buttons**: PDF, Excel, Word buttons on the top right.
- Uses Recharts or custom SVG for profit/loss visualization (bar chart or line chart).
- The profit/loss report shows: Total Revenue, Total Cost, Gross Profit, Profit Margin %, and a breakdown table.

##### [MODIFY] `frontend/src/App.tsx`
- Add route: `<Route path="reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'AUDITOR']}><Reports /></ProtectedRoute>} />`.

##### [MODIFY] `frontend/src/layouts/DashboardLayout.tsx`
- Add "Reports" to the sidebar menu (with `BarChart3` icon from lucide-react).

##### [NEW] Install `recharts` for charts
- Run `npm install recharts` in frontend folder.

---

## 4. Profit & Loss Calculation

### Description
Calculate profit and loss from completed sales. Profit = Selling Price − Purchase Price (per unit), multiplied by quantity sold. This is integrated into the Reports page (Feature #3).

### Current State
- `SaleItem` entity has `unit_price` (selling price) and links to `Batch` via `batch_id`.
- `Batch` entity has `purchase_price`.
- **No profit calculation exists anywhere**.
- The data model already supports this: `profit_per_item = (sale_item.unit_price - batch.purchase_price) * sale_item.quantity`.

### Technical Approach

#### Backend

##### [MODIFY] `backend/src/modules/reporting/reporting.service.ts`
- The `getProfitLossReport(startDate, endDate)` method (from Feature #3) will:
  1. Query all sales within the date range with relations: `items → batch`.
  2. For each `SaleItem`, compute: `revenue = unit_price × quantity`, `cost = batch.purchase_price × quantity`, `profit = revenue - cost`.
  3. Aggregate into totals: `totalRevenue`, `totalCost`, `grossProfit`, `profitMargin`.
  4. Group by day/week/month depending on the date range span for chart data.
  5. Return both the summary and the grouped data.

#### Frontend
- Covered by the Reports page in Feature #3.
- The Profit & Loss tab shows:
  - **Summary Cards**: Total Revenue, Total Cost, Gross Profit, Profit Margin %.
  - **Chart**: Bar chart showing profit over time (days/weeks/months depending on filter).
  - **Breakdown Table**: Per-medicine breakdown with revenue, cost, and profit columns.

---

## 5. In-App Notification System

### Description
A modern in-app notification system with:
- Notification bell icon in the header bar with unread count badge.
- Dropdown panel showing recent notifications.
- Mark as read, mark all as read, and delete functionality.
- Responsive design (works on mobile).
- Notifications triggered by system events (low stock alerts, expiring batches, new sales, etc.).

### Current State
- `Alerts` entity and service exist but are page-level alerts (separate Alerts page) — they are not in-app notifications.
- `DashboardLayout.tsx` header has space for additional elements.
- No notification entity or API exists.

### Technical Approach

#### Backend

##### [NEW] `backend/src/modules/notifications/entities/notification.entity.ts`
- Fields: `id`, `user_id` (nullable — null means broadcast to all), `title`, `message`, `type` (enum: LOW_STOCK, EXPIRING, SALE, SYSTEM, INFO), `is_read` (boolean, default false), `created_at`.

##### [NEW] `backend/src/modules/notifications/notifications.service.ts`
- `create(dto)` — creates a notification.
- `findAllForUser(userId)` — returns notifications for the user (user-specific + broadcasts), ordered by `created_at DESC`.
- `getUnreadCount(userId)` — count of unread notifications.
- `markAsRead(id)` — sets `is_read = true`.
- `markAllAsRead(userId)` — marks all user's notifications as read.
- `delete(id)` — deletes a notification.

##### [NEW] `backend/src/modules/notifications/notifications.controller.ts`
- `GET /notifications` — returns all notifications for the logged-in user.
- `GET /notifications/unread-count` — returns the unread count.
- `PATCH /notifications/:id/read` — mark as read.
- `PATCH /notifications/read-all` — mark all as read.
- `DELETE /notifications/:id` — delete a notification.

##### [NEW] `backend/src/modules/notifications/notifications.module.ts`
- Standard NestJS module setup.

##### [MODIFY] `backend/src/app.module.ts`
- Register `NotificationsModule`.

##### [MODIFY] `backend/src/modules/alerts/alerts.service.ts`
- When `checkLowStock()` generates a new alert, also create a notification via `NotificationsService`.

##### [MODIFY] `backend/src/modules/sales/sales.service.ts`
- After a sale completes, create a notification for admin users (e.g., "New sale completed: $XX.XX").

#### Frontend

##### [NEW] `frontend/src/components/NotificationBell.tsx`
- A bell icon (from lucide-react `Bell` icon) placed in the header.
- Shows an animated badge with unread count.
- On click, toggles a dropdown panel with recent notifications.
- Each notification card shows: icon (by type), title, message, time ago, action buttons (mark read / delete).
- "Mark All as Read" button at the top of the panel.
- Polls `/notifications/unread-count` every 30 seconds to update the badge.
- On open, fetches full notification list from `/notifications`.

##### [MODIFY] `frontend/src/layouts/DashboardLayout.tsx`
- Add `<NotificationBell />` component in the header, between the session info and the user avatar.

---

## 6. Dashboard Trending / Analytics Visuals

### Description
Add trending medicine analytics to the Dashboard. The system analyzes sales data and displays:
- **Top Selling Medicines** — bar or horizontal bar chart showing the most sold medicines.
- **Least Selling Medicines** — to identify slow-moving stock.
- **Sales Trend** — line chart showing daily/weekly sales over time.
- **Revenue Summary** — a compact widget showing today's, this week's, and this month's revenue comparison.

### Current State
- Dashboard (`Dashboard.tsx`) shows: 5 stat cards, recent transactions list, and critical stock status.
- No charts or graphs exist on the dashboard.
- No trending data API exists.

### Technical Approach

#### Backend

##### [MODIFY] `backend/src/modules/reporting/reporting.service.ts`
- Add `getTrendingMedicines(limit: number)`:
  - Query `sale_items` grouped by `medicine_id`, summing `quantity`.
  - Join with `medicine` table to get names.
  - Order by total quantity DESC. Return top N.
- Add `getLeastSellingMedicines(limit: number)`:
  - Same query but order ASC, filtering out medicines with 0 sales from the medicines table.
- Add `getSalesTrend(days: number)`:
  - Query sales grouped by date (for the last N days).
  - Return array of `{ date, totalSales, totalRevenue }`.
- Add `getRevenueComparison()`:
  - Compute: today's revenue, this week's, this month's, previous month's. Return all for comparison.

##### [MODIFY] `backend/src/modules/reporting/reporting.controller.ts`
- Add endpoints:
  - `GET /reporting/trending-medicines?limit=10`
  - `GET /reporting/least-selling?limit=10`
  - `GET /reporting/sales-trend?days=30`
  - `GET /reporting/revenue-comparison`

#### Frontend

##### [MODIFY] `frontend/src/pages/Dashboard.tsx`
- Add a new row below the stat cards with 2-3 chart widgets:
  1. **Trending Medicines** — horizontal bar chart (using recharts `BarChart` or `ResponsiveContainer`).
  2. **Sales Trend** — line chart (using recharts `LineChart`).
  3. **Revenue Overview** — compact cards comparing today vs. week vs. month with percentage change indicators.
- Optionally add **Least Selling Medicines** as a small list widget.
- Fetch data from the new endpoints on mount.

##### [DEPENDENCY] `recharts` (installed in Feature #3)

---

## 7. Merge Patient & Prescription Pages

### Description
Combine the Patient page (`Patients.tsx`) and Prescription page (`Prescriptions.tsx`) into a single unified "Patient" page. All features from both pages must be preserved:
- Patient registration, search, directory (card grid).
- Patient history modal (prescriptions + sales timeline).
- Prescription creation, listing, viewing.

### Current State
- `Patients.tsx` (381 lines): Patient cards with search, register modal, history modal.
- `Prescriptions.tsx` (314 lines): Prescription list with create modal.
- Two separate routes: `/patients` and `/prescriptions`.
- Sidebar has separate entries for both.

### Technical Approach

#### Frontend

##### [MODIFY] `frontend/src/pages/Patients.tsx`
- Add a **tabbed interface** at the top: "Patient Directory" | "Prescriptions".
- **Patient Directory tab**: Keep existing functionality (cards, search, register, history modal).
- **Prescriptions tab**: Move the prescription listing and creation logic from `Prescriptions.tsx` into this tab.
  - Prescription list with create modal.
  - All prescription state management (formData, medicines/patients fetching, addItem/removeItem, handleSubmit).
- Both tabs share the same patient data fetch, so prescriptions tab can pre-populate patient options.

##### [DELETE] `frontend/src/pages/Prescriptions.tsx`
- Remove this file after merging all functionality into `Patients.tsx`.

##### [MODIFY] `frontend/src/App.tsx`
- Remove the `/prescriptions` route.
- Keep `/patients` route as-is.

##### [MODIFY] `frontend/src/layouts/DashboardLayout.tsx`
- Remove "Prescriptions" from `allMenuItems`.
- Rename "Patients" label to "Patient" (singular, to match user's request).

#### Backend
- **No changes needed**. The `/patients` and `/prescriptions` APIs remain separate. The frontend just calls both from one page.

---

## Dependencies Summary

| Package | Location | Purpose |
|---------|---------|---------|
| `recharts` | Frontend | Charts for dashboard and reports |
| `docx` | Backend | Word document export |
| `@types/multer` | Backend | File upload typing |

---

## New File Summary

| File | Type | Purpose |
|------|------|---------|
| `frontend/src/components/ColumnFilter.tsx` | Component | Reusable dropdown column filter |
| `frontend/src/components/NotificationBell.tsx` | Component | Header notification bell + dropdown |
| `frontend/src/pages/Reports.tsx` | Page | Dedicated reports page |
| `backend/src/modules/notifications/` | Module | Full notification module (entity, service, controller, module) |

---

## File Modification Summary

| File | Features |
|------|----------|
| `frontend/src/pages/Medicines.tsx` | #1 (column filter), #2 (Excel import) |
| `frontend/src/pages/Batches.tsx` | #1 (column filter), #2 (Excel import) |
| `frontend/src/pages/SalesLog.tsx` | #1 (column filter) |
| `frontend/src/pages/Dashboard.tsx` | #6 (trending analytics) |
| `frontend/src/pages/Patients.tsx` | #7 (merge prescriptions) |
| `frontend/src/App.tsx` | #3 (reports route), #7 (remove prescriptions route) |
| `frontend/src/layouts/DashboardLayout.tsx` | #3 (reports menu), #5 (notification bell), #7 (remove prescriptions menu) |
| `backend/src/modules/reporting/reporting.service.ts` | #3 (reports), #4 (profit/loss), #6 (trending) |
| `backend/src/modules/reporting/reporting.controller.ts` | #3 (report endpoints), #6 (trending endpoints) |
| `backend/src/modules/medicines/medicines.controller.ts` | #2 (import endpoint) |
| `backend/src/modules/medicines/medicines.service.ts` | #2 (import logic) |
| `backend/src/modules/batches/batches.controller.ts` | #2 (import endpoint) |
| `backend/src/modules/batches/batches.service.ts` | #2 (import logic) |
| `backend/src/modules/alerts/alerts.service.ts` | #5 (trigger notifications) |
| `backend/src/modules/sales/sales.service.ts` | #5 (trigger notifications) |
| `backend/src/app.module.ts` | #5 (register notifications module) |

---

## Execution Order (Recommended)

1. **Feature #7** — Merge Patient & Prescription (independent, reduces page count early)
2. **Feature #1** — Column Filtering (reusable component, purely frontend)
3. **Feature #5** — In-App Notifications (backend entity + frontend component)
4. **Feature #2** — Excel Import (backend + frontend)
5. **Features #3 + #4** — Reports Page + Profit/Loss (tightly coupled, backend heavy)
6. **Feature #6** — Dashboard Trending Analytics (depends on recharts from #3)

---

## Verification Plan

### Automated / Build Verification
- **TypeScript Compilation**: Run `npm run build` in both `frontend/` and `backend/` to ensure no compile errors after each feature.
- **Backend Lint**: Run `npm run lint` in `backend/` to catch style issues.
- **Backend Unit Tests**: Run `npm test` in `backend/` — existing tests should continue to pass.

### Manual Verification (per feature)

**Feature #1 — Column Filtering**:
1. Navigate to `/medicines` page.
2. Click the "Medicine Name" column header → verify a dropdown appears with all unique medicine names.
3. Select one medicine name → verify the table filters to only show that medicine.
4. Click the "Status" column header → verify dropdown with "Low Stock" and "In Stock".
5. Select "Low Stock" while a medicine name filter is active → verify combined AND filter works.
6. Click "All" in any dropdown → verify the filter is cleared for that column.

**Feature #2 — Excel Import**:
1. Prepare a test `.xlsx` file with columns: `name`, `generic_name`, `category`, `unit`, `minimum_stock_level`, `is_controlled`.
2. Navigate to `/medicines` → click "Import Excel" → select the file.
3. Verify the import summary modal shows created count.
4. Verify the new medicines appear in the table.
5. Repeat for Batches with: `medicine_name`, `batch_number`, `expiry_date`, `purchase_price`, `selling_price`, `initial_quantity`.

**Feature #3 — Reports Page**:
1. Navigate to `/reports` (or click "Reports" in sidebar).
2. Select "Sales" report type → verify sales data table loads.
3. Change date filter to "This Month" → verify data updates.
4. Click "Export Excel" → verify `.xlsx` file downloads.
5. Click "Export PDF" → verify `.pdf` file downloads.
6. Click "Export Word" → verify `.docx` file downloads.
7. Repeat for other report types (Medicines, Batches, Profit & Loss).

**Feature #4 — Profit & Loss**:
1. On the Reports page, select "Profit & Loss" tab.
2. Verify summary cards show: Total Revenue, Total Cost, Gross Profit, Margin %.
3. Verify the chart displays profit over time.
4. Change date range → verify numbers update accordingly.

**Feature #5 — In-App Notifications**:
1. Check the header bar for a bell icon with a badge.
2. Trigger a low stock alert (sell enough to hit minimum stock level).
3. Verify the badge count increases.
4. Click the bell → verify the notification dropdown opens with the new notification.
5. Click "Mark as Read" on a notification → verify it visually changes.
6. Click "Delete" on a notification → verify it disappears.
7. Click "Mark All as Read" → verify all notifications are marked read and badge resets.

**Feature #6 — Dashboard Analytics**:
1. Navigate to the Dashboard.
2. Verify the "Trending Medicines" bar chart appears with data (requires existing sales data).
3. Verify the "Sales Trend" line chart shows the last 30 days.
4. Verify revenue comparison cards show today vs week vs month.

**Feature #7 — Patient/Prescription Merge**:
1. Verify `/patients` page now has two tabs: "Patient Directory" and "Prescriptions".
2. On the "Patient Directory" tab, verify all patient features work (search, register, view history, delete).
3. Switch to "Prescriptions" tab → verify prescription list loads.
4. Click "New Prescription" → verify the create modal opens with patient/medicine dropdowns.
5. Create a prescription → verify it appears in the list.
6. Navigate to `/prescriptions` → verify it redirects or shows 404 (route removed).
7. Verify the sidebar no longer shows "Prescriptions" as a separate item.
