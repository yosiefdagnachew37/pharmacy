# Enterprise Pharmacy Intelligence Platform — Advanced Implementation Plan

## Vision Statement

Transform the current Pharmacy Management System from an operational CRUD + Reporting platform into a **Fully Integrated Intelligent Pharmacy ERP** with Predictive Inventory, Procurement Optimization, Financial Intelligence, Compliance Monitoring, and Enterprise FEFO (First Expiry, First Out) enforcement.

---

## Current System Baseline

The existing system already provides:
- Medicine & Batch CRUD with Excel import
- FIFO stock issuance via `StockService.issueStock()`
- POS with cart, checkout, and receipt numbers
- Patient & Prescription management
- Multi-format reporting (Excel, PDF, Word)
- In-app notifications, audit logging, and system backups
- RBAC with 4 roles (Admin, Pharmacist, Cashier, Auditor)

All new features build **on top of** this foundation without breaking existing functionality.

---

## Phase 1 — Enterprise FEFO Framework & Batch Intelligence

> **Priority: CRITICAL** — Eliminates expiry losses, the #1 financial risk in pharmacy operations.

### 1.1 Database Schema Changes

#### [MODIFY] `batch.entity.ts`
Add fields to enforce FEFO and expiry locking:
```
+ is_locked: boolean (default: false)     — Prevents sale of expired batches
+ is_quarantined: boolean (default: false) — Manual hold flag
+ supplier_id: string (nullable, FK)       — Links to future Supplier entity
+ notes: string (nullable)                 — Batch-level notes
```

#### [MODIFY] `medicine.entity.ts`
Add barcode infrastructure and procurement fields:
```
+ barcode: string (unique, nullable)       — EAN/UPC barcode
+ sku: string (unique, nullable)           — Internal stock-keeping unit
+ supplier_barcode: string (nullable)      — Supplier's own barcode
+ preferred_supplier_id: string (nullable) — Default supplier FK
```

#### [MODIFY] `stock-transaction.entity.ts`
Add FEFO override tracking:
```
+ is_fefo_override: boolean (default: false)
+ override_reason: string (nullable)
```

### 1.2 FEFO Batch Selection (Replaces current FIFO)

**Current**: `StockService.issueStock()` sorts by `expiry_date ASC` and skips expired batches.

**Upgrade**: Replace with deterministic FEFO allocation engine:

```sql
-- Atomic FEFO batch selection query
SELECT * FROM batches
WHERE medicine_id = :medicineId
  AND quantity_remaining > 0
  AND is_locked = FALSE
  AND is_quarantined = FALSE
  AND expiry_date > CURRENT_DATE
ORDER BY expiry_date ASC, created_at ASC
FOR UPDATE;  -- Row-level lock for concurrency
```

Key changes:
- Add `is_locked` and `is_quarantined` checks
- Add `FOR UPDATE` for transactional safety under concurrent POS usage
- Reject if batch expires within 24 hours (configurable threshold)

### 1.3 Automated Expired Batch Locking

**New Cron Job** (runs every hour via `@nestjs/schedule`):
```sql
UPDATE batches
SET is_locked = TRUE
WHERE expiry_date <= CURRENT_DATE
  AND is_locked = FALSE;
```
- Creates an alert for each newly locked batch
- Logs the action in the audit trail

### 1.4 FEFO Manual Override (Admin Only)

Allow pharmacist to manually override FEFO batch selection:
- Must provide a reason (mandatory text field)
- Logged as `FEFO_OVERRIDE` in `StockTransaction`
- **Blocked entirely for controlled substances** (`medicine.is_controlled = true`)

### 1.5 Expiry Risk Scoring Engine

#### [NEW] `expiry-intelligence.service.ts`

```
Expiry Risk Score = (Current Stock / Avg Daily Sales) ÷ Days Until Expiry
```

| Score | Status | Automated Action |
| :--- | :--- | :--- |
| < 0.5 | Safe | None |
| 0.5 – 1.0 | Monitor | Dashboard highlight |
| 1.0 – 2.0 | High Risk | Alert + Discount suggestion |
| > 2.0 | Critical | Alert + Block new purchase + Suggest supplier return |

### 1.6 Dashboard Widgets (Expiry Intelligence)

Add to `Dashboard.tsx`:
- **Total Inventory at Expiry Risk** (currency value)
- **% of Inventory Near Expiry** (gauge chart)
- **Top 10 Expiry Risk Medicines** (ranked list)
- **Predicted Expiry Loss (Next 30 Days)** (projected financial impact)

### 1.7 FEFO Reporting

#### [NEW] Report types in `ReportingService`:
- **FEFO Compliance Report**: % of sales that followed FEFO vs. overrides
- **Expiry Loss Report**: Actual and projected losses from expired stock
- **Batch Turnover Report**: Days-to-sell per batch, identifying slow movers

---

## Phase 2 — Supplier Management Module

> **Priority: HIGH** — Enables strategic, data-driven procurement.

### 2.1 New Database Entities

#### [NEW] `supplier.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| name | string | Company name |
| contact_person | string | Primary contact |
| phone | string | Phone number |
| email | string | Email address |
| address | text | Full address |
| credit_limit | decimal | Maximum credit (ETB) |
| payment_terms | enum | NET_15, NET_30, NET_60, COD |
| average_lead_time | int | Average delivery days |
| is_active | boolean | Active/inactive toggle |
| created_at | timestamp | Record creation date |

#### [NEW] `supplier-contract.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| supplier_id | UUID (FK) | Linked supplier |
| effective_date | date | Contract start |
| expiry_date | date | Contract end |
| discount_percentage | decimal | Agreed discount |
| return_policy | text | Return terms |
| notes | text | Additional terms |

#### [NEW] `supplier-performance.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| supplier_id | UUID (FK) | Linked supplier |
| period | string | e.g., "2026-03" |
| on_time_deliveries | int | Count |
| total_deliveries | int | Count |
| price_variance | decimal | Price stability metric |
| returned_items | int | Items returned |
| total_items | int | Items received |
| quality_rating | decimal | 1.0 – 5.0 |
| computed_score | decimal | Auto-calculated |

#### [NEW] `price-history.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| medicine_id | UUID (FK) | Linked medicine |
| supplier_id | UUID (FK) | Linked supplier |
| unit_price | decimal | Purchase price |
| recorded_at | timestamp | When price was recorded |

### 2.2 Supplier Performance Scoring Algorithm

```
Supplier Score =
  (Delivery Reliability × 0.35)
  + (Price Stability × 0.25)
  + (Credit Flexibility × 0.15)
  + (Return Cooperation × 0.15)
  + (Quality Rating × 0.10)

Where:
  Delivery Reliability = on_time_deliveries / total_deliveries
  Price Stability = 1 - normalized_price_variance
  Return Cooperation = 1 - (returned_items / total_items)
  Credit Flexibility = normalized(credit_limit / avg_order_value)
  Quality Rating = quality_rating / 5.0
```

### 2.3 Frontend Pages

#### [NEW] `Suppliers.tsx`
- Supplier directory with CRUD
- Performance score badges (color-coded: green ≥ 0.8, amber ≥ 0.6, red < 0.6)
- Price history charts per medicine
- Contract status indicators

#### [NEW] `SupplierDetail.tsx`
- Full profile with contracts, performance history, and price trends
- Multi-supplier price comparison table per medicine

### 2.4 Supplier Ranking Dashboard Widget

Show Top 5 suppliers by composite score on the main Dashboard.

---

## Phase 3 — Intelligent Purchase Order Module

> **Priority: HIGH** — Automates procurement and prevents over-purchasing.

### 3.1 New Database Entities

#### [NEW] `purchase-order.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| po_number | string (unique) | Auto-generated PO number |
| supplier_id | UUID (FK) | Target supplier |
| status | enum | DRAFT, APPROVED, SENT, CONFIRMED, PARTIALLY_RECEIVED, COMPLETED, CANCELLED |
| total_amount | decimal | Computed total |
| notes | text | PO notes |
| created_by | UUID (FK) | User who created |
| approved_by | UUID (FK, nullable) | User who approved |
| created_at | timestamp | Creation date |
| expected_delivery | date | Based on supplier lead time |

#### [NEW] `purchase-order-item.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| purchase_order_id | UUID (FK) | Parent PO |
| medicine_id | UUID (FK) | Medicine to order |
| quantity_ordered | int | Amount requested |
| quantity_received | int (default: 0) | Amount received so far |
| unit_price | decimal | Agreed unit cost |
| subtotal | decimal | Computed |

#### [NEW] `goods-receipt.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| purchase_order_id | UUID (FK) | Linked PO |
| received_by | UUID (FK) | User who confirmed |
| received_at | timestamp | Date/time of receipt |
| notes | text | Discrepancy notes |

Auto-creates Batch records upon goods receipt confirmation.

#### [NEW] `purchase-recommendation.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| medicine_id | UUID (FK) | Medicine to reorder |
| recommended_quantity | int | Calculated amount |
| reorder_point | int | Trigger threshold |
| safety_stock | int | Buffer quantity |
| avg_daily_sales | decimal | 30-day average |
| suggested_supplier_id | UUID (FK, nullable) | Best-scoring supplier |
| status | enum | PENDING, CONVERTED, DISMISSED |
| created_at | timestamp | Generated date |

### 3.2 Dynamic Reorder Algorithm

```
Reorder Point = (Avg Daily Sales × Lead Time) + Safety Stock

Safety Stock = Z × StdDev(Daily Sales) × √(Lead Time)
  Where Z = 1.65 (95% service level)
```

### 3.3 Over-Purchase Prevention Rule

Block PO creation if:
```
(Current Stock + Incoming PO Quantity) > (Forecasted 60-Day Demand × 1.2)
```
Display warning with projected expiry risk.

### 3.4 Frontend Pages

#### [NEW] `PurchaseOrders.tsx`
- PO list with status pipeline visualization (Draft → Completed)
- Create PO from recommendation or manually
- Multi-supplier price comparison during item selection
- Budget cap alert indicator

#### [NEW] `PurchaseRecommendations.tsx`
- Auto-generated suggestions from forecasting engine
- One-click "Convert to PO" action
- Dismiss with reason

#### [NEW] `GoodsReceipt.tsx`
- Receive against open POs
- Partial delivery support
- Auto-creates batches in the system

---

## Phase 4 — Intelligent Forecasting Engine

> **Priority: HIGH** — Powers purchase recommendations and expiry prevention.

### 4.1 Implementation Strategy

**No Python required.** All statistical modeling runs in TypeScript + PostgreSQL.

#### [NEW] `forecasting.service.ts`
Uses `simple-statistics` npm library for:
- **Simple Moving Average** (30/60/90-day windows)
- **Weighted Moving Average** (recent sales weighted higher)
- **Linear Regression** (trend detection)
- **Seasonal Index** (monthly multipliers from historical data)

#### [NEW] `forecast-result.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| medicine_id | UUID (FK) | Target medicine |
| forecast_date | date | Prediction target date |
| predicted_demand | decimal | Forecasted quantity |
| confidence_interval | decimal | ± range |
| method | enum | SMA, WMA, LINEAR_REG, SEASONAL |
| created_at | timestamp | When forecast was generated |

### 4.2 Nightly Cron Job

Using `@nestjs/schedule`:
- Runs at 2:00 AM daily
- Calculates forecasts for all active medicines
- Generates purchase recommendations where `current_stock < reorder_point`
- Updates expiry risk scores

### 4.3 Dead Stock Detection

**Criteria**: No sales in 60 days AND stock > minimum level.

**Actions**:
- Flag medicine as "Dead Stock" in dashboard
- Suggest discount or supplier return
- Include in dead stock report

---

## Phase 5 — Advanced POS & Receipt Printing

> **Priority: MEDIUM** — Speeds up checkout and provides professional receipts.

### 5.1 POS Enhancements (`POS.tsx` Upgrade)

- **Barcode Scan Input**: Auto-focused text field, barcode scanner acts as keyboard
- **Quick Add**: Scan → auto-add to cart (duplicate scan increments quantity)
- **Sound Feedback**: Audio confirmation on successful scan
- **Split Payments**: Support partial Cash + Card combinations
- **Refund Processing**: Process returns with stock re-entry
- **Controlled Drug Prompt**: Modal confirmation for `is_controlled = true` medicines requiring prescription reference
- **Discount Application**: Per-item and per-cart discount support

### 5.2 Receipt Printing

#### [NEW] `receipt.service.ts`
Structure:
```
┌──────────────────────────────┐
│     PHARMACY NAME            │
│     Address Line 1           │
│     Phone | License No.      │
├──────────────────────────────┤
│ Receipt: RX-20260304-0042    │
│ Date: 2026-03-04 11:30 AM   │
│ Cashier: pharmacist1         │
├──────────────────────────────┤
│ Item         Qty  Price  Sub │
│ Paracetamol   2   1.20  2.40│
│ Amoxicillin   1   3.50  3.50│
├──────────────────────────────┤
│ Subtotal:              5.90  │
│ Tax (15%):             0.89  │
│ TOTAL:                 6.79  │
│ Payment: Cash                │
├──────────────────────────────┤
│        [QR CODE]             │
│   Scan for verification      │
└──────────────────────────────┘
```

### 5.3 QR Code Generation

Using `qrcode` npm package:
- QR encodes: `{ saleId, receiptNo, timestamp, hash }`
- Used for customer verification and regulatory audit

---

## Phase 6 — Barcode & QR Scanning Infrastructure

> **Priority: MEDIUM** — Eliminates manual product search in POS and stock audits.

### 6.1 POS Barcode Integration

- **Option A (Primary)**: USB barcode scanner → keyboard input → auto-detect via `onKeyDown` listener
- **Option B (Optional)**: Camera-based scanning via `html5-qrcode` library

### 6.2 Stock Audit Mode

#### [NEW] `StockAudit.tsx`

Workflow:
1. Start audit session (records timestamp and auditor)
2. Scan all physical stock items
3. System compares scanned quantities vs. database quantities
4. Generate **Variance Report** (shortages, surpluses)
5. Auto-create adjustment transactions for discrepancies
6. Lock audit session (immutable after finalization)

---

## Phase 7 — Financial Intelligence Layer

> **Priority: MEDIUM** — True profit visibility and working capital monitoring.

### 7.1 Expense Tracking Module

#### [NEW] `expense.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| category | enum | RENT, UTILITIES, SALARY, MAINTENANCE, MISC |
| amount | decimal | Expense amount |
| description | text | Details |
| expense_date | date | Date incurred |
| receipt_reference | string (nullable) | External reference |
| created_by | UUID (FK) | User who recorded |
| created_at | timestamp | Record creation |

### 7.2 True Profit Calculation

```
Net Profit = Gross Profit
             − Operating Expenses
             − Expiry Loss (value of expired stock)
             − Shrinkage Loss (audit variances)
```

### 7.3 New Financial Reports

- **Monthly P&L with expense breakdown** (graph + table)
- **Profit Margin per Medicine** (identify top/bottom performers)
- **Top 20% Revenue Contributors** (Pareto analysis)
- **Inventory Turnover Ratio**: `COGS ÷ Average Inventory`

### 7.4 Working Capital Dashboard Widget

Display:
- Total Inventory Value (at cost)
- Outstanding Payables (to suppliers)
- Cash Position estimate
- Inventory Turnover Ratio

### 7.5 Supplier Payment Tracking

#### [NEW] `supplier-payment.entity.ts`
Track payments against supplier invoices, outstanding balances, and payment aging.

---

## Phase 8 — Compliance & Controlled Substance Monitoring

> **Priority: MEDIUM** — Regulatory readiness.

### 8.1 Enhanced Controlled Substance Rules

- **Mandatory prescription attachment** for `is_controlled = true` medicines
- **No FEFO override** for controlled substances
- **Special audit log flag** (`is_controlled_transaction: true`)

### 8.2 New Reports

- **Daily Narcotics Report**: All controlled substance sales with prescription references
- **Regulatory Export**: CSV/Excel format compliant with standard pharmacy regulatory requirements

---

## Phase 9 — Anomaly & Fraud Detection

> **Priority: LOW** — Advanced security layer.

### 9.1 Detection Rules

| Anomaly | Detection Method | Action |
| :--- | :--- | :--- |
| Sales spike | Z-score > 3.0 on daily sales | Alert + Audit flag |
| Stock without sale | Negative adjustments > threshold | Alert + Investigation flag |
| High refund rate | Refunds > 5% of sales per user | Alert + Manager notification |
| Unusual discounts | Discount % > 2× average per user | Alert + Audit flag |

### 9.2 Implementation

#### [NEW] `anomaly-detection.service.ts`
- Runs nightly as cron job
- Uses Z-score calculation from `simple-statistics`
- Generates `FRAUD_ALERT` type notifications

---

## Phase 10 — Multi-Branch Future-Proofing

> **Priority: LOW** — Schema preparation only, no UI changes yet.

### 10.1 Schema Addition

Add `branch_id` (UUID, nullable, default: null) to all major entities:
- `medicines`, `batches`, `sales`, `patients`, `purchase_orders`, `expenses`

#### [NEW] `branch.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| name | string | Branch name |
| address | text | Location |
| phone | string | Contact |
| is_headquarters | boolean | Main branch flag |

This enables future inter-branch transfers and centralized reporting without migration risk.

---

## Dependency & Installation Plan

### New NPM Packages (Backend)

| Package | Purpose | Phase |
| :--- | :--- | :--- |
| `@nestjs/schedule` | Cron jobs for forecasting and batch locking | 1 |
| `simple-statistics` | Statistical forecasting (SMA, regression) | 4 |
| `qrcode` | QR code generation for receipts | 5 |

### New NPM Packages (Frontend)

| Package | Purpose | Phase |
| :--- | :--- | :--- |
| `html5-qrcode` | Camera-based barcode/QR scanning (optional) | 6 |
| `react-qr-code` | QR display in receipt previews | 5 |

---

## Safe Migration Strategy

Since the system is already live:

| Step | Action | Risk |
| :--- | :--- | :--- |
| 1 | Add new tables and nullable columns only — no existing schema modification | Zero |
| 2 | Deploy Phase 1 (FEFO + Batch locking) first | Low — enhances existing flow |
| 3 | Deploy Phase 2-3 (Supplier + PO) as independent modules | Zero — new functionality |
| 4 | Enable Forecasting in read-only mode (Phase 4) | Zero — background process |
| 5 | After validation → Activate auto-recommendations | Low |
| 6 | Enable financial intelligence (Phase 7) | Zero — additive |

---

## Implementation Timeline Estimate

| Phase | Scope | Estimated Effort |
| :--- | :--- | :--- |
| **Phase 1** | FEFO Framework + Expiry Intelligence | 3–4 days |
| **Phase 2** | Supplier Management | 2–3 days |
| **Phase 3** | Purchase Orders + Goods Receipt | 3–4 days |
| **Phase 4** | Forecasting Engine + Recommendations | 2–3 days |
| **Phase 5** | POS Upgrades + Receipt Printing | 2–3 days |
| **Phase 6** | Barcode/QR + Stock Audit | 1–2 days |
| **Phase 7** | Financial Intelligence + Expenses | 2–3 days |
| **Phase 8** | Compliance Monitoring | 1–2 days |
| **Phase 9** | Anomaly Detection | 1–2 days |
| **Phase 10** | Multi-Branch Schema Prep | 0.5 day |

**Total Estimated: 18–26 working days**

---

## Verification Plan

### Per-Phase Testing
- Unit tests for all service methods (especially FEFO allocation, scoring algorithms, forecast calculations)
- Integration tests for PO → Goods Receipt → Batch creation flow
- Browser-based UI verification for all new pages
- Report accuracy validation against manual calculations

### End-to-End Scenarios
1. Full procurement cycle: Forecast → Recommendation → PO → Receipt → Batch → Sale (FEFO) → Report
2. Expiry prevention: Near-expiry batch → Alert → Discount suggestion → Prioritized sale
3. Fraud detection: Simulated anomaly → Alert generation → Audit log verification
4. Controlled substance: Attempt FEFO override → Blocked → Audit logged
