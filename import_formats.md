# Excel Import Formats

To ensure successful data import, please use the following formats for your Excel files (.xlsx).

## 1. Medicines Import Format
**Sheet Name**: Any (First sheet is used)
**Headers**: Row 1 must be headers (exact names not required, but order is fixed).

| Column | Field | Required | Description | Sample Data |
| :--- | :--- | :--- | :--- | :--- |
| A | Name | Yes | Brand name of the medicine | Amlodipine 500mg |
| B | Generic Name | No | Generic/Chemical name | Amlodipine |
| C | Category | No | Classification | Antihypertensives |
| D | Unit | No | Unit of measure (TAB, ML, etc.) | TAB |
| E | Min. Level | No | Stock level to trigger alerts | 40 |
| F | Controlled | No | Is it a controlled substance? (True/Yes/1) | False |

---

## 2. Batches Import Format
**Sheet Name**: Any (First sheet is used)
**Headers**: Row 1 must be headers.
> [!IMPORTANT]
> The **Medicine Name** must exactly match an existing medicine in the system (case-insensitive).

| Column | Field | Required | Description | Sample Data |
| :--- | :--- | :--- | :--- | :--- |
| A | Medicine Name | Yes | Must match an existing Medicine | Amlodipine 500mg |
| B | Batch Number | Yes | Unique identifier for the batch | BN-9982 |
| C | Expiry Date | Yes | Date format (YYYY-MM-DD or excel date) | 2026-12-31 |
| D | Purchase Price | Yes | Unit cost | 1.50 |
| E | Selling Price | Yes | Unit selling price | 2.50 |
| F | Initial Quantity| Yes | Total units in this batch | 1000 |

---

## Sample Data (Copy-Paste)

### Medicine Sample
| Amlodipine 500mg | Amlodipine | Antihypertensives | TAB | 40 | False |
| Paracetamol 500mg | Paracetamol | Analgesic | TAB | 100 | False |

### Batch Sample
| Amlodipine 500mg | BN-9982 | 2026-12-31 | 1.50 | 2.50 | 1000 |
| Paracetamol 500mg | BN-P12 | 2025-06-15 | 0.80 | 1.20 | 500 |
