--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: alerts_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alerts_status_enum AS ENUM (
    'ACTIVE',
    'RESOLVED'
);


ALTER TYPE public.alerts_status_enum OWNER TO postgres;

--
-- Name: alerts_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alerts_type_enum AS ENUM (
    'LOW_STOCK',
    'EXPIRY',
    'EXPIRED'
);


ALTER TYPE public.alerts_type_enum OWNER TO postgres;

--
-- Name: audit_logs_action_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.audit_logs_action_enum AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'DISPENSE',
    'SELL',
    'REFUND'
);


ALTER TYPE public.audit_logs_action_enum OWNER TO postgres;

--
-- Name: audit_sessions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.audit_sessions_status_enum AS ENUM (
    'DRAFT',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.audit_sessions_status_enum OWNER TO postgres;

--
-- Name: cheque_records_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cheque_records_status_enum AS ENUM (
    'PENDING',
    'CLEARED',
    'BOUNCED'
);


ALTER TYPE public.cheque_records_status_enum OWNER TO postgres;

--
-- Name: credit_records_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.credit_records_status_enum AS ENUM (
    'UNPAID',
    'PARTIAL',
    'PAID'
);


ALTER TYPE public.credit_records_status_enum OWNER TO postgres;

--
-- Name: expenses_category_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expenses_category_enum AS ENUM (
    'RENT',
    'SALARY',
    'ELECTRICITY',
    'WATER',
    'INTERNET',
    'MAINTENANCE',
    'MISC'
);


ALTER TYPE public.expenses_category_enum OWNER TO postgres;

--
-- Name: expenses_frequency_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expenses_frequency_enum AS ENUM (
    'MONTHLY',
    'WEEKLY',
    'DAILY',
    'ONE_TIME'
);


ALTER TYPE public.expenses_frequency_enum OWNER TO postgres;

--
-- Name: forecast_results_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.forecast_results_method_enum AS ENUM (
    'SMA',
    'WMA',
    'LINEAR_REGRESSION',
    'EXPONENTIAL_SMOOTHING'
);


ALTER TYPE public.forecast_results_method_enum OWNER TO postgres;

--
-- Name: medicines_product_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medicines_product_type_enum AS ENUM (
    'MEDICINE',
    'COSMETIC'
);


ALTER TYPE public.medicines_product_type_enum OWNER TO postgres;

--
-- Name: notifications_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notifications_type_enum AS ENUM (
    'LOW_STOCK',
    'EXPIRING',
    'FRAUD_ALERT',
    'SALE',
    'SYSTEM',
    'INFO',
    'PURCHASE_ORDER',
    'CREDIT_PAYMENT',
    'REFUND'
);


ALTER TYPE public.notifications_type_enum OWNER TO postgres;

--
-- Name: organizations_subscription_plan_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.organizations_subscription_plan_enum AS ENUM (
    'BASIC',
    'SILVER',
    'GOLD'
);


ALTER TYPE public.organizations_subscription_plan_enum OWNER TO postgres;

--
-- Name: organizations_subscription_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.organizations_subscription_status_enum AS ENUM (
    'TRIAL',
    'ACTIVE',
    'EXPIRED',
    'SUSPENDED'
);


ALTER TYPE public.organizations_subscription_status_enum OWNER TO postgres;

--
-- Name: patients_gender_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patients_gender_enum AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public.patients_gender_enum OWNER TO postgres;

--
-- Name: payment_account_transactions_reference_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_account_transactions_reference_type_enum AS ENUM (
    'INITIAL_BALANCE',
    'SALE',
    'EXPENSE',
    'REFUND',
    'MANUAL_ADJUSTMENT',
    'PURCHASE',
    'CREDIT_REPAYMENT'
);


ALTER TYPE public.payment_account_transactions_reference_type_enum OWNER TO postgres;

--
-- Name: payment_account_transactions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_account_transactions_type_enum AS ENUM (
    'CREDIT',
    'DEBIT'
);


ALTER TYPE public.payment_account_transactions_type_enum OWNER TO postgres;

--
-- Name: payment_accounts_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_accounts_type_enum AS ENUM (
    'CASH',
    'BANK',
    'MOBILE_MONEY',
    'OTHER'
);


ALTER TYPE public.payment_accounts_type_enum OWNER TO postgres;

--
-- Name: purchase_order_items_product_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_order_items_product_type_enum AS ENUM (
    'MEDICINE',
    'COSMETIC'
);


ALTER TYPE public.purchase_order_items_product_type_enum OWNER TO postgres;

--
-- Name: purchase_orders_payment_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_payment_method_enum AS ENUM (
    'CASH',
    'CREDIT',
    'CHEQUE',
    'BANK_TRANSFER',
    'OTHER'
);


ALTER TYPE public.purchase_orders_payment_method_enum OWNER TO postgres;

--
-- Name: purchase_orders_payment_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_payment_status_enum AS ENUM (
    'PAID',
    'PENDING',
    'PARTIALLY_PAID',
    'UNPAID'
);


ALTER TYPE public.purchase_orders_payment_status_enum OWNER TO postgres;

--
-- Name: purchase_orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_status_enum AS ENUM (
    'DRAFT',
    'APPROVED',
    'SENT',
    'CONFIRMED',
    'PARTIALLY_RECEIVED',
    'COMPLETED',
    'CANCELLED',
    'PENDING_PAYMENT',
    'REGISTERED'
);


ALTER TYPE public.purchase_orders_status_enum OWNER TO postgres;

--
-- Name: purchase_recommendations_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_recommendations_status_enum AS ENUM (
    'PENDING',
    'CONVERTED',
    'DISMISSED'
);


ALTER TYPE public.purchase_recommendations_status_enum OWNER TO postgres;

--
-- Name: sale_orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sale_orders_status_enum AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED'
);


ALTER TYPE public.sale_orders_status_enum OWNER TO postgres;

--
-- Name: sales_payment_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sales_payment_method_enum AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'INSURANCE',
    'CREDIT',
    'CHEQUE',
    'SPLIT'
);


ALTER TYPE public.sales_payment_method_enum OWNER TO postgres;

--
-- Name: stock_transactions_reference_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.stock_transactions_reference_type_enum AS ENUM (
    'PURCHASE',
    'SALE',
    'RETURN',
    'ADJUSTMENT',
    'DISPOSAL',
    'TEST'
);


ALTER TYPE public.stock_transactions_reference_type_enum OWNER TO postgres;

--
-- Name: stock_transactions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.stock_transactions_type_enum AS ENUM (
    'IN',
    'OUT',
    'ADJUSTMENT'
);


ALTER TYPE public.stock_transactions_type_enum OWNER TO postgres;

--
-- Name: subscription_requests_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_requests_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public.subscription_requests_status_enum OWNER TO postgres;

--
-- Name: supplier_payments_payment_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.supplier_payments_payment_method_enum AS ENUM (
    'CASH',
    'BANK_TRANSFER',
    'CHEQUE',
    'MOBILE_MONEY'
);


ALTER TYPE public.supplier_payments_payment_method_enum OWNER TO postgres;

--
-- Name: suppliers_payment_terms_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.suppliers_payment_terms_enum AS ENUM (
    'NET_15',
    'NET_30',
    'NET_60',
    'COD'
);


ALTER TYPE public.suppliers_payment_terms_enum OWNER TO postgres;

--
-- Name: transfer_requests_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transfer_requests_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.transfer_requests_status_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'PHARMACIST',
    'CASHIER',
    'AUDITOR',
    'SUPER_ADMIN'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type public.alerts_type_enum NOT NULL,
    status public.alerts_status_enum DEFAULT 'ACTIVE'::public.alerts_status_enum NOT NULL,
    message character varying NOT NULL,
    reference_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.alerts FORCE ROW LEVEL SECURITY;


ALTER TABLE public.alerts OWNER TO postgres;

--
-- Name: audit_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    session_id uuid NOT NULL,
    medicine_id uuid NOT NULL,
    batch_id uuid NOT NULL,
    system_quantity integer NOT NULL,
    scanned_quantity integer DEFAULT 0 NOT NULL,
    variance integer DEFAULT 0 NOT NULL,
    notes text,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.audit_items FORCE ROW LEVEL SECURITY;


ALTER TABLE public.audit_items OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action public.audit_logs_action_enum NOT NULL,
    entity character varying NOT NULL,
    entity_id character varying,
    old_values text,
    new_values text,
    ip_address character varying,
    is_controlled_transaction boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.audit_logs FORCE ROW LEVEL SECURITY;


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status public.audit_sessions_status_enum DEFAULT 'DRAFT'::public.audit_sessions_status_enum NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    organization_id uuid NOT NULL,
    "createdById" uuid,
    name text
);

ALTER TABLE ONLY public.audit_sessions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.audit_sessions OWNER TO postgres;

--
-- Name: batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    batch_number character varying NOT NULL,
    medicine_id uuid NOT NULL,
    expiry_date date,
    purchase_price numeric(10,2),
    selling_price numeric(10,2),
    initial_quantity integer NOT NULL,
    quantity_remaining integer NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    is_quarantined boolean DEFAULT false NOT NULL,
    supplier_id character varying,
    notes text,
    branch_id character varying,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);

ALTER TABLE ONLY public.batches FORCE ROW LEVEL SECURITY;


ALTER TABLE public.batches OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    address character varying,
    phone character varying,
    is_headquarters boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.branches FORCE ROW LEVEL SECURITY;


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: cheque_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cheque_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    cheque_number character varying NOT NULL,
    bank_name character varying NOT NULL,
    amount numeric(12,2) NOT NULL,
    due_date date NOT NULL,
    status public.cheque_records_status_enum DEFAULT 'PENDING'::public.cheque_records_status_enum NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.cheque_records FORCE ROW LEVEL SECURITY;


ALTER TABLE public.cheque_records OWNER TO postgres;

--
-- Name: credit_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    credit_record_id uuid,
    amount numeric(12,2) NOT NULL,
    payment_method character varying DEFAULT 'CASH'::character varying NOT NULL,
    reference_number character varying,
    received_by uuid,
    payment_date timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.credit_payments FORCE ROW LEVEL SECURITY;


ALTER TABLE public.credit_payments OWNER TO postgres;

--
-- Name: credit_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    sale_id uuid,
    original_amount numeric(12,2) NOT NULL,
    paid_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    due_date date NOT NULL,
    status public.credit_records_status_enum DEFAULT 'UNPAID'::public.credit_records_status_enum NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.credit_records FORCE ROW LEVEL SECURITY;


ALTER TABLE public.credit_records OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    phone character varying,
    address text,
    total_credit numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.customers FORCE ROW LEVEL SECURITY;


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    category public.expenses_category_enum DEFAULT 'MISC'::public.expenses_category_enum NOT NULL,
    amount numeric(12,2) NOT NULL,
    frequency public.expenses_frequency_enum DEFAULT 'ONE_TIME'::public.expenses_frequency_enum NOT NULL,
    description text,
    expense_date date NOT NULL,
    receipt_reference character varying,
    is_recurring boolean DEFAULT false NOT NULL,
    created_by uuid,
    branch_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL,
    payment_account_id uuid
);

ALTER TABLE ONLY public.expenses FORCE ROW LEVEL SECURITY;


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: forecast_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forecast_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    medicine_id uuid NOT NULL,
    target_date date NOT NULL,
    method public.forecast_results_method_enum NOT NULL,
    predicted_demand numeric(10,2) NOT NULL,
    confidence_score numeric(5,2),
    historical_data_points jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.forecast_results FORCE ROW LEVEL SECURITY;


ALTER TABLE public.forecast_results OWNER TO postgres;

--
-- Name: goods_receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods_receipts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    grn_number character varying NOT NULL,
    purchase_order_id uuid NOT NULL,
    received_by uuid,
    notes text,
    organization_id uuid NOT NULL,
    received_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.goods_receipts FORCE ROW LEVEL SECURITY;


ALTER TABLE public.goods_receipts OWNER TO postgres;

--
-- Name: medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    generic_name character varying,
    category character varying,
    unit character varying,
    is_controlled boolean DEFAULT false NOT NULL,
    barcode character varying,
    sku character varying NOT NULL,
    supplier_barcode character varying,
    preferred_supplier_id character varying,
    minimum_stock_level integer DEFAULT 10 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    branch_id character varying,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    product_type public.medicines_product_type_enum DEFAULT 'MEDICINE'::public.medicines_product_type_enum NOT NULL,
    is_expirable boolean DEFAULT true NOT NULL,
    dosage_form character varying
);

ALTER TABLE ONLY public.medicines FORCE ROW LEVEL SECURITY;


ALTER TABLE public.medicines OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    title character varying NOT NULL,
    message text NOT NULL,
    type public.notifications_type_enum DEFAULT 'INFO'::public.notifications_type_enum NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.notifications FORCE ROW LEVEL SECURITY;


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    subscription_plan public.organizations_subscription_plan_enum DEFAULT 'BASIC'::public.organizations_subscription_plan_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    address character varying,
    phone character varying,
    email character varying,
    contact_person character varying,
    license_number character varying,
    city character varying,
    subscription_status public.organizations_subscription_status_enum DEFAULT 'TRIAL'::public.organizations_subscription_status_enum,
    subscription_expiry_date timestamp without time zone,
    subscription_plan_name character varying,
    feature_overrides json,
    internal_notes text,
    preferences json
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: patient_reminders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_reminders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    medication_name character varying NOT NULL,
    last_purchase_date date NOT NULL,
    dispensed_quantity integer NOT NULL,
    expected_duration_days integer NOT NULL,
    depletion_date date NOT NULL,
    is_resolved boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    patient_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    created_by_id uuid
);


ALTER TABLE public.patient_reminders OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    branch_id character varying,
    phone character varying,
    age integer,
    gender public.patients_gender_enum,
    address text,
    allergies text,
    chronic_conditions text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.patients FORCE ROW LEVEL SECURITY;


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: payment_account_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_account_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    payment_account_id uuid NOT NULL,
    amount numeric(14,2) NOT NULL,
    type public.payment_account_transactions_type_enum NOT NULL,
    reference_type public.payment_account_transactions_reference_type_enum NOT NULL,
    reference_id uuid,
    description character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    organization_id uuid NOT NULL
);


ALTER TABLE public.payment_account_transactions OWNER TO postgres;

--
-- Name: payment_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    type public.payment_accounts_type_enum DEFAULT 'CASH'::public.payment_accounts_type_enum NOT NULL,
    account_number character varying,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    balance numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    is_visible_to_cashier boolean DEFAULT true NOT NULL,
    allow_transfer boolean DEFAULT true NOT NULL
);


ALTER TABLE public.payment_accounts OWNER TO postgres;

--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    prescription_id uuid NOT NULL,
    medicine_id uuid NOT NULL,
    dosage character varying NOT NULL,
    frequency character varying,
    duration character varying NOT NULL,
    quantity_dispensed integer DEFAULT 0 NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.prescription_items FORCE ROW LEVEL SECURITY;


ALTER TABLE public.prescription_items OWNER TO postgres;

--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_id uuid NOT NULL,
    doctor_name character varying,
    facility character varying,
    prescription_number character varying,
    prescription_image_path character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.prescriptions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: price_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    medicine_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.price_history FORCE ROW LEVEL SECURITY;


ALTER TABLE public.price_history OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_order_id uuid NOT NULL,
    medicine_id uuid NOT NULL,
    quantity_ordered integer NOT NULL,
    quantity_received integer DEFAULT 0 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    organization_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    selling_price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    batch_number character varying,
    expiry_date date,
    product_type public.purchase_order_items_product_type_enum DEFAULT 'MEDICINE'::public.purchase_order_items_product_type_enum NOT NULL
);

ALTER TABLE ONLY public.purchase_order_items FORCE ROW LEVEL SECURITY;


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    po_number character varying NOT NULL,
    supplier_id uuid,
    status public.purchase_orders_status_enum DEFAULT 'DRAFT'::public.purchase_orders_status_enum NOT NULL,
    total_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    payment_method public.purchase_orders_payment_method_enum DEFAULT 'CASH'::public.purchase_orders_payment_method_enum NOT NULL,
    payment_status public.purchase_orders_payment_status_enum DEFAULT 'PENDING'::public.purchase_orders_payment_status_enum NOT NULL,
    total_paid numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    branch_id character varying,
    organization_id uuid NOT NULL,
    created_by uuid,
    approved_by uuid,
    expected_delivery date,
    cheque_bank_name character varying,
    cheque_number character varying,
    cheque_issue_date date,
    cheque_due_date date,
    cheque_amount numeric(12,2),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_vat_inclusive boolean DEFAULT false NOT NULL,
    vat_rate numeric(5,2) DEFAULT '15'::numeric NOT NULL,
    vat_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    subtotal_before_vat numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    payment_account_id character varying,
    paid_by character varying,
    supplier_invoice_number character varying
);

ALTER TABLE ONLY public.purchase_orders FORCE ROW LEVEL SECURITY;


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchase_recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_recommendations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    medicine_id uuid NOT NULL,
    recommended_quantity integer NOT NULL,
    reorder_point integer DEFAULT 0 NOT NULL,
    safety_stock integer DEFAULT 0 NOT NULL,
    avg_daily_sales numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    suggested_supplier_id character varying,
    estimated_cost numeric(10,2),
    reasoning text,
    urgency text,
    status public.purchase_recommendations_status_enum DEFAULT 'PENDING'::public.purchase_recommendations_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.purchase_recommendations FORCE ROW LEVEL SECURITY;


ALTER TABLE public.purchase_recommendations OWNER TO postgres;

--
-- Name: refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refunds (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sale_id uuid NOT NULL,
    medicine_id uuid NOT NULL,
    quantity integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason character varying,
    processed_by_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.refunds FORCE ROW LEVEL SECURITY;


ALTER TABLE public.refunds OWNER TO postgres;

--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sale_id uuid NOT NULL,
    medicine_id uuid NOT NULL,
    batch_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    is_refunded boolean DEFAULT false NOT NULL,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.sale_items FORCE ROW LEVEL SECURITY;


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- Name: sale_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying NOT NULL,
    items jsonb NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    status public.sale_orders_status_enum DEFAULT 'PENDING'::public.sale_orders_status_enum NOT NULL,
    patient_id uuid,
    prescription_image_url character varying,
    is_controlled_transaction boolean DEFAULT false NOT NULL,
    payment_account_id character varying,
    payment_account_name character varying,
    created_by uuid NOT NULL,
    confirmed_by uuid,
    confirmed_at timestamp with time zone,
    sale_id character varying,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sale_orders OWNER TO postgres;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    receipt_number character varying NOT NULL,
    patient_id uuid,
    prescription_id uuid,
    total_amount numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    payment_method public.sales_payment_method_enum DEFAULT 'CASH'::public.sales_payment_method_enum NOT NULL,
    split_payments jsonb,
    created_by uuid NOT NULL,
    is_refunded boolean DEFAULT false NOT NULL,
    refund_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    prescription_image_url character varying,
    is_controlled_transaction boolean DEFAULT false NOT NULL,
    branch_id character varying,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.sales FORCE ROW LEVEL SECURITY;


ALTER TABLE public.sales OWNER TO postgres;

--
-- Name: stock_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    batch_id uuid NOT NULL,
    type public.stock_transactions_type_enum NOT NULL,
    quantity integer NOT NULL,
    reference_type public.stock_transactions_reference_type_enum NOT NULL,
    reference_id character varying,
    notes character varying,
    is_fefo_override boolean DEFAULT false NOT NULL,
    override_reason text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.stock_transactions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.stock_transactions OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description text,
    features json NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    duration_months integer DEFAULT 1 NOT NULL,
    costs numeric(10,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscription_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status public.subscription_requests_status_enum DEFAULT 'PENDING'::public.subscription_requests_status_enum NOT NULL,
    user_notes text,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscription_requests OWNER TO postgres;

--
-- Name: supplier_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_contracts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    supplier_id uuid NOT NULL,
    effective_date date NOT NULL,
    expiry_date date NOT NULL,
    discount_percentage numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    return_policy text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.supplier_contracts FORCE ROW LEVEL SECURITY;


ALTER TABLE public.supplier_contracts OWNER TO postgres;

--
-- Name: supplier_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_order_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method public.supplier_payments_payment_method_enum DEFAULT 'CASH'::public.supplier_payments_payment_method_enum NOT NULL,
    transaction_reference character varying,
    payment_date date NOT NULL,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.supplier_payments FORCE ROW LEVEL SECURITY;


ALTER TABLE public.supplier_payments OWNER TO postgres;

--
-- Name: supplier_performance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_performance (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    supplier_id uuid NOT NULL,
    period character varying NOT NULL,
    on_time_deliveries integer DEFAULT 0 NOT NULL,
    total_deliveries integer DEFAULT 0 NOT NULL,
    price_variance numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    returned_items integer DEFAULT 0 NOT NULL,
    total_items integer DEFAULT 0 NOT NULL,
    quality_rating numeric(3,1) DEFAULT '3'::numeric NOT NULL,
    computed_score numeric(5,2),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.supplier_performance FORCE ROW LEVEL SECURITY;


ALTER TABLE public.supplier_performance OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    contact_person character varying,
    phone character varying,
    email character varying,
    address text,
    credit_limit numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    payment_terms public.suppliers_payment_terms_enum DEFAULT 'COD'::public.suppliers_payment_terms_enum NOT NULL,
    average_lead_time integer DEFAULT 7 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE ONLY public.suppliers FORCE ROW LEVEL SECURITY;


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: system_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_features (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    key character varying NOT NULL,
    name character varying NOT NULL,
    description text,
    icon character varying,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_features OWNER TO postgres;

--
-- Name: transfer_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transfer_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    from_account_id uuid NOT NULL,
    to_account_id uuid NOT NULL,
    amount numeric(14,2) NOT NULL,
    reason text,
    status public.transfer_requests_status_enum DEFAULT 'PENDING'::public.transfer_requests_status_enum NOT NULL,
    requested_by uuid NOT NULL,
    approved_by uuid,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transfer_requests OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying NOT NULL,
    password_hash character varying NOT NULL,
    role public.users_role_enum DEFAULT 'CASHIER'::public.users_role_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    manager_pin character varying,
    branch_id character varying,
    organization_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.users FORCE ROW LEVEL SECURITY;


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerts (id, type, status, message, reference_id, created_at, organization_id) FROM stdin;
97773622-57c6-48b7-84a3-7e615c3dc9c5	LOW_STOCK	ACTIVE	Medicine Amoxiciliin 500 mg is low on stock (0 units remaining)	afcc56ec-103a-4e60-8c18-437c01c83928	2026-03-31 00:44:49.070861	37448208-174d-473e-a2eb-a031a33e298e
2e4ea736-af87-43d5-8c8e-2dad27d0c39d	LOW_STOCK	ACTIVE	Medicine Doxycycline 100mg is low on stock (0 units remaining)	4d23dc1b-f4ff-4d2d-b388-076335774421	2026-03-31 03:24:13.870018	70cd42a3-f2d6-46fe-99db-a97bfb08c020
b8c55f26-97ab-4374-ba5c-79261f0e39fd	LOW_STOCK	RESOLVED	Medicine Ceftriaxone 1g is low on stock (0 units remaining)	8359d054-8533-4c0f-ab20-58a0a5ba08a8	2026-03-31 03:06:04.991272	cfc876dd-c6e3-4283-b705-0cd86ac95e00
7e34a92d-1e49-47bc-8210-8cbfa63a9cc4	LOW_STOCK	ACTIVE	Medicine carteee is low on stock (272 units remaining)	4119856f-81f8-4193-9162-c6583590e935	2026-04-05 12:52:54.294778	cfc876dd-c6e3-4283-b705-0cd86ac95e00
323abc91-91ac-4fe8-8860-f30ac313454f	LOW_STOCK	ACTIVE	Medicine test is low on stock (0 units remaining)	c7d4b78f-85b4-4729-99a0-dc8d73c3be05	2026-04-06 03:55:33.683923	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3675f1cd-df8b-4b96-83ad-7d737b6aef3a	LOW_STOCK	ACTIVE	Medicine Nivea Body Lotion is low on stock (0 units remaining)	97d7d8ed-2b6a-4518-be21-f23f118d7512	2026-04-13 13:37:21.296804	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0fdad8d3-7408-41b2-82a1-bb7190ac6fc0	LOW_STOCK	ACTIVE	Medicine FOGGE Body Sprirant is low on stock (0 units remaining)	17c16570-4097-40f4-92b1-f9f806e468e1	2026-04-13 13:37:22.118691	cfc876dd-c6e3-4283-b705-0cd86ac95e00
7ad90e68-f605-4608-bcff-d42af4cda697	LOW_STOCK	ACTIVE	Medicine Snail Hail Oil is low on stock (0 units remaining)	cccee9c5-23e6-4cb6-9046-6b89a22021e4	2026-04-13 14:00:00.888614	cfc876dd-c6e3-4283-b705-0cd86ac95e00
288c5d54-1a4d-4591-8670-98aa86db726e	EXPIRY	ACTIVE	Batch BN-new-124 of test expires soon on 2026-05-09	c7d4b78f-85b4-4729-99a0-dc8d73c3be05	2026-04-13 14:00:01.201378	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0dda6e70-1afe-4733-88b3-652bf27d0fe2	EXPIRY	ACTIVE	Batch r of carteee expires soon on 2026-05-01	4119856f-81f8-4193-9162-c6583590e935	2026-04-15 14:00:00.374334	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c3b1107c-b50e-4c86-8435-99098efcc14e	EXPIRY	ACTIVE	Batch t of Chemistry 400mg expires soon on 2026-05-06	81ea01b0-c189-4107-8885-69cbd12eaffd	2026-04-15 14:00:00.417414	cfc876dd-c6e3-4283-b705-0cd86ac95e00
63c643d2-fda9-4e8c-8490-40dc1be166ed	EXPIRED	ACTIVE	CRITICAL: Batch BN-03 of Ibuprofen has EXPIRED on 2025-11-10	e72ac6ce-839b-41d3-a30a-04f12454f155	2026-04-16 14:00:00.466302	cfc876dd-c6e3-4283-b705-0cd86ac95e00
2714d2e1-45e5-4c5c-afa4-62006366a6b2	EXPIRY	ACTIVE	Batch C-CG-1 of Colgate expires soon on 2026-05-12	3c6125b9-051a-48de-aa3b-339f486a96f1	2026-04-16 14:00:00.552038	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: audit_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_items (id, session_id, medicine_id, batch_id, system_quantity, scanned_quantity, variance, notes, organization_id) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity, entity_id, old_values, new_values, ip_address, is_controlled_transaction, created_at, organization_id) FROM stdin;
c9fbb411-3196-49b1-86e3-cf18d688dd00	98b71fd9-9d98-4395-b114-cf28cfe62aab	CREATE	medicines	63d8e81b-16f5-429e-ab69-cb5ac2191c29	\N	{"name":"Amoxicilin","generic_name":"Amoxicilin 500 mg","category":"Antibotics","unit":"TAB","is_controlled":false,"minimum_stock_level":10}	\N	f	2026-03-26 09:22:35.119909	fda0c216-b48c-4a42-8670-52966096499f
80df9089-a9d2-4979-ba85-c0e4679da931	98b71fd9-9d98-4395-b114-cf28cfe62aab	UPDATE	medicines	63d8e81b-16f5-429e-ab69-cb5ac2191c29	{"name":"Amoxicilin","category":"Antibotics","unit":"TAB"}	{"name":"Amoxicilin","generic_name":"Amoxicilin 500 mg","category":"Antibotics","unit":"TAB","minimum_stock_level":14,"is_controlled":false}	\N	f	2026-03-26 09:23:22.862841	fda0c216-b48c-4a42-8670-52966096499f
d0239e50-df00-4301-a4c7-b3e9c522ff48	98b71fd9-9d98-4395-b114-cf28cfe62aab	CREATE	batches	3417c80a-bbcd-4db8-965e-183f64fed44d	\N	{"batch_number":"BN-2003-ER","medicine_id":"63d8e81b-16f5-429e-ab69-cb5ac2191c29","initial_quantity":200}	\N	f	2026-03-26 09:24:02.280003	fda0c216-b48c-4a42-8670-52966096499f
166a5b1e-b7dc-4d31-85d0-1e229655315b	98b71fd9-9d98-4395-b114-cf28cfe62aab	CREATE	patients	b087255d-c174-4e0f-8492-391befe6df1e	\N	{"name":"Ato, Getaneh"}	\N	f	2026-03-26 09:24:39.530765	fda0c216-b48c-4a42-8670-52966096499f
7f357ca0-92a1-4912-b799-7136fe0c2061	98b71fd9-9d98-4395-b114-cf28cfe62aab	SELL	sales	be0287a2-c691-405f-8a7f-05d1c37c5c00	\N	{"total_amount":"14.00","items_count":1}	\N	f	2026-03-26 09:24:43.262079	fda0c216-b48c-4a42-8670-52966096499f
f5451e99-12ad-4b98-b4d3-e3f64924a083	59e6bca9-0b11-495e-a482-69f6947081d8	CREATE	medicines	80fee193-333c-4dd1-b399-bcadbe0710eb	\N	{"name":"Amlodipine 5 mg","generic_name":"Amlodipine Besylate","category":"Antihypertensives","unit":"Tablet","is_controlled":false,"minimum_stock_level":10}	\N	f	2026-03-31 00:38:41.753016	37448208-174d-473e-a2eb-a031a33e298e
f0baa358-7cb6-441d-b231-1c2da687a683	59e6bca9-0b11-495e-a482-69f6947081d8	CREATE	medicines	afcc56ec-103a-4e60-8c18-437c01c83928	\N	{"name":"Amoxiciliin 500 mg","generic_name":"Amoxiciliin","category":"Antibiotics","unit":"Capsule","is_controlled":false,"minimum_stock_level":50}	\N	f	2026-03-31 00:39:58.635865	37448208-174d-473e-a2eb-a031a33e298e
cb268a15-289e-4006-8203-f8b9e0d9f4d6	59e6bca9-0b11-495e-a482-69f6947081d8	CREATE	medicines	b4a262ae-1b4b-4cdb-804c-f4b70f9dea47	\N	{"name":"Azithromycin 250mg","generic_name":"Azithromycin","category":"Antibiotics","unit":"Tablet","is_controlled":false,"minimum_stock_level":30}	\N	f	2026-03-31 00:40:52.650971	37448208-174d-473e-a2eb-a031a33e298e
13e6c449-3f23-4f19-a1eb-b3cb9565c3db	59e6bca9-0b11-495e-a482-69f6947081d8	CREATE	batches	8de1fee1-0ddd-4cfe-bb39-edc8227f11a0	\N	{"batch_number":"BN-AML-2026-LL2","medicine_id":"80fee193-333c-4dd1-b399-bcadbe0710eb","initial_quantity":1000}	\N	f	2026-03-31 00:42:58.910498	37448208-174d-473e-a2eb-a031a33e298e
52b8bd44-2d50-4186-a45f-e4ca81998d71	59e6bca9-0b11-495e-a482-69f6947081d8	CREATE	batches	bb9f8450-3f7b-405b-9190-50e32c6645d7	\N	{"batch_number":"BN-AZI-2026-LL3","medicine_id":"b4a262ae-1b4b-4cdb-804c-f4b70f9dea47","initial_quantity":1200}	\N	f	2026-03-31 00:43:58.53461	37448208-174d-473e-a2eb-a031a33e298e
3ccb293d-7f26-47c1-9a4e-7c48f9d502b0	59e6bca9-0b11-495e-a482-69f6947081d8	CREATE	patients	23f628ea-4915-423c-b0f6-1c906efc9791	\N	{"name":"Abebe Kebede"}	\N	f	2026-03-31 00:44:45.305609	37448208-174d-473e-a2eb-a031a33e298e
a67812fb-7a0b-4600-852b-f83aa2eb6d44	59e6bca9-0b11-495e-a482-69f6947081d8	SELL	sales	bf4e9fa1-8940-4aad-b05d-f1bbd9202c71	\N	{"total_amount":"36.00","items_count":1}	\N	f	2026-03-31 00:44:49.001311	37448208-174d-473e-a2eb-a031a33e298e
faf5b2b6-612e-48c2-a6fa-f4a418fb82e2	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	26347fc6-bff1-4ab2-816d-7189d451d6d1	\N	{"name":"Ciprofloxacin 500mg","generic_name":"Ciprofloxacin","category":"Antibiotics","unit":"Tablet","is_controlled":false,"minimum_stock_level":40}	\N	f	2026-03-31 02:57:06.253915	cfc876dd-c6e3-4283-b705-0cd86ac95e00
7c538673-e29e-46f0-a778-bc710786d79e	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	ad25d0ae-f7f3-4119-9aea-5c216460aa53	\N	{"name":"Cetirizine 10mg","generic_name":"Cetirizine HCL","category":"Antihistamines","unit":"Tablet","is_controlled":false,"minimum_stock_level":60}	\N	f	2026-03-31 02:58:02.794911	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0eaf888f-fde4-416f-841d-49c6f9335a8b	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	8359d054-8533-4c0f-ab20-58a0a5ba08a8	\N	{"name":"Ceftriaxone 1g","generic_name":"Ceftriaxone Sodium","category":"Antiboitics","unit":"Tablet","is_controlled":false,"minimum_stock_level":30}	\N	f	2026-03-31 03:00:22.843402	cfc876dd-c6e3-4283-b705-0cd86ac95e00
978c4a1b-dac3-480a-901b-c2183df607da	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	batches	0704b8ba-9d3a-4d4f-802b-e56082e72597	\N	{"batch_number":"BN-CIP-2026-LL$","medicine_id":"26347fc6-bff1-4ab2-816d-7189d451d6d1","initial_quantity":1300}	\N	f	2026-03-31 03:00:59.347529	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d8239073-9aae-4694-9d32-0524a8f04a8c	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	batches	83ef3e8b-9240-426b-bc86-2c3b5c084f9d	\N	{"batch_number":"BN-CET-2026-LL5","medicine_id":"ad25d0ae-f7f3-4119-9aea-5c216460aa53","initial_quantity":900}	\N	f	2026-03-31 03:01:39.089269	cfc876dd-c6e3-4283-b705-0cd86ac95e00
e9aa4b10-a38f-41de-9f32-9d6c84fd51cb	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	patients	b34dba65-543b-40ec-89ab-0af1d0508101	\N	{"name":"Chalachew Kebede"}	\N	f	2026-03-31 03:06:00.618702	cfc876dd-c6e3-4283-b705-0cd86ac95e00
8ed4bb2b-2f61-4fa8-b1a0-27603e3a1816	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	6df304fc-847d-4a19-bc29-efafb8faf61b	\N	{"total_amount":"52.00","items_count":1}	\N	f	2026-03-31 03:06:04.772777	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f35cc952-2eb7-4a0f-b549-b676178e8441	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	patients	438408bb-1ed8-4b63-a5be-471f7611ab1e	\N	{"name":"Chala Dekika"}	\N	f	2026-03-31 03:06:53.63269	cfc876dd-c6e3-4283-b705-0cd86ac95e00
9ce99e22-917b-4d5b-98dc-293772853013	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	1b92f600-79c4-4d98-94d9-91716a4d1e7b	\N	{"total_amount":"26.00","items_count":1}	\N	f	2026-03-31 03:07:01.816046	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1759cfec-d646-46f2-a5cb-2353d300f5de	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	CREATE	medicines	4d23dc1b-f4ff-4d2d-b388-076335774421	\N	{"name":"Doxycycline 100mg","generic_name":"Doxycycline Hyclate","category":"Painkiller","unit":"Capsule","is_controlled":false,"minimum_stock_level":30}	\N	f	2026-03-31 03:19:13.574256	70cd42a3-f2d6-46fe-99db-a97bfb08c020
009c9cde-9b85-44cd-a404-fbb1bcbefaa9	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	CREATE	medicines	e6389e15-50eb-44c2-87f5-4f041f668709	\N	{"name":"Diazepam Injection 10mg","generic_name":"Diazepam","category":"Anxiolytics","unit":"Ampoule","is_controlled":false,"minimum_stock_level":25}	\N	f	2026-03-31 03:20:07.766553	70cd42a3-f2d6-46fe-99db-a97bfb08c020
b226154a-2ef2-4491-b4cb-d55c135536b4	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	CREATE	medicines	1675b37c-47a1-425e-bd91-63cc8e3af786	\N	{"name":"Digoxin 0.25mg","generic_name":"Digoxin","category":"Cardiac Glycosides","unit":"Tablet","is_controlled":false,"minimum_stock_level":30}	\N	f	2026-03-31 03:21:36.97664	70cd42a3-f2d6-46fe-99db-a97bfb08c020
f5efa091-96fa-4244-b242-36fcbbe79d88	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	CREATE	batches	4460c7e6-5422-4ca2-a62c-8bd1b7cfb131	\N	{"batch_number":"BN-DIG-2026-LL6","medicine_id":"1675b37c-47a1-425e-bd91-63cc8e3af786","initial_quantity":800}	\N	f	2026-03-31 03:22:43.818097	70cd42a3-f2d6-46fe-99db-a97bfb08c020
f07b0b7b-afb2-4bea-81f4-dadb63a85d48	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	CREATE	batches	3915643c-9142-497a-88b3-d6edc4b21807	\N	{"batch_number":"BN-DIA-2026-LL8","medicine_id":"e6389e15-50eb-44c2-87f5-4f041f668709","initial_quantity":700}	\N	f	2026-03-31 03:23:28.890153	70cd42a3-f2d6-46fe-99db-a97bfb08c020
f7c1d6cd-596e-4a05-9d9a-244e6016254b	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	CREATE	patients	29f7159d-cdea-42b5-962a-9f269ebca524	\N	{"name":"Derbachew Kebede"}	\N	f	2026-03-31 03:24:06.398493	70cd42a3-f2d6-46fe-99db-a97bfb08c020
52e1aead-4a22-4a42-9ea2-c220eef1a40c	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	SELL	sales	9477e52e-9e80-4100-b617-9f77d081c059	\N	{"total_amount":"43.50","items_count":1}	\N	f	2026-03-31 03:24:13.776092	70cd42a3-f2d6-46fe-99db-a97bfb08c020
5f529981-c083-4f41-921c-b804ba6e31f5	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	CREATE	patients	3fa28543-f38f-481a-8f4d-6f81df3aed2d	\N	{"name":"Desalegn Kebede"}	\N	f	2026-03-31 03:25:03.948761	70cd42a3-f2d6-46fe-99db-a97bfb08c020
6f4d6390-d078-4895-aa7e-6681ed2b204e	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	SELL	sales	10c7304d-9208-44ed-9124-40a9216d2fd2	\N	{"total_amount":"49.00","items_count":2}	\N	f	2026-03-31 03:25:12.176381	70cd42a3-f2d6-46fe-99db-a97bfb08c020
1837ba5c-7d67-4461-985b-4f9391f328fc	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	SELL	sales	522d26ab-f925-4b09-92a4-14c2ad6ca51d	\N	{"total_amount":"14.50","items_count":1}	\N	f	2026-03-31 09:23:30.005244	70cd42a3-f2d6-46fe-99db-a97bfb08c020
f0082f02-c72a-415a-a721-37d3fcb53eb7	4548bc76-62a3-464d-8f6f-d1aa02298954	CREATE	medicines	8d291731-451a-4b6c-aee7-b718e4777196	\N	{"name":"buprofen 400mg","generic_name":"buprofen","category":"Painkiller","unit":"Talet","is_controlled":false,"minimum_stock_level":10}	\N	f	2026-03-31 11:35:47.285949	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b
5afcb117-e675-4726-8500-eaa4cc7dbd9c	4548bc76-62a3-464d-8f6f-d1aa02298954	CREATE	batches	56204713-c662-46f6-bc6d-5266b5dfff72	\N	{"batch_number":"BN-BUP-2026-LE2","medicine_id":"8d291731-451a-4b6c-aee7-b718e4777196","initial_quantity":890}	\N	f	2026-03-31 11:36:23.218143	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b
bf01d10d-0236-4ca7-a050-0996a03b9b84	4548bc76-62a3-464d-8f6f-d1aa02298954	CREATE	patients	201de500-ce8e-445a-ba09-78c44ed98cca	\N	{"name":"Israel kebede"}	\N	f	2026-03-31 11:37:15.69657	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b
cc3fc494-883c-45b1-8a95-980b2128845e	4548bc76-62a3-464d-8f6f-d1aa02298954	SELL	sales	76b9994b-aab0-44a4-8596-6a642d8d3c78	\N	{"total_amount":"30.00","items_count":1}	\N	f	2026-03-31 11:37:19.064551	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b
f64642bc-9f1c-41a9-a3e0-b2297785c077	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	26347fc6-bff1-4ab2-816d-7189d451d6d1	{"name":"Ciprofloxacin 500mg"}	\N	\N	f	2026-04-01 01:08:11.210042	cfc876dd-c6e3-4283-b705-0cd86ac95e00
e75a527f-e8f4-4429-825b-d206586ac3a4	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	8359d054-8533-4c0f-ab20-58a0a5ba08a8	{"name":"Ceftriaxone 1g"}	\N	\N	f	2026-04-01 01:08:12.892109	cfc876dd-c6e3-4283-b705-0cd86ac95e00
25b0d1a4-d083-4312-9f02-7c341cfb5f61	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	ad25d0ae-f7f3-4119-9aea-5c216460aa53	{"name":"Cetirizine 10mg"}	\N	\N	f	2026-04-01 01:08:15.766137	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b8a9b8bc-b35e-4213-b1ab-f6b128e62648	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	0704b8ba-9d3a-4d4f-802b-e56082e72597	{"batch_number":"BN-CIP-2026-LL$"}	\N	\N	f	2026-04-01 01:08:20.06362	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ab014739-f182-42a8-b9e5-8bbc5d1e6d1c	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	83ef3e8b-9240-426b-bc86-2c3b5c084f9d	{"batch_number":"BN-CET-2026-LL5"}	\N	\N	f	2026-04-01 01:08:21.824897	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1b2a2da0-68d3-4ba2-97d0-92ce499b1a2e	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	e9733e4c-1c2d-499f-a747-7dffe3772488	\N	{"name":"chesmo","generic_name":"chesmo","category":"","unit":"TAB","is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-05 03:44:53.762278	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a78138c7-0bc2-4461-82c6-159275139c4f	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	17322c3a-8323-4ea9-b093-ab69d2df6bfe	\N	{"name":"Chemicals ","generic_name":"chemicals","category":"Pain Killer","unit":"TAB","is_controlled":false,"minimum_stock_level":43}	\N	f	2026-04-05 03:49:33.045706	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a868b354-455d-4163-8d3e-6bb27c2ef240	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	batches	a9f7cfdc-9438-432d-9722-95595e888a92	\N	{"batch_number":"BN-LLR#4D","medicine_id":"17322c3a-8323-4ea9-b093-ab69d2df6bfe","initial_quantity":435}	\N	f	2026-04-05 03:50:14.443488	cfc876dd-c6e3-4283-b705-0cd86ac95e00
cb0b0de6-6bdd-4065-a1c8-7cd80b3d66ce	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	batches	44ce660c-60eb-47bb-a1b0-3259eda9f73d	\N	{"batch_number":"BN-ghep=riei","medicine_id":"e9733e4c-1c2d-499f-a747-7dffe3772488","initial_quantity":9045}	\N	f	2026-04-05 03:50:52.275373	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a00a2d05-c7bf-49a5-b432-6dd3713f9ea5	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	ec7c2917-11db-4912-b126-d82273bb1f9c	\N	{"total_amount":"150.00","items_count":1}	\N	f	2026-04-05 03:51:10.747718	cfc876dd-c6e3-4283-b705-0cd86ac95e00
88d19170-34ca-4ce9-b3a8-1bed208e54d8	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	e16af5c8-7cc5-4d38-9fd2-bc0fbd53c401	\N	{"total_amount":"66.00","items_count":2}	\N	f	2026-04-05 03:51:21.489941	cfc876dd-c6e3-4283-b705-0cd86ac95e00
df1862ab-27be-4dba-b2d9-f1c09d67a36b	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	18410b59-9288-47b2-803d-52270aefe167	\N	{"medicine_id":"17322c3a-8323-4ea9-b093-ab69d2df6bfe","batch_number":"BN-PUR-NE3","expiry_date":"2033-11-05","purchase_price":9,"selling_price":14.5,"initial_quantity":10}	\N	f	2026-04-05 04:14:56.38807	cfc876dd-c6e3-4283-b705-0cd86ac95e00
56d4b18d-5b4f-4915-bb37-3abe28889905	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	18410b59-9288-47b2-803d-52270aefe167	\N	{"medicine_id":"17322c3a-8323-4ea9-b093-ab69d2df6bfe","batch_number":"BN-PUR-NE3","expiry_date":"2033-11-05","purchase_price":9,"selling_price":14.4,"initial_quantity":10}	\N	f	2026-04-05 04:15:11.491562	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ae0c2567-bc4b-4cec-af51-9f4cd055e6c6	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	18410b59-9288-47b2-803d-52270aefe167	\N	{"medicine_id":"17322c3a-8323-4ea9-b093-ab69d2df6bfe","batch_number":"BN-PUR-NEw","expiry_date":"2033-11-05","purchase_price":9,"selling_price":14.4,"initial_quantity":10}	\N	f	2026-04-05 04:15:21.205429	cfc876dd-c6e3-4283-b705-0cd86ac95e00
50d53400-c0ca-4c28-a975-795ae8867c4c	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	18410b59-9288-47b2-803d-52270aefe167	\N	{"medicine_id":"17322c3a-8323-4ea9-b093-ab69d2df6bfe","batch_number":"BN-PUR-OLD","expiry_date":"2033-11-05","purchase_price":9,"selling_price":14.4,"initial_quantity":10}	\N	f	2026-04-05 04:15:36.521333	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ad15d4ca-7d76-443d-ade7-765be34a4cbc	5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	CREATE	patients	563e65ce-3edf-4c51-ad57-e156424bfb8d	\N	{"name":"Asmare dinku"}	\N	f	2026-04-05 05:04:36.906409	37448208-174d-473e-a2eb-a031a33e298e
d1481213-85ba-4b08-82fe-c7d757d447f1	5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	SELL	sales	307736bc-783d-4983-b71e-e9f4bd5fe516	\N	{"total_amount":"56.00","items_count":2}	\N	f	2026-04-05 05:04:38.94212	37448208-174d-473e-a2eb-a031a33e298e
382d0cf8-a8ca-4dc7-9462-b1edffdad147	5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	SELL	sales	dc97486e-fb9a-480a-af09-1654a9b828bc	\N	{"total_amount":"84.00","items_count":1}	\N	f	2026-04-05 05:04:53.701817	37448208-174d-473e-a2eb-a031a33e298e
3146ce82-eb42-44ec-899e-d8d4b8c1f855	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	44ce660c-60eb-47bb-a1b0-3259eda9f73d	\N	{"medicine_id":"e9733e4c-1c2d-499f-a747-7dffe3772488","batch_number":"BN-ghep=riei","expiry_date":"2029-05-23","purchase_price":12,"selling_price":16,"initial_quantity":9045}	\N	f	2026-04-05 05:12:02.348218	cfc876dd-c6e3-4283-b705-0cd86ac95e00
947aeeb0-1a77-49c4-a61d-11fd265b2f3f	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	44ce660c-60eb-47bb-a1b0-3259eda9f73d	\N	{"medicine_id":"e9733e4c-1c2d-499f-a747-7dffe3772488","batch_number":"BN-ghep=riei","expiry_date":"2029-05-23","purchase_price":12,"selling_price":16,"initial_quantity":9040}	\N	f	2026-04-05 05:12:18.447552	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0560869c-65e0-44f4-821c-f8f3ad00df35	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	4119856f-81f8-4193-9162-c6583590e935	\N	{"name":"carteee","generic_name":"catt","category":"killer","unit":"TAB","is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-05 05:12:46.565449	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f2efda65-046b-4f69-80b2-f6bb5fcb9e03	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	batches	e260efd1-591d-490a-a30b-96157cda9630	\N	{"batch_number":"BN-MVN=jk","medicine_id":"4119856f-81f8-4193-9162-c6583590e935","initial_quantity":400}	\N	f	2026-04-05 05:13:11.880163	cfc876dd-c6e3-4283-b705-0cd86ac95e00
022052e0-dc75-42f7-a1c3-c040112782a2	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	44ce660c-60eb-47bb-a1b0-3259eda9f73d	\N	{"medicine_id":"e9733e4c-1c2d-499f-a747-7dffe3772488","batch_number":"BN-ghep=riei","expiry_date":"2029-05-23","purchase_price":12,"selling_price":16,"initial_quantity":600}	\N	f	2026-04-05 05:13:39.657323	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c0bbe26e-80dd-48f8-8c3e-ac72a450e841	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	a9f7cfdc-9438-432d-9722-95595e888a92	{"batch_number":"BN-LLR#4D"}	\N	\N	f	2026-04-05 05:13:52.989606	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ce5a5346-8ff9-46a0-ac88-103a38e04dac	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	08de2b53-b269-45dc-9bb1-682a8839d3f4	{"batch_number":"BN-PUR-NEW"}	\N	\N	f	2026-04-05 05:13:56.590951	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c698cc97-5179-46d2-b96c-c867530ef09d	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	18410b59-9288-47b2-803d-52270aefe167	{"batch_number":"BN-PUR-OLD"}	\N	\N	f	2026-04-05 05:13:59.068506	cfc876dd-c6e3-4283-b705-0cd86ac95e00
4277c81d-cfa1-43ab-8113-67c46d5b0c39	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	faad34b2-15fe-49d8-8b3d-35b0b4fb4f21	{"batch_number":"BN-New"}	\N	\N	f	2026-04-05 05:14:01.411465	cfc876dd-c6e3-4283-b705-0cd86ac95e00
fd42c9d4-c423-497a-a3e4-f8d169c1329d	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	44ce660c-60eb-47bb-a1b0-3259eda9f73d	{"batch_number":"BN-ghep=riei"}	\N	\N	f	2026-04-05 05:14:06.956248	cfc876dd-c6e3-4283-b705-0cd86ac95e00
52dd4252-7a86-4b99-b02e-ac8ecbb31f34	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	batches	8600de43-040c-4d45-8bb1-cd263b46747e	\N	{"batch_number":"BN-2026-ll2","medicine_id":"17322c3a-8323-4ea9-b093-ab69d2df6bfe","initial_quantity":1230}	\N	f	2026-04-05 05:14:46.719863	cfc876dd-c6e3-4283-b705-0cd86ac95e00
876db1ae-650a-4d32-9443-d49510780b46	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	batches	f0487fc4-7121-44e5-93c1-13774015314a	\N	{"batch_number":"BN-2026-ll3","medicine_id":"e9733e4c-1c2d-499f-a747-7dffe3772488","initial_quantity":720}	\N	f	2026-04-05 05:15:19.550782	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d8f02c85-32d2-4ea8-8f46-245ced282f52	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	medicines	e9733e4c-1c2d-499f-a747-7dffe3772488	{"name":"chesmo","category":"","unit":"TAB"}	{"name":"chesmo","generic_name":"chesmo","category":"Antibiotics","unit":"TAB","minimum_stock_level":10,"is_controlled":false}	\N	f	2026-04-05 05:15:31.188063	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5866e774-4f35-4d47-805e-a346478fef11	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	6f723d89-eade-4a45-8042-aceb275b54d0	\N	{"total_amount":"38.00","items_count":3}	\N	f	2026-04-05 05:15:40.865557	cfc876dd-c6e3-4283-b705-0cd86ac95e00
03219581-f428-4d21-8863-89d349c88eaa	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	397696d8-fc94-4268-8569-48a1bd5bad5c	\N	{"total_amount":"48.00","items_count":1}	\N	f	2026-04-05 05:54:42.805865	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5008ed9f-acf2-4c96-8f27-4c505f40be41	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	76942773-43f5-4d5e-a5be-742c91377fe2	\N	{"total_amount":"24.00","items_count":1}	\N	f	2026-04-05 05:54:47.468583	cfc876dd-c6e3-4283-b705-0cd86ac95e00
13a0f2a0-b597-4b12-9397-6ffa4cd48550	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	81ea01b0-c189-4107-8885-69cbd12eaffd	\N	{"name":"Chemistry 400mg","generic_name":"chemistry of life","category":"Antiboitics","unit":"Capsule","is_controlled":false,"minimum_stock_level":34}	\N	f	2026-04-05 06:02:20.386889	cfc876dd-c6e3-4283-b705-0cd86ac95e00
6933a590-fee8-400c-a7d6-a92b90963907	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	batches	35edf1d6-ee7d-447e-8cf2-372e49290d18	\N	{"batch_number":"BN_2026_NEW","medicine_id":"81ea01b0-c189-4107-8885-69cbd12eaffd","initial_quantity":2450}	\N	f	2026-04-05 06:03:07.761824	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0c79e3a4-de56-4ca7-b7b1-6aaac4674afc	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	e40ea462-60eb-43dc-b34f-570d6f4c73ae	\N	{"total_amount":"136.00","items_count":1}	\N	f	2026-04-05 06:03:27.581944	cfc876dd-c6e3-4283-b705-0cd86ac95e00
06d10170-d06c-4e92-b8f4-f164837277d3	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	208fdafa-1e76-464f-8b4c-caf0d59e767c	\N	{"total_amount":"34.00","items_count":1}	\N	f	2026-04-05 06:23:18.280798	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5383b32d-1435-4de3-a811-9ee4392e4b8b	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	patients	1bc787bc-83ee-453e-8f78-871e959b2607	\N	{"name":"cu-test"}	\N	f	2026-04-05 06:26:44.427968	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b2e9a066-2d4b-4bfe-a7de-15f4ec67e51c	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	39e2993e-a54c-48ab-bde3-4b73c86dcd84	\N	{"total_amount":"2024.00","items_count":1}	\N	f	2026-04-05 06:26:47.66969	cfc876dd-c6e3-4283-b705-0cd86ac95e00
8872c1ad-d9dc-45e7-b7fa-767b84f44132	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	52b6aed3-5405-426a-b2c8-3994e4159366	\N	{"total_amount":"800.00","items_count":1}	\N	f	2026-04-05 06:27:12.850507	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c1ca9246-dc13-41e9-9867-2530d3ee0624	46282536-d3c2-4d26-9a61-afd2de2c3534	REFUND	sales	39e2993e-a54c-48ab-bde3-4b73c86dcd84	\N	{"amount":2024,"medicine_id":"4119856f-81f8-4193-9162-c6583590e935"}	\N	f	2026-04-05 06:41:47.014489	cfc876dd-c6e3-4283-b705-0cd86ac95e00
7593e141-5bf3-4b7b-a3c0-b732e0a14d87	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	UPDATE	batches	e260efd1-591d-490a-a30b-96157cda9630	\N	{"medicine_id":"4119856f-81f8-4193-9162-c6583590e935","batch_number":"BN-MVN=jk","expiry_date":"2026-07-29","purchase_price":3,"selling_price":8,"initial_quantity":280}	\N	f	2026-04-05 06:44:02.150851	cfc876dd-c6e3-4283-b705-0cd86ac95e00
4d4888a5-3c3b-4673-96f3-cd5553760d01	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	UPDATE	batches	e260efd1-591d-490a-a30b-96157cda9630	\N	{"medicine_id":"4119856f-81f8-4193-9162-c6583590e935","batch_number":"BN-009-20290","expiry_date":"2026-07-29","purchase_price":3,"selling_price":8,"initial_quantity":280}	\N	f	2026-04-05 06:44:37.934104	cfc876dd-c6e3-4283-b705-0cd86ac95e00
827a5c9c-9914-497e-9d93-f0f7ef2e96d8	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	medicines	4119856f-81f8-4193-9162-c6583590e935	{"name":"carteee","category":"killer","unit":"TAB"}	{"name":"carteee","generic_name":"catt","category":"killer","unit":"TAB","minimum_stock_level":280,"is_controlled":false}	\N	f	2026-04-05 12:52:40.412272	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0792054c-53f2-4a84-a63d-29d1149a31b1	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	28342ed9-677e-4cd7-8b26-a4f928ce2f58	\N	{"total_amount":"144.00","items_count":1}	\N	f	2026-04-05 12:52:54.465785	cfc876dd-c6e3-4283-b705-0cd86ac95e00
59d0448e-c584-4524-b2c9-c0d776e3465d	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	medicines	4119856f-81f8-4193-9162-c6583590e935	{"name":"carteee","category":"killer","unit":"TAB"}	{"name":"carteee","generic_name":"catt","category":"killer","unit":"TAB","minimum_stock_level":30,"is_controlled":false}	\N	f	2026-04-05 13:40:14.238586	cfc876dd-c6e3-4283-b705-0cd86ac95e00
859c76de-5907-441f-bba6-cb814126b0a3	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	a01dc628-6991-4737-848c-c98e4040a322	\N	{"total_amount":"104.00","items_count":4}	\N	f	2026-04-06 01:22:20.781326	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a4a7436b-a06d-40f1-b1b7-6aad934879e9	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	00d7a16f-9fa2-4d9a-b112-a96fe29d41eb	\N	{"total_amount":"8.00","items_count":1}	\N	f	2026-04-06 01:38:18.475602	cfc876dd-c6e3-4283-b705-0cd86ac95e00
e22b71f4-808e-4d3e-b302-2a2a9498309c	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	c7d4b78f-85b4-4729-99a0-dc8d73c3be05	\N	{"name":"test","generic_name":"test 123263717","category":"7600","unit":"TAB","is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-06 03:54:30.310475	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1c2b4912-d4ca-4600-a124-6bc3bd252fc8	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	batches	21638636-d515-4715-923e-42c8b415848e	\N	{"batch_number":"BN-new-123","medicine_id":"c7d4b78f-85b4-4729-99a0-dc8d73c3be05","initial_quantity":18}	\N	f	2026-04-06 03:54:58.302985	cfc876dd-c6e3-4283-b705-0cd86ac95e00
68050dc5-8708-48a9-9a29-23c021a31104	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	25504db3-7107-4f0c-99ce-6ee505b4d8d7	\N	{"total_amount":"216.00","items_count":1}	\N	f	2026-04-06 03:55:33.565873	cfc876dd-c6e3-4283-b705-0cd86ac95e00
9f039448-6aae-448e-a470-7db9709318e4	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	21638636-d515-4715-923e-42c8b415848e	\N	{"medicine_id":"c7d4b78f-85b4-4729-99a0-dc8d73c3be05","batch_number":"BN-new-123","expiry_date":"2026-05-08","purchase_price":10,"selling_price":12,"initial_quantity":20}	\N	f	2026-04-06 03:56:22.189834	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a564dfd0-aea9-4b0b-9e30-7e23565d974f	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	21638636-d515-4715-923e-42c8b415848e	\N	{"medicine_id":"c7d4b78f-85b4-4729-99a0-dc8d73c3be05","batch_number":"BN-new-123","expiry_date":"2026-05-08","purchase_price":10,"selling_price":12,"initial_quantity":12}	\N	f	2026-04-06 03:58:45.627263	cfc876dd-c6e3-4283-b705-0cd86ac95e00
60370a91-c1c6-42a4-9ca3-e2419dcea2f5	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	21638636-d515-4715-923e-42c8b415848e	\N	{"medicine_id":"c7d4b78f-85b4-4729-99a0-dc8d73c3be05","batch_number":"BN-new-123","expiry_date":"2026-05-08","purchase_price":10,"selling_price":12,"initial_quantity":15}	\N	f	2026-04-06 03:59:25.003671	cfc876dd-c6e3-4283-b705-0cd86ac95e00
15906871-60eb-436e-ba9e-0c0129a7ec2d	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	6374c23e-dd65-4653-92fc-bd52fb9d607b	\N	{"medicine_id":"c7d4b78f-85b4-4729-99a0-dc8d73c3be05","batch_number":"BN-new-124","expiry_date":"2026-05-09","purchase_price":10,"selling_price":15,"initial_quantity":16}	\N	f	2026-04-06 04:02:27.248346	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c29c559e-01ea-4150-8c08-ed03437215f4	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	c1d73f48-2229-4f27-8947-9a138b47c8b2	\N	{"total_amount":"238.00","items_count":1}	\N	f	2026-04-11 03:51:16.671124	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0428be56-ec36-4865-9c91-a37e986add5d	46282536-d3c2-4d26-9a61-afd2de2c3534	SELL	sales	58236be7-155e-42b4-8d29-c3984ca09aac	\N	{"total_amount":"128.00","items_count":1}	\N	f	2026-04-11 03:53:09.383552	cfc876dd-c6e3-4283-b705-0cd86ac95e00
616b9f58-9311-4ee4-aa26-1cc35c9cf1a0	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	c2fd0a43-2efc-445f-81d5-fadde98d449f	\N	{"order_number":"ORD-20260411-KR1A","total_amount":140,"items_count":3}	\N	f	2026-04-11 04:18:56.343551	cfc876dd-c6e3-4283-b705-0cd86ac95e00
fb2486cd-c460-4ce4-8787-a912d03ec131	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	ad228cc9-b81c-4e39-ab55-8fe2f1f84a32	\N	{"total_amount":"140.00","payment_account":"CBE"}	\N	f	2026-04-11 04:35:17.083684	cfc876dd-c6e3-4283-b705-0cd86ac95e00
162b1ea3-1562-413e-8c78-22b0f3efe289	46282536-d3c2-4d26-9a61-afd2de2c3534	REFUND	sales	ad228cc9-b81c-4e39-ab55-8fe2f1f84a32	\N	{"amount":56,"medicine_id":"e9733e4c-1c2d-499f-a747-7dffe3772488"}	\N	f	2026-04-11 06:02:16.067566	cfc876dd-c6e3-4283-b705-0cd86ac95e00
015e6ef9-ac92-4e8a-b069-22c6105f0a02	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	ab9d32cc-305a-4976-b04e-dd249102cb19	\N	{"order_number":"ORD-20260411-21UR","total_amount":64,"items_count":1}	\N	f	2026-04-11 06:11:56.362243	cfc876dd-c6e3-4283-b705-0cd86ac95e00
cb159b36-0dad-4071-aa93-6876aa9e12b7	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	8c60d5b0-ecf7-4bd8-9aa3-054dddac1d6d	\N	{"order_number":"ORD-20260411-FIT5","total_amount":8,"items_count":1}	\N	f	2026-04-11 06:13:15.323833	cfc876dd-c6e3-4283-b705-0cd86ac95e00
21257470-2318-488d-9d2d-1239f224f7b2	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	31709fb3-c81e-4129-89d9-f2908cecb29f	\N	{"total_amount":"8.00","payment_account":"CBE"}	\N	f	2026-04-11 06:14:00.545949	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d52fc970-1627-404e-a888-aa2f416a73e4	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	patients	a7602f9a-4468-485e-bd58-0c2271abbf8b	\N	{"name":"chuch"}	\N	f	2026-04-11 08:07:52.728255	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a975b4bd-d03f-4336-ae64-ebc527622715	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	patients	120544d7-3f26-4dd0-8587-77d43c2ba48d	\N	{"name":"new custimer"}	\N	f	2026-04-11 08:08:27.251031	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0699d426-49c2-4bc6-9f95-7a5366b53ad7	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	patients	3ff7110f-a45d-4040-8a79-f54624059d10	\N	{"name":"new cust"}	\N	f	2026-04-11 08:08:49.888768	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d0920ab6-3aad-4f47-9a19-7665a54ef6b6	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	ca7ca10e-4e94-430c-b8f9-8e69005685a2	\N	{"order_number":"ORD-20260411-IUHA","total_amount":16,"items_count":1}	\N	f	2026-04-11 08:09:37.188322	cfc876dd-c6e3-4283-b705-0cd86ac95e00
e94a5df8-e47b-43b1-9543-0018cf86ec65	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	4d4ef74a-be11-4451-80c9-9156970969be	\N	{"total_amount":"16.00","payment_account":"Abysinnia Bank"}	\N	f	2026-04-11 08:10:12.186618	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0a00a0c1-72f6-4774-ad1f-79fb62fb0317	46282536-d3c2-4d26-9a61-afd2de2c3534	REFUND	sales	4d4ef74a-be11-4451-80c9-9156970969be	\N	{"amount":16,"medicine_id":"17322c3a-8323-4ea9-b093-ab69d2df6bfe"}	\N	f	2026-04-11 08:11:20.745942	cfc876dd-c6e3-4283-b705-0cd86ac95e00
32c6e409-94b7-48f3-bab9-b9d1b3d2f8a8	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	780433ed-886a-426b-a206-3d15d6d3c915	\N	{"order_number":"ORD-20260411-REDR","total_amount":32,"items_count":1}	\N	f	2026-04-11 08:41:34.431419	cfc876dd-c6e3-4283-b705-0cd86ac95e00
156b4c7a-cc14-4311-94ae-800624bb8f64	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	b7d30835-ee83-4156-b9c2-a605485d42b4	\N	{"total_amount":"32.00","payment_account":"Abysinnia Bank"}	\N	f	2026-04-11 08:42:52.064635	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0fe588c3-e7d7-42cd-8573-dfadc487fce5	46282536-d3c2-4d26-9a61-afd2de2c3534	REFUND	sales	b7d30835-ee83-4156-b9c2-a605485d42b4	\N	{"amount":32,"medicine_id":"4119856f-81f8-4193-9162-c6583590e935"}	\N	f	2026-04-11 08:48:00.971431	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b0c7fc44-fc4f-42ee-b9ee-d5505591c993	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	9f159911-9ffb-4251-bece-046f4fd75613	\N	{"order_number":"ORD-20260413-I12E","total_amount":228,"items_count":2}	\N	f	2026-04-13 10:26:27.157956	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c873b359-7a06-48e9-8c78-4db9ac1d71bb	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	e4b15235-0af7-4ef2-a397-1dbc8a7129f2	\N	{"total_amount":"228.00","payment_account":"Tellebirr"}	\N	f	2026-04-13 10:33:32.465604	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ad2d5cf9-8a24-4ba2-9bc1-5f7bfb73f03e	46282536-d3c2-4d26-9a61-afd2de2c3534	REFUND	sales	e4b15235-0af7-4ef2-a397-1dbc8a7129f2	\N	{"amount":84,"medicine_id":"e9733e4c-1c2d-499f-a747-7dffe3772488"}	\N	f	2026-04-13 10:52:54.737215	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f2cea6b8-ea25-495b-a844-5cfcd6670bb4	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	e3e4bf9a-5b51-475d-835f-829814154ce4	\N	{"name":"Nivea Lotion Bodyy","category":"Skin Care","unit":"PCS","minimum_stock_level":5,"product_type":"COSMETIC","preferred_supplier_id":"506ce147-b96a-4b5e-bb7c-db4cecd62b8a"}	\N	f	2026-04-13 12:55:02.75959	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5a3eb0c2-584d-42a3-afa8-49aeb2311285	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	e3e4bf9a-5b51-475d-835f-829814154ce4	{"name":"Nivea Lotion Bodyy"}	\N	\N	f	2026-04-13 12:55:36.694432	cfc876dd-c6e3-4283-b705-0cd86ac95e00
23cbc773-e12d-4acf-b5db-12f639df9497	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	97d7d8ed-2b6a-4518-be21-f23f118d7512	\N	{"name":"Nivea Body Lotion","category":"Skin Care","unit":"BOTTLE","minimum_stock_level":5,"product_type":"COSMETIC","preferred_supplier_id":"43ba81a5-6f63-4532-8c8e-33295d55060d"}	\N	f	2026-04-13 12:56:00.946036	cfc876dd-c6e3-4283-b705-0cd86ac95e00
af79cfe8-393a-454a-8f45-9d5330742b30	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	17c16570-4097-40f4-92b1-f9f806e468e1	\N	{"name":"FOGGE Body Sprirant","category":"Fragrances","unit":"PCS","minimum_stock_level":5,"product_type":"COSMETIC","preferred_supplier_id":"7ef164e7-09e3-4a3a-96d9-dfbed63bd042"}	\N	f	2026-04-13 12:56:36.551851	cfc876dd-c6e3-4283-b705-0cd86ac95e00
db7d0c96-4d38-42c3-b422-99a6fafd3840	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	REFUND	sales	e4b15235-0af7-4ef2-a397-1dbc8a7129f2	\N	{"amount":144,"medicine_id":"17322c3a-8323-4ea9-b093-ab69d2df6bfe"}	\N	f	2026-04-13 12:58:45.461594	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b598ce36-1ef9-4ef9-b41e-2ad697874657	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	5e687d08-0c32-4614-a3e2-cf2db459bd91	\N	{"order_number":"ORD-20260413-WFBM","total_amount":160,"items_count":1}	\N	f	2026-04-13 13:36:54.653075	cfc876dd-c6e3-4283-b705-0cd86ac95e00
6031f455-b54f-453c-b15d-c3b4ca2c2dff	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	94e93b26-6b5a-492f-bbb9-f7cbb5f7504d	\N	{"total_amount":"160.00","payment_account":"Tellebirr"}	\N	f	2026-04-13 13:37:21.320644	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3c2e1834-009a-403d-a36b-0159f5699c96	196cf18c-9db4-45f0-a518-a3fe0ae0d70c	CREATE	medicines	cccee9c5-23e6-4cb6-9046-6b89a22021e4	\N	{"name":"Snail Hail Oil","category":"Make down","unit":"TABLET","minimum_stock_level":8,"product_type":"COSMETIC","preferred_supplier_id":"43ba81a5-6f63-4532-8c8e-33295d55060d"}	\N	f	2026-04-13 13:56:24.108309	cfc876dd-c6e3-4283-b705-0cd86ac95e00
94699277-a5c4-4cbc-b1c1-bdf0b6f6f364	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	f61596a6-df22-4555-b928-4ec9a2bab0f9	\N	{"medicine_id":"17322c3a-8323-4ea9-b093-ab69d2df6bfe","batch_number":"BN-NEW","expiry_date":"2030-11-09","purchase_price":6,"selling_price":9,"initial_quantity":70}	\N	f	2026-04-13 14:12:49.53139	cfc876dd-c6e3-4283-b705-0cd86ac95e00
2ba7870a-2b7e-4dfb-969c-81f021749d1e	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	289e62ff-c7db-4c5c-927d-d8daafb03b7b	\N	{"order_number":"ORD-20260413-7HBB","total_amount":16,"items_count":1}	\N	f	2026-04-13 16:38:46.155289	cfc876dd-c6e3-4283-b705-0cd86ac95e00
15d843da-693a-490e-99da-fa79891b3734	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	ad0156fa-1f94-423d-a5bb-9391d2e93895	\N	{"total_amount":"16.00","payment_account":"Tellebirr"}	\N	f	2026-04-13 16:39:34.998788	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f77395e8-c30a-42c8-af5e-a3a8157d6428	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	67271379-ce8e-4f03-a701-f04549ebc057	\N	{"order_number":"ORD-20260415-64LX","total_amount":6600,"items_count":2}	\N	f	2026-04-15 11:27:59.308439	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3b4032d4-b6b4-4935-bddf-33e148dd4687	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	509bc1a8-8179-4973-a54c-fa4f92c669e4	\N	{"total_amount":"6600.00","payment_account":"Abysinnia Bank"}	\N	f	2026-04-15 11:28:47.433144	cfc876dd-c6e3-4283-b705-0cd86ac95e00
bd14b387-18d7-4529-a9ea-799d4cd6b6b0	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	4025da0d-fca2-4e42-b592-71239dc767f2	\N	{"order_number":"ORD-20260415-GFQ4","total_amount":18105,"items_count":3}	\N	f	2026-04-15 11:30:06.565527	cfc876dd-c6e3-4283-b705-0cd86ac95e00
77e789b1-55af-46f8-85f3-f79ca12cbabe	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	eb44767b-79d1-4875-a671-c1b1eeb1bf27	\N	{"total_amount":"18105.00","payment_account":"Tellebirr"}	\N	f	2026-04-15 11:30:19.443829	cfc876dd-c6e3-4283-b705-0cd86ac95e00
edadcda3-bf75-413a-b908-338661cfba3b	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	3d697552-33e3-4ff9-9533-640f40d7cff0	\N	{"order_number":"ORD-20260415-41D2","total_amount":16,"items_count":1}	\N	f	2026-04-15 11:58:26.503461	cfc876dd-c6e3-4283-b705-0cd86ac95e00
91b25b67-e938-4cb1-be46-7550e3b3c2ab	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	eb2b83b9-c896-4c1b-8377-33b7c0cc5b4e	\N	{"total_amount":"16.00","payment_account":"Pitty Cash"}	\N	f	2026-04-15 11:59:08.316083	cfc876dd-c6e3-4283-b705-0cd86ac95e00
73d9b216-f204-42f3-b2f6-7c353738d251	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	1c4b8ba0-e944-46ab-9225-7254502530de	\N	{"order_number":"ORD-20260415-DL64","total_amount":64,"items_count":1}	\N	f	2026-04-15 11:59:20.702518	cfc876dd-c6e3-4283-b705-0cd86ac95e00
042395a0-aa77-41ef-a5df-a82c9b368daf	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	31494f23-f0f4-4f2e-a2a6-e3b8d825bb13	\N	{"order_number":"ORD-20260415-YWF1","total_amount":1200,"items_count":2}	\N	f	2026-04-15 11:59:27.999313	cfc876dd-c6e3-4283-b705-0cd86ac95e00
eaf15305-44c4-4bd1-891d-36bcc515ddcb	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	0c716437-a064-4a0b-94a3-52530fe4b5f4	\N	{"order_number":"ORD-20260415-55P7","total_amount":1800,"items_count":1}	\N	f	2026-04-15 11:59:34.033926	cfc876dd-c6e3-4283-b705-0cd86ac95e00
fff82478-cf19-456d-9a65-3679435681fa	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	03f86dee-8dfd-4ffb-a0b4-94e685d36716	\N	{"total_amount":"64.00","payment_account":"Abysinnia Bank"}	\N	f	2026-04-15 12:00:00.678028	cfc876dd-c6e3-4283-b705-0cd86ac95e00
bb03dc48-aa3b-48b5-a0cd-a9fe4a5b6f6a	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	9166e24c-fe8e-4d72-84bc-1f90ac40c820	\N	{"order_number":"ORD-20260415-EOIQ","total_amount":1200,"items_count":1}	\N	f	2026-04-15 13:35:05.506949	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5791fd7b-9c84-4e24-ba15-c8315e28f375	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	f62ab9fd-9279-4a01-b5ed-7ba2117640b9	\N	{"order_number":"ORD-20260415-F9LJ","total_amount":900,"items_count":1}	\N	f	2026-04-15 13:37:30.461033	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1d0fc5e3-8b48-497c-86e9-9060a2c94007	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	72a0a007-9f93-431b-9de1-865670396ca8	\N	{"order_number":"ORD-20260415-CHWE","total_amount":0,"items_count":1}	\N	f	2026-04-15 13:45:34.181836	cfc876dd-c6e3-4283-b705-0cd86ac95e00
8a29688b-a4bd-46e8-b187-408f35f59bb2	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	e6e2e2ba-0f37-412f-8850-97997423eccb	\N	{"order_number":"ORD-20260415-D4FV","total_amount":1200,"items_count":1}	\N	f	2026-04-15 13:56:16.367369	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b7788b68-17cf-4dc4-8f6c-046323b60b74	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	558c496d-f2f4-47bc-a07b-dd81295f3d02	\N	{"order_number":"ORD-20260415-U22M","total_amount":1200,"items_count":1}	\N	f	2026-04-15 13:57:14.782613	cfc876dd-c6e3-4283-b705-0cd86ac95e00
9daaeafe-eeab-4993-a0ed-58db2f51fe08	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	2a14a0cc-33c9-4fbf-a576-68047035a114	\N	{"total_amount":"1200.00","payment_account":"Abysinnia Bank"}	\N	f	2026-04-15 13:57:59.381425	cfc876dd-c6e3-4283-b705-0cd86ac95e00
4dd9a371-85ce-41cc-840b-1cec5414595c	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	1b941d5b-ec66-4d60-8d0c-3ca487c5c628	\N	{"total_amount":"1800.00","payment_account":"Abysinnia Bank"}	\N	f	2026-04-15 13:58:16.543482	cfc876dd-c6e3-4283-b705-0cd86ac95e00
4059db58-8bc7-4ad3-b41d-b68629aa79ae	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	SELL	sales	29ebece4-1cc7-49d8-86fc-70153f3405ea	\N	{"total_amount":"1200.00","payment_account":"Pitty Cash"}	\N	f	2026-04-15 13:58:24.947004	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d95dd4f8-2660-49b4-a660-c9f8771ab83e	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	medicines	17322c3a-8323-4ea9-b093-ab69d2df6bfe	{"name":"Chemicals ","category":"Pain Killer","unit":"TAB"}	{"sku":"MED-001","name":"Amoxiciilin 500 mg","generic_name":"Amoxiccilin","dosage_form":"Tablet","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":43}	\N	f	2026-04-16 02:59:20.447209	cfc876dd-c6e3-4283-b705-0cd86ac95e00
7a4911b9-63a3-45c5-905b-294f4ae328bb	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	e1a193a4-7138-49de-a998-6ffd0f834040	\N	{"sku":"MED-002","name":"Medical Supply - 1","generic_name":"Medicla Supplies","unit":"TAB","is_expirable":false,"is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-16 03:01:44.914697	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5bcbd858-89aa-4cff-8f93-8c006d1c35d6	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	5da180da-46cb-4ba7-899c-e8824c1236c9	\N	{"sku":"MED-003","name":"Ibuprofen 25 mg","generic_name":"Ibuprofen","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":30,"batch_number":"BN-001","initial_quantity":200,"selling_price":5,"purchase_price":0,"expiry_date":"2030-09-01"}	\N	f	2026-04-16 03:04:07.566665	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c2d72a9b-9d42-4fb9-b305-a6692ef8ae74	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	fed88b6d-7215-4fd3-a3ab-2cda5120045f	\N	{"medicine_id":"5da180da-46cb-4ba7-899c-e8824c1236c9","batch_number":"BN-001","expiry_date":"2030-09-01","purchase_price":4,"selling_price":5,"initial_quantity":200}	\N	f	2026-04-16 03:04:38.80607	cfc876dd-c6e3-4283-b705-0cd86ac95e00
18d1d4fd-359d-4ed7-9b53-cd75bdec2468	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	cccee9c5-23e6-4cb6-9046-6b89a22021e4	{"name":"Snail Hail Oil"}	\N	\N	f	2026-04-16 03:07:31.928588	cfc876dd-c6e3-4283-b705-0cd86ac95e00
bf789336-ce82-435c-875f-d2d8fb048408	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	e9733e4c-1c2d-499f-a747-7dffe3772488	{"name":"chesmo"}	\N	\N	f	2026-04-16 03:07:36.496838	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d016a560-7498-4f08-b91f-399e90c9e4ce	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	c7d4b78f-85b4-4729-99a0-dc8d73c3be05	{"name":"test"}	\N	\N	f	2026-04-16 03:07:40.379663	cfc876dd-c6e3-4283-b705-0cd86ac95e00
4a15f175-ed3a-45fb-8cdd-011847ef98a4	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	97d7d8ed-2b6a-4518-be21-f23f118d7512	{"name":"Nivea Body Lotion"}	\N	\N	f	2026-04-16 03:08:06.266562	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c7a0b690-6028-4c3f-a2be-ff1940079c2e	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	81ea01b0-c189-4107-8885-69cbd12eaffd	{"name":"Chemistry 400mg"}	\N	\N	f	2026-04-16 03:08:11.287686	cfc876dd-c6e3-4283-b705-0cd86ac95e00
41e327a6-61aa-405e-b7fd-7860a48de661	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	5da180da-46cb-4ba7-899c-e8824c1236c9	{"name":"Ibuprofen 25 mg"}	\N	\N	f	2026-04-16 03:08:15.235547	cfc876dd-c6e3-4283-b705-0cd86ac95e00
e5e09e15-28dc-4849-a7c2-1c60d0a236b3	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	4119856f-81f8-4193-9162-c6583590e935	{"name":"carteee"}	\N	\N	f	2026-04-16 03:08:19.827598	cfc876dd-c6e3-4283-b705-0cd86ac95e00
63990f96-b729-4b4e-860c-c71e7227f378	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	17c16570-4097-40f4-92b1-f9f806e468e1	{"name":"FOGGE Body Sprirant"}	\N	\N	f	2026-04-16 03:08:25.297219	cfc876dd-c6e3-4283-b705-0cd86ac95e00
75b515bd-2388-4a9d-9620-b05358b3e587	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	17322c3a-8323-4ea9-b093-ab69d2df6bfe	{"name":"Amoxiciilin 500 mg"}	\N	\N	f	2026-04-16 03:08:30.244327	cfc876dd-c6e3-4283-b705-0cd86ac95e00
6202d9ad-2bdd-468b-948a-f4e35f4e9508	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	medicines	e1a193a4-7138-49de-a998-6ffd0f834040	{"name":"Medical Supply - 1","category":null,"unit":"TAB"}	{"sku":"MED-002","name":"Medical Supply - 1","generic_name":"Medicla Supplies","unit":"KKL","is_expirable":false,"is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-16 03:09:28.562545	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f2d8e513-7150-4430-b7ee-07da24d4e822	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	e1a193a4-7138-49de-a998-6ffd0f834040	{"name":"Medical Supply - 1"}	\N	\N	f	2026-04-16 03:10:48.968362	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b11feae8-5655-47f7-8dca-86e96bc0a550	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	6374c23e-dd65-4653-92fc-bd52fb9d607b	{"batch_number":"BN-new-124"}	\N	\N	f	2026-04-16 03:11:06.308829	cfc876dd-c6e3-4283-b705-0cd86ac95e00
bbb19c52-6113-41c5-acd5-64b1fac54a89	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	8600de43-040c-4d45-8bb1-cd263b46747e	{"batch_number":"BN-2026-ll2"}	\N	\N	f	2026-04-16 03:11:09.090407	cfc876dd-c6e3-4283-b705-0cd86ac95e00
01a2191b-fef1-4df0-bd9a-3107abf2166f	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	35edf1d6-ee7d-447e-8cf2-372e49290d18	{"batch_number":"BN_2026_NEW"}	\N	\N	f	2026-04-16 03:11:11.455915	cfc876dd-c6e3-4283-b705-0cd86ac95e00
64e0b581-2144-44a0-a28e-54ac34722eb3	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	a89ad017-b37b-42b2-ad9c-841de188ca2f	{"batch_number":"BN-2026-new"}	\N	\N	f	2026-04-16 03:11:13.942817	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ee863041-1110-4835-b87a-9b92082c0e92	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	5bf72517-92d9-4b1c-96a7-1344f1e8f137	{"batch_number":"bn-tyu-kjn"}	\N	\N	f	2026-04-16 03:11:16.268569	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3964ad7c-2617-4114-abd8-909e1adb6b22	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	2335fa3f-656e-4fb5-8054-1ec0460ab63d	{"batch_number":"r"}	\N	\N	f	2026-04-16 03:11:18.525392	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f864f5c7-8fa0-408c-a295-7f4b309b2d79	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	2ea82c10-0fd9-4938-b761-6b3efe2de3b2	{"batch_number":"BN-NEW"}	\N	\N	f	2026-04-16 03:11:20.828876	cfc876dd-c6e3-4283-b705-0cd86ac95e00
717f6067-1037-4977-8586-8b200f76894e	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	50d2e2fc-5b89-4773-993c-699a921bb30e	{"batch_number":"BN-NEW"}	\N	\N	f	2026-04-16 03:11:24.051885	cfc876dd-c6e3-4283-b705-0cd86ac95e00
7854a6fa-04d7-4c94-b41e-1b3922ccf29e	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	f0487fc4-7121-44e5-93c1-13774015314a	{"batch_number":"BN-2026-ll3"}	\N	\N	f	2026-04-16 03:11:26.728959	cfc876dd-c6e3-4283-b705-0cd86ac95e00
9eb09b23-9017-4f80-87d5-34c222d5c9ac	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	fed88b6d-7215-4fd3-a3ab-2cda5120045f	{"batch_number":"BN-001"}	\N	\N	f	2026-04-16 03:11:29.248065	cfc876dd-c6e3-4283-b705-0cd86ac95e00
970f50f3-2785-4adf-ac5e-85338f7db32f	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	21638636-d515-4715-923e-42c8b415848e	{"batch_number":"BN-new-123"}	\N	\N	f	2026-04-16 03:11:31.826896	cfc876dd-c6e3-4283-b705-0cd86ac95e00
2484bc9c-16e5-414b-8955-e2595238de65	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	a9f488b6-9024-4f2d-83d7-937f204992e4	{"batch_number":"t"}	\N	\N	f	2026-04-16 03:11:34.671167	cfc876dd-c6e3-4283-b705-0cd86ac95e00
01348f40-eacf-4483-be79-c6a74bde3ce2	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	0db1653d-947f-4f52-b259-d236158c1caf	{"batch_number":"BN-BN"}	\N	\N	f	2026-04-16 03:11:36.669046	cfc876dd-c6e3-4283-b705-0cd86ac95e00
580fbfcd-5266-43e1-8751-be192c1aac45	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	f61596a6-df22-4555-b928-4ec9a2bab0f9	{"batch_number":"BN-NEW"}	\N	\N	f	2026-04-16 03:11:38.756646	cfc876dd-c6e3-4283-b705-0cd86ac95e00
eb4f06ed-db8d-4760-bee4-638633ffb62f	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	batches	e260efd1-591d-490a-a30b-96157cda9630	{"batch_number":"BN-009-20290"}	\N	\N	f	2026-04-16 03:11:40.925992	cfc876dd-c6e3-4283-b705-0cd86ac95e00
22b8c6ba-8bc8-4ba2-bd04-fb63a988ac4b	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	a66df35e-9a3f-4ffd-bb38-ea6ae2509246	\N	{"sku":"MED-001","name":"Amoxicillin 500mg","generic_name":"Amoxicillin","dosage_form":"Capsule","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":50,"batch_number":"BN-001","initial_quantity":1000,"selling_price":10,"purchase_price":0,"expiry_date":"2030-10-22"}	\N	f	2026-04-16 03:26:36.651194	cfc876dd-c6e3-4283-b705-0cd86ac95e00
4c90b4d0-6c2b-46a7-9b50-39c53ff75d9c	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	73570a2a-d947-4527-820c-c5a202070d76	\N	{"sku":"MED-002","name":"Amoxicillin 250mg","generic_name":"Amoxicillin","dosage_form":"Capsule","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":40,"batch_number":"BN-001","initial_quantity":800,"selling_price":6,"purchase_price":0,"expiry_date":"2026-05-09"}	\N	f	2026-04-16 03:42:52.965341	cfc876dd-c6e3-4283-b705-0cd86ac95e00
bc81e3af-e34a-4139-85d9-b299076e3222	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	66c8733c-a994-4cc7-9c3a-3ab7a6105c4d	\N	{"sku":"MED-003","name":"Paracetamol 500mg","generic_name":"Paracetamol","dosage_form":"Tablet","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":30,"batch_number":"BN-001","initial_quantity":700,"selling_price":5,"purchase_price":0,"expiry_date":"2026-05-09"}	\N	f	2026-04-16 03:53:49.401002	cfc876dd-c6e3-4283-b705-0cd86ac95e00
490f1f34-fed2-4014-ba35-ec7a71bd1578	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	692c93ef-2526-450c-b6b5-737f1da3eb39	\N	{"medicine_id":"66c8733c-a994-4cc7-9c3a-3ab7a6105c4d","batch_number":"BN-002","expiry_date":"2026-05-09","purchase_price":0,"selling_price":5,"initial_quantity":700}	\N	f	2026-04-16 03:54:29.378101	cfc876dd-c6e3-4283-b705-0cd86ac95e00
9e00097f-03ad-412f-9ca9-37347c140623	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	fda9f3c5-4d91-470d-a799-eebe2a4ea898	\N	{"sku":"MED-004","name":"Ibuprofen 400mg","generic_name":"Ibuprofen","dosage_form":"Injection","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":20,"batch_number":"BN-003","initial_quantity":600,"selling_price":9,"purchase_price":0,"expiry_date":"2028-06-30"}	\N	f	2026-04-16 03:57:51.869751	cfc876dd-c6e3-4283-b705-0cd86ac95e00
416a9b20-0e8c-49f4-abfb-a7298c277feb	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	c4b8787c-fa89-4684-910c-7ac0c7de8700	\N	{"sku":"MED-005","name":"Metformin 850mg","generic_name":"Metformin","dosage_form":"Cream","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-16 04:00:39.469806	cfc876dd-c6e3-4283-b705-0cd86ac95e00
52db3d11-4764-47a5-be02-b7a8e3495ce2	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	c8b79e8a-8e81-4344-a248-e81c741332cb	\N	{"sku":"MED-050","name":"Ciprofloxacin 500mg","generic_name":"Ciprofloxacin","dosage_form":"Syrup","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":10,"batch_number":"BN-890","initial_quantity":678,"selling_price":9,"purchase_price":0,"expiry_date":"2028-01-23"}	\N	f	2026-04-16 10:30:16.066771	cfc876dd-c6e3-4283-b705-0cd86ac95e00
fc19f8a9-f984-45b1-94d7-d798824469ab	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	1e466b04-7bc8-4085-8f53-a2a3a885a455	\N	{"sku":"MED-008","name":"Omeprazole 20mg","generic_name":"Omeprazole","dosage_form":"Cream","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":78,"batch_number":"BN-9jk","initial_quantity":890,"selling_price":8,"purchase_price":0,"expiry_date":"2029-09-06"}	\N	f	2026-04-16 10:31:08.279008	cfc876dd-c6e3-4283-b705-0cd86ac95e00
adfa5bce-a30c-4005-9bbd-2fa7af0f2c57	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	2b06153b-8cbb-4524-ad12-d49ebd9da484	\N	{"sku":"MED-009","name":"Amlodipine 5mg","generic_name":"Amlodipine","dosage_form":"Inhaler","unit":"ML","is_expirable":true,"is_controlled":false,"minimum_stock_level":49,"batch_number":"BN-h7y","initial_quantity":8000,"selling_price":12,"purchase_price":0,"expiry_date":"2030-05-07"}	\N	f	2026-04-16 10:33:06.258646	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d5e63862-8051-4157-9706-5461cd982ff7	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	552784ef-a61d-446f-be58-404907d85f69	\N	{"sku":"MED-010","name":"Cetirizine 10mg","generic_name":"Cetirizine","dosage_form":"Inhaler","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":9,"batch_number":"BN9-nko","initial_quantity":300,"selling_price":15,"purchase_price":0,"expiry_date":"2035-12-31"}	\N	f	2026-04-16 10:38:35.549138	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b3f431fd-fc6b-4da8-8e76-06b36995d7df	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	cc5a3440-d843-4f69-8f5a-a160db544478	\N	{"sku":"COS-001","name":"Nivea Body Lotion","category":"Skin Care","unit":"PCS","minimum_stock_level":5,"product_type":"COSMETIC","batch_number":"BN-001","initial_quantity":89,"selling_price":10,"purchase_price":2,"expiry_date":"2030-12-19"}	\N	f	2026-04-16 12:25:19.734297	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b796816b-6d30-4558-8b5d-572f6421c59c	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	7cded872-e552-4aff-8d8f-0616f903f694	{"name":"Aaaaaaa 250mg"}	\N	\N	f	2026-04-16 12:55:25.130879	cfc876dd-c6e3-4283-b705-0cd86ac95e00
53bab324-6aa2-40a6-8be2-52312e60238b	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	8dd651d1-28c4-481a-bea7-b4865458c8ad	{"name":"Ooooooo 20mg"}	\N	\N	f	2026-04-16 12:56:10.539295	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a8757c88-80c9-4089-9c37-b197e6c7d3b0	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	bea4ca05-2603-44b3-8e61-9dc466720ff5	{"name":"Ppppppp 500mg"}	\N	\N	f	2026-04-16 12:56:40.473064	cfc876dd-c6e3-4283-b705-0cd86ac95e00
cc25e375-ffe5-48a6-a12a-e28ef5e2cd53	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	c4b8787c-fa89-4684-910c-7ac0c7de8700	{"name":"Metformin 850mg"}	\N	\N	f	2026-04-16 12:56:43.460835	cfc876dd-c6e3-4283-b705-0cd86ac95e00
de07ec1f-93ff-46ce-8f2a-80c51a29925a	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	cc5a3440-d843-4f69-8f5a-a160db544478	{"name":"Nivea Body Lotion"}	\N	\N	f	2026-04-16 12:59:09.349481	cfc876dd-c6e3-4283-b705-0cd86ac95e00
27331878-198d-4ed6-ad27-50cf509629cb	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	ce49b17e-de88-458d-b337-5ae0cd60670d	{"name":"Ibuprofen"}	\N	\N	f	2026-04-16 13:08:27.659268	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f69f69db-7fe3-4210-95bb-09cfc614d16c	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	8824f6dd-29b8-4624-bc61-419528534041	{"name":"Acetaminophen"}	\N	\N	f	2026-04-16 13:09:46.271202	cfc876dd-c6e3-4283-b705-0cd86ac95e00
16941de6-b03a-4bac-b201-79301b233322	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	338a0dd7-6ab8-4162-b594-ac08f38a568d	{"name":"Omeprazole"}	\N	\N	f	2026-04-16 13:09:53.310368	cfc876dd-c6e3-4283-b705-0cd86ac95e00
9ec6dee4-69b9-4514-aa27-3eecc86c23a8	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	713f3302-98c4-4798-aeb0-8a9e18131682	{"name":"Amoxicillin"}	\N	\N	f	2026-04-16 13:09:55.928751	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3385b219-62ba-4946-8eda-c5ce3ec7f3db	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	0ceff716-56ae-4906-8a04-eec733f4fbce	{"name":"Cetirizine"}	\N	\N	f	2026-04-16 13:09:59.149964	cfc876dd-c6e3-4283-b705-0cd86ac95e00
65440f5d-c5ee-44aa-8b12-b82b81cf4d7c	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	2a37ef02-8894-412b-9973-49686048edc8	{"name":"Ibuprofen"}	\N	\N	f	2026-04-16 13:12:44.42511	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ccb5dd9e-6e7f-4bde-84e6-bd168472b2bb	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	1650696e-3806-4108-bb36-576c996b9841	{"name":"Ibuprofen"}	\N	\N	f	2026-04-16 13:14:43.086349	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f3e8e4d4-0d0f-42d0-936f-d4af432ae384	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	93153b6c-d207-4164-b858-a1a4ea5aa56a	{"name":"Amoxicillin"}	\N	\N	f	2026-04-16 13:14:46.981193	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f610d52e-24d4-4d8f-aa39-f09537a1cd4b	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	69996531-94d9-4060-9bf4-56c244826ad8	{"name":"Paracetamol"}	\N	\N	f	2026-04-16 13:14:49.033752	cfc876dd-c6e3-4283-b705-0cd86ac95e00
7b194e24-6a8b-4400-8b42-70e97af30952	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	249ac70e-184c-4f03-aa0b-1dbaf6de4806	{"name":"Amoxicillin"}	\N	\N	f	2026-04-16 13:21:01.575019	cfc876dd-c6e3-4283-b705-0cd86ac95e00
64f256f3-3ec6-43a5-9f49-5d16306b4e5a	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	4e8ed1de-d87d-470d-99ac-1891aa85c9d7	{"name":"Ibuprofen"}	\N	\N	f	2026-04-16 13:21:04.125675	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0204ef51-4855-49f3-b1cd-9b5443f59f3d	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	0de87f9f-bd0e-46ec-b8db-d6f329a9610b	{"name":"Paracetamol"}	\N	\N	f	2026-04-16 13:21:10.462237	cfc876dd-c6e3-4283-b705-0cd86ac95e00
8fc08df2-80e0-407a-9383-b7c216d6f96a	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	0874d8b4-f1ad-4a26-a4a0-1a5b267748be	{"name":"Paracetamol"}	\N	\N	f	2026-04-16 13:25:05.242099	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f394b471-d57a-4684-b46e-92507ca32ff7	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	a35d337e-a922-4e73-9d67-b4dce5c8e560	{"name":"Ibuprofen"}	\N	\N	f	2026-04-16 13:25:07.192806	cfc876dd-c6e3-4283-b705-0cd86ac95e00
65cf0205-4b3b-4443-b6ec-f77cba7294b5	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	bab03fcc-48fb-4fd9-85d8-5e75c48b61b6	{"name":"Amoxicillin"}	\N	\N	f	2026-04-16 13:25:09.88503	cfc876dd-c6e3-4283-b705-0cd86ac95e00
606eefe7-4d41-4eca-b590-74cc37bb0170	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	de5a9421-e2d2-42fe-8847-6aed083df919	{"name":"Paracetamol"}	\N	\N	f	2026-04-16 13:25:54.009583	cfc876dd-c6e3-4283-b705-0cd86ac95e00
75cc7bf7-428b-4d9f-8537-653a1928fbbf	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	82bac160-dfd7-4331-a4f4-ce1c7d24ed90	{"name":"Ibuprofen"}	\N	\N	f	2026-04-16 13:25:59.098465	cfc876dd-c6e3-4283-b705-0cd86ac95e00
56efcb86-66ad-4d4c-9ce7-8298352acdd1	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	ff4fff3f-5d0f-4697-9ef8-e827e5382fb6	{"name":"test"}	\N	\N	f	2026-04-16 13:26:01.556687	cfc876dd-c6e3-4283-b705-0cd86ac95e00
eeb16718-282d-4391-95d9-2abccb925148	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	c01c42bd-210d-4c62-b052-b34045285141	{"name":"Amoxicillin"}	\N	\N	f	2026-04-16 13:26:05.057768	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c178fee2-1591-4bd8-94d5-a50e5e3f231c	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	ad45418f-2a99-4b05-b2c2-0445994ca37e	\N	{"sku":"test-oi09","name":"testtest","category":"youiyi","unit":"PCS","minimum_stock_level":5,"product_type":"COSMETIC"}	\N	f	2026-04-16 14:46:01.32499	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b492d6d6-9f3a-499b-8788-6c22c3282d4d	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	ad45418f-2a99-4b05-b2c2-0445994ca37e	{"name":"testtest"}	\N	\N	f	2026-04-16 14:46:32.794993	cfc876dd-c6e3-4283-b705-0cd86ac95e00
79f8cd5c-a25f-4ff0-8d67-32b4471db24c	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	d462be6a-14f1-48ac-b893-a983cb48188a	\N	{"sku":"test-oiu89","name":"testtesttest","category":"Skin Care","unit":"PCS","minimum_stock_level":5,"product_type":"COSMETIC","batch_number":"bnyu-90","initial_quantity":1234,"selling_price":14,"purchase_price":12,"expiry_date":"2034-12-23"}	\N	f	2026-04-16 14:47:19.445808	cfc876dd-c6e3-4283-b705-0cd86ac95e00
67b3f104-b881-4a1c-a81c-42f9abaffa8e	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	d462be6a-14f1-48ac-b893-a983cb48188a	{"name":"testtesttest"}	\N	\N	f	2026-04-16 14:55:59.872645	cfc876dd-c6e3-4283-b705-0cd86ac95e00
da10b2f6-6134-42bd-a484-113595832f2c	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	751f88cf-e7f3-4fc2-8ef8-9cee18bd6a37	\N	{"sku":"ITEM-01","name":"For Test","category":"Skin Care","unit":"PCS","minimum_stock_level":5,"product_type":"COSMETIC","batch_number":"BN-TEST-01","initial_quantity":100,"selling_price":18,"purchase_price":12,"expiry_date":"2028-09-28"}	\N	f	2026-04-16 15:00:16.936473	cfc876dd-c6e3-4283-b705-0cd86ac95e00
e420052e-d390-40cf-b9ea-ac3cb39039ba	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	medicines	238fa5c9-1b83-47e2-b100-b039c1271a53	{"name":"Metformin","category":"","unit":"CAP"}	{"sku":"MED-ME-01","name":"Metformin","generic_name":"Metform","dosage_form":"Capsule","unit":"CAP","is_expirable":false,"is_controlled":false,"minimum_stock_level":45}	\N	f	2026-04-16 15:16:21.620879	cfc876dd-c6e3-4283-b705-0cd86ac95e00
2d857716-d0f9-4a73-835e-df999d1f769b	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	medicines	238fa5c9-1b83-47e2-b100-b039c1271a53	{"name":"Metformin","category":"","unit":"CAP"}	{"sku":"MED-ME-01","name":"Metformin","generic_name":"Metform","dosage_form":"Capsule","unit":"CAP","is_expirable":false,"is_controlled":false,"minimum_stock_level":45}	\N	f	2026-04-16 15:16:21.658701	cfc876dd-c6e3-4283-b705-0cd86ac95e00
cebdfd13-1495-4318-9bb2-f85ce1adb393	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	299bd48e-f420-4579-9b09-b8fe69848a19	\N	{"sku":"EQU-001","name":"Termo Metere","generic_name":"Equip","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-16 15:42:49.112175	cfc876dd-c6e3-4283-b705-0cd86ac95e00
6e31bc25-4a11-4a88-b00c-04fe143e0da9	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	3f8976dc-09f7-4521-945b-9819b46d362e	\N	{"sku":"EQUI-02","name":"Classoc Termo","generic_name":"Calssic","unit":"TAB","is_expirable":false,"is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-16 15:43:46.519697	cfc876dd-c6e3-4283-b705-0cd86ac95e00
9f2ded9b-c534-4be9-ac3b-b85cb68ce7b1	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	222e9465-8ce1-4ca9-8ea9-555091d9fe75	\N	{"sku":"EQU-003","name":"Yosief","generic_name":"jossy","unit":"TAB","is_expirable":false,"is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-16 15:45:33.06408	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c2b21b40-fc3a-4bee-85fe-842683362506	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	299bd48e-f420-4579-9b09-b8fe69848a19	{"name":"Termo Metere"}	\N	\N	f	2026-04-16 15:48:39.492411	cfc876dd-c6e3-4283-b705-0cd86ac95e00
22b80227-0171-4ec4-95b8-7a01ee2824fa	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	3f8976dc-09f7-4521-945b-9819b46d362e	{"name":"Classoc Termo"}	\N	\N	f	2026-04-16 15:48:44.134376	cfc876dd-c6e3-4283-b705-0cd86ac95e00
23bc46d1-8bc6-47a3-b224-24b99b0031a1	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	bbdf262c-84c7-4517-bfd8-fe9ce44b1a1a	\N	{"sku":"tes45","name":"este3456","generic_name":"rctrytty","dosage_form":"uuuuu","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":10,"batch_number":"uiuiioio099 ","initial_quantity":6767,"selling_price":56,"purchase_price":0,"expiry_date":"2927-11-23"}	\N	f	2026-04-16 15:49:23.322659	cfc876dd-c6e3-4283-b705-0cd86ac95e00
6f5cf3ec-d747-4c07-94f0-8bc6785c9e67	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	b98fd364-20dd-43d8-893c-60f08df8ac92	\N	{"sku":"equipment-09","name":"equippp","generic_name":"equipp","dosage_form":"Syrup","unit":"TAB","is_expirable":false,"is_controlled":false,"minimum_stock_level":10,"initial_quantity":898,"selling_price":700,"purchase_price":0}	\N	f	2026-04-16 15:50:28.969711	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c4b369d4-7034-40bc-8da0-7f60879321e0	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	222e9465-8ce1-4ca9-8ea9-555091d9fe75	{"name":"Yosief"}	\N	\N	f	2026-04-16 15:52:12.892965	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1236112a-73e2-4d85-bbc2-650002259be4	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	bbdf262c-84c7-4517-bfd8-fe9ce44b1a1a	{"name":"este3456"}	\N	\N	f	2026-04-16 15:52:18.907374	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d8feb00a-35b7-4c68-8dba-4f9c43789bd7	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	3d71612b-0d1a-4e5e-940e-132f56604c06	\N	{"medicine_id":"b98fd364-20dd-43d8-893c-60f08df8ac92","batch_number":"GEN-828352","expiry_date":null,"purchase_price":600,"selling_price":700,"initial_quantity":898}	\N	f	2026-04-16 15:57:23.627819	cfc876dd-c6e3-4283-b705-0cd86ac95e00
80816c8f-3f24-4737-b552-b3182de16c7a	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	b98fd364-20dd-43d8-893c-60f08df8ac92	{"name":"equippp"}	\N	\N	f	2026-04-16 15:59:02.869397	cfc876dd-c6e3-4283-b705-0cd86ac95e00
81563fdf-29af-44ca-bfee-755c507fc58a	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	708c7e69-eabf-43eb-8455-b370dfab39ac	\N	{"sku":"EQU-01","name":"Classic Teermo","generic_name":"Classic","unit":"TAB","is_expirable":true,"is_controlled":false,"minimum_stock_level":10}	\N	f	2026-04-16 15:59:29.527032	cfc876dd-c6e3-4283-b705-0cd86ac95e00
aa2ab8c2-6452-4070-baf1-a4e972cb3cc7	46282536-d3c2-4d26-9a61-afd2de2c3534	DELETE	medicines	708c7e69-eabf-43eb-8455-b370dfab39ac	{"name":"Classic Teermo"}	\N	\N	f	2026-04-16 16:00:59.629363	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3311f83b-8f5f-4e1f-8244-4de38455de61	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	medicines	f7bfc127-50f8-4b08-b44e-692d6cf4a2c4	\N	{"sku":"EQU-001","name":"EQUIPMENT -ONE","unit":"TAB","is_expirable":false,"is_controlled":false,"minimum_stock_level":100,"initial_quantity":400,"selling_price":500,"purchase_price":0}	\N	f	2026-04-16 16:01:36.168893	cfc876dd-c6e3-4283-b705-0cd86ac95e00
8fe4c66e-1c70-49f0-a603-0cfd95c92c44	46282536-d3c2-4d26-9a61-afd2de2c3534	UPDATE	batches	e0ccf410-1830-402b-b82e-ac6e213115cc	\N	{"medicine_id":"f7bfc127-50f8-4b08-b44e-692d6cf4a2c4","batch_number":"GEN-496133","expiry_date":null,"purchase_price":300,"selling_price":500,"initial_quantity":400}	\N	f	2026-04-16 16:02:01.770191	cfc876dd-c6e3-4283-b705-0cd86ac95e00
8f8bd947-99e6-432e-a42d-4cb0d7038f99	46282536-d3c2-4d26-9a61-afd2de2c3534	CREATE	sale_orders	4b9b8841-c1a8-40dd-ac29-e2246172e6e9	\N	{"order_number":"ORD-20260416-X067","total_amount":502.5,"items_count":2}	\N	f	2026-04-16 16:02:22.233201	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: audit_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_sessions (id, status, notes, created_at, completed_at, organization_id, "createdById", name) FROM stdin;
966590da-a7d3-41bc-b26d-89061652d544	IN_PROGRESS	Q-C Inventory Check	2026-04-05 03:53:18.840148	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N
22583d7a-c218-4743-b080-41882ce8c866	COMPLETED		2026-04-05 03:55:01.703516	2026-04-05 13:57:22.889	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N
1b917d08-25f2-4eed-9308-2c5c21eefe46	COMPLETED	This monthe have many audit reconcilation and backtracking , those should be considered during closing the audit session.\n\n\nIn the memory of us....\nGood lucks !\n	2026-04-05 05:09:51.283864	2026-04-05 15:10:06.467	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	MonthlyAudit - Septembe
14fc2bcb-b48a-482b-ac29-a00b29fbee22	COMPLETED		2026-04-05 04:38:08.274996	2026-04-05 15:51:31.893	cfc876dd-c6e3-4283-b705-0cd86ac95e00	519dab08-1342-46dc-a816-7b419e816e56	\N
d42705c9-c375-418c-ab1a-1cf03e6478e9	IN_PROGRESS		2026-04-05 05:51:47.595114	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	Monthly audit - october
bd21308d-0b4d-4ebd-94bb-edd71b06d5ac	IN_PROGRESS		2026-04-05 05:52:58.129015	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	
f023b597-9284-4df0-9e10-3fa3d1ab8c70	IN_PROGRESS		2026-04-06 04:02:51.651937	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	teset
eeb22825-cc0b-48bc-950d-66277332b976	IN_PROGRESS		2026-04-16 03:24:23.823418	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, batch_number, medicine_id, expiry_date, purchase_price, selling_price, initial_quantity, quantity_remaining, is_locked, is_quarantined, supplier_id, notes, branch_id, organization_id, created_at, deleted_at) FROM stdin;
043b4012-d5fa-4532-95a9-ce0cbf682b8d	BN-01	be56227d-5862-4206-9052-3ff34b401017	2026-12-31	0.00	2.50	500	500	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:34:24.9534-07	\N
9890c367-0669-49fe-a23f-7f53822d9a1c	BN-03	e72ac6ce-839b-41d3-a30a-04f12454f155	2034-09-23	0.00	3.80	300	300	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:34:25.020952-07	\N
ad033d3a-5bd6-47e5-aff3-515b6a7bd1ec	BN0-iweio	238fa5c9-1b83-47e2-b100-b039c1271a53	\N	0.00	10.00	600	600	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:34:25.07157-07	\N
838c16ad-d8f0-4593-b306-4152ca03e679	C-NV-1	09557811-8b7b-40ec-830b-412182b918e3	2027-01-15	12.00	18.50	50	50	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:42:27.251857-07	\N
c061c63f-d3b6-4e38-9c75-ae9232f4339c	C-DV-1	b84327d1-bde5-4820-98b0-11d2a329bd06	2026-08-20	8.00	12.00	40	40	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:42:27.291227-07	\N
85ed8a4b-4d91-4c80-87bf-4edcaf514ef5	C-CG-1	3c6125b9-051a-48de-aa3b-339f486a96f1	2026-05-12	5.00	7.50	60	60	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:42:27.325102-07	\N
5823a1f5-2fb0-46dc-a94c-c78058a42e56	B-P-1234	be56227d-5862-4206-9052-3ff34b401017	2026-12-31	1.50	2.50	500	500	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:54:40.453128-07	\N
75e59584-c2d7-4c31-845b-71b5644e3347	B-P-1234	be56227d-5862-4206-9052-3ff34b401017	2026-12-31	1.50	2.50	500	500	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:56:04.285162-07	\N
fea75073-2f33-42cb-8085-cb7d5512341c	BN-03	e72ac6ce-839b-41d3-a30a-04f12454f155	2025-11-10	2.20	3.80	300	300	t	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:56:04.308869-07	\N
5bf0cb28-39b7-4c37-8575-f6bb636eacd5	BN-TEST-01	751f88cf-e7f3-4fc2-8ef8-9cee18bd6a37	2028-09-28	12.00	18.00	100	100	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 15:00:16.84909-07	\N
e0ccf410-1830-402b-b82e-ac6e213115cc	GEN-496133	f7bfc127-50f8-4b08-b44e-692d6cf4a2c4	\N	300.00	500.00	400	400	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 16:01:36.141363-07	\N
b5cbd453-3cf2-4ede-825b-e339506bfed1	BN-001	238fa5c9-1b83-47e2-b100-b039c1271a53	2026-04-23	230.00	10.00	1	1	f	f	43ba81a5-6f63-4532-8c8e-33295d55060d	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-18 12:12:22.260404-07	\N
20ba0678-8ef3-41d1-980c-4003cb345610	BN0thhy	238fa5c9-1b83-47e2-b100-b039c1271a53	2026-04-30	20230.00	10.00	1	1	f	f	506ce147-b96a-4b5e-bb7c-db4cecd62b8a	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-18 12:24:16.943455-07	\N
afb7af3d-fcfa-411f-9f92-bc42e4167db6	NM	238fa5c9-1b83-47e2-b100-b039c1271a53	\N	20230.00	10.00	1	1	f	f	506ce147-b96a-4b5e-bb7c-db4cecd62b8a	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-18 13:06:38.958095-07	\N
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, address, phone, is_headquarters, is_active, created_at, updated_at, organization_id) FROM stdin;
\.


--
-- Data for Name: cheque_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cheque_records (id, customer_id, cheque_number, bank_name, amount, due_date, status, notes, created_at, organization_id) FROM stdin;
\.


--
-- Data for Name: credit_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_payments (id, customer_id, credit_record_id, amount, payment_method, reference_number, received_by, payment_date, organization_id) FROM stdin;
\.


--
-- Data for Name: credit_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_records (id, customer_id, sale_id, original_amount, paid_amount, due_date, status, notes, created_at, organization_id) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, address, total_credit, is_active, created_at, updated_at, organization_id) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, name, category, amount, frequency, description, expense_date, receipt_reference, is_recurring, created_by, branch_id, created_at, organization_id, payment_account_id) FROM stdin;
33e355aa-b5b2-4930-817f-384b4c5bc5d6	Rent for House	RENT	15000.00	MONTHLY		2026-04-05		t	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	2026-04-05 03:52:13.690512	cfc876dd-c6e3-4283-b705-0cd86ac95e00	\N
\.


--
-- Data for Name: forecast_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forecast_results (id, medicine_id, target_date, method, predicted_demand, confidence_score, historical_data_points, created_at, organization_id) FROM stdin;
\.


--
-- Data for Name: goods_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goods_receipts (id, grn_number, purchase_order_id, received_by, notes, organization_id, received_at) FROM stdin;
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, name, generic_name, category, unit, is_controlled, barcode, sku, supplier_barcode, preferred_supplier_id, minimum_stock_level, is_active, branch_id, organization_id, created_at, updated_at, deleted_at, product_type, is_expirable, dosage_form) FROM stdin;
f7bfc127-50f8-4b08-b44e-692d6cf4a2c4	EQUIPMENT -ONE	\N	\N	TAB	f	\N	EQU-001	\N	\N	100	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 16:01:36.106472-07	2026-04-16 16:01:36.106472-07	\N	MEDICINE	f	\N
be56227d-5862-4206-9052-3ff34b401017	Paracetamol	Acetam		TAB	f	\N	MED-PR-01	\N	\N	100	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:34:24.905583-07	2026-04-16 13:34:24.905583-07	\N	MEDICINE	t	Tablet
e72ac6ce-839b-41d3-a30a-04f12454f155	Ibuprofen	Ibup		TAB	f	\N	MED-IB-03	\N	\N	80	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:34:24.997161-07	2026-04-16 13:34:24.997161-07	\N	MEDICINE	t	Tablet
09557811-8b7b-40ec-830b-412182b918e3	Nivea Soft		Skin Care	JAR	f	\N	COS-NV-01	\N	\N	10	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:42:27.200022-07	2026-04-16 13:42:27.200022-07	\N	COSMETIC	t	
b84327d1-bde5-4820-98b0-11d2a329bd06	Dove Shampoo		Hair Care	BTL	f	\N	COS-DV-02	\N	\N	15	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:42:27.274567-07	2026-04-16 13:42:27.274567-07	\N	COSMETIC	t	
3c6125b9-051a-48de-aa3b-339f486a96f1	Colgate		Dental	TUBE	f	\N	COS-CG-03	\N	\N	20	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:42:27.308562-07	2026-04-16 13:42:27.308562-07	\N	COSMETIC	t	
751f88cf-e7f3-4fc2-8ef8-9cee18bd6a37	For Test	\N	Skin Care	PCS	f	\N	ITEM-01	\N	\N	5	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 15:00:16.729773-07	2026-04-16 15:00:16.729773-07	\N	COSMETIC	t	\N
238fa5c9-1b83-47e2-b100-b039c1271a53	Metformin	Metform		CAP	f	\N	MED-ME-01	\N	\N	45	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 13:34:25.047755-07	2026-04-16 15:16:21.545341-07	\N	MEDICINE	f	Capsule
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1774499999999	EnableRLSPolicies1774499999999
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, created_at, organization_id) FROM stdin;
e6925b48-412a-43db-b659-e67df50e3b8e	\N	New Sale Completed	A sale of $14.00 has been processed (Receipt: RCPT-20260326-5JCI)	SALE	f	2026-03-26 09:24:43.261922	fda0c216-b48c-4a42-8670-52966096499f
72e0cbe5-6ac5-41a4-afb3-6f871d035602	416ae697-489b-4f08-a316-afdfa4566805	Test Notification	This is a test notification to verify the system is working!	INFO	f	2026-03-26 12:08:54.440521	1129d8da-c6a7-48fc-865a-7ab5095dc398
3b596d4d-97c3-48b0-aa67-d41b40c5975a	416ae697-489b-4f08-a316-afdfa4566805	Test Notification	This is a test notification to verify the system is working!	INFO	f	2026-03-26 12:08:56.408988	1129d8da-c6a7-48fc-865a-7ab5095dc398
6d0af5af-c739-4eac-a38d-6354825d9b2d	416ae697-489b-4f08-a316-afdfa4566805	Test Notification	This is a test notification to verify the system is working!	INFO	f	2026-03-26 12:09:17.486182	1129d8da-c6a7-48fc-865a-7ab5095dc398
129c0f22-e646-409d-9b01-d6ed98a93648	\N	New Sale Completed	A sale of $36.00 has been processed (Receipt: RCPT-20260331-CM5K)	SALE	f	2026-03-31 00:44:49.001208	37448208-174d-473e-a2eb-a031a33e298e
45fedfc3-eaee-4859-889d-8f312c2e13e6	\N	Low Stock Alert	Medicine Amoxiciliin 500 mg is low on stock (0 units remaining)	LOW_STOCK	f	2026-03-31 00:44:49.164232	37448208-174d-473e-a2eb-a031a33e298e
b50c7a8f-23ff-42ee-b353-045d86502425	\N	New Sale Completed	A sale of $43.50 has been processed (Receipt: RCPT-20260331-73H0)	SALE	f	2026-03-31 03:24:13.775955	70cd42a3-f2d6-46fe-99db-a97bfb08c020
7ca960bb-d5b0-49ba-a4a6-d36731eb66f7	\N	Low Stock Alert	Medicine Doxycycline 100mg is low on stock (0 units remaining)	LOW_STOCK	f	2026-03-31 03:24:13.935282	70cd42a3-f2d6-46fe-99db-a97bfb08c020
f07a7d70-8e7f-46de-b06b-72dcb5c84de8	\N	New Sale Completed	A sale of $49.00 has been processed (Receipt: RCPT-20260331-XWDV)	SALE	f	2026-03-31 03:25:11.963708	70cd42a3-f2d6-46fe-99db-a97bfb08c020
a99d090a-3c70-4f0c-a10c-1ee13d973183	\N	New Sale Completed	A sale of $14.50 has been processed (Receipt: RCPT-20260331-3U1Y)	SALE	f	2026-03-31 09:23:30.005051	70cd42a3-f2d6-46fe-99db-a97bfb08c020
c57e2c1c-d4c1-4d13-bd01-b59a4599594a	\N	New Sale Completed	A sale of $30.00 has been processed (Receipt: RCPT-20260331-6PUO)	SALE	f	2026-03-31 11:37:19.064481	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b
18822f4d-a22c-4341-be29-0d6f9917b502	\N	New Sale Completed	A sale of $56.00 has been processed (Receipt: RCPT-20260405-VSFF)	SALE	f	2026-04-05 05:04:38.942032	37448208-174d-473e-a2eb-a031a33e298e
25cc298e-29cd-4630-a66d-b85f74c57317	\N	New Sale Completed	A sale of $84.00 has been processed (Receipt: RCPT-20260405-3KBN)	SALE	f	2026-04-05 05:04:53.534674	37448208-174d-473e-a2eb-a031a33e298e
20979d3d-4486-4ba6-b522-929a0e258014	\N	Subscription Request Update	Your subscription upgrade request has been declined. Admin Notes: No new FU	INFO	f	2026-04-05 08:48:15.147601	00000000-0000-0000-0000-000000000000
57e92fb2-d156-4a06-b7d4-8397cf0c748f	\N	Subscription Request Update	Your subscription upgrade request has been declined. Admin Notes: Redundant feature, you currently have this feature	INFO	f	2026-04-05 08:48:55.577531	00000000-0000-0000-0000-000000000000
88d5f654-9257-4036-af6f-348d81de1eaa	\N	Subscription Request Update	Your subscription upgrade request has been declined. Admin Notes: Redundant feature, you currently have this feature	INFO	f	2026-04-05 08:49:31.330447	00000000-0000-0000-0000-000000000000
0a840875-6f21-4f9e-a764-c80ded634935	\N	Subscription Upgraded	Congratulations! Your request for the Permium plan has been approved. Your new expiry date is 6/5/2026.	SYSTEM	f	2026-04-05 08:49:43.850669	00000000-0000-0000-0000-000000000000
43766b51-e64c-4559-88ab-c403d475510f	\N	Sale Confirmed	Order ORD-20260413-WFBM confirmed. Receipt: RCPT-20260413-X9QM	SALE	t	2026-04-13 13:37:21.036586	cfc876dd-c6e3-4283-b705-0cd86ac95e00
8ad5d67a-7561-49ff-81aa-b378af5e5886	\N	Low Stock Alert	Medicine Nivea Body Lotion is low on stock (0 units remaining)	LOW_STOCK	t	2026-04-13 13:37:21.352793	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3c5707b6-d85c-4793-adc3-26e9d0ef8fa9	\N	Low Stock Alert	Medicine FOGGE Body Sprirant is low on stock (0 units remaining)	LOW_STOCK	t	2026-04-13 13:37:22.553621	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d33abb83-609b-4861-9a41-0afd38960379	\N	Low Stock Alert	Medicine Snail Hail Oil is low on stock (0 units remaining)	LOW_STOCK	t	2026-04-13 14:00:00.971753	cfc876dd-c6e3-4283-b705-0cd86ac95e00
7f73f63d-5371-432e-8822-6c20beca2188	\N	Expiring Batch Alert	Batch BN-new-124 of test expires soon on 2026-05-09	EXPIRING	t	2026-04-13 14:00:01.25955	cfc876dd-c6e3-4283-b705-0cd86ac95e00
7408167b-48bd-4615-9253-14b799c06061	\N	New Purchase Order	Purchase Order PO-202604-0009 has been created and requires cashier payment approval.	PURCHASE_ORDER	t	2026-04-13 14:07:12.299968	cfc876dd-c6e3-4283-b705-0cd86ac95e00
2bf02d4d-646d-4d37-af97-ff036d428539	\N	New Purchase Order	Purchase Order PO-202604-0010 has been created and requires cashier payment approval.	PURCHASE_ORDER	t	2026-04-13 14:11:40.798367	cfc876dd-c6e3-4283-b705-0cd86ac95e00
edd8cedb-dbd8-451f-be9c-7a80a1f04545	\N	New Purchase Order	Purchase Order PO-202604-0011 has been created and requires cashier payment approval.	PURCHASE_ORDER	t	2026-04-13 14:13:45.932825	cfc876dd-c6e3-4283-b705-0cd86ac95e00
37243c7e-eb4c-49d1-b17a-c14e3bdd654d	\N	New Purchase Order	Purchase Order PO-202604-0012 has been created and requires cashier payment approval.	PURCHASE_ORDER	t	2026-04-13 14:44:27.707265	cfc876dd-c6e3-4283-b705-0cd86ac95e00
e359af27-1ae9-49be-b76b-06e42da8a51e	\N	New Purchase Order	Purchase Order PO-202604-0013 has been created and requires cashier payment approval.	PURCHASE_ORDER	t	2026-04-13 15:08:42.248946	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c6e2bf9a-9489-4d93-b547-476d22050fea	\N	New Purchase Order	Purchase Order PO-202604-0014 has been created and requires cashier payment approval.	PURCHASE_ORDER	t	2026-04-13 15:15:29.238703	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a8073d74-ba93-4c5c-81f9-4a32346e0526	\N	New Purchase Order	Purchase Order PO-202604-0015 has been created and requires cashier payment approval.	PURCHASE_ORDER	t	2026-04-13 15:15:59.935961	cfc876dd-c6e3-4283-b705-0cd86ac95e00
cff77b32-cddc-40c7-95af-99bdd957dfa8	46282536-d3c2-4d26-9a61-afd2de2c3534	PO Payment Recorded	Payment of ETB 160 recorded for PO PO-202604-0014 via Tellebirr.	PURCHASE_ORDER	t	2026-04-13 15:29:14.073906	cfc876dd-c6e3-4283-b705-0cd86ac95e00
4c57fc19-98df-4bc8-ad7c-d90c88cf8ace	46282536-d3c2-4d26-9a61-afd2de2c3534	PO Payment Recorded	Payment of ETB 2 recorded for PO PO-202604-0014 via CBE.	PURCHASE_ORDER	t	2026-04-13 15:29:30.541563	cfc876dd-c6e3-4283-b705-0cd86ac95e00
6ab6b6f4-60e9-4e95-9789-2231d40be96c	\N	Sale Confirmed	Order ORD-20260413-7HBB confirmed. Receipt: RCPT-20260413-6JKZ	SALE	t	2026-04-13 16:39:34.48483	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b3b899d8-f39b-4555-af0c-e966f2de63da	\N	Sale Confirmed	Order ORD-20260415-64LX confirmed. Receipt: RCPT-20260415-BGL2	SALE	t	2026-04-15 11:28:47.056695	cfc876dd-c6e3-4283-b705-0cd86ac95e00
e8f19f05-9fe5-4a20-bccb-633276082d4c	\N	Sale Confirmed	Order ORD-20260415-GFQ4 confirmed. Receipt: RCPT-20260415-64NU	SALE	t	2026-04-15 11:30:19.440564	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f224ed16-83f0-48ef-acb9-3f421120317a	\N	Sale Confirmed	Order ORD-20260415-41D2 confirmed. Receipt: RCPT-20260415-AJWT	SALE	t	2026-04-15 11:59:08.315708	cfc876dd-c6e3-4283-b705-0cd86ac95e00
34a624c8-c6bb-4beb-abaf-54b0950751ea	\N	Sale Confirmed	Order ORD-20260415-DL64 confirmed. Receipt: RCPT-20260415-4ZZM	SALE	t	2026-04-15 12:00:00.676242	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a79f713e-65c3-4ad1-99b2-ccbd41a1f948	\N	Sale Confirmed	Order ORD-20260415-YWF1 confirmed. Receipt: RCPT-20260415-V529	SALE	f	2026-04-15 13:57:59.146265	cfc876dd-c6e3-4283-b705-0cd86ac95e00
58656465-6347-4b74-b227-62ea4b852434	\N	Sale Confirmed	Order ORD-20260415-55P7 confirmed. Receipt: RCPT-20260415-705X	SALE	f	2026-04-15 13:58:16.37668	cfc876dd-c6e3-4283-b705-0cd86ac95e00
bce8656a-9c6f-4e26-a980-73680d405210	\N	Sale Confirmed	Order ORD-20260415-U22M confirmed. Receipt: RCPT-20260415-Y59R	SALE	f	2026-04-15 13:58:24.946946	cfc876dd-c6e3-4283-b705-0cd86ac95e00
539bb8fe-e06c-4a46-adb5-b7f2d0085db1	\N	Expiring Batch Alert	Batch r of carteee expires soon on 2026-05-01	EXPIRING	f	2026-04-15 14:00:00.398235	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0ec7316a-fe36-437a-8e5e-a9afd7dc2734	\N	Expiring Batch Alert	Batch t of Chemistry 400mg expires soon on 2026-05-06	EXPIRING	f	2026-04-15 14:00:00.427669	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f7a15954-6ef0-4c26-94ff-8077c1591c24	\N	Expired Batches Locked	1 batch(es) have been automatically locked due to expiration.	EXPIRING	f	2026-04-16 14:00:00.393532	cfc876dd-c6e3-4283-b705-0cd86ac95e00
46b3ccb3-f693-40dd-b629-97c8553427d9	\N	Expiring Batch Alert	CRITICAL: Batch BN-03 of Ibuprofen has EXPIRED on 2025-11-10	EXPIRING	f	2026-04-16 14:00:00.496833	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d8c01d30-af19-418e-900f-efd4bda40f95	\N	Expiring Batch Alert	Batch C-CG-1 of Colgate expires soon on 2026-05-12	EXPIRING	f	2026-04-16 14:00:00.56443	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5459da79-7cf3-4c3a-9eac-ff41bdbbe418	46282536-d3c2-4d26-9a61-afd2de2c3534	PO Payment Recorded	Payment of ETB 8,230 recorded for PO PO-20260418-0003 via Tellebirr.	PURCHASE_ORDER	f	2026-04-18 13:07:03.234418	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, subscription_plan, is_active, created_at, updated_at, address, phone, email, contact_person, license_number, city, subscription_status, subscription_expiry_date, subscription_plan_name, feature_overrides, internal_notes, preferences) FROM stdin;
cfc876dd-c6e3-4283-b705-0cd86ac95e00	Abinet Pharmacy	BASIC	t	2026-03-26 03:42:00.082	2026-04-16 10:42:00.30508	Gondar Azezo , 	09865433567	sami@gmail.com	Samuel geremew	MOH-Q21K-B8y	Gondar 	ACTIVE	2026-05-06 13:52:15.79	Pro	\N	Hey There !!	\N
1129d8da-c6a7-48fc-865a-7ab5095dc398	tereawewa	BASIC	f	2026-03-25 15:26:27.141748	2026-04-05 04:33:13.643204	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N	\N	\N
b9034243-010c-496b-b5d4-90947a3b3974	Legehar Pharmacy	BASIC	f	2026-03-26 03:42:42.659531	2026-04-05 04:33:16.692102	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N	\N	\N
70cd42a3-f2d6-46fe-99db-a97bfb08c020	Tikur Anbesa	BASIC	t	2026-03-26 03:42:51.300241	2026-04-05 04:33:53.709832	\N	\N	\N	\N	\N	\N	ACTIVE	2026-05-04 13:44:05.509	Permium	\N	\N	\N
82d0d253-897a-4edf-8749-bb03798004db	New Pharmacy	BASIC	t	2026-04-01 01:25:44.814	2026-04-05 04:33:56.603497	Mexico-Ras Abebe Aregay Street, Addis Ababa, Ethiopia	0987346523	contact@newPahrmacy.com	Bereketq	MOH-122321	Addis Ababa	ACTIVE	2026-04-15 13:25:35.213	Basic	\N	\N	\N
00000000-0000-0000-0000-000000000000	Legacy Default Organization	SILVER	t	2026-03-25 14:45:39.303842	2026-04-05 04:33:57.72876	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N	\N	\N
fda0c216-b48c-4a42-8670-52966096499f	Tiruwerk Pharmacy	BASIC	f	2026-03-26 03:43:42.892625	2026-03-26 22:35:55.553762	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N	\N	\N
37448208-174d-473e-a2eb-a031a33e298e	Health First	BASIC	t	2026-03-30 03:12:30.741684	2026-04-05 04:34:01.778881	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N	\N	\N
145c68ec-9ad5-46f6-9d20-9a5f6294ae7b	Health Second	BASIC	f	2026-03-31 11:32:39.454	2026-04-01 01:11:04.734512	Lideta Sub-City, Ras Aregay St,	+251960945350	contact@healthsecond.gmail.com	Yosief Dagnachew	\N	Addis Ababa	SUSPENDED	2026-05-01 21:33:09.892	BASIC	\N	\N	\N
\.


--
-- Data for Name: patient_reminders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_reminders (id, medication_name, last_purchase_date, dispensed_quantity, expected_duration_days, depletion_date, is_resolved, created_at, updated_at, patient_id, organization_id, created_by_id) FROM stdin;
a7aa1783-2057-4a99-9a99-9e8a6c04d835	Insulin	2026-03-17	56	32	2026-04-18	t	2026-04-15 14:45:23.555759	2026-04-15 14:58:35.704407	b34dba65-543b-40ec-89ab-0af1d0508101	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534
c50eb842-c4ec-4fbe-b0ea-37b6ea30d27f	Insulin	2026-03-17	56	32	2026-04-18	t	2026-04-15 14:45:24.858487	2026-04-15 14:58:41.270466	b34dba65-543b-40ec-89ab-0af1d0508101	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534
84fa68da-6ee6-4fc7-9d74-93e6cff12cca	Metformin	2026-04-15	28	3	2026-04-18	f	2026-04-15 15:00:43.000838	2026-04-15 15:00:43.000838	438408bb-1ed8-4b63-a5be-471f7611ab1e	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, name, is_active, branch_id, phone, age, gender, address, allergies, chronic_conditions, created_at, updated_at, organization_id) FROM stdin;
b087255d-c174-4e0f-8492-391befe6df1e	Ato, Getaneh	t	\N	0987654321	\N	\N		\N	\N	2026-03-26 09:24:39.466592	2026-03-26 09:24:39.466592	fda0c216-b48c-4a42-8670-52966096499f
23f628ea-4915-423c-b0f6-1c906efc9791	Abebe Kebede	t	\N	0912345678	\N	\N	Bole, 	\N	\N	2026-03-31 00:44:45.273997	2026-03-31 00:44:45.273997	37448208-174d-473e-a2eb-a031a33e298e
b34dba65-543b-40ec-89ab-0af1d0508101	Chalachew Kebede	t	\N	0912345678	\N	\N	Lideta	\N	\N	2026-03-31 03:06:00.50831	2026-03-31 03:06:00.50831	cfc876dd-c6e3-4283-b705-0cd86ac95e00
438408bb-1ed8-4b63-a5be-471f7611ab1e	Chala Dekika	t	\N	0912345679	\N	\N	Mexico	\N	\N	2026-03-31 03:06:53.562835	2026-03-31 03:06:53.562835	cfc876dd-c6e3-4283-b705-0cd86ac95e00
29f7159d-cdea-42b5-962a-9f269ebca524	Derbachew Kebede	t	\N	0912345678	\N	\N	MExico, Addis Ababa	\N	\N	2026-03-31 03:24:06.285258	2026-03-31 03:24:06.285258	70cd42a3-f2d6-46fe-99db-a97bfb08c020
3fa28543-f38f-481a-8f4d-6f81df3aed2d	Desalegn Kebede	t	\N	0912345676	\N	\N	Bole Arabsa	\N	\N	2026-03-31 03:25:03.888875	2026-03-31 03:25:03.888875	70cd42a3-f2d6-46fe-99db-a97bfb08c020
201de500-ce8e-445a-ba09-78c44ed98cca	Israel kebede	t	\N	0912345678	\N	\N	Piyasa Arada sub-cty	\N	\N	2026-03-31 11:37:15.66567	2026-03-31 11:37:15.66567	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b
563e65ce-3edf-4c51-ad57-e156424bfb8d	Asmare dinku	t	\N	098765433	\N	\N		\N	\N	2026-04-05 05:04:36.859457	2026-04-05 05:04:36.859457	37448208-174d-473e-a2eb-a031a33e298e
1bc787bc-83ee-453e-8f78-871e959b2607	cu-test	t	\N		\N	\N		\N	\N	2026-04-05 06:26:44.406431	2026-04-05 06:26:44.406431	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a7602f9a-4468-485e-bd58-0c2271abbf8b	chuch	t	\N	098768989	\N	\N		\N	\N	2026-04-11 08:07:52.65905	2026-04-11 08:07:52.65905	cfc876dd-c6e3-4283-b705-0cd86ac95e00
120544d7-3f26-4dd0-8587-77d43c2ba48d	new custimer	t	\N	709092302009390	\N	\N		\N	\N	2026-04-11 08:08:27.191869	2026-04-11 08:08:27.191869	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3ff7110f-a45d-4040-8a79-f54624059d10	new cust	t	\N	9902	45	OTHER	09309290309	[]	\N	2026-04-11 08:08:49.7921	2026-04-11 08:08:49.7921	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: payment_account_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_account_transactions (id, payment_account_id, amount, type, reference_type, reference_id, description, created_at, created_by, organization_id) FROM stdin;
aa939074-6708-4794-89a8-e2b1aa20ee5a	b35129c5-9f7a-4404-bba7-5ced176b7daa	16.00	CREDIT	SALE	4d4ef74a-be11-4451-80c9-9156970969be	Sale Receipt: RCPT-20260411-LKAY	2026-04-11 08:10:10.463082	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
eed16fdd-f9ec-4242-acb9-682da043d958	b35129c5-9f7a-4404-bba7-5ced176b7daa	16.00	DEBIT	REFUND	4d4ef74a-be11-4451-80c9-9156970969be	Refund for Sale RCPT-20260411-LKAY	2026-04-11 08:11:19.073705	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
916d3088-692e-4819-94d7-f3dec7832685	b35129c5-9f7a-4404-bba7-5ced176b7daa	25.00	CREDIT	SALE	b7d30835-ee83-4156-b9c2-a605485d42b4	Sale Receipt: RCPT-20260411-R0RO (Upfront paid)	2026-04-11 08:42:51.061403	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
22c154c0-93ac-4584-88c9-4e42fb05b42f	b35129c5-9f7a-4404-bba7-5ced176b7daa	32.00	DEBIT	REFUND	b7d30835-ee83-4156-b9c2-a605485d42b4	Refund for Sale RCPT-20260411-R0RO	2026-04-11 08:48:00.189842	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
50bb58ce-3d2e-41ac-98ab-ded68b446b6f	66453b16-890a-4c44-8294-23d2e7feee71	228.00	CREDIT	SALE	e4b15235-0af7-4ef2-a397-1dbc8a7129f2	Sale Receipt: RCPT-20260413-7FVV	2026-04-13 10:33:31.258811	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f316f253-0bb8-4f49-af27-07dff06299fd	66453b16-890a-4c44-8294-23d2e7feee71	84.00	DEBIT	REFUND	e4b15235-0af7-4ef2-a397-1dbc8a7129f2	Refund for Sale RCPT-20260413-7FVV	2026-04-13 10:52:53.452822	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1ce5a54a-8141-4d70-a9ad-8acef45a5f38	66453b16-890a-4c44-8294-23d2e7feee71	144.00	DEBIT	REFUND	e4b15235-0af7-4ef2-a397-1dbc8a7129f2	Refund for Sale RCPT-20260413-7FVV	2026-04-13 12:58:39.846695	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0aa61bd0-7403-4d2b-98b4-866611014ccd	b35129c5-9f7a-4404-bba7-5ced176b7daa	238.00	CREDIT	CREDIT_REPAYMENT	246af7f5-bd01-43b5-a7f7-622a9e6f68f8	Credit repayment from customer	2026-04-13 12:59:39.541916	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c72cf75c-7f2c-4785-99aa-2de7a904239f	66453b16-890a-4c44-8294-23d2e7feee71	160.00	CREDIT	SALE	94e93b26-6b5a-492f-bbb9-f7cbb5f7504d	Sale Receipt: RCPT-20260413-X9QM	2026-04-13 13:37:20.306159	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
2e86a88b-a3c5-4ca9-abb4-e3f2f46c7d4b	66453b16-890a-4c44-8294-23d2e7feee71	160.00	DEBIT	PURCHASE	48291626-b928-44c8-8d83-7045eb52027a	Payment for PO PO-202604-0014	2026-04-13 15:29:13.335879	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c1560054-6a40-44a1-9677-a72be0d67caf	66453b16-890a-4c44-8294-23d2e7feee71	16.00	CREDIT	SALE	ad0156fa-1f94-423d-a5bb-9391d2e93895	Sale Receipt: RCPT-20260413-6JKZ	2026-04-13 16:39:32.490602	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
675ad791-98c2-49cd-9970-6b19c303db34	cfc69f5c-171a-4773-b345-69c7746b361e	190790.00	CREDIT	INITIAL_BALANCE	\N	Initial Account Balance	2026-04-15 11:25:18.448893	00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000000
7634a07f-fbe4-4d45-900d-5a198b794980	b35129c5-9f7a-4404-bba7-5ced176b7daa	6600.00	CREDIT	SALE	509bc1a8-8179-4973-a54c-fa4f92c669e4	Sale Receipt: RCPT-20260415-BGL2	2026-04-15 11:28:45.934988	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
811f2b13-d0fb-41db-88d9-b0f186c535b2	66453b16-890a-4c44-8294-23d2e7feee71	18105.00	CREDIT	SALE	eb44767b-79d1-4875-a671-c1b1eeb1bf27	Sale Receipt: RCPT-20260415-64NU	2026-04-15 11:30:16.8984	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a3e95bdb-985d-43a1-9446-61015f232775	a293dec6-e318-44a5-97f9-917f8fd118ed	45080.00	CREDIT	INITIAL_BALANCE	\N	Initial Account Balance	2026-04-15 11:43:21.239224	00000000-0000-0000-0000-000000000000	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f426ffd4-d5cb-448f-b070-29fb946e1cd2	a293dec6-e318-44a5-97f9-917f8fd118ed	1999.98	DEBIT	MANUAL_ADJUSTMENT	fdf9b3a9-e8f6-4e0c-aae4-3ea524a9fa76	Transfer out to CBE	2026-04-15 11:49:59.820244	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
e7d8964f-1cf7-4013-a4d8-7b3704a9e250	a293dec6-e318-44a5-97f9-917f8fd118ed	43080.02	DEBIT	MANUAL_ADJUSTMENT	ffa6f3ab-1a26-4654-8d34-c27aae568627	Transfer out to Abysinnia Bank	2026-04-15 11:56:43.773815	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a2d4a474-8b6c-4578-9c21-aa1faf41044a	b35129c5-9f7a-4404-bba7-5ced176b7daa	43080.02	CREDIT	MANUAL_ADJUSTMENT	ffa6f3ab-1a26-4654-8d34-c27aae568627	Transfer in from Pitty Cash	2026-04-15 11:56:43.773815	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d66178f2-b0c4-4349-accd-befbf3538d5d	a293dec6-e318-44a5-97f9-917f8fd118ed	16.00	CREDIT	SALE	eb2b83b9-c896-4c1b-8377-33b7c0cc5b4e	Sale Receipt: RCPT-20260415-AJWT	2026-04-15 11:59:07.634635	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0a16b87f-d050-4fe5-9826-aebb500f3b4f	b35129c5-9f7a-4404-bba7-5ced176b7daa	64.00	CREDIT	SALE	03f86dee-8dfd-4ffb-a0b4-94e685d36716	Sale Receipt: RCPT-20260415-4ZZM	2026-04-15 11:59:59.202214	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3b025149-0481-4edb-879f-550e75bf2414	b35129c5-9f7a-4404-bba7-5ced176b7daa	25.00	CREDIT	MANUAL_ADJUSTMENT	24d3c9a6-4841-4542-8a59-60e1449ca598	Transfer in from CBE	2026-04-15 12:07:32.540313	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f8032f04-f163-46b5-b92d-410fe2b90bbf	a293dec6-e318-44a5-97f9-917f8fd118ed	5.00	DEBIT	MANUAL_ADJUSTMENT	e043acae-004c-41b3-b1ab-51291490cdf8	Transfer out to CBE	2026-04-15 12:09:04.238025	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
89766cbd-6734-4255-9e57-1d7873954c85	a293dec6-e318-44a5-97f9-917f8fd118ed	1.00	DEBIT	MANUAL_ADJUSTMENT	06e12de1-e6b0-414e-a042-f111efe5f76d	Transfer out to CBE	2026-04-15 12:10:36.933833	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1a007e04-079e-4bc9-bb0c-e354a6bd5b08	66453b16-890a-4c44-8294-23d2e7feee71	121.00	DEBIT	MANUAL_ADJUSTMENT	\N	Withdrawal: Cash withdrawal	2026-04-15 12:26:26.271376	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c21b12d4-79ed-4251-8ea1-1a6da23a13a0	b35129c5-9f7a-4404-bba7-5ced176b7daa	1.00	CREDIT	MANUAL_ADJUSTMENT	7c36fe59-0864-4cfa-8bf5-ecac8f466cbb	Transfer in from CBE	2026-04-15 12:32:37.055526	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3274fb25-db86-421e-928e-addb92025e84	b35129c5-9f7a-4404-bba7-5ced176b7daa	1200.00	CREDIT	SALE	2a14a0cc-33c9-4fbf-a576-68047035a114	Sale Receipt: RCPT-20260415-V529	2026-04-15 13:57:58.172927	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
6f4d75df-5c29-4778-82e7-379b8ba294e1	b35129c5-9f7a-4404-bba7-5ced176b7daa	1800.00	CREDIT	SALE	1b941d5b-ec66-4d60-8d0c-3ca487c5c628	Sale Receipt: RCPT-20260415-705X	2026-04-15 13:58:16.017328	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
db8f62b9-b152-4805-ad24-32f3fd285711	a293dec6-e318-44a5-97f9-917f8fd118ed	1200.00	CREDIT	SALE	29ebece4-1cc7-49d8-86fc-70153f3405ea	Sale Receipt: RCPT-20260415-Y59R	2026-04-15 13:58:23.959398	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5c2dfa66-0c26-4b33-9ed5-68e96bde1404	b35129c5-9f7a-4404-bba7-5ced176b7daa	53001.02	DEBIT	MANUAL_ADJUSTMENT	327d2f4b-1e6c-429a-93b9-fe6533fd3e4f	Transfer out to CBE	2026-04-16 03:23:32.032998	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a2cdd612-a9e4-4e59-8ab4-c8f48db5d565	a293dec6-e318-44a5-97f9-917f8fd118ed	1210.00	DEBIT	MANUAL_ADJUSTMENT	1f4a4d79-a6f7-4e3c-bebd-45d0f45c3674	Transfer out to CBE	2026-04-16 03:23:42.985516	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
059b5103-64f7-4bf9-bb8e-8cd9e950005c	66453b16-890a-4c44-8294-23d2e7feee71	8230.00	DEBIT	PURCHASE	31b9f0aa-6c92-40bd-b76b-bddead9323fd	Payment for PO PO-20260418-0003	2026-04-18 13:07:02.679274	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: payment_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_accounts (id, name, type, account_number, description, is_active, organization_id, created_at, updated_at, balance, is_visible_to_cashier, allow_transfer) FROM stdin;
cfc69f5c-171a-4773-b345-69c7746b361e	CBE	BANK			t	00000000-0000-0000-0000-000000000000	2026-04-15 11:25:18.448893-07	2026-04-15 11:25:18.448893-07	190790.00	t	f
b35129c5-9f7a-4404-bba7-5ced176b7daa	Abysinnia Bank	BANK			t	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-11 04:33:41.600125-07	2026-04-16 03:23:32.032998-07	0.00	f	t
a293dec6-e318-44a5-97f9-917f8fd118ed	Pitty Cash	CASH			t	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 11:43:21.239224-07	2026-04-16 03:23:42.985516-07	0.00	t	t
66453b16-890a-4c44-8294-23d2e7feee71	Tellebirr	MOBILE_MONEY	0960945350		t	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-11 04:34:11.835194-07	2026-04-18 13:07:02.679274-07	9770.00	f	t
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (id, prescription_id, medicine_id, dosage, frequency, duration, quantity_dispensed, organization_id) FROM stdin;
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, patient_id, doctor_name, facility, prescription_number, prescription_image_path, notes, created_at, organization_id) FROM stdin;
\.


--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_history (id, medicine_id, supplier_id, unit_price, recorded_at, organization_id) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, medicine_id, quantity_ordered, quantity_received, unit_price, subtotal, organization_id, created_at, selling_price, batch_number, expiry_date, product_type) FROM stdin;
7fdd9c11-e84c-47d9-8f7e-16d5e37451ca	a6674129-6efd-4d99-bd0d-356328316714	238fa5c9-1b83-47e2-b100-b039c1271a53	1	1	230.00	230.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-18 12:12:22.260404	10.00	BN-001	2026-04-23	MEDICINE
de15bdd6-8752-4db6-8241-dc2438a97373	1502d364-60cd-447f-9adf-1806d2ecd1db	238fa5c9-1b83-47e2-b100-b039c1271a53	1	1	20230.00	20230.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-18 12:24:16.943455	10.00	BN0thhy	2026-04-30	MEDICINE
73e45061-7f8f-4aac-b0b5-009a1f3f7e04	31b9f0aa-6c92-40bd-b76b-bddead9323fd	238fa5c9-1b83-47e2-b100-b039c1271a53	1	1	20230.00	20230.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-18 13:06:38.958095	10.00	NM	\N	MEDICINE
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, po_number, supplier_id, status, total_amount, notes, payment_method, payment_status, total_paid, branch_id, organization_id, created_by, approved_by, expected_delivery, cheque_bank_name, cheque_number, cheque_issue_date, cheque_due_date, cheque_amount, created_at, updated_at, is_vat_inclusive, vat_rate, vat_amount, subtotal_before_vat, payment_account_id, paid_by, supplier_invoice_number) FROM stdin;
a6674129-6efd-4d99-bd0d-356328316714	PO-20260418-0001	43ba81a5-6f63-4532-8c8e-33295d55060d	REGISTERED	230.00		CASH	UNPAID	0.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	\N	\N	\N	\N	2026-04-18 12:12:22.260404	2026-04-18 12:12:22.260404	f	0.00	0.00	230.00	\N	\N	PO-001
1502d364-60cd-447f-9adf-1806d2ecd1db	PO-20260418-0002	506ce147-b96a-4b5e-bb7c-db4cecd62b8a	REGISTERED	20230.00	oeioQIWEWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWJIOIOIOOOIIOQWIOQIowqIOWIOqiosIOOIO\nNote: Initial physical cash payment of ETB 20230 recorded outside system accounts.	CHEQUE	PAID	20230.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	DASHEN	DS-PO-001	\N	2026-04-21	\N	2026-04-18 12:24:16.943455	2026-04-18 12:24:16.943455	f	0.00	0.00	20230.00	\N	\N	PO-002
31b9f0aa-6c92-40bd-b76b-bddead9323fd	PO-20260418-0003	506ce147-b96a-4b5e-bb7c-db4cecd62b8a	REGISTERED	20230.00	Note: Initial physical cash payment of ETB 12000 recorded outside system accounts.	CASH	PAID	20230.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	\N	\N	\N	\N	2026-04-18 13:06:38.958095	2026-04-18 13:07:02.679274	f	0.00	0.00	20230.00	66453b16-890a-4c44-8294-23d2e7feee71	46282536-d3c2-4d26-9a61-afd2de2c3534	Po-090
\.


--
-- Data for Name: purchase_recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_recommendations (id, medicine_id, recommended_quantity, reorder_point, safety_stock, avg_daily_sales, suggested_supplier_id, estimated_cost, reasoning, urgency, status, created_at, organization_id) FROM stdin;
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refunds (id, sale_id, medicine_id, quantity, amount, reason, processed_by_id, organization_id, created_at) FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, medicine_id, batch_id, quantity, unit_price, subtotal, is_refunded, organization_id, created_at) FROM stdin;
\.


--
-- Data for Name: sale_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_orders (id, order_number, items, total_amount, discount, status, patient_id, prescription_image_url, is_controlled_transaction, payment_account_id, payment_account_name, created_by, confirmed_by, confirmed_at, sale_id, organization_id, created_at, updated_at) FROM stdin;
c2fd0a43-2efc-445f-81d5-fadde98d449f	ORD-20260411-KR1A	[{"name": "Chemistry 400mg", "batch_id": "0db1653d-947f-4f52-b259-d236158c1caf", "quantity": 1, "unit_price": 9, "expiry_date": "2030-12-05", "medicine_id": "81ea01b0-c189-4107-8885-69cbd12eaffd", "batch_number": "BN-BN"}, {"name": "chesmo", "batch_id": "f0487fc4-7121-44e5-93c1-13774015314a", "quantity": 4, "unit_price": 14, "expiry_date": "2033-10-05", "medicine_id": "e9733e4c-1c2d-499f-a747-7dffe3772488", "batch_number": "BN-2026-ll3"}, {"name": "test", "batch_id": "6374c23e-dd65-4653-92fc-bd52fb9d607b", "quantity": 5, "unit_price": 15, "expiry_date": "2026-05-09", "medicine_id": "c7d4b78f-85b4-4729-99a0-dc8d73c3be05", "batch_number": "BN-new-124"}]	140.00	0.00	CONFIRMED	\N	\N	f	8f69bbf2-bdad-4b17-ab4d-27613df63efb	CBE	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-11 04:35:16.275-07	ad228cc9-b81c-4e39-ab55-8fe2f1f84a32	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-11 04:18:56.246081-07	2026-04-11 04:35:16.904783-07
ab9d32cc-305a-4976-b04e-dd249102cb19	ORD-20260411-21UR	[{"name": "Chemicals ", "batch_id": "8600de43-040c-4d45-8bb1-cd263b46747e", "quantity": 4, "unit_price": 16, "expiry_date": "2030-10-05", "medicine_id": "17322c3a-8323-4ea9-b093-ab69d2df6bfe", "batch_number": "BN-2026-ll2"}]	64.00	0.00	CANCELLED	\N	\N	f	\N	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-11 06:11:56.270452-07	2026-04-11 06:12:33.892581-07
289e62ff-c7db-4c5c-927d-d8daafb03b7b	ORD-20260413-7HBB	[{"name": "Chemicals ", "batch_id": "8600de43-040c-4d45-8bb1-cd263b46747e", "quantity": 1, "unit_price": 16, "expiry_date": "2030-10-05", "medicine_id": "17322c3a-8323-4ea9-b093-ab69d2df6bfe", "batch_number": "BN-2026-ll2"}]	16.00	0.00	CONFIRMED	\N	\N	f	66453b16-890a-4c44-8294-23d2e7feee71	Tellebirr	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-13 16:39:31.881-07	ad0156fa-1f94-423d-a5bb-9391d2e93895	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-13 16:38:45.947833-07	2026-04-13 16:39:34.406268-07
8c60d5b0-ecf7-4bd8-9aa3-054dddac1d6d	ORD-20260411-FIT5	[{"name": "carteee", "batch_id": "e260efd1-591d-490a-a30b-96157cda9630", "quantity": 1, "unit_price": 8, "expiry_date": "2026-07-29", "medicine_id": "4119856f-81f8-4193-9162-c6583590e935", "batch_number": "BN-009-20290"}]	8.00	0.00	CONFIRMED	\N	\N	f	8f69bbf2-bdad-4b17-ab4d-27613df63efb	CBE	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-11 06:13:58.709-07	31709fb3-c81e-4129-89d9-f2908cecb29f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-11 06:13:15.240159-07	2026-04-11 06:14:00.174009-07
9f159911-9ffb-4251-bece-046f4fd75613	ORD-20260413-I12E	[{"name": "Chemicals ", "batch_id": "8600de43-040c-4d45-8bb1-cd263b46747e", "quantity": 9, "unit_price": 16, "expiry_date": "2030-10-05", "medicine_id": "17322c3a-8323-4ea9-b093-ab69d2df6bfe", "batch_number": "BN-2026-ll2"}, {"name": "chesmo", "batch_id": "f0487fc4-7121-44e5-93c1-13774015314a", "quantity": 6, "unit_price": 14, "expiry_date": "2033-10-05", "medicine_id": "e9733e4c-1c2d-499f-a747-7dffe3772488", "batch_number": "BN-2026-ll3"}]	228.00	0.00	CONFIRMED	3ff7110f-a45d-4040-8a79-f54624059d10	\N	f	66453b16-890a-4c44-8294-23d2e7feee71	Tellebirr	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-13 10:33:30.962-07	e4b15235-0af7-4ef2-a397-1dbc8a7129f2	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-13 10:26:26.848575-07	2026-04-13 10:33:32.15562-07
ca7ca10e-4e94-430c-b8f9-8e69005685a2	ORD-20260411-IUHA	[{"name": "Chemicals ", "batch_id": "8600de43-040c-4d45-8bb1-cd263b46747e", "quantity": 1, "unit_price": 16, "expiry_date": "2030-10-05", "medicine_id": "17322c3a-8323-4ea9-b093-ab69d2df6bfe", "batch_number": "BN-2026-ll2"}]	16.00	0.00	CONFIRMED	1bc787bc-83ee-453e-8f78-871e959b2607	\N	f	b35129c5-9f7a-4404-bba7-5ced176b7daa	Abysinnia Bank	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-11 08:10:10.215-07	4d4ef74a-be11-4451-80c9-9156970969be	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-11 08:09:37.09897-07	2026-04-11 08:10:12.119077-07
780433ed-886a-426b-a206-3d15d6d3c915	ORD-20260411-REDR	[{"name": "carteee", "batch_id": "e260efd1-591d-490a-a30b-96157cda9630", "quantity": 4, "unit_price": 8, "expiry_date": "2026-07-29", "medicine_id": "4119856f-81f8-4193-9162-c6583590e935", "batch_number": "BN-009-20290"}]	32.00	0.00	CONFIRMED	3ff7110f-a45d-4040-8a79-f54624059d10	\N	f	b35129c5-9f7a-4404-bba7-5ced176b7daa	Abysinnia Bank	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-11 08:42:50.978-07	b7d30835-ee83-4156-b9c2-a605485d42b4	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-11 08:41:34.347898-07	2026-04-11 08:42:51.797015-07
5e687d08-0c32-4614-a3e2-cf2db459bd91	ORD-20260413-WFBM	[{"name": "Chemicals ", "batch_id": "8600de43-040c-4d45-8bb1-cd263b46747e", "quantity": 10, "unit_price": 16, "expiry_date": "2030-10-05", "medicine_id": "17322c3a-8323-4ea9-b093-ab69d2df6bfe", "batch_number": "BN-2026-ll2"}]	160.00	0.00	CONFIRMED	\N	\N	f	66453b16-890a-4c44-8294-23d2e7feee71	Tellebirr	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-13 13:37:20.219-07	94e93b26-6b5a-492f-bbb9-f7cbb5f7504d	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-13 13:36:54.588353-07	2026-04-13 13:37:21.003846-07
67271379-ce8e-4f03-a701-f04549ebc057	ORD-20260415-64LX	[{"name": "FOGGE Body Sprirant", "batch_id": "50d2e2fc-5b89-4773-993c-699a921bb30e", "quantity": 5, "unit_price": 1200, "expiry_date": "2032-12-26", "medicine_id": "17c16570-4097-40f4-92b1-f9f806e468e1", "batch_number": "BN-NEW"}, {"name": "Nivea Body Lotion", "batch_id": "2ea82c10-0fd9-4938-b761-6b3efe2de3b2", "quantity": 1, "unit_price": 600, "expiry_date": "2034-01-01", "medicine_id": "97d7d8ed-2b6a-4518-be21-f23f118d7512", "batch_number": "BN-NEW"}]	6600.00	0.00	CONFIRMED	\N	\N	f	b35129c5-9f7a-4404-bba7-5ced176b7daa	Abysinnia Bank	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-15 11:28:45.848-07	509bc1a8-8179-4973-a54c-fa4f92c669e4	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 11:27:59.23311-07	2026-04-15 11:28:47.018964-07
4025da0d-fca2-4e42-b592-71239dc767f2	ORD-20260415-GFQ4	[{"name": "FOGGE Body Sprirant", "batch_id": "50d2e2fc-5b89-4773-993c-699a921bb30e", "quantity": 9, "unit_price": 1200, "expiry_date": "2032-12-26", "medicine_id": "17c16570-4097-40f4-92b1-f9f806e468e1", "batch_number": "BN-NEW"}, {"name": "test", "batch_id": "6374c23e-dd65-4653-92fc-bd52fb9d607b", "quantity": 7, "unit_price": 15, "expiry_date": "2026-05-09", "medicine_id": "c7d4b78f-85b4-4729-99a0-dc8d73c3be05", "batch_number": "BN-new-124"}, {"name": "Nivea Body Lotion", "batch_id": "2ea82c10-0fd9-4938-b761-6b3efe2de3b2", "quantity": 12, "unit_price": 600, "expiry_date": "2034-01-01", "medicine_id": "97d7d8ed-2b6a-4518-be21-f23f118d7512", "batch_number": "BN-NEW"}]	18105.00	0.00	CONFIRMED	\N	\N	f	66453b16-890a-4c44-8294-23d2e7feee71	Tellebirr	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-15 11:30:16.797-07	eb44767b-79d1-4875-a671-c1b1eeb1bf27	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 11:30:06.501875-07	2026-04-15 11:30:19.116407-07
3d697552-33e3-4ff9-9533-640f40d7cff0	ORD-20260415-41D2	[{"name": "Chemicals ", "batch_id": "8600de43-040c-4d45-8bb1-cd263b46747e", "quantity": 1, "unit_price": 16, "expiry_date": "2030-10-05", "medicine_id": "17322c3a-8323-4ea9-b093-ab69d2df6bfe", "batch_number": "BN-2026-ll2"}]	16.00	0.00	CONFIRMED	\N	\N	f	a293dec6-e318-44a5-97f9-917f8fd118ed	Pitty Cash	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-15 11:59:07.597-07	eb2b83b9-c896-4c1b-8377-33b7c0cc5b4e	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 11:58:26.467756-07	2026-04-15 11:59:08.270881-07
1c4b8ba0-e944-46ab-9225-7254502530de	ORD-20260415-DL64	[{"name": "Chemicals ", "batch_id": "8600de43-040c-4d45-8bb1-cd263b46747e", "quantity": 4, "unit_price": 16, "expiry_date": "2030-10-05", "medicine_id": "17322c3a-8323-4ea9-b093-ab69d2df6bfe", "batch_number": "BN-2026-ll2"}]	64.00	0.00	CONFIRMED	\N	\N	f	b35129c5-9f7a-4404-bba7-5ced176b7daa	Abysinnia Bank	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-15 11:59:59.148-07	03f86dee-8dfd-4ffb-a0b4-94e685d36716	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 11:59:20.670501-07	2026-04-15 12:00:00.001165-07
9166e24c-fe8e-4d72-84bc-1f90ac40c820	ORD-20260415-EOIQ	[{"name": "FOGGE Body Sprirant", "batch_id": "50d2e2fc-5b89-4773-993c-699a921bb30e", "quantity": 1, "unit_price": 1200, "expiry_date": "2032-12-26", "medicine_id": "17c16570-4097-40f4-92b1-f9f806e468e1", "batch_number": "BN-NEW"}]	1200.00	0.00	PENDING	\N	\N	f	\N	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 13:35:05.438907-07	2026-04-15 13:35:05.438907-07
f62ab9fd-9279-4a01-b5ed-7ba2117640b9	ORD-20260415-F9LJ	[{"name": "FOGGE Body Sprirant", "batch_id": "50d2e2fc-5b89-4773-993c-699a921bb30e", "quantity": 1, "unit_price": 1200, "expiry_date": "2032-12-26", "medicine_id": "17c16570-4097-40f4-92b1-f9f806e468e1", "batch_number": "BN-NEW"}]	900.00	300.00	PENDING	\N	\N	f	\N	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 13:37:30.414122-07	2026-04-15 13:37:30.414122-07
72a0a007-9f93-431b-9de1-865670396ca8	ORD-20260415-CHWE	[{"name": "carteee", "batch_id": "e260efd1-591d-490a-a30b-96157cda9630", "quantity": 1, "unit_price": 12, "expiry_date": "2026-07-29", "medicine_id": "4119856f-81f8-4193-9162-c6583590e935", "batch_number": "BN-009-20290"}]	0.00	12.00	PENDING	\N	\N	f	\N	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 13:45:34.140779-07	2026-04-15 13:45:34.140779-07
e6e2e2ba-0f37-412f-8850-97997423eccb	ORD-20260415-D4FV	[{"name": "FOGGE Body Sprirant", "batch_id": "50d2e2fc-5b89-4773-993c-699a921bb30e", "quantity": 1, "unit_price": 1200, "expiry_date": "2032-12-26", "medicine_id": "17c16570-4097-40f4-92b1-f9f806e468e1", "batch_number": "BN-NEW"}]	1200.00	0.00	PENDING	\N	\N	f	\N	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 13:56:16.317577-07	2026-04-15 13:56:16.317577-07
31494f23-f0f4-4f2e-a2a6-e3b8d825bb13	ORD-20260415-YWF1	[{"name": "FOGGE Body Sprirant", "batch_id": "50d2e2fc-5b89-4773-993c-699a921bb30e", "quantity": 1, "unit_price": 1200, "expiry_date": "2032-12-26", "medicine_id": "17c16570-4097-40f4-92b1-f9f806e468e1", "batch_number": "BN-NEW"}, {"name": "carteee", "batch_id": "2335fa3f-656e-4fb5-8054-1ec0460ab63d", "quantity": 3, "unit_price": 0, "expiry_date": "2026-05-01", "medicine_id": "4119856f-81f8-4193-9162-c6583590e935", "batch_number": "r"}]	1200.00	0.00	CONFIRMED	\N	\N	f	b35129c5-9f7a-4404-bba7-5ced176b7daa	Abysinnia Bank	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-15 13:57:58.129-07	2a14a0cc-33c9-4fbf-a576-68047035a114	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 11:59:27.979338-07	2026-04-15 13:57:59.11436-07
0c716437-a064-4a0b-94a3-52530fe4b5f4	ORD-20260415-55P7	[{"name": "Nivea Body Lotion", "batch_id": "2ea82c10-0fd9-4938-b761-6b3efe2de3b2", "quantity": 3, "unit_price": 600, "expiry_date": "2034-01-01", "medicine_id": "97d7d8ed-2b6a-4518-be21-f23f118d7512", "batch_number": "BN-NEW"}]	1800.00	0.00	CONFIRMED	\N	\N	f	b35129c5-9f7a-4404-bba7-5ced176b7daa	Abysinnia Bank	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-15 13:58:15.991-07	1b941d5b-ec66-4d60-8d0c-3ca487c5c628	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 11:59:33.930896-07	2026-04-15 13:58:16.35918-07
558c496d-f2f4-47bc-a07b-dd81295f3d02	ORD-20260415-U22M	[{"name": "FOGGE Body Sprirant", "batch_id": "50d2e2fc-5b89-4773-993c-699a921bb30e", "quantity": 1, "unit_price": 1200, "expiry_date": "2032-12-26", "medicine_id": "17c16570-4097-40f4-92b1-f9f806e468e1", "batch_number": "BN-NEW"}]	1200.00	0.00	CONFIRMED	\N	\N	f	a293dec6-e318-44a5-97f9-917f8fd118ed	Pitty Cash	46282536-d3c2-4d26-9a61-afd2de2c3534	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	2026-04-15 13:58:23.923-07	29ebece4-1cc7-49d8-86fc-70153f3405ea	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 13:57:14.756368-07	2026-04-15 13:58:24.897662-07
4b9b8841-c1a8-40dd-ac29-e2246172e6e9	ORD-20260416-X067	[{"name": "EQUIPMENT -ONE", "batch_id": "e0ccf410-1830-402b-b82e-ac6e213115cc", "quantity": 1, "unit_price": 500, "expiry_date": null, "medicine_id": "f7bfc127-50f8-4b08-b44e-692d6cf4a2c4", "batch_number": "GEN-496133"}, {"name": "Paracetamol", "batch_id": "043b4012-d5fa-4532-95a9-ce0cbf682b8d", "quantity": 1, "unit_price": 2.5, "expiry_date": "2026-12-31", "medicine_id": "be56227d-5862-4206-9052-3ff34b401017", "batch_number": "BN-01"}]	502.50	0.00	PENDING	\N	\N	f	\N	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-16 16:02:22.150543-07	2026-04-16 16:02:22.150543-07
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, receipt_number, patient_id, prescription_id, total_amount, discount, payment_method, split_payments, created_by, is_refunded, refund_amount, prescription_image_url, is_controlled_transaction, branch_id, organization_id, created_at) FROM stdin;
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transactions (id, batch_id, type, quantity, reference_type, reference_id, notes, is_fefo_override, override_reason, created_by, created_at, organization_id) FROM stdin;
a418685f-27b9-4619-a240-50b88653e67d	b5cbd453-3cf2-4ede-825b-e339506bfed1	IN	1	PURCHASE	a6674129-6efd-4d99-bd0d-356328316714	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-18 12:12:22.260404	cfc876dd-c6e3-4283-b705-0cd86ac95e00
2f6f9b74-aa03-4498-bf7b-0d70743102fa	20ba0678-8ef3-41d1-980c-4003cb345610	IN	1	PURCHASE	1502d364-60cd-447f-9adf-1806d2ecd1db	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-18 12:24:16.943455	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b2930b5f-5c8f-48f4-8c58-87b0c4b2290f	afb7af3d-fcfa-411f-9f92-bc42e4167db6	IN	1	PURCHASE	31b9f0aa-6c92-40bd-b76b-bddead9323fd	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-18 13:06:38.958095	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, description, features, is_active, created_at, updated_at, duration_months, costs) FROM stdin;
32e9a33f-a38c-4655-b87c-97620d7978a9	Basic		["Up to 3 users","Full time support","Credit","Expenses"]	t	2026-03-31 11:28:41.685942	2026-04-05 03:48:10.231785	1	700.00
9b3be0f1-8469-4577-a431-bf2345e70d3a	Pro		["Suppliers","Intelligent Forecasting","Expenses","Credit","Inventory","Purchases","Payment Accounts","Stock Audit"]	t	2026-04-01 02:25:29.23603	2026-04-15 12:21:09.65868	1	1000.00
d355ecfc-d278-4b74-816c-f7d72b2e47af	Permium		["Suppliers","Purchases","Inventory","Intelligent Forecasting"]	f	2026-04-01 00:12:02.517614	2026-04-15 12:21:29.106217	1	800.00
\.


--
-- Data for Name: subscription_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_requests (id, organization_id, plan_id, status, user_notes, admin_notes, created_at, updated_at) FROM stdin;
71a097c7-3ba5-4ad4-8b2b-8922fa05a92e	00000000-0000-0000-0000-000000000000	d355ecfc-d278-4b74-816c-f7d72b2e47af	REJECTED		No new FU	2026-04-05 08:18:55.831734	2026-04-05 08:48:15.113868
b51a56ad-68bb-4dff-9d0a-b2e6c7e9595a	cfc876dd-c6e3-4283-b705-0cd86ac95e00	d355ecfc-d278-4b74-816c-f7d72b2e47af	REJECTED	Upgrade Please!	Redundant feature, you currently have this feature	2026-04-05 08:28:07.322354	2026-04-05 08:48:55.557106
d12f1e22-149f-46c6-988c-2a36e77fca1e	cfc876dd-c6e3-4283-b705-0cd86ac95e00	d355ecfc-d278-4b74-816c-f7d72b2e47af	REJECTED		Redundant feature, you currently have this feature	2026-04-05 08:12:42.372053	2026-04-05 08:49:31.308226
c022cd69-5519-4dc2-a40e-41cc55d595cc	cfc876dd-c6e3-4283-b705-0cd86ac95e00	d355ecfc-d278-4b74-816c-f7d72b2e47af	APPROVED	I want this features please upgrade my plan, 	\N	2026-04-05 07:52:22.67225	2026-04-05 08:49:43.78032
8774a370-5b73-4eb7-bb3a-12beab4b141e	cfc876dd-c6e3-4283-b705-0cd86ac95e00	d355ecfc-d278-4b74-816c-f7d72b2e47af	REJECTED	Please upgrade to the new Plan Preminum	Rejected	2026-04-05 08:12:05.810379	2026-04-05 08:56:20.199979
\.


--
-- Data for Name: supplier_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_contracts (id, supplier_id, effective_date, expiry_date, discount_percentage, return_policy, notes, created_at, organization_id) FROM stdin;
ed13623c-134d-44bf-8036-bc65159d237d	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	2026-04-05	2027-04-05	10.00	Test	Test	2026-04-05 04:22:51.87179	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: supplier_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_payments (id, purchase_order_id, amount, payment_method, transaction_reference, payment_date, notes, created_by, created_at, organization_id) FROM stdin;
\.


--
-- Data for Name: supplier_performance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_performance (id, supplier_id, period, on_time_deliveries, total_deliveries, price_variance, returned_items, total_items, quality_rating, computed_score, created_at, organization_id) FROM stdin;
11828876-56fc-41bc-bc7c-8958a3aee981	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	2026-04	100	140	1.25	20	120	3.5	0.52	2026-04-05 04:23:51.763483	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, contact_person, phone, email, address, credit_limit, payment_terms, average_lead_time, is_active, created_at, updated_at, organization_id) FROM stdin;
7ef164e7-09e3-4a3a-96d9-dfbed63bd042	CHEMOSAL	Yosief	07654321	chemosal-support@addis.com	Bole Brass 	59800.00	COD	7	t	2026-04-05 04:07:44.662896	2026-04-05 04:09:28.605722	cfc876dd-c6e3-4283-b705-0cd86ac95e00
43ba81a5-6f63-4532-8c8e-33295d55060d	CHCHCHCH	Yosida	07654321	yosidasupport@chch.com	Kazanchis	23400.00	NET_15	6	t	2026-04-05 04:25:22.589599	2026-04-05 04:25:22.589599	cfc876dd-c6e3-4283-b705-0cd86ac95e00
506ce147-b96a-4b5e-bb7c-db4cecd62b8a	chemere	chmex	066567654	uieriwhuiqwu	Mexico	2000.00	COD	7	t	2026-04-05 06:20:55.537192	2026-04-05 06:20:55.537192	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: system_features; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_features (id, key, name, description, icon, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transfer_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transfer_requests (id, from_account_id, to_account_id, amount, reason, status, requested_by, approved_by, organization_id, created_at, updated_at) FROM stdin;
ffa6f3ab-1a26-4654-8d34-c27aae568627	a293dec6-e318-44a5-97f9-917f8fd118ed	b35129c5-9f7a-4404-bba7-5ced176b7daa	43080.02		APPROVED	65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 11:56:30.926338-07	2026-04-15 11:56:43.773815-07
a33e6dc1-6123-4648-bb2b-266a854e4174	a293dec6-e318-44a5-97f9-917f8fd118ed	66453b16-890a-4c44-8294-23d2e7feee71	9.00		APPROVED	46282536-d3c2-4d26-9a61-afd2de2c3534	46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-15 12:00:59.139455-07	2026-04-15 12:00:59.139455-07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, role, is_active, manager_pin, branch_id, organization_id, created_at, updated_at) FROM stdin;
e02e046c-eddc-4abb-9a77-80e08d5929ad	new	$2b$10$qWmWqwN.RtdC9DXAfuYzw.oZ8qwIznC6JAm.qSe0c1v6anmbKRYpm	ADMIN	t	\N	\N	82d0d253-897a-4edf-8749-bb03798004db	2026-04-01 01:25:44.814477	2026-04-01 02:04:24.427292
65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	moges	$2b$10$nnAvZIo4IXZIj5QCH0Gb1.LOdwi7N/.9aT/sUpNiQcOWvuCGhZcWO	CASHIER	t	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-03 23:20:08.600613	2026-04-11 04:24:04.647446
39ddfcb3-1462-45d5-9c6b-ef304915c1a3	bereket	$2b$10$LmGq0heC3lDlvlsp8OJBWOrHIbs7WY/7Dgom9EzYXj1CrWisndJtK	PHARMACIST	t	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 08:44:48.841922	2026-03-26 08:44:48.841922
6a6aa93e-f5f7-4685-a934-e6a11a708d89	yosief	$2b$10$XBZOCKTof.PM0GFMgEPRsOb3lgTlp9eQXxQiKDDoR79bOd3pCoew.	ADMIN	f	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 08:36:14.676204	2026-03-26 08:51:42.068207
98b71fd9-9d98-4395-b114-cf28cfe62aab	mudaye	$2b$10$SpM9bpqGWsXTdDxLeyRgDOH8CLwSbeXmK32Org9m6MKFT.Mx0nwVK	ADMIN	t	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 08:55:43.392331	2026-03-26 08:55:43.392331
416ae697-489b-4f08-a316-afdfa4566805	mudaye	$2b$10$HDBRrakDIDC4hZMlG42SPuD/hPqSrUvYqO/r9G4ekHreeEDJ4qb0K	ADMIN	t	\N	\N	1129d8da-c6a7-48fc-865a-7ab5095dc398	2026-03-26 08:58:45.820253	2026-03-26 08:59:21.949776
fbc32a57-a091-4fc3-b3a3-a7cb71b30382	beki	$2b$10$H1ARgh1riUyOoHgMquakButffXE1QdcJCDI2k0d58QQHKEig20Hvi	ADMIN	t	\N	\N	1129d8da-c6a7-48fc-865a-7ab5095dc398	2026-03-26 22:41:15.163455	2026-03-26 22:41:15.163455
0449f568-0509-4c50-a472-f4844ac13e7e	beki	$2b$10$.Z.tY7XQ2syUAZknhJ7Rp.w36qvdboN/qXlzrXpoHcpRtDoZt4OVe	ADMIN	t	\N	\N	b9034243-010c-496b-b5d4-90947a3b3974	2026-03-26 22:42:53.418108	2026-03-26 22:42:53.418108
5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	yosief	$2b$10$k11bb8Y.vF9.QlcODXHyxeglh2.H0LAy3FQkYsY22O8qW.7ELmF3K	ADMIN	t	\N	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-30 03:12:30.741684	2026-03-30 03:12:30.741684
0f953bcd-70cd-4228-afab-37d8e1ecc81c	Yosief D	$2b$10$xJQIovRLsDaWhWoKqgDq5.AF0zy0JSnFKPO4EHd.HVHdE6H974WJ2	ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-30 03:36:14.279193	2026-03-30 03:36:14.279193
41398660-3cd9-44bc-ab1a-1616c68d619f	bereket	$2b$10$kJuuYWqEBFaDa0FsHY2CPucrEpxhPqTx6CruFSo2tkiHQM/uyXzue	CASHIER	t	\N	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:31:53.379259	2026-03-31 00:31:53.379259
196cf18c-9db4-45f0-a518-a3fe0ae0d70c	samri	$2b$10$MytaOJENiZZvTQMkMnTva.klTyO5QFx9oKI5dR62/tpuEDJhpFQfa	PHARMACIST	t	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 00:49:46.046757	2026-04-13 13:45:34.243834
59e6bca9-0b11-495e-a482-69f6947081d8	admin	$2b$10$HYJePhR07AGtdqvLlPlJF.NQgwVqqJJTpBRWRJ3ks.aKpuFxGF/5O	ADMIN	t	\N	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:32:16.10403	2026-03-31 00:32:56.391867
65321d2a-a6fc-4900-abcc-5693c8f6c196	bewket	$2b$10$t3n1DAMTOdYfhZ//xpY0V..rPWsEvaKEnjliqJT5TQo4QjMsEQ.sG	ADMIN	t	\N	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 00:53:40.027339	2026-03-31 00:53:40.027339
db79319d-343f-4d8f-bb54-e4efaa70c31d	bereket	$2b$10$7MNbOGAoGINuHi.dHm7kOunP47022EXOvZmAVkaIx3uCeGy0oPWjy	ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-26 08:33:51.312164	2026-03-31 09:29:17.591983
4548bc76-62a3-464d-8f6f-d1aa02298954	samri	$2b$10$eBBTyL6M7adOMCNd9WuVfuGlVqHi6b4Rz5wxy1VhMQEXm2PkZzYvi	ADMIN	t	\N	\N	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b	2026-03-31 11:32:39.45472	2026-03-31 11:34:34.224286
d95c589a-04c5-4ea3-af8d-82192031f907	new1	$2b$10$x3IVEahDcFaGpvxfZR9G1u9IoVYqec40xcoa5efVbc1H02NIU8bG.	ADMIN	t	\N	\N	82d0d253-897a-4edf-8749-bb03798004db	2026-04-01 02:02:24.94574	2026-04-01 02:02:24.94574
46282536-d3c2-4d26-9a61-afd2de2c3534	hayle	$2b$10$Rx0KiwEtksx33zgR0kIwPO3cT33HAoOBCf7fxI6wW2VSGfy24Jyv2	ADMIN	t	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 00:50:33.941235	2026-04-03 15:18:03.95072
c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	moges	$2b$10$iiFdG7w0DMGJlVg7ykMGtuyi4ncfWocGFVYFfV4jNtBaCd.xIRdCC	ADMIN	t	\N	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 00:53:22.474545	2026-04-04 03:34:50.292848
519dab08-1342-46dc-a816-7b419e816e56	superadmin	$2b$10$HYJePhR07AGtdqvLlPlJF.NQgwVqqJJTpBRWRJ3ks.aKpuFxGF/5O	SUPER_ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-25 14:45:39.568484	2026-03-31 09:29:39.372069
8fef06d5-307b-49eb-a867-6322ea49f080	admin	$2b$10$igmmcTQjo0juMmyvOhVXr.AILneDx409WC2QGrUflsJuNREatfaVy	ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-25 14:45:39.460855	2026-04-05 04:32:24.011706
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- Name: supplier_performance PK_00be6388740bd7564d67c0255f7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_performance
    ADD CONSTRAINT "PK_00be6388740bd7564d67c0255f7" PRIMARY KEY (id);


--
-- Name: purchase_orders PK_05148947415204a897e8beb2553; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY (id);


--
-- Name: purchase_recommendations PK_057da8e5d55a88335a210d58859; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_recommendations
    ADD CONSTRAINT "PK_057da8e5d55a88335a210d58859" PRIMARY KEY (id);


--
-- Name: prescriptions PK_097b2cc2f2b7e56825468188503; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT "PK_097b2cc2f2b7e56825468188503" PRIMARY KEY (id);


--
-- Name: system_features PK_0c1d7826eeafb79aca18282059b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_features
    ADD CONSTRAINT "PK_0c1d7826eeafb79aca18282059b" PRIMARY KEY (id);


--
-- Name: customers PK_133ec679a801fab5e070f73d3ea; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY (id);


--
-- Name: stock_transactions PK_1aa2430f5ac950c26da6e1ff222; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT "PK_1aa2430f5ac950c26da6e1ff222" PRIMARY KEY (id);


--
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- Name: audit_items PK_29c9dcee199af96e49a46d7a58b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_items
    ADD CONSTRAINT "PK_29c9dcee199af96e49a46d7a58b" PRIMARY KEY (id);


--
-- Name: payment_accounts PK_30d855e954ca88f8d6badbab40e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_accounts
    ADD CONSTRAINT "PK_30d855e954ca88f8d6badbab40e" PRIMARY KEY (id);


--
-- Name: payment_account_transactions PK_3467d771d3dfe30238c12215d1c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_account_transactions
    ADD CONSTRAINT "PK_3467d771d3dfe30238c12215d1c" PRIMARY KEY (id);


--
-- Name: credit_records PK_377014773d4429797ed836e6bbf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_records
    ADD CONSTRAINT "PK_377014773d4429797ed836e6bbf" PRIMARY KEY (id);


--
-- Name: supplier_contracts PK_4cbe9269b1c0b47de0745ba0e48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_contracts
    ADD CONSTRAINT "PK_4cbe9269b1c0b47de0745ba0e48" PRIMARY KEY (id);


--
-- Name: sales PK_4f0bc990ae81dba46da680895ea; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY (id);


--
-- Name: refunds PK_5106efb01eeda7e49a78b869738; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "PK_5106efb01eeda7e49a78b869738" PRIMARY KEY (id);


--
-- Name: batches PK_55e7ff646e969b61d37eea5be7a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT "PK_55e7ff646e969b61d37eea5be7a" PRIMARY KEY (id);


--
-- Name: sale_items PK_5a7dc5b4562a9e590528b3e08ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "PK_5a7dc5b4562a9e590528b3e08ab" PRIMARY KEY (id);


--
-- Name: alerts PK_60f895662df096bfcdfab7f4b96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT "PK_60f895662df096bfcdfab7f4b96" PRIMARY KEY (id);


--
-- Name: prescription_items PK_6216831f49afc381b3934c9672c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT "PK_6216831f49afc381b3934c9672c" PRIMARY KEY (id);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: organizations PK_6b031fcd0863e3f6b44230163f9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY (id);


--
-- Name: supplier_payments PK_76e86f3194494faf999c652dbf9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT "PK_76e86f3194494faf999c652dbf9" PRIMARY KEY (id);


--
-- Name: medicines PK_77b93851766f7ab93f71f44b18b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT "PK_77b93851766f7ab93f71f44b18b" PRIMARY KEY (id);


--
-- Name: branches PK_7f37d3b42defea97f1df0d19535; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY (id);


--
-- Name: subscription_requests PK_7f97babb1f4d7eeef9d5c2937be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_requests
    ADD CONSTRAINT "PK_7f97babb1f4d7eeef9d5c2937be" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: patient_reminders PK_910e079e6df1872897f3fb1e272; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_reminders
    ADD CONSTRAINT "PK_910e079e6df1872897f3fb1e272" PRIMARY KEY (id);


--
-- Name: expenses PK_94c3ceb17e3140abc9282c20610; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY (id);


--
-- Name: subscription_plans PK_9ab8fe6918451ab3d0a4fb6bb0c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: patients PK_a7f0b9fcbb3469d5ec0b0aceaa7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY (id);


--
-- Name: forecast_results PK_b1f71db62cbb629da10d0fbbcdb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forecast_results
    ADD CONSTRAINT "PK_b1f71db62cbb629da10d0fbbcdb" PRIMARY KEY (id);


--
-- Name: suppliers PK_b70ac51766a9e3144f778cfe81e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY (id);


--
-- Name: sale_orders PK_ba301b7939d3333e8821ff92637; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_orders
    ADD CONSTRAINT "PK_ba301b7939d3333e8821ff92637" PRIMARY KEY (id);


--
-- Name: credit_payments PK_c8bf096041d9d988603b649ee33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_payments
    ADD CONSTRAINT "PK_c8bf096041d9d988603b649ee33" PRIMARY KEY (id);


--
-- Name: cheque_records PK_d6e062d2a17ccfce7a424c2c920; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cheque_records
    ADD CONSTRAINT "PK_d6e062d2a17ccfce7a424c2c920" PRIMARY KEY (id);


--
-- Name: price_history PK_e41e25472373d4b574b153229e9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT "PK_e41e25472373d4b574b153229e9" PRIMARY KEY (id);


--
-- Name: purchase_order_items PK_e8b7568d25c41e3290db596b312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "PK_e8b7568d25c41e3290db596b312" PRIMARY KEY (id);


--
-- Name: audit_sessions PK_edfdd76908c4e6139251775c0e2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_sessions
    ADD CONSTRAINT "PK_edfdd76908c4e6139251775c0e2" PRIMARY KEY (id);


--
-- Name: goods_receipts PK_f8cac411be0211f923e1be8534f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT "PK_f8cac411be0211f923e1be8534f" PRIMARY KEY (id);


--
-- Name: transfer_requests PK_f97530bf47e4af43166089627ba; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_requests
    ADD CONSTRAINT "PK_f97530bf47e4af43166089627ba" PRIMARY KEY (id);


--
-- Name: purchase_orders UQ_05408dde2a3cec84a0f5a0a262c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "UQ_05408dde2a3cec84a0f5a0a262c" UNIQUE (po_number, organization_id);


--
-- Name: prescriptions UQ_0706289c30fc64d64150a9310c4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT "UQ_0706289c30fc64d64150a9310c4" UNIQUE (prescription_number, organization_id);


--
-- Name: branches UQ_07f6271bbdf388a0b8050f4d907; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "UQ_07f6271bbdf388a0b8050f4d907" UNIQUE (name, organization_id);


--
-- Name: suppliers UQ_11eaea5682bd6d12f681b5352db; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "UQ_11eaea5682bd6d12f681b5352db" UNIQUE (name, organization_id);


--
-- Name: goods_receipts UQ_37f263aeec4f057bdd9b445312c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT "UQ_37f263aeec4f057bdd9b445312c" UNIQUE (grn_number, organization_id);


--
-- Name: system_features UQ_3927db26bc678c49b9a2b47c28c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_features
    ADD CONSTRAINT "UQ_3927db26bc678c49b9a2b47c28c" UNIQUE (key);


--
-- Name: medicines UQ_427e5a217bcd977bc0a5018a632; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT "UQ_427e5a217bcd977bc0a5018a632" UNIQUE (sku, organization_id);


--
-- Name: expenses UQ_43e18a414992a1bf8930bcacc86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "UQ_43e18a414992a1bf8930bcacc86" UNIQUE (receipt_reference, organization_id);


--
-- Name: medicines UQ_677ba5d6553ebdd46cced85cef2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT "UQ_677ba5d6553ebdd46cced85cef2" UNIQUE (name, organization_id);


--
-- Name: sales UQ_7882a7d8ea1f821ce579ad43325; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "UQ_7882a7d8ea1f821ce579ad43325" UNIQUE (receipt_number, organization_id);


--
-- Name: subscription_plans UQ_ae18a0f6e0143f06474aa8cef1f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT "UQ_ae18a0f6e0143f06474aa8cef1f" UNIQUE (name);


--
-- Name: medicines UQ_b4a17bc8a00ba5243a5e998fb5b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT "UQ_b4a17bc8a00ba5243a5e998fb5b" UNIQUE (barcode, organization_id);


--
-- Name: patients UQ_b553d9528653aeadb5b33a65b59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT "UQ_b553d9528653aeadb5b33a65b59" UNIQUE (phone, organization_id);


--
-- Name: users UQ_da5d8a239590129ea1b7522dd63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_da5d8a239590129ea1b7522dd63" UNIQUE (username, organization_id);


--
-- Name: customers UQ_e09aa39168dc835141074776ef0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "UQ_e09aa39168dc835141074776ef0" UNIQUE (phone, organization_id);


--
-- Name: IDX_07f8fe9649327c6cffe35c5849; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_07f8fe9649327c6cffe35c5849" ON public.medicines USING btree (name);


--
-- Name: IDX_24fce6714d45db43ca415cef37; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_24fce6714d45db43ca415cef37" ON public.purchase_recommendations USING btree (medicine_id);


--
-- Name: IDX_4095a4539da89f77c4f4670043; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4095a4539da89f77c4f4670043" ON public.forecast_results USING btree (medicine_id);


--
-- Name: IDX_4189d6a832feca8867fdda65e5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4189d6a832feca8867fdda65e5" ON public.batches USING btree (expiry_date);


--
-- Name: IDX_5ad5a8f10afedf9afb4c613ac5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5ad5a8f10afedf9afb4c613ac5" ON public.sale_items USING btree (created_at);


--
-- Name: IDX_6dfe79109b2975245d622f55e8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6dfe79109b2975245d622f55e8" ON public.sales USING btree (created_at);


--
-- Name: IDX_77ee7b06d6f802000c0846f3a5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_77ee7b06d6f802000c0846f3a5" ON public.notifications USING btree (created_at);


--
-- Name: IDX_d4049dba0cd51fc62bed3b9c85; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d4049dba0cd51fc62bed3b9c85" ON public.forecast_results USING btree (target_date);


--
-- Name: IDX_f690cc2b7316bc457fa3c0e878; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f690cc2b7316bc457fa3c0e878" ON public.sale_orders USING btree (created_at);


--
-- Name: purchase_order_items FK_03efd4571c458c93b59ff17a709; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_03efd4571c458c93b59ff17a709" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: subscription_requests FK_08a05533fac26a1133888c2c04a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_requests
    ADD CONSTRAINT "FK_08a05533fac26a1133888c2c04a" FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: medicines FK_0bc9e6f0385565f18801c7beeea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT "FK_0bc9e6f0385565f18801c7beeea" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: supplier_payments FK_0ef621c98c59626b321265cd34c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT "FK_0ef621c98c59626b321265cd34c" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: audit_sessions FK_11722ed0fe1a3230f53807b4926; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_sessions
    ADD CONSTRAINT "FK_11722ed0fe1a3230f53807b4926" FOREIGN KEY ("createdById") REFERENCES public.users(id);


--
-- Name: sale_orders FK_13c73cca98f3703940b8e056879; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_orders
    ADD CONSTRAINT "FK_13c73cca98f3703940b8e056879" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: audit_logs FK_145f35b204c731ba7fc1a0be0e7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_145f35b204c731ba7fc1a0be0e7" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: supplier_payments FK_17331de2f272fcf9e5766756b6a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT "FK_17331de2f272fcf9e5766756b6a" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sale_items FK_1b3b68db226a9c68c4acc1dafe0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "FK_1b3b68db226a9c68c4acc1dafe0" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: prescription_items FK_1f27bfd532954d09c41d6a66d6f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT "FK_1f27bfd532954d09c41d6a66d6f" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: users FK_21a659804ed7bf61eb91688dea7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_21a659804ed7bf61eb91688dea7" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: supplier_contracts FK_22e44813af6b8328bb21446bc96; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_contracts
    ADD CONSTRAINT "FK_22e44813af6b8328bb21446bc96" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: patients FK_231c2a4693ed4edb7ccf29d9111; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT "FK_231c2a4693ed4edb7ccf29d9111" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: purchase_recommendations FK_24fce6714d45db43ca415cef37b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_recommendations
    ADD CONSTRAINT "FK_24fce6714d45db43ca415cef37b" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON DELETE CASCADE;


--
-- Name: prescriptions FK_28f318dc50357ec7970ec63fe5c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT "FK_28f318dc50357ec7970ec63fe5c" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: subscription_requests FK_2919989109de7510ae5688a8805; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_requests
    ADD CONSTRAINT "FK_2919989109de7510ae5688a8805" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: purchase_orders FK_396e7d9c9ddef24e5af83a23316; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_396e7d9c9ddef24e5af83a23316" FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: audit_sessions FK_3be7f4ff03ab99c06125ef7dba4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_sessions
    ADD CONSTRAINT "FK_3be7f4ff03ab99c06125ef7dba4" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: credit_records FK_3c1d2f983fb8f9814db7d0e8722; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_records
    ADD CONSTRAINT "FK_3c1d2f983fb8f9814db7d0e8722" FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: audit_items FK_3c8f138cca9f3023fe877f6afb2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_items
    ADD CONSTRAINT "FK_3c8f138cca9f3023fe877f6afb2" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: suppliers FK_3e9f69576d3622550efafbd6e4b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "FK_3e9f69576d3622550efafbd6e4b" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: purchase_order_items FK_3f92bb44026cedfe235c8b91244; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_3f92bb44026cedfe235c8b91244" FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: forecast_results FK_4095a4539da89f77c4f4670043c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forecast_results
    ADD CONSTRAINT "FK_4095a4539da89f77c4f4670043c" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON DELETE CASCADE;


--
-- Name: audit_items FK_40ad853fe763e54526531fe4387; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_items
    ADD CONSTRAINT "FK_40ad853fe763e54526531fe4387" FOREIGN KEY (batch_id) REFERENCES public.batches(id);


--
-- Name: expenses FK_47784468bc789a4e58fa64b4b3e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "FK_47784468bc789a4e58fa64b4b3e" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: prescription_items FK_47969d67ea9e2ef9827c9f40d84; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT "FK_47969d67ea9e2ef9827c9f40d84" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: supplier_performance FK_49563afd47148a0bb22e956cb07; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_performance
    ADD CONSTRAINT "FK_49563afd47148a0bb22e956cb07" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: credit_payments FK_4a4e254b049719eb8a63eea0286; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_payments
    ADD CONSTRAINT "FK_4a4e254b049719eb8a63eea0286" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: batches FK_4d1fe79271e59e8a051671679bc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT "FK_4d1fe79271e59e8a051671679bc" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: goods_receipts FK_4dc96f6157a0e7865ca1b72aaa5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT "FK_4dc96f6157a0e7865ca1b72aaa5" FOREIGN KEY (received_by) REFERENCES public.users(id);


--
-- Name: credit_records FK_4ff8fd7874f449feca3ec025950; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_records
    ADD CONSTRAINT "FK_4ff8fd7874f449feca3ec025950" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: refunds FK_54028e29d6a3aaef1cf313b0063; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "FK_54028e29d6a3aaef1cf313b0063" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: supplier_performance FK_5a9ea8fe2055524336da0bf9e4e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_performance
    ADD CONSTRAINT "FK_5a9ea8fe2055524336da0bf9e4e" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: refunds FK_5dcb85de1d184a6e1436dec41fd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "FK_5dcb85de1d184a6e1436dec41fd" FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: supplier_payments FK_5e3f9443818b705f6ab86b44764; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT "FK_5e3f9443818b705f6ab86b44764" FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_recommendations FK_6406d3b45a5bb92fd87c0d0814a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_recommendations
    ADD CONSTRAINT "FK_6406d3b45a5bb92fd87c0d0814a" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sale_items FK_6510bee02a86eca458a8572af6e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "FK_6510bee02a86eca458a8572af6e" FOREIGN KEY (batch_id) REFERENCES public.batches(id);


--
-- Name: transfer_requests FK_6a91bde6a85c8db2ec917828b9d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_requests
    ADD CONSTRAINT "FK_6a91bde6a85c8db2ec917828b9d" FOREIGN KEY (to_account_id) REFERENCES public.payment_accounts(id) ON DELETE CASCADE;


--
-- Name: audit_items FK_6af8e033db899fdff9845436fe0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_items
    ADD CONSTRAINT "FK_6af8e033db899fdff9845436fe0" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: sales FK_742b48cee8319453602e7d6fd4b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "FK_742b48cee8319453602e7d6fd4b" FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: cheque_records FK_7b7879706a961c5584865651553; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cheque_records
    ADD CONSTRAINT "FK_7b7879706a961c5584865651553" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: expenses FK_7c0c012c2f8e6578277c239ee61; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "FK_7c0c012c2f8e6578277c239ee61" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batches FK_7caa4282b9d3c923684ba4889f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT "FK_7caa4282b9d3c923684ba4889f1" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON DELETE CASCADE;


--
-- Name: goods_receipts FK_7dd02777a589d5e2d1e75a92ba7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT "FK_7dd02777a589d5e2d1e75a92ba7" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: payment_account_transactions FK_7ff88a168ded713bbf73bbab03f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_account_transactions
    ADD CONSTRAINT "FK_7ff88a168ded713bbf73bbab03f" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sales FK_83a12e5e2723eafe9a47c441457; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "FK_83a12e5e2723eafe9a47c441457" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: payment_accounts FK_8f0d5dd175e3034846e0268ae5b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_accounts
    ADD CONSTRAINT "FK_8f0d5dd175e3034846e0268ae5b" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: price_history FK_8f12440a05c78991547a8e6b598; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT "FK_8f12440a05c78991547a8e6b598" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON DELETE CASCADE;


--
-- Name: prescriptions FK_9389db557647131856661f7d7b5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT "FK_9389db557647131856661f7d7b5" FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: sales FK_9545ccf017c60b345c1c9a59407; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "FK_9545ccf017c60b345c1c9a59407" FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: purchase_orders FK_99f44faa1ca8d7ec9ebef918b06; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_99f44faa1ca8d7ec9ebef918b06" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sales FK_9a408600b4d9cee04c2f831fa3c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "FK_9a408600b4d9cee04c2f831fa3c" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: notifications FK_9a8a82462cab47c73d25f49261f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: refunds FK_9e274de520e2ef181f6d3010de1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "FK_9e274de520e2ef181f6d3010de1" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: credit_records FK_9e824837e5472d55483f856f0af; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_records
    ADD CONSTRAINT "FK_9e824837e5472d55483f856f0af" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: branches FK_9ecf73d5ca57108dc33c87f7d88; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "FK_9ecf73d5ca57108dc33c87f7d88" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sale_orders FK_9f19d4a90ba18f7125e09544105; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_orders
    ADD CONSTRAINT "FK_9f19d4a90ba18f7125e09544105" FOREIGN KEY (confirmed_by) REFERENCES public.users(id);


--
-- Name: price_history FK_9fdbc9f1cc971e55548b433c70e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT "FK_9fdbc9f1cc971e55548b433c70e" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: patient_reminders FK_a195425c90acb19febc0faa901a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_reminders
    ADD CONSTRAINT "FK_a195425c90acb19febc0faa901a" FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: prescription_items FK_a603d92d4a8459db5fbe45a4aea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT "FK_a603d92d4a8459db5fbe45a4aea" FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;


--
-- Name: purchase_orders FK_ae7f7b1d42c24b9ef3eb6d8d966; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_ae7f7b1d42c24b9ef3eb6d8d966" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: supplier_contracts FK_afa418f8036d07d50cb8a7018c6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_contracts
    ADD CONSTRAINT "FK_afa418f8036d07d50cb8a7018c6" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: credit_payments FK_b35402998a6ddffb923efa38205; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_payments
    ADD CONSTRAINT "FK_b35402998a6ddffb923efa38205" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: payment_account_transactions FK_b38fcd460d201593d0ebcac79b2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_account_transactions
    ADD CONSTRAINT "FK_b38fcd460d201593d0ebcac79b2" FOREIGN KEY (payment_account_id) REFERENCES public.payment_accounts(id) ON DELETE CASCADE;


--
-- Name: refunds FK_b7d1eaf9ed1c18fb9b4be69981c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "FK_b7d1eaf9ed1c18fb9b4be69981c" FOREIGN KEY (processed_by_id) REFERENCES public.users(id);


--
-- Name: transfer_requests FK_b8b8e0ff176ea52eb6addfc2fe4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_requests
    ADD CONSTRAINT "FK_b8b8e0ff176ea52eb6addfc2fe4" FOREIGN KEY (from_account_id) REFERENCES public.payment_accounts(id) ON DELETE CASCADE;


--
-- Name: alerts FK_ba66a38e94abfda415d5a9df76b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT "FK_ba66a38e94abfda415d5a9df76b" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: audit_logs FK_bd2726fd31b35443f2245b93ba0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: stock_transactions FK_bda898b3287f26f83674dbcefb8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT "FK_bda898b3287f26f83674dbcefb8" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sale_items FK_c210a330b80232c29c2ad68462a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "FK_c210a330b80232c29c2ad68462a" FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: stock_transactions FK_c36f71170f7013658ee98fcc7dd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT "FK_c36f71170f7013658ee98fcc7dd" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: patient_reminders FK_c52d384c0fbdabf137243925853; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_reminders
    ADD CONSTRAINT "FK_c52d384c0fbdabf137243925853" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: notifications FK_cb7b1fb018b296f2107e998b2ff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_cb7b1fb018b296f2107e998b2ff" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: cheque_records FK_ce98458f78f4d112df09af686e0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cheque_records
    ADD CONSTRAINT "FK_ce98458f78f4d112df09af686e0" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sale_items FK_ceadfec7a989d28fec9f710ef70; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "FK_ceadfec7a989d28fec9f710ef70" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: purchase_orders FK_d16a885aa88447ccfd010e739b0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_d16a885aa88447ccfd010e739b0" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: transfer_requests FK_d1d2bb5faf56b0ba6878e8d38c6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_requests
    ADD CONSTRAINT "FK_d1d2bb5faf56b0ba6878e8d38c6" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: customers FK_d2fc0e42b07d01fafc3fbb2bee3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "FK_d2fc0e42b07d01fafc3fbb2bee3" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sale_orders FK_d320c01f96d5c38b5bdb7a2d28b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_orders
    ADD CONSTRAINT "FK_d320c01f96d5c38b5bdb7a2d28b" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: goods_receipts FK_d3c8a7fa026b8e9e9b1cc98241a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT "FK_d3c8a7fa026b8e9e9b1cc98241a" FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: credit_payments FK_d43280ac1261a1fb89c97fe5729; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_payments
    ADD CONSTRAINT "FK_d43280ac1261a1fb89c97fe5729" FOREIGN KEY (credit_record_id) REFERENCES public.credit_records(id);


--
-- Name: sale_orders FK_d7bbf747b4e5d78375e0711deab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_orders
    ADD CONSTRAINT "FK_d7bbf747b4e5d78375e0711deab" FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: audit_items FK_d87e79c60ea0683a21726a6263a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_items
    ADD CONSTRAINT "FK_d87e79c60ea0683a21726a6263a" FOREIGN KEY (session_id) REFERENCES public.audit_sessions(id) ON DELETE CASCADE;


--
-- Name: price_history FK_e1a57a921333950f316d94071c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT "FK_e1a57a921333950f316d94071c2" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: purchase_order_items FK_e5c1775385a9d89df69316ba36a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_e5c1775385a9d89df69316ba36a" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON DELETE CASCADE;


--
-- Name: patient_reminders FK_e7ae2cb4154745969e055459f52; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_reminders
    ADD CONSTRAINT "FK_e7ae2cb4154745969e055459f52" FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: credit_payments FK_e878bdf2f584807f1ebe669b0b5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_payments
    ADD CONSTRAINT "FK_e878bdf2f584807f1ebe669b0b5" FOREIGN KEY (received_by) REFERENCES public.users(id);


--
-- Name: stock_transactions FK_ee68e055bbe7743dbed5ee62a24; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT "FK_ee68e055bbe7743dbed5ee62a24" FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;


--
-- Name: forecast_results FK_eefd37f509eb82acc44c3af81fb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forecast_results
    ADD CONSTRAINT "FK_eefd37f509eb82acc44c3af81fb" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: alerts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_items ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: batches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

--
-- Name: branches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

--
-- Name: cheque_records; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cheque_records ENABLE ROW LEVEL SECURITY;

--
-- Name: credit_payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.credit_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: credit_records; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.credit_records ENABLE ROW LEVEL SECURITY;

--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: forecast_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.forecast_results ENABLE ROW LEVEL SECURITY;

--
-- Name: goods_receipts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;

--
-- Name: medicines; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: patients; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

--
-- Name: prescription_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;

--
-- Name: prescriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: price_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

--
-- Name: purchase_order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: purchase_orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: purchase_recommendations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.purchase_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: refunds; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

--
-- Name: sale_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

--
-- Name: sales; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: supplier_contracts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.supplier_contracts ENABLE ROW LEVEL SECURITY;

--
-- Name: supplier_payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: supplier_performance; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.supplier_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: suppliers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

--
-- Name: alerts tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.alerts USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: audit_items tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.audit_items USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: audit_logs tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.audit_logs USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: audit_sessions tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.audit_sessions USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: batches tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.batches USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: branches tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.branches USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: cheque_records tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.cheque_records USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: credit_payments tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.credit_payments USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: credit_records tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.credit_records USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: customers tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.customers USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: expenses tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.expenses USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: forecast_results tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.forecast_results USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: goods_receipts tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.goods_receipts USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: medicines tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.medicines USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: notifications tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.notifications USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: patients tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.patients USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: prescription_items tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.prescription_items USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: prescriptions tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.prescriptions USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: price_history tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.price_history USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: purchase_order_items tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.purchase_order_items USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: purchase_orders tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.purchase_orders USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: purchase_recommendations tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.purchase_recommendations USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: refunds tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.refunds USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: sale_items tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.sale_items USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: sales tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.sales USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: stock_transactions tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.stock_transactions USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: supplier_contracts tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.supplier_contracts USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: supplier_payments tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.supplier_payments USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: supplier_performance tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.supplier_performance USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: suppliers tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.suppliers USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: users tenant_isolation_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_isolation_policy ON public.users USING ((((organization_id)::text = current_setting('app.current_tenant'::text, true)) OR (current_setting('app.is_super_admin'::text, true) = 'true'::text)));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

