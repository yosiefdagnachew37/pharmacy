# Pharmacy System: Excel Import Complete Guide

This guide contains the column specifications and sample data for importing Medicines, Cosmetics, and Batches into the system.

---

# PART 1: Column Formats (Templates)

Use these specifications to create your Excel (.xlsx) files.

## 1. Medicines Import Format
**Target:** Medicines Page -> Import Excel
*(Includes optional initial batch details)*

| Column | Header Name | Description | Required? | Example |
| :--- | :--- | :--- | :---: | :--- |
| **A** | **Item ID (SKU)** | Internal tracking ID | **Yes** | MED-0012 |
| **B** | **Name** | Primary brand name | **Yes** | Amoxicillin 500mg |
| **C** | **Generic Name** | Scientific name | No | Amoxicillin trihydrate |
| **D** | **Dosage Form** | Physical form | No | Capsule |
| **E** | **Batch Number** | Initial batch ID | No | BN-2026-X |
| **F** | **Is Expirable** | `true` or `false` | No | true |
| **G** | **Expiry Date** | Expiration (YYYY-MM-DD) | No | 2026-12-01 |
| **H** | **Unit** | Dispensing unit (UoM) | No | TAB |
| **I** | **Initial Quantity** | Initial stock count | No | 100 |
| **J** | **Min Stock Level** | Low stock threshold | No | 50 |
| **K** | **Selling Price** | Unit retail price | No | 25.50 |

---

## 2. Cosmetics Import Format
**Target:** Cosmetics Page -> Import Excel
*(Includes optional initial batch details)*

| Column | Header Name | Description | Required? | Example |
| :--- | :--- | :--- | :---: | :--- |
| **A** | **Item ID (SKU)** | Internal tracking ID | **Yes** | COS-9921 |
| **B** | **Name** | Product name | **Yes** | Nivea Body Lotion |
| **C** | **Category** | Product category | No | Skin Care |
| **D** | **Unit** | Packaging unit | No | BOTTLE |
| **E** | **Min Stock Level** | Low stock threshold | No | 10 |
| **F** | **Batch Number** | Initial batch ID | No | B-NV-100 |
| **G** | **Initial Quantity** | Initial stock count | No | 20 |
| **H** | **Purchase Price** | Buy price per unit | No | 12.50 |
| **I** | **Selling Price** | Sale price per unit | No | 18.00 |
| **J** | **Expiry Date** | Expiration (YYYY-MM-DD) | No | 2027-01-15 |

---

## 3. Batches Import Format
**Target:** Batches Page -> Import Excel
*(Use this for adding new stock to existing products)*

| Column | Header Name | Description | Required? | Example |
| :--- | :--- | :--- | :---: | :--- |
| **A** | **Product Name** | *Exact* name from registry | **Yes** | Amoxicillin 500mg |
| **B** | **Batch Number** | Logistical batch ID | **Yes** | LOT-2025-A |
| **C** | **Expiry Date** | Expiration (YYYY-MM-DD) | No | 2026-12-01 |
| **D** | **Purchase Price** | Buy price per unit | No | 12.50 |
| **E** | **Selling Price** | Sale price per unit | No | 18.00 |
| **F** | **Initial Quantity** | Total units added | No | 100 |

---

# PART 2: Sample Data (To Try)

You can copy-paste the data below into your Excel files for testing.

## 1. Medicines Sample Rows
| Item ID | Name | Generic | Form | Batch | Exp? | Expiry | Unit | Qty | Min | Price |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| MED-PR-01 | Paracetamol | Acetam | Tablet | BN-01 | true | 2026-12-31 | TAB | 500 | 100 | 2.50 |
| MED-AM-02 | Amoxicillin | Amox | Capsule | BN-02 | true | 2025-06-30 | CAP | 200 | 50 | 5.00 |
| MED-IB-03 | Ibuprofen | Ibup | Tablet | BN-03 | true | 2025-11-10 | TAB | 300 | 80 | 3.80 |

## 2. Cosmetics Sample Rows
| Item ID | Name | Category | Unit | Min | Batch | Qty | Purchase | Selling | Expiry |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| COS-NV-01 | Nivea Soft | Skin Care | JAR | 10 | C-NV-1 | 50 | 12.00 | 18.50 | 2027-01-15 |
| COS-DV-02 | Dove Shampoo | Hair Care | BTL | 15 | C-DV-1 | 40 | 8.00 | 12.00 | 2026-08-20 |
| COS-CG-03 | Colgate | Dental | TUBE | 20 | C-CG-1 | 60 | 5.00 | 7.50 | 2026-05-12 |

## 3. Batches Sample Rows (Stock Levels)
*(Register the products above first before uploading these batches)*

| Product Name | Batch Number | Expiry Date | Purchase Price | Selling Price | Initial Quantity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Paracetamol 500mg | B-P-1234 | 2026-12-31 | 1.50 | 2.50 | 500 |
| Amoxicillin 250mg | B-A-5678 | 2025-06-30 | 3.00 | 5.00 | 200 |
| Nivea Soft Cream | C-N-9012 | 2027-01-15 | 12.00 | 18.50 | 50 |
| Dove Shampoo 400ml | C-D-3456 | 2026-08-20 | 8.00 | 12.00 | 40 |
| Ibuprofen 400mg | B-I-7890 | 2025-11-10 | 2.20 | 3.80 | 300 |

---
> [!TIP]
> Ensure there are no empty rows in your Excel file. All dates should be in **YYYY-MM-DD** format.
