# Refined Tenant Configuration & T&C Positioning

Based on your terminal logs and additional feature requests, three specific adjustments will be made.

## User Review Required
> [!IMPORTANT]
> - Since modifying a strict PostgreSQL `ENUM` column on a live database structure can sometimes lead to data drops, I will bypass the database error entirely from the React side! I will pass a dummy `BASIC` value to the old strict column to satisfy the DB, while safely saving your dynamic "Premium" plans into the newer `subscription_plan_name` column. This is the safest approach and requires 0 database schema migrations!
> - The EULA Terms and Conditions checkbox will be added squarely to the `Login.tsx` page so End-Users actually acknowledge the framework usage, not Super Admins.
> - The Tenant List table will be expanded to allow full modification of the Tenant details and its specific subscription status (`TRIAL` | `ACTIVE` | `EXPIRED` | `SUSPENDED`).

## Proposed Changes

### Frontend Components

#### [MODIFY] `e:\Pharmacy_system\frontend\src\pages\super-admin\TenantList.tsx`
- **T&C Removal**: Strip out the "I agree to terms" checkbox and state blocks from the Super Admin deployment modal.
- **Tenant API Payload Fix**: Bind the `subscription_plan_name: formData.subscription_plan` explicitly into the payload and pass a silent default `subscription_plan: 'BASIC'` to prevent the PostgreSQL 500 enum error.
- **Full Node Editing**: Introduce an Edit button inside the table's "Actions" column. 
- **Subscription Status Dropdown**: Introduce a `<select>` dropdown in the Edit Modal allowing Super Admins to instantly toggle the tenant between `TRIAL`, `ACTIVE`, `EXPIRED`, and `SUSPENDED`.
- Add the `deleteTenant` mechanism to totally wipe a tenant if needed.

#### [MODIFY] `e:\Pharmacy_system\frontend\src\pages\Login.tsx`
- **T&C Relocation**: Inject a new `<input type="checkbox">` explicitly stating "I have read and agree to the System Terms and Conditions for organizational usage."
- **Enforcement**: Disable the `Sign In` button globally unless this EULA usage checkbox is checked.

### Backend Handlers

#### [MODIFY] `e:\Pharmacy_system\backend\src\modules\organizations\organizations.controller.ts`
- Ensure that `UPDATE` actions (which will be leveraged by the new TenantList Edit Modal) accurately map the new incoming `subscription_status` array and bypass DB locks.
- Ensure the Delete route correctly cascades or drops the entire tenant namespace (if requested by the Super Admin).

## Open Questions

- Should checking the Terms & Conditions persist logically (e.g. they only do it on their *first* login ever on that Desktop app) using `localStorage`, or should they forcibly check it *every single time* they type a password? (Using LocalStorage is recommended so it tracks the desktop installation and only forces the T&C once per device). I will set it up via LocalStorage by default so it's less annoying. Let me know if you want it every time!

## Verification Plan

### Manual Verification
1. Open the super admin dashboard and create a new node selecting "Premium", verify that no 500 POST error occurs in the terminal.
2. Sign out and load the `Login.tsx` page, confirm the Sign In functionality is rigorously blocked unless the T&C checkbox is marked.
3. Access `TenantList.tsx` as Super Admin and click "Edit" on a tenant, toggle their state to `EXPIRED` and save, then attempt to log-in as that tenant to ensure the System Block intercepts the user.
