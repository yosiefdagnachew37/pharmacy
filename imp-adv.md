# Enterprise Pharmacy Intelligence Platform — Advanced Implementation Plan

## Vision Statement

Transform the current Pharmacy Management System from an operational CRUD + Reporting platform into a **Fully Integrated Intelligent Pharmacy ERP** with Predictive Inventory, Procurement Optimization, Financial Intelligence, Customer Credit Management, Compliance Monitoring, and Enterprise FEFO (First Expiry, First Out) enforcement.

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

## Phase 5 — Advanced POS, Credit Sales & Receipt Printing

> **Priority: MEDIUM-HIGH** — Speeds up checkout, enables credit sales, and provides professional receipts.

### 5.1 POS Enhancements (`POS.tsx` Upgrade)

- **Barcode Scan Input**: Auto-focused text field, barcode scanner acts as keyboard
- **Quick Add**: Scan → auto-add to cart (duplicate scan increments quantity)
- **Sound Feedback**: Audio confirmation on successful scan
- **Split Payments**: Support partial Cash + Card + Credit combinations
- **Refund Processing**: Process returns with stock re-entry
- **Controlled Drug Prompt**: Modal confirmation for `is_controlled = true` medicines requiring prescription reference
- **Discount Application**: Per-item and per-cart discount support
- **Credit Sale Toggle**: When payment method = CREDIT, prompt for customer info and credit terms
- **Cheque Payment**: When payment = CHEQUE, capture bank name, cheque number, amount, due date

### 5.2 Flexible Price Management

The owner must be able to **update the selling price at any time**, regardless of the original purchase price.

#### [MODIFY] `medicine.entity.ts`
```
+ current_selling_price: decimal (nullable)  — Owner-set selling price override
```

**Pricing Logic**:
- If `medicine.current_selling_price` is set → use it for all POS transactions
- Else → fall back to `batch.selling_price` (batch-level price)
- Purchase price history is maintained separately in `price_history` table (Phase 2)
- Owner can update `current_selling_price` from the Medicine edit modal at any time

#### [NEW] Price editing UI in `Medicines.tsx`
- New "Update Price" quick-action button on each medicine row
- Modal shows: current selling price, last purchase price, suggested margin %, and a field to enter new price
- Price change is logged in the audit trail

### 5.3 Receipt Printing

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

### 5.4 QR Code Generation

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

## Phase 7 — Financial Intelligence & Expense Management

> **Priority: HIGH** — True profit visibility, daily expense tracking, and working capital monitoring.

### 7.1 Comprehensive Expense Tracking Module

The owner needs to record **all pharmacy expenses** and see them reflected in daily profit.

#### [NEW] `expense.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| name | string | Expense name (e.g., "Office Rent") |
| category | enum | RENT, SALARY, ELECTRICITY, WATER, INTERNET, MAINTENANCE, MISC |
| amount | decimal | Expense amount (ETB) |
| frequency | enum | MONTHLY, WEEKLY, DAILY, ONE_TIME |
| description | text (nullable) | Additional details |
| expense_date | date | Date incurred (for one-time) or period start |
| receipt_reference | string (nullable) | External receipt number |
| is_recurring | boolean (default: false) | Auto-applies to daily calculations |
| created_by | UUID (FK) | User who recorded |
| created_at | timestamp | Record creation |

#### [NEW] `Expenses.tsx` (Frontend Page)
- Full CRUD for expense records
- Toggle between recurring (monthly/weekly) and one-time expenses
- Category-based color coding and icons
- Monthly expense summary bar chart

### 7.2 Daily Profit Calculation

The system calculates **true daily profit** by amortizing recurring expenses:

```
Daily Profit = Total Daily Sales Revenue
             − Cost of Medicines Sold (COGS for the day)
             − Daily Amortized Expenses
             − Daily Expiry Loss (if any)
```

**Daily Expense Amortization Logic**:
```
For each recurring expense:
  If frequency = MONTHLY  → daily_cost = amount / 30
  If frequency = WEEKLY   → daily_cost = amount / 7
  If frequency = DAILY    → daily_cost = amount
  If frequency = ONE_TIME → daily_cost = 0 (counted on expense_date only)

Total Daily Expected Expense = SUM(all daily_cost values)
```

**Example**:
| Expense | Monthly Amount | Daily Cost |
| :--- | :--- | :--- |
| Rent | 3,000 ETB | 100 ETB/day |
| Salary (3 staff) | 6,000 ETB | 200 ETB/day |
| Electricity | 900 ETB | 30 ETB/day |
| Water | 300 ETB | 10 ETB/day |
| Internet | 600 ETB | 20 ETB/day |
| **Total** | **10,800 ETB** | **360 ETB/day** |

### 7.3 Expected Daily Expense Dashboard Widget

New widget on `Dashboard.tsx` showing:
- **Today's Expected Expense**: Sum of all amortized recurring costs
- **Breakdown table**: Each expense → monthly amount → daily equivalent
- **Today's Profit So Far**: Live calculation = Today's Sales − Today's COGS − Today's Expected Expense

### 7.4 True Net Profit Calculation

```
Net Profit (Period) = Gross Profit
                    − Operating Expenses (amortized)
                    − Expiry Loss (value of expired/locked stock)
                    − Shrinkage Loss (audit variance adjustments)
```

### 7.5 Financial Reports (Enhanced)

- **Daily Profit Report**: Revenue, COGS, expenses, and net profit for each day
- **Monthly P&L with expense breakdown** (graph + table)
- **Profit Margin per Medicine** (identify top/bottom performers)
- **Top 20% Revenue Contributors** (Pareto analysis)
- **Inventory Turnover Ratio**: `COGS ÷ Average Inventory`
- **Expense Trend Report**: Month-over-month expense comparison

### 7.6 Working Capital Dashboard Widget

Display:
- Total Inventory Value (at cost)
- Outstanding Payables (to suppliers)
- Outstanding Receivables (from credit customers)
- Cash Position estimate
- Inventory Turnover Ratio

### 7.7 Supplier Payment Tracking

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

## Phase 11 — Customer Credit Management

> **Priority: HIGH** — Enables selling on credit and cheque, critical for cash flow management.

### 11.1 Overview

The pharmacy frequently sells to customers on credit or accepts cheques. The system must track every credit sale, the customer's outstanding balance, and alert the owner before payment deadlines.

### 11.2 New Database Entities

#### [NEW] `credit-customer.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| name | string | Customer full name |
| phone | string | Phone number |
| address | text (nullable) | Customer address |
| total_credit_given | decimal | Lifetime credit issued |
| total_paid | decimal | Lifetime payments received |
| outstanding_balance | decimal | Computed: total_credit_given − total_paid |
| is_active | boolean | Active flag |
| created_at | timestamp | Registration date |

#### [NEW] `credit-sale.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| sale_id | UUID (FK) | Linked sale transaction |
| credit_customer_id | UUID (FK) | Who owes |
| total_amount | decimal | Credit amount |
| amount_paid | decimal (default: 0) | How much repaid so far |
| due_date | date | Payment deadline |
| status | enum | PENDING, PARTIALLY_PAID, PAID, OVERDUE |
| payment_method | enum | CASH_LATER, CHEQUE |
| created_by | UUID (FK) | Cashier who created |
| created_at | timestamp | Sale date |

#### [NEW] `cheque-record.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| credit_sale_id | UUID (FK) | Linked credit sale |
| bank_name | string | Issuing bank |
| cheque_number | string | Cheque reference number |
| cheque_amount | decimal | Amount on cheque |
| deposit_deadline | date | When to deposit |
| is_deposited | boolean | Has it been deposited? |
| deposit_date | date (nullable) | When actually deposited |
| status | enum | PENDING, DEPOSITED, BOUNCED, CLEARED |
| created_at | timestamp | Record creation |

#### [NEW] `credit-payment.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| credit_sale_id | UUID (FK) | Which credit sale is being paid |
| amount | decimal | Payment amount |
| payment_method | enum | CASH, CHEQUE, BANK_TRANSFER |
| received_by | UUID (FK) | User who received payment |
| notes | text (nullable) | Additional notes |
| created_at | timestamp | Payment date |

### 11.3 Credit Sale Workflow

1. **At POS checkout** → Select payment method: Cash | Credit | Cheque
2. **If Credit** → Search existing credit customers or register new one (name, phone, address)
3. **Record credit details**: total amount, due date
4. **If Cheque** → Capture: bank name, cheque number, cheque amount, deposit deadline
5. **Sale is completed** → Stock deducted, credit record created
6. **Credit Payment** → Owner records partial or full payments over time
7. **Status auto-updates**: PENDING → PARTIALLY_PAID → PAID (or OVERDUE if past due_date)

### 11.4 Credit & Cheque Alerts

| Alert Type | Trigger | Notification |
| :--- | :--- | :--- |
| Credit Payment Due | 3 days before due_date | "Credit payment of X ETB from [Customer] is due on [date]" |
| Credit Overdue | due_date passed + unpaid | "OVERDUE: [Customer] owes X ETB, was due [date]" |
| Cheque Deposit Reminder | 2 days before deposit_deadline | "Deposit cheque #[number] from [bank] for X ETB before [date]" |
| Cheque Bounced | Manual flag by owner | "ALERT: Cheque #[number] from [bank] has bounced" |

Alerts run as a **daily cron job** and create in-app notifications.

### 11.5 Frontend Pages

#### [NEW] `CreditManagement.tsx`
- **Credit Dashboard**: Total outstanding credit, overdue amount, upcoming due dates
- **Customer Credit List**: All credit customers with balances, sortable and filterable
- **Credit Sale Details**: Per-sale view with payment history timeline
- **Record Payment**: Modal to register incoming payments
- **Cheque Tracker**: Separate tab showing all cheques with deposit status

### 11.6 Credit Reports

- **Outstanding Credit Report**: All unpaid credit sales grouped by customer
- **Overdue Report**: Aged receivables (0-30 days, 30-60 days, 60+ days)
- **Cheque Status Report**: Pending, deposited, cleared, bounced cheques
- **Customer Credit History**: Full transaction log per customer

---

## Phase 12 — Purchase Recording & Payment Tracking

> **Priority: HIGH** — Complete purchase-to-payment lifecycle with credit and cheque support.

### 12.1 Overview

When the pharmacy buys medicines from suppliers, the system must record **all purchase details** and track the payment method (Cash, Credit, Cheque). This enables accurate **Purchase vs Sales Analysis**.

### 12.2 Enhancements to Purchase Order (Phase 3)

#### [MODIFY] `purchase-order.entity.ts`
Add payment tracking fields:
```
+ payment_method: enum (CASH, CREDIT, CHEQUE)
+ payment_status: enum (PAID, PENDING, PARTIALLY_PAID)
+ total_paid: decimal (default: 0)
```

#### [NEW] `purchase-cheque.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| purchase_order_id | UUID (FK) | Linked PO |
| bank_name | string | Cheque issuing bank |
| cheque_number | string | Cheque reference |
| cheque_amount | decimal | Amount |
| payment_deadline | date | When payment is due |
| is_deposited | boolean | Supplier deposited? |
| status | enum | PENDING, DEPOSITED, CLEARED |
| created_at | timestamp | Record creation |

#### [NEW] `supplier-credit.entity.ts`
| Field | Type | Description |
| :--- | :--- | :--- |
| id | UUID (PK) | Primary key |
| purchase_order_id | UUID (FK) | Linked PO |
| supplier_id | UUID (FK) | Supplier owed to |
| total_amount | decimal | Credit amount |
| amount_paid | decimal | Paid so far |
| due_date | date | Payment deadline |
| status | enum | PENDING, PARTIALLY_PAID, PAID, OVERDUE |

### 12.3 Purchase Payment Alerts

| Alert Type | Trigger | Notification |
| :--- | :--- | :--- |
| Supplier Payment Due | 3 days before due_date | "Payment of X ETB to [Supplier] due on [date]" |
| Supplier Payment Overdue | due_date passed | "OVERDUE: X ETB owed to [Supplier] since [date]" |
| Cheque Deposit Warning | 2 days before deadline | "Supplier [name] will deposit cheque #[num] for X ETB on [date]" |

### 12.4 Purchase Information Recorded

For every purchase, the system records:
- Medicine name (linked to medicine entity)
- Batch number (auto-generated or manual)
- Quantity purchased
- Purchase price per unit
- Total purchase amount
- Supplier name (linked to supplier entity)
- Purchase date
- Expiration date
- Payment method (Cash / Credit / Cheque)
- If cheque: bank name, cheque number, cheque amount, payment deadline

---

## Phase 13 — Purchase vs Sales Analysis & Dormant Stock Intelligence

> **Priority: HIGH** — Answers the critical question: "Am I making money?"

### 13.1 Purchase vs Sales Comparison

The owner needs to see at a glance:
- **How much money was spent buying medicines** (monthly/weekly/daily)
- **How much money was earned from sales** (same periods)
- **Profit estimation** after subtracting expenses

#### [NEW] `PurchaseAnalysis.tsx` (or tab in Reports)

| Metric | January | February | March |
| :--- | :--- | :--- | :--- |
| Total Purchases | 45,000 ETB | 38,000 ETB | 42,000 ETB |
| Total Sales | 62,000 ETB | 55,000 ETB | 60,000 ETB |
| Gross Profit | 17,000 ETB | 17,000 ETB | 18,000 ETB |
| Operating Expenses | 10,800 ETB | 10,800 ETB | 10,800 ETB |
| **Net Profit** | **6,200 ETB** | **6,200 ETB** | **7,200 ETB** |

With interactive bar charts comparing purchase vs sales monthly.

### 13.2 Smart Restock Suggestions

The system suggests what medicines to buy next month based on:
- **Last month's sales** (demand signal)
- **Current stock levels** (supply signal)
- **Fast-moving medicines** (velocity ranking)
- **Expiry risk** (don't buy if current stock is at risk)

Displayed as a "Suggested Purchase List" with recommended quantities and preferred suppliers.

### 13.3 Dormant Medicine Detection & Alerts

Dormant medicine = medicines that remain in stock but **have not been sold for X days** (configurable, default: 60 days).

#### Detection Criteria
```
Dormant if:
  Last sale date > X days ago
  AND current stock > 0
```

#### [NEW] Dashboard Widget: "Dormant Stock Alert"
Example:
| Medicine | Last Sold | Days Dormant | Current Stock | Action |
| :--- | :--- | :--- | :--- | :--- |
| Paracetamol 500mg | 90 days ago | 90 | 200 units | Suggest discount |
| Vitamin C 1000mg | 65 days ago | 65 | 150 units | Monitor |

#### Automated Actions
- **60+ days**: Flag as "Dormant" in dashboard, yellow warning
- **90+ days**: Alert notification to owner, suggest discount or supplier return
- **120+ days**: Critical alert, include in dead stock report

#### [NEW] `DormantStock.tsx` (or tab in Reports)
- Full dormant stock report with last sale date, stock value, and suggested actions
- Export to Excel/PDF

---

## Phase 14 — Comprehensive Reporting Suite Upgrade

> **Priority: HIGH** — The owner needs instant access to all operational data.

### 14.1 Sales Reports

| Report | Description | Filters |
| :--- | :--- | :--- |
| Daily Sales | All sales for a specific day | Date picker |
| Weekly Sales | Aggregated by week | Week selector |
| Monthly Sales | Aggregated by month | Month/Year |
| Yearly Sales | Annual summary | Year |
| Sales by Medicine | Per-medicine revenue breakdown | Date range |
| Sales by Cashier | Per-user sales performance | Date range, User |

### 14.2 Financial Reports

| Report | Description | Filters |
| :--- | :--- | :--- |
| Daily Profit | Revenue − COGS − Daily expenses | Date picker |
| Monthly P&L | Full profit & loss statement | Month/Year |
| Expense Report | All expenses by category and frequency | Date range, Category |
| Credit Report | Outstanding receivables + aging | Status, Customer |
| Purchase Report | All purchases by supplier, period | Date range, Supplier |
| Purchase vs Sales | Side-by-side comparison | Date range |

### 14.3 Inventory Reports

| Report | Description | Filters |
| :--- | :--- | :--- |
| Low Stock | Medicines below minimum level | Category |
| Expired Medicines | Locked/expired batches | Date range |
| Near Expiration | Batches expiring within X days | Days threshold |
| Dormant Medicines | Not sold for X+ days | Days threshold |
| Stock Valuation | Total inventory value at cost | Category |
| FEFO Compliance | % of sales following FEFO order | Date range |

### 14.4 Credit & Payment Reports

| Report | Description | Filters |
| :--- | :--- | :--- |
| Customer Credit Outstanding | Unpaid balances by customer | Status |
| Aged Receivables | 0-30, 30-60, 60+ day breakdown | — |
| Supplier Payables | Outstanding supplier payments | Supplier, Status |
| Cheque Tracker | All cheques with status | Status, Bank |

### 14.5 Export Formats

All reports support export in:
- **Excel (.xlsx)** — for data analysis
- **PDF (.pdf)** — for printing and archiving
- **Word (.docx)** — for editable documentation

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
| 3 | Deploy Phase 2-3 (Supplier + PO + Purchase Recording) as independent modules | Zero — new functionality |
| 4 | Deploy Phase 11 (Customer Credit) alongside POS upgrade | Low — new payment method |
| 5 | Deploy Phase 7 (Expenses + Daily Profit) | Zero — additive |
| 6 | Enable Forecasting in read-only mode (Phase 4) | Zero — background process |
| 7 | After validation → Activate auto-recommendations + Dormant alerts | Low |
| 8 | Deploy Phase 14 (Full Reporting Suite) | Zero — read-only reports |

---

## Implementation Timeline Estimate

| Phase | Scope | Estimated Effort |
| :--- | :--- | :--- |
| **Phase 1** | FEFO Framework + Expiry Intelligence | 3–4 days |
| **Phase 2** | Supplier Management | 2–3 days |
| **Phase 3** | Purchase Orders + Goods Receipt | 3–4 days |
| **Phase 4** | Forecasting Engine + Recommendations + Dormant Detection | 2–3 days |
| **Phase 5** | POS Upgrades + Credit Sales + Flexible Pricing + Receipt Printing | 3–4 days |
| **Phase 6** | Barcode/QR + Stock Audit | 1–2 days |
| **Phase 7** | Financial Intelligence + Expense Tracking + Daily Profit | 3–4 days |
| **Phase 8** | Compliance Monitoring | 1–2 days |
| **Phase 9** | Anomaly Detection | 1–2 days |
| **Phase 10** | Multi-Branch Schema Prep | 0.5 day |
| **Phase 11** | Customer Credit Management + Cheque Tracking | 2–3 days |
| **Phase 12** | Purchase Recording & Supplier Payment Tracking | 2–3 days |
| **Phase 13** | Purchase vs Sales Analysis + Dormant Stock UI | 1–2 days |
| **Phase 14** | Comprehensive Reporting Suite Upgrade | 2–3 days |

**Total Estimated: 26–38 working days**

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
3. Credit sale cycle: POS → Credit/Cheque → Customer record → Payment tracking → Alert on due date → Cleared
4. Purchase with cheque: PO → Cheque details → Deposit reminder → Cleared/Bounced tracking
5. Daily profit: Sales − COGS − Amortized expenses = Daily profit → Dashboard widget
6. Dormant detection: No sales for 60+ days → Alert → Discount suggestion → Report
7. Purchase vs Sales: Monthly comparison → Restock suggestion → PO creation
8. Fraud detection: Simulated anomaly → Alert generation → Audit log verification
9. Controlled substance: Attempt FEFO override → Blocked → Audit logged
