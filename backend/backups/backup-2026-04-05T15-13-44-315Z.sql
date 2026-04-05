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
-- Name: notifications_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notifications_type_enum AS ENUM (
    'LOW_STOCK',
    'EXPIRING',
    'FRAUD_ALERT',
    'SALE',
    'SYSTEM',
    'INFO'
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
-- Name: purchase_orders_payment_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_payment_method_enum AS ENUM (
    'CASH',
    'CREDIT',
    'CHEQUE'
);


ALTER TYPE public.purchase_orders_payment_method_enum OWNER TO postgres;

--
-- Name: purchase_orders_payment_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_payment_status_enum AS ENUM (
    'PAID',
    'PENDING',
    'PARTIALLY_PAID'
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
    'CANCELLED'
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
    expiry_date date NOT NULL,
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
    organization_id uuid NOT NULL
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
    sku character varying,
    supplier_barcode character varying,
    preferred_supplier_id character varying,
    minimum_stock_level integer DEFAULT 10 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    branch_id character varying,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
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
    feature_overrides json
);


ALTER TABLE public.organizations OWNER TO postgres;

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
    created_at timestamp without time zone DEFAULT now() NOT NULL
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
\.


--
-- Data for Name: audit_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_items (id, session_id, medicine_id, batch_id, system_quantity, scanned_quantity, variance, notes, organization_id) FROM stdin;
b45fafe1-de1b-4b0d-ad74-295a8199b92b	966590da-a7d3-41bc-b26d-89061652d544	e9733e4c-1c2d-499f-a747-7dffe3772488	44ce660c-60eb-47bb-a1b0-3259eda9f73d	9044	0	-9044	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5c282a18-1b41-493f-afc2-f728e5f026f2	966590da-a7d3-41bc-b26d-89061652d544	17322c3a-8323-4ea9-b093-ab69d2df6bfe	a9f7cfdc-9438-432d-9722-95595e888a92	431	0	-431	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
226dc699-4dd7-45c2-9818-3c39f11c8131	22583d7a-c218-4743-b080-41882ce8c866	e9733e4c-1c2d-499f-a747-7dffe3772488	44ce660c-60eb-47bb-a1b0-3259eda9f73d	9044	9044	0	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
eb3ebddc-fc95-47ba-9faa-dba6a5bbbc73	22583d7a-c218-4743-b080-41882ce8c866	17322c3a-8323-4ea9-b093-ab69d2df6bfe	a9f7cfdc-9438-432d-9722-95595e888a92	431	430	-1	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
97dbcad1-a91e-43fa-a41e-31a83565fbb7	14fc2bcb-b48a-482b-ac29-a00b29fbee22	e9733e4c-1c2d-499f-a747-7dffe3772488	44ce660c-60eb-47bb-a1b0-3259eda9f73d	9044	0	-9044	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5428d0e8-274f-4ba5-bf75-8189eb6238b8	14fc2bcb-b48a-482b-ac29-a00b29fbee22	17322c3a-8323-4ea9-b093-ab69d2df6bfe	a9f7cfdc-9438-432d-9722-95595e888a92	430	0	-430	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
129a87d6-5e0d-46f5-aa0a-56cc60458c83	14fc2bcb-b48a-482b-ac29-a00b29fbee22	17322c3a-8323-4ea9-b093-ab69d2df6bfe	08de2b53-b269-45dc-9bb1-682a8839d3f4	290	0	-290	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0b31a9ab-efb0-4154-a981-e53d1bd894cd	14fc2bcb-b48a-482b-ac29-a00b29fbee22	17322c3a-8323-4ea9-b093-ab69d2df6bfe	18410b59-9288-47b2-803d-52270aefe167	10	0	-10	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f5cd9855-e15b-415f-82ac-77719a11d01c	14fc2bcb-b48a-482b-ac29-a00b29fbee22	17322c3a-8323-4ea9-b093-ab69d2df6bfe	faad34b2-15fe-49d8-8b3d-35b0b4fb4f21	200	0	-200	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0ed5f30c-4543-4667-96fa-df9881007e4d	1b917d08-25f2-4eed-9308-2c5c21eefe46	e9733e4c-1c2d-499f-a747-7dffe3772488	44ce660c-60eb-47bb-a1b0-3259eda9f73d	9044	0	-9044	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
6bbe5de8-0c11-44d0-ab86-b72d5faf0c85	1b917d08-25f2-4eed-9308-2c5c21eefe46	17322c3a-8323-4ea9-b093-ab69d2df6bfe	a9f7cfdc-9438-432d-9722-95595e888a92	430	0	-430	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b2134347-addb-4f3d-be81-8b4711931217	1b917d08-25f2-4eed-9308-2c5c21eefe46	17322c3a-8323-4ea9-b093-ab69d2df6bfe	08de2b53-b269-45dc-9bb1-682a8839d3f4	290	0	-290	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
16b21531-3352-44a0-b7f2-f9c33e761a39	1b917d08-25f2-4eed-9308-2c5c21eefe46	17322c3a-8323-4ea9-b093-ab69d2df6bfe	18410b59-9288-47b2-803d-52270aefe167	10	0	-10	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d774be95-9e84-4c96-999a-cb01eb615814	1b917d08-25f2-4eed-9308-2c5c21eefe46	17322c3a-8323-4ea9-b093-ab69d2df6bfe	faad34b2-15fe-49d8-8b3d-35b0b4fb4f21	200	0	-200	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f0a0896d-57b0-4d47-97fe-2fd1ae6f1fe2	d42705c9-c375-418c-ab1a-1cf03e6478e9	17322c3a-8323-4ea9-b093-ab69d2df6bfe	8600de43-040c-4d45-8bb1-cd263b46747e	1229	0	-1229	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
73bb6e6d-72fb-4de5-924c-7ac6cb741a2a	d42705c9-c375-418c-ab1a-1cf03e6478e9	4119856f-81f8-4193-9162-c6583590e935	e260efd1-591d-490a-a30b-96157cda9630	399	0	-399	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
de04b66a-c9ae-45c5-aa50-2dae181dc79e	d42705c9-c375-418c-ab1a-1cf03e6478e9	e9733e4c-1c2d-499f-a747-7dffe3772488	f0487fc4-7121-44e5-93c1-13774015314a	719	0	-719	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1205db61-f650-4173-a606-4785bf7db348	bd21308d-0b4d-4ebd-94bb-edd71b06d5ac	17322c3a-8323-4ea9-b093-ab69d2df6bfe	8600de43-040c-4d45-8bb1-cd263b46747e	1229	0	-1229	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
8fc76c86-2864-4c2a-a8f0-c8291b0210f2	bd21308d-0b4d-4ebd-94bb-edd71b06d5ac	4119856f-81f8-4193-9162-c6583590e935	e260efd1-591d-490a-a30b-96157cda9630	399	0	-399	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a7bae2be-7c85-4a96-b4b6-f8b9877e21d2	bd21308d-0b4d-4ebd-94bb-edd71b06d5ac	e9733e4c-1c2d-499f-a747-7dffe3772488	f0487fc4-7121-44e5-93c1-13774015314a	719	0	-719	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00
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
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, batch_number, medicine_id, expiry_date, purchase_price, selling_price, initial_quantity, quantity_remaining, is_locked, is_quarantined, supplier_id, notes, branch_id, organization_id, created_at, deleted_at) FROM stdin;
3417c80a-bbcd-4db8-965e-183f64fed44d	BN-2003-ER	63d8e81b-16f5-429e-ab69-cb5ac2191c29	2030-10-22	12.00	14.00	200	199	f	f	\N	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 09:24:02.214113-07	\N
44ce660c-60eb-47bb-a1b0-3259eda9f73d	BN-ghep=riei	e9733e4c-1c2d-499f-a747-7dffe3772488	2029-05-23	12.00	16.00	600	0	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 03:50:52.235589-07	2026-04-05 05:14:06.943316-07
8600de43-040c-4d45-8bb1-cd263b46747e	BN-2026-ll2	17322c3a-8323-4ea9-b093-ab69d2df6bfe	2030-10-05	12.00	16.00	1230	1229	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:14:46.688005-07	\N
4460c7e6-5422-4ca2-a62c-8bd1b7cfb131	BN-DIG-2026-LL6	1675b37c-47a1-425e-bd91-63cc8e3af786	2030-10-31	8.00	10.00	800	798	f	f	\N	\N	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:22:43.743279-07	\N
3915643c-9142-497a-88b3-d6edc4b21807	BN-DIA-2026-LL8	e6389e15-50eb-44c2-87f5-4f041f668709	2030-06-30	11.00	14.50	700	694	f	f	\N	\N	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:23:28.827917-07	\N
56204713-c662-46f6-bc6d-5266b5dfff72	BN-BUP-2026-LE2	8d291731-451a-4b6c-aee7-b718e4777196	2029-11-30	8.00	10.00	890	887	f	f	\N	\N	\N	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b	2026-03-31 11:36:23.138579-07	\N
0704b8ba-9d3a-4d4f-802b-e56082e72597	BN-CIP-2026-LL$	26347fc6-bff1-4ab2-816d-7189d451d6d1	2028-06-30	10.00	13.00	1300	1296	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 03:00:59.2533-07	2026-04-01 01:08:20.039873-07
83ef3e8b-9240-426b-bc86-2c3b5c084f9d	BN-CET-2026-LL5	ad25d0ae-f7f3-4119-9aea-5c216460aa53	2030-10-31	9.00	13.00	900	898	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 03:01:39.036774-07	2026-04-01 01:08:21.799447-07
f0487fc4-7121-44e5-93c1-13774015314a	BN-2026-ll3	e9733e4c-1c2d-499f-a747-7dffe3772488	2033-10-05	9.00	14.00	720	719	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:15:19.531301-07	\N
35edf1d6-ee7d-447e-8cf2-372e49290d18	BN_2026_NEW	81ea01b0-c189-4107-8885-69cbd12eaffd	2034-10-05	24.00	34.00	2450	2446	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:03:07.732769-07	\N
8de1fee1-0ddd-4cfe-bb39-edc8227f11a0	BN-AML-2026-LL2	80fee193-333c-4dd1-b399-bcadbe0710eb	2029-10-31	8.00	10.00	1000	998	f	f	\N	\N	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:42:58.869683-07	\N
bb9f8450-3f7b-405b-9190-50e32c6645d7	BN-AZI-2026-LL3	b4a262ae-1b4b-4cdb-804c-f4b70f9dea47	2027-11-30	9.00	12.00	1200	1187	f	f	\N	\N	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:43:58.491877-07	\N
f61596a6-df22-4555-b928-4ec9a2bab0f9	BN-NEW	17322c3a-8323-4ea9-b093-ab69d2df6bfe	2030-10-31	0.00	10.00	50	50	f	f	43ba81a5-6f63-4532-8c8e-33295d55060d	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:14:04.734853-07	\N
a89ad017-b37b-42b2-ad9c-841de188ca2f	BN-2026-new	81ea01b0-c189-4107-8885-69cbd12eaffd	2034-05-05	14.00	21.00	33	33	f	f	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:18:49.037269-07	\N
5bf72517-92d9-4b1c-96a7-1344f1e8f137	bn-tyu-kjn	81ea01b0-c189-4107-8885-69cbd12eaffd	2033-05-05	8.00	12.00	300	300	f	f	506ce147-b96a-4b5e-bb7c-db4cecd62b8a	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:22:16.60926-07	\N
0db1653d-947f-4f52-b259-d236158c1caf	BN-BN	81ea01b0-c189-4107-8885-69cbd12eaffd	2030-12-05	6.00	9.00	121	120	f	f	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:13:23.933971-07	\N
a9f7cfdc-9438-432d-9722-95595e888a92	BN-LLR#4D	17322c3a-8323-4ea9-b093-ab69d2df6bfe	2035-10-12	43.00	50.00	435	0	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 03:50:14.378204-07	2026-04-05 05:13:52.978052-07
08de2b53-b269-45dc-9bb1-682a8839d3f4	BN-PUR-NEW	17322c3a-8323-4ea9-b093-ab69d2df6bfe	2033-11-05	9.00	14.40	290	0	f	f	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 04:12:26.905101-07	2026-04-05 05:13:56.585359-07
18410b59-9288-47b2-803d-52270aefe167	BN-PUR-OLD	17322c3a-8323-4ea9-b093-ab69d2df6bfe	2033-11-05	9.00	14.40	10	0	f	f	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 04:14:14.529423-07	2026-04-05 05:13:59.057701-07
faad34b2-15fe-49d8-8b3d-35b0b4fb4f21	BN-New	17322c3a-8323-4ea9-b093-ab69d2df6bfe	2028-10-23	10.00	15.00	200	0	f	f	43ba81a5-6f63-4532-8c8e-33295d55060d	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 04:26:32.508529-07	2026-04-05 05:14:01.407081-07
e260efd1-591d-490a-a30b-96157cda9630	BN-009-20290	4119856f-81f8-4193-9162-c6583590e935	2026-07-29	3.00	8.00	280	290	f	f	\N	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:13:11.845813-07	\N
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
adb80bc4-ffdf-4ff6-b3f2-deaf3b50c022	438408bb-1ed8-4b63-a5be-471f7611ab1e	\N	26.00	CHEQUE	tetruwuu788384738 uuuiuii	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:40:21.34663	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1164247e-fc7d-4ae7-b2c8-59788851684d	b34dba65-543b-40ec-89ab-0af1d0508101	\N	202.00	CASH		46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:40:30.604439	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: credit_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_records (id, customer_id, sale_id, original_amount, paid_amount, due_date, status, notes, created_at, organization_id) FROM stdin;
7e3e75b5-0f25-4fe8-82bd-9e11d06ca186	3fa28543-f38f-481a-8f4d-6f81df3aed2d	10c7304d-9208-44ed-9124-40a9216d2fd2	49.00	0.00	2026-04-30	UNPAID	Credit sale automatically logged from POS	2026-03-31 03:25:08.781591	70cd42a3-f2d6-46fe-99db-a97bfb08c020
11f525ab-d347-4414-b844-f6289723fc4a	563e65ce-3edf-4c51-ad57-e156424bfb8d	dc97486e-fb9a-480a-af09-1654a9b828bc	84.00	0.00	2026-05-05	UNPAID	Credit sale automatically logged from POS	2026-04-05 05:04:52.999313	37448208-174d-473e-a2eb-a031a33e298e
ee302d40-47e9-4471-aca4-1dca32f4347e	438408bb-1ed8-4b63-a5be-471f7611ab1e	1b92f600-79c4-4d98-94d9-91716a4d1e7b	26.00	26.00	2026-04-30	PAID	Credit sale automatically logged from POS	2026-03-31 03:07:01.172232	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a6619a29-3571-462d-9ac9-e27d57e1739a	b34dba65-543b-40ec-89ab-0af1d0508101	e16af5c8-7cc5-4d38-9fd2-bc0fbd53c401	66.00	66.00	2026-05-05	PAID	Credit sale automatically logged from POS	2026-04-05 03:51:20.237387	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ab70dc34-6d32-42f2-a61b-2a06e0e1643a	b34dba65-543b-40ec-89ab-0af1d0508101	e40ea462-60eb-43dc-b34f-570d6f4c73ae	136.00	136.00	2026-05-05	PAID	Credit sale automatically logged from POS	2026-04-05 06:03:27.042961	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, address, total_credit, is_active, created_at, updated_at, organization_id) FROM stdin;
3fa28543-f38f-481a-8f4d-6f81df3aed2d	Desalegn Kebede	0912345676	Bole Arabsa	49.00	t	2026-03-31 03:25:08.781591	2026-03-31 03:25:08.781591	70cd42a3-f2d6-46fe-99db-a97bfb08c020
563e65ce-3edf-4c51-ad57-e156424bfb8d	Asmare dinku	098765433		84.00	t	2026-04-05 05:04:52.999313	2026-04-05 05:04:52.999313	37448208-174d-473e-a2eb-a031a33e298e
438408bb-1ed8-4b63-a5be-471f7611ab1e	Chala Dekika	0912345679	Mexico	0.00	t	2026-03-31 03:07:01.172232	2026-04-05 06:40:21.34663	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b34dba65-543b-40ec-89ab-0af1d0508101	Chalachew Kebede	0912345678	Lideta	0.00	t	2026-04-05 03:51:20.237387	2026-04-05 06:40:30.604439	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, name, category, amount, frequency, description, expense_date, receipt_reference, is_recurring, created_by, branch_id, created_at, organization_id) FROM stdin;
33e355aa-b5b2-4930-817f-384b4c5bc5d6	Rent for House	RENT	15000.00	MONTHLY		2026-04-05		t	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	2026-04-05 03:52:13.690512	cfc876dd-c6e3-4283-b705-0cd86ac95e00
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
1fe8f235-017a-4c4b-922e-b028f65327cb	GRN-20260405-SGY2	b2470dce-9586-46b5-8f01-177c76458db7	46282536-d3c2-4d26-9a61-afd2de2c3534	Received via Dashboard	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 04:12:26.905101
93ae6d3b-50d2-4918-bf95-9884cee2f668	GRN-20260405-MI2P	b2470dce-9586-46b5-8f01-177c76458db7	46282536-d3c2-4d26-9a61-afd2de2c3534	Received via Dashboard	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 04:14:14.529423
3fe264dd-148f-4a91-a084-43f4460d50d2	GRN-20260405-X5XL	b2470dce-9586-46b5-8f01-177c76458db7	46282536-d3c2-4d26-9a61-afd2de2c3534	Received via Dashboard	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 04:14:22.336996
767e44d6-48a7-4f2d-bf5d-2d721a0e01d6	GRN-20260405-ZCK8	b87764fc-72e6-4d9b-9037-0f04cc7da3b5	46282536-d3c2-4d26-9a61-afd2de2c3534	Received via Dashboard	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 04:26:32.508529
0d17c59c-ae3b-40ac-9688-b9939188261d	GRN-20260405-TYVB	b87764fc-72e6-4d9b-9037-0f04cc7da3b5	46282536-d3c2-4d26-9a61-afd2de2c3534	Received via Dashboard	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:22:49.038364
8268af6f-584b-4447-ac80-6a5181b62d72	GRN-20260405-P8GT	98631b40-b933-4bbf-86b5-b1bbceec5a75	46282536-d3c2-4d26-9a61-afd2de2c3534	Received via Dashboard	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:13:23.933971
aca7a93f-07f8-4d80-877c-99345c365101	GRN-20260405-33QZ	41c7c9ea-9d9d-4bab-89cb-f7522a443a0e	46282536-d3c2-4d26-9a61-afd2de2c3534	Received via Dashboard	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:14:04.734853
9dbde227-173b-4099-8623-e0f7a0454923	GRN-20260405-TAX7	735100b1-7f13-4791-941e-5fb8040365c4	46282536-d3c2-4d26-9a61-afd2de2c3534	Received via Dashboard	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:18:49.037269
c2e09214-74de-4314-86bf-9c9506f07068	GRN-20260405-C5J5	b0b345ad-5651-48c9-8d8a-749e0eb8df5a	46282536-d3c2-4d26-9a61-afd2de2c3534	Received via Dashboard	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:22:16.60926
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, name, generic_name, category, unit, is_controlled, barcode, sku, supplier_barcode, preferred_supplier_id, minimum_stock_level, is_active, branch_id, organization_id, created_at, updated_at, deleted_at) FROM stdin;
63d8e81b-16f5-429e-ab69-cb5ac2191c29	Amoxicilin	Amoxicilin 500 mg	Antibotics	TAB	f	\N	\N	\N	\N	14	t	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 09:22:35.033995-07	2026-03-26 09:23:22.820811-07	\N
80fee193-333c-4dd1-b399-bcadbe0710eb	Amlodipine 5 mg	Amlodipine Besylate	Antihypertensives	Tablet	f	\N	\N	\N	\N	10	t	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:38:41.710561-07	2026-03-31 00:38:41.710561-07	\N
afcc56ec-103a-4e60-8c18-437c01c83928	Amoxiciliin 500 mg	Amoxiciliin	Antibiotics	Capsule	f	\N	\N	\N	\N	50	t	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:39:58.611772-07	2026-03-31 00:39:58.611772-07	\N
b4a262ae-1b4b-4cdb-804c-f4b70f9dea47	Azithromycin 250mg	Azithromycin	Antibiotics	Tablet	f	\N	\N	\N	\N	30	t	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:40:52.628319-07	2026-03-31 00:40:52.628319-07	\N
4d23dc1b-f4ff-4d2d-b388-076335774421	Doxycycline 100mg	Doxycycline Hyclate	Painkiller	Capsule	f	\N	\N	\N	\N	30	t	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:19:13.502122-07	2026-03-31 03:19:13.502122-07	\N
e6389e15-50eb-44c2-87f5-4f041f668709	Diazepam Injection 10mg	Diazepam	Anxiolytics	Ampoule	f	\N	\N	\N	\N	25	t	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:20:07.704514-07	2026-03-31 03:20:07.704514-07	\N
1675b37c-47a1-425e-bd91-63cc8e3af786	Digoxin 0.25mg	Digoxin	Cardiac Glycosides	Tablet	f	\N	\N	\N	\N	30	t	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:21:36.914587-07	2026-03-31 03:21:36.914587-07	\N
8d291731-451a-4b6c-aee7-b718e4777196	buprofen 400mg	buprofen	Painkiller	Talet	f	\N	\N	\N	\N	10	t	\N	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b	2026-03-31 11:35:47.253789-07	2026-03-31 11:35:47.253789-07	\N
26347fc6-bff1-4ab2-816d-7189d451d6d1	Ciprofloxacin 500mg	Ciprofloxacin	Antibiotics	Tablet	f	\N	\N	\N	\N	40	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 02:57:05.802903-07	2026-04-01 01:08:11.165338-07	2026-04-01 01:08:11.165338-07
8359d054-8533-4c0f-ab20-58a0a5ba08a8	Ceftriaxone 1g	Ceftriaxone Sodium	Antiboitics	Tablet	f	\N	\N	\N	\N	30	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 03:00:22.779902-07	2026-04-01 01:08:12.863962-07	2026-04-01 01:08:12.863962-07
ad25d0ae-f7f3-4119-9aea-5c216460aa53	Cetirizine 10mg	Cetirizine HCL	Antihistamines	Tablet	f	\N	\N	\N	\N	60	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 02:58:02.667146-07	2026-04-01 01:08:15.754614-07	2026-04-01 01:08:15.754614-07
17322c3a-8323-4ea9-b093-ab69d2df6bfe	Chemicals 	chemicals	Pain Killer	TAB	f	\N	\N	\N	\N	43	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 03:49:32.975753-07	2026-04-05 03:49:32.975753-07	\N
4119856f-81f8-4193-9162-c6583590e935	carteee	catt	killer	TAB	f	\N	\N	\N	\N	10	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:12:46.544478-07	2026-04-05 05:12:46.544478-07	\N
e9733e4c-1c2d-499f-a747-7dffe3772488	chesmo	chesmo	Antibiotics	TAB	f	\N	\N	\N	\N	10	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 03:44:53.305114-07	2026-04-05 05:15:31.178555-07	\N
81ea01b0-c189-4107-8885-69cbd12eaffd	Chemistry 400mg	chemistry of life	Antiboitics	Capsule	f	\N	\N	\N	\N	34	t	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:02:20.341704-07	2026-04-05 06:02:20.341704-07	\N
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
3eb149dc-3f9a-437b-96ea-b05bcd5d18ec	\N	New Sale Completed	A sale of $150.00 has been processed (Receipt: RCPT-20260405-JFHO)	SALE	t	2026-04-05 03:51:10.473906	cfc876dd-c6e3-4283-b705-0cd86ac95e00
524294a0-da80-447e-aff2-a7e705c6226e	\N	New Sale Completed	A sale of $66.00 has been processed (Receipt: RCPT-20260405-M7KG)	SALE	t	2026-04-05 03:51:21.218673	cfc876dd-c6e3-4283-b705-0cd86ac95e00
da3921c9-c3f3-40c7-884a-3dc60bc056f9	\N	New Sale Completed	A sale of $38.00 has been processed (Receipt: RCPT-20260405-V5NU)	SALE	t	2026-04-05 05:15:40.865518	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a3bb04c3-85e7-4044-9c4d-0530d7873801	\N	New Sale Completed	A sale of $48.00 has been processed (Receipt: RCPT-20260405-L15Y)	SALE	t	2026-04-05 05:54:42.805789	cfc876dd-c6e3-4283-b705-0cd86ac95e00
71229957-ff2b-476a-acb1-74a4d2c8dec7	\N	New Sale Completed	A sale of $24.00 has been processed (Receipt: RCPT-20260405-SAXQ)	SALE	t	2026-04-05 05:54:47.468486	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5dba0614-4b8d-4e14-8aad-61f74f797035	\N	New Sale Completed	A sale of $136.00 has been processed (Receipt: RCPT-20260405-4XA4)	SALE	t	2026-04-05 06:03:27.467802	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3ebcde39-b293-49f5-a5c6-d23ff1cceecd	\N	New Sale Completed	A sale of $34.00 has been processed (Receipt: RCPT-20260405-YPLQ)	SALE	t	2026-04-05 06:23:18.280691	cfc876dd-c6e3-4283-b705-0cd86ac95e00
70c4e968-7752-41c1-b511-0db29b6f814e	46282536-d3c2-4d26-9a61-afd2de2c3534	Test Notification	This is a test notification to verify the system is working!	INFO	t	2026-04-05 06:23:37.108473	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f6853f27-f8e0-46ff-b936-8de7887d04b8	46282536-d3c2-4d26-9a61-afd2de2c3534	Test Notification	This is a test notification to verify the system is working!	INFO	f	2026-04-05 06:23:39.907204	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ffa0003d-169f-4b20-98f7-6a6b30eccfcd	\N	New Sale Completed	A sale of $2024.00 has been processed (Receipt: RCPT-20260405-PI72)	SALE	f	2026-04-05 06:26:47.669594	cfc876dd-c6e3-4283-b705-0cd86ac95e00
28387a2e-d76c-4187-af89-61a60bbf525d	\N	New Sale Completed	A sale of $800.00 has been processed (Receipt: RCPT-20260405-A498)	SALE	f	2026-04-05 06:27:12.729429	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, subscription_plan, is_active, created_at, updated_at, address, phone, email, contact_person, license_number, city, subscription_status, subscription_expiry_date, subscription_plan_name, feature_overrides) FROM stdin;
1129d8da-c6a7-48fc-865a-7ab5095dc398	tereawewa	BASIC	f	2026-03-25 15:26:27.141748	2026-04-05 04:33:13.643204	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N
b9034243-010c-496b-b5d4-90947a3b3974	Legehar Pharmacy	BASIC	f	2026-03-26 03:42:42.659531	2026-04-05 04:33:16.692102	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N
70cd42a3-f2d6-46fe-99db-a97bfb08c020	Tikur Anbesa	BASIC	t	2026-03-26 03:42:51.300241	2026-04-05 04:33:53.709832	\N	\N	\N	\N	\N	\N	ACTIVE	2026-05-04 13:44:05.509	Permium	\N
82d0d253-897a-4edf-8749-bb03798004db	New Pharmacy	BASIC	t	2026-04-01 01:25:44.814	2026-04-05 04:33:56.603497	Mexico-Ras Abebe Aregay Street, Addis Ababa, Ethiopia	0987346523	contact@newPahrmacy.com	Bereketq	MOH-122321	Addis Ababa	ACTIVE	2026-04-15 13:25:35.213	Basic	\N
00000000-0000-0000-0000-000000000000	Legacy Default Organization	SILVER	t	2026-03-25 14:45:39.303842	2026-04-05 04:33:57.72876	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N
fda0c216-b48c-4a42-8670-52966096499f	Tiruwerk Pharmacy	BASIC	f	2026-03-26 03:43:42.892625	2026-03-26 22:35:55.553762	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N
37448208-174d-473e-a2eb-a031a33e298e	Health First	BASIC	t	2026-03-30 03:12:30.741684	2026-04-05 04:34:01.778881	\N	\N	\N	\N	\N	\N	TRIAL	\N	\N	\N
cfc876dd-c6e3-4283-b705-0cd86ac95e00	Abinet Pharmacy	BASIC	t	2026-03-26 03:42:00.082377	2026-04-05 07:50:33.045301	\N	\N	\N	\N	\N	\N	ACTIVE	2026-05-05 17:50:32.889	Basic	\N
145c68ec-9ad5-46f6-9d20-9a5f6294ae7b	Health Second	BASIC	f	2026-03-31 11:32:39.454	2026-04-01 01:11:04.734512	Lideta Sub-City, Ras Aregay St,	+251960945350	contact@healthsecond.gmail.com	Yosief Dagnachew	\N	Addis Ababa	SUSPENDED	2026-05-01 21:33:09.892	BASIC	\N
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
4195dffa-3222-4eb9-a8a2-a7d6d6ff3244	81ea01b0-c189-4107-8885-69cbd12eaffd	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	6.00	2026-04-05 06:13:24.083632	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3c454454-106f-4563-aad0-86e1ad97d99a	17322c3a-8323-4ea9-b093-ab69d2df6bfe	43ba81a5-6f63-4532-8c8e-33295d55060d	0.00	2026-04-05 06:14:04.853094	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a65fdbe3-d75e-45ec-9bfd-0a6233fea903	81ea01b0-c189-4107-8885-69cbd12eaffd	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	14.00	2026-04-05 06:18:49.148916	cfc876dd-c6e3-4283-b705-0cd86ac95e00
60834e8e-073f-44a5-82ce-2e29db12f86e	81ea01b0-c189-4107-8885-69cbd12eaffd	506ce147-b96a-4b5e-bb7c-db4cecd62b8a	8.00	2026-04-05 06:22:16.723587	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, medicine_id, quantity_ordered, quantity_received, unit_price, subtotal, organization_id, created_at) FROM stdin;
eacc270c-93cb-4370-a607-50c86c7a4a65	b2470dce-9586-46b5-8f01-177c76458db7	17322c3a-8323-4ea9-b093-ab69d2df6bfe	300	300	9.00	2700.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 04:10:09.259086
dec55196-4654-444d-b73c-f774b8658620	b87764fc-72e6-4d9b-9037-0f04cc7da3b5	17322c3a-8323-4ea9-b093-ab69d2df6bfe	200	200	10.00	2000.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 04:25:50.324033
de6c3060-0ecd-4dfc-8d36-a37c7519bb57	98631b40-b933-4bbf-86b5-b1bbceec5a75	81ea01b0-c189-4107-8885-69cbd12eaffd	121	121	6.00	726.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:11:43.815224
6f407bcc-4e36-4675-bc27-8429cc50965b	41c7c9ea-9d9d-4bab-89cb-f7522a443a0e	17322c3a-8323-4ea9-b093-ab69d2df6bfe	50	50	0.00	0.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:12:12.513375
8e9d55e7-7424-4a2d-8fb9-5dd4cbf1c808	735100b1-7f13-4791-941e-5fb8040365c4	81ea01b0-c189-4107-8885-69cbd12eaffd	33	33	14.00	462.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:18:07.319402
46406501-ff0e-41aa-98e5-7690b7a8decf	b0b345ad-5651-48c9-8d8a-749e0eb8df5a	81ea01b0-c189-4107-8885-69cbd12eaffd	300	300	8.00	2400.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:21:30.937054
b1291dc4-adb7-4230-a3df-c97f9d9f25b4	42ab5440-cdac-44cb-917b-54d53629496a	4119856f-81f8-4193-9162-c6583590e935	10	0	6.00	60.00	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:27:36.294316
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, po_number, supplier_id, status, total_amount, notes, payment_method, payment_status, total_paid, branch_id, organization_id, created_by, approved_by, expected_delivery, cheque_bank_name, cheque_number, cheque_issue_date, cheque_due_date, cheque_amount, created_at, updated_at) FROM stdin;
b2470dce-9586-46b5-8f01-177c76458db7	PO-202604-0001	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	COMPLETED	2700.00		CREDIT	PAID	2700.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	\N	\N	\N	\N	2026-04-05 04:10:09.259086	2026-04-05 04:17:01.519493
b87764fc-72e6-4d9b-9037-0f04cc7da3b5	PO-202604-0002	43ba81a5-6f63-4532-8c8e-33295d55060d	COMPLETED	2000.00		CASH	PAID	2000.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	\N	\N	\N	\N	2026-04-05 04:25:50.324033	2026-04-05 04:26:32.508529
98631b40-b933-4bbf-86b5-b1bbceec5a75	PO-202604-0003	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	COMPLETED	726.00		CREDIT	PAID	726.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	\N	\N	\N	\N	2026-04-05 06:11:43.815224	2026-04-05 06:13:23.933971
41c7c9ea-9d9d-4bab-89cb-f7522a443a0e	PO-202604-0004	43ba81a5-6f63-4532-8c8e-33295d55060d	COMPLETED	0.00		CASH	PAID	5900.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	\N	\N	\N	\N	2026-04-05 06:12:12.513375	2026-04-05 06:14:17.823155
735100b1-7f13-4791-941e-5fb8040365c4	PO-202604-0005	7ef164e7-09e3-4a3a-96d9-dfbed63bd042	COMPLETED	462.00		CHEQUE	PAID	462.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	CBE	TXN#896520915629	2026-04-05	2026-04-09	\N	2026-04-05 06:18:07.319402	2026-04-05 06:19:00.053801
b0b345ad-5651-48c9-8d8a-749e0eb8df5a	PO-202604-0006	506ce147-b96a-4b5e-bb7c-db4cecd62b8a	COMPLETED	2400.00		CREDIT	PENDING	0.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	\N	\N	\N	\N	2026-04-05 06:21:30.937054	2026-04-05 06:22:16.60926
42ab5440-cdac-44cb-917b-54d53629496a	PO-202604-0007	506ce147-b96a-4b5e-bb7c-db4cecd62b8a	DRAFT	60.00		CASH	PENDING	0.00	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	46282536-d3c2-4d26-9a61-afd2de2c3534	\N	\N	\N	\N	\N	\N	\N	2026-04-05 06:27:36.294316	2026-04-05 06:27:36.294316
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
b1f7f67b-a626-4b41-b488-fb9974e1488a	39e2993e-a54c-48ab-bde3-4b73c86dcd84	4119856f-81f8-4193-9162-c6583590e935	253	2024.00		46282536-d3c2-4d26-9a61-afd2de2c3534	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:41:46.626552
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, medicine_id, batch_id, quantity, unit_price, subtotal, is_refunded, organization_id, created_at) FROM stdin;
99869e5f-5663-4c04-8c81-d68c6998b3b2	be0287a2-c691-405f-8a7f-05d1c37c5c00	63d8e81b-16f5-429e-ab69-cb5ac2191c29	3417c80a-bbcd-4db8-965e-183f64fed44d	1	14.00	14.00	f	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 09:24:42.647742-07
31427911-952a-40b2-8346-bbb430ce3fd4	bf4e9fa1-8940-4aad-b05d-f1bbd9202c71	b4a262ae-1b4b-4cdb-804c-f4b70f9dea47	bb9f8450-3f7b-405b-9190-50e32c6645d7	3	12.00	36.00	f	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:44:48.665689-07
44a6c1b7-f0de-41e5-9a78-bea7cd06a09e	6df304fc-847d-4a19-bc29-efafb8faf61b	26347fc6-bff1-4ab2-816d-7189d451d6d1	0704b8ba-9d3a-4d4f-802b-e56082e72597	4	13.00	52.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 03:06:04.23238-07
a5c115b8-4187-4528-b18d-f6d835858bb6	1b92f600-79c4-4d98-94d9-91716a4d1e7b	ad25d0ae-f7f3-4119-9aea-5c216460aa53	83ef3e8b-9240-426b-bc86-2c3b5c084f9d	2	13.00	26.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 03:07:01.172232-07
a1ead58e-2759-4994-8f4e-1e1d9d974e07	9477e52e-9e80-4100-b617-9f77d081c059	e6389e15-50eb-44c2-87f5-4f041f668709	3915643c-9142-497a-88b3-d6edc4b21807	3	14.50	43.50	f	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:24:13.20656-07
3ed75f2b-cb55-4cad-9032-13d0729bda54	10c7304d-9208-44ed-9124-40a9216d2fd2	1675b37c-47a1-425e-bd91-63cc8e3af786	4460c7e6-5422-4ca2-a62c-8bd1b7cfb131	2	10.00	20.00	f	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:25:08.781591-07
d1dbfd56-07c5-44db-8afa-c6c12b27a493	10c7304d-9208-44ed-9124-40a9216d2fd2	e6389e15-50eb-44c2-87f5-4f041f668709	3915643c-9142-497a-88b3-d6edc4b21807	2	14.50	29.00	f	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:25:08.781591-07
c481d449-fdb1-49e0-8c99-0d2c06902ef2	522d26ab-f925-4b09-92a4-14c2ad6ca51d	e6389e15-50eb-44c2-87f5-4f041f668709	3915643c-9142-497a-88b3-d6edc4b21807	1	14.50	14.50	f	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 09:23:29.505221-07
467fab8e-92fc-435c-8c58-01d20c735dfb	76b9994b-aab0-44a4-8596-6a642d8d3c78	8d291731-451a-4b6c-aee7-b718e4777196	56204713-c662-46f6-bc6d-5266b5dfff72	3	10.00	30.00	f	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b	2026-03-31 11:37:18.808172-07
5937f361-8648-4ebf-9472-713cda03ca91	ec7c2917-11db-4912-b126-d82273bb1f9c	17322c3a-8323-4ea9-b093-ab69d2df6bfe	a9f7cfdc-9438-432d-9722-95595e888a92	3	50.00	150.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 03:51:09.680521-07
b37ad42c-460f-4a67-a928-f81a1961b7fd	e16af5c8-7cc5-4d38-9fd2-bc0fbd53c401	e9733e4c-1c2d-499f-a747-7dffe3772488	44ce660c-60eb-47bb-a1b0-3259eda9f73d	1	16.00	16.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 03:51:20.237387-07
39c86ed3-e1c0-4a2b-8655-7e7aa6787b83	e16af5c8-7cc5-4d38-9fd2-bc0fbd53c401	17322c3a-8323-4ea9-b093-ab69d2df6bfe	a9f7cfdc-9438-432d-9722-95595e888a92	1	50.00	50.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 03:51:20.237387-07
b6d44108-daf0-49b3-8c2e-326e909c4061	307736bc-783d-4983-b71e-e9f4bd5fe516	80fee193-333c-4dd1-b399-bcadbe0710eb	8de1fee1-0ddd-4cfe-bb39-edc8227f11a0	2	10.00	20.00	f	37448208-174d-473e-a2eb-a031a33e298e	2026-04-05 05:04:38.623952-07
fea0d954-375d-4953-9cf3-3d11f82d7635	307736bc-783d-4983-b71e-e9f4bd5fe516	b4a262ae-1b4b-4cdb-804c-f4b70f9dea47	bb9f8450-3f7b-405b-9190-50e32c6645d7	3	12.00	36.00	f	37448208-174d-473e-a2eb-a031a33e298e	2026-04-05 05:04:38.623952-07
d236610a-64e0-4cff-b126-987004315b37	dc97486e-fb9a-480a-af09-1654a9b828bc	b4a262ae-1b4b-4cdb-804c-f4b70f9dea47	bb9f8450-3f7b-405b-9190-50e32c6645d7	7	12.00	84.00	f	37448208-174d-473e-a2eb-a031a33e298e	2026-04-05 05:04:52.999313-07
9808e17e-7a85-4f32-8618-fdf23ba4b3b7	6f723d89-eade-4a45-8042-aceb275b54d0	17322c3a-8323-4ea9-b093-ab69d2df6bfe	8600de43-040c-4d45-8bb1-cd263b46747e	1	16.00	16.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:15:40.102096-07
bc6ae35e-be66-4b32-bee6-4d36733943bc	6f723d89-eade-4a45-8042-aceb275b54d0	4119856f-81f8-4193-9162-c6583590e935	e260efd1-591d-490a-a30b-96157cda9630	1	8.00	8.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:15:40.102096-07
3e4c2e63-daed-411c-a846-fa8231f88f10	6f723d89-eade-4a45-8042-aceb275b54d0	e9733e4c-1c2d-499f-a747-7dffe3772488	f0487fc4-7121-44e5-93c1-13774015314a	1	14.00	14.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:15:40.102096-07
7f3a6af4-9ff6-45bd-b394-a1f165c2f856	397696d8-fc94-4268-8569-48a1bd5bad5c	4119856f-81f8-4193-9162-c6583590e935	e260efd1-591d-490a-a30b-96157cda9630	6	8.00	48.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:54:42.527994-07
18e7c1c2-0f4d-4bc3-ac21-f3273a0a46d7	76942773-43f5-4d5e-a5be-742c91377fe2	4119856f-81f8-4193-9162-c6583590e935	e260efd1-591d-490a-a30b-96157cda9630	3	8.00	24.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:54:47.205693-07
cf4dec13-4ade-4846-8f01-d2d054817b97	e40ea462-60eb-43dc-b34f-570d6f4c73ae	81ea01b0-c189-4107-8885-69cbd12eaffd	35edf1d6-ee7d-447e-8cf2-372e49290d18	4	34.00	136.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:03:27.042961-07
6ccb759e-2a15-413f-a178-5003e5def5a6	208fdafa-1e76-464f-8b4c-caf0d59e767c	81ea01b0-c189-4107-8885-69cbd12eaffd	0db1653d-947f-4f52-b259-d236158c1caf	1	34.00	34.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:23:17.826478-07
a6cf2d4a-c332-489b-804f-ade207995ae0	52b6aed3-5405-426a-b2c8-3994e4159366	4119856f-81f8-4193-9162-c6583590e935	e260efd1-591d-490a-a30b-96157cda9630	100	8.00	800.00	f	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:27:12.475232-07
ec67b7a7-5bdf-4192-b136-f9937cfe51b4	39e2993e-a54c-48ab-bde3-4b73c86dcd84	4119856f-81f8-4193-9162-c6583590e935	e260efd1-591d-490a-a30b-96157cda9630	253	8.00	2024.00	t	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:26:47.412501-07
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, receipt_number, patient_id, prescription_id, total_amount, discount, payment_method, split_payments, created_by, is_refunded, refund_amount, prescription_image_url, is_controlled_transaction, branch_id, organization_id, created_at) FROM stdin;
be0287a2-c691-405f-8a7f-05d1c37c5c00	RCPT-20260326-5JCI	b087255d-c174-4e0f-8492-391befe6df1e	\N	14.00	0.00	CASH	\N	98b71fd9-9d98-4395-b114-cf28cfe62aab	f	0.00	\N	f	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 09:24:42.647742-07
bf4e9fa1-8940-4aad-b05d-f1bbd9202c71	RCPT-20260331-CM5K	23f628ea-4915-423c-b0f6-1c906efc9791	\N	36.00	0.00	CASH	\N	59e6bca9-0b11-495e-a482-69f6947081d8	f	0.00	\N	f	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:44:48.665689-07
6df304fc-847d-4a19-bc29-efafb8faf61b	RCPT-20260331-VV71	b34dba65-543b-40ec-89ab-0af1d0508101	\N	52.00	0.00	CASH	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 03:06:04.23238-07
1b92f600-79c4-4d98-94d9-91716a4d1e7b	RCPT-20260331-RR4Y	438408bb-1ed8-4b63-a5be-471f7611ab1e	\N	26.00	0.00	CREDIT	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 03:07:01.172232-07
9477e52e-9e80-4100-b617-9f77d081c059	RCPT-20260331-73H0	29f7159d-cdea-42b5-962a-9f269ebca524	\N	43.50	0.00	CASH	\N	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	f	0.00	\N	f	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:24:13.20656-07
10c7304d-9208-44ed-9124-40a9216d2fd2	RCPT-20260331-XWDV	3fa28543-f38f-481a-8f4d-6f81df3aed2d	\N	49.00	0.00	CREDIT	\N	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	f	0.00	\N	f	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 03:25:08.781591-07
522d26ab-f925-4b09-92a4-14c2ad6ca51d	RCPT-20260331-3U1Y	\N	\N	14.50	0.00	CASH	\N	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	f	0.00	\N	f	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 09:23:29.505221-07
76b9994b-aab0-44a4-8596-6a642d8d3c78	RCPT-20260331-6PUO	201de500-ce8e-445a-ba09-78c44ed98cca	\N	30.00	0.00	CASH	\N	4548bc76-62a3-464d-8f6f-d1aa02298954	f	0.00	\N	f	\N	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b	2026-03-31 11:37:18.808172-07
ec7c2917-11db-4912-b126-d82273bb1f9c	RCPT-20260405-JFHO	438408bb-1ed8-4b63-a5be-471f7611ab1e	\N	150.00	0.00	CASH	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 03:51:09.680521-07
e16af5c8-7cc5-4d38-9fd2-bc0fbd53c401	RCPT-20260405-M7KG	b34dba65-543b-40ec-89ab-0af1d0508101	\N	66.00	0.00	CREDIT	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 03:51:20.237387-07
307736bc-783d-4983-b71e-e9f4bd5fe516	RCPT-20260405-VSFF	563e65ce-3edf-4c51-ad57-e156424bfb8d	\N	56.00	0.00	CASH	\N	5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	f	0.00	\N	f	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-04-05 05:04:38.623952-07
dc97486e-fb9a-480a-af09-1654a9b828bc	RCPT-20260405-3KBN	563e65ce-3edf-4c51-ad57-e156424bfb8d	\N	84.00	0.00	CREDIT	\N	5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	f	0.00	\N	f	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-04-05 05:04:52.999313-07
6f723d89-eade-4a45-8042-aceb275b54d0	RCPT-20260405-V5NU	\N	\N	38.00	0.00	CASH	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:15:40.102096-07
397696d8-fc94-4268-8569-48a1bd5bad5c	RCPT-20260405-L15Y	\N	\N	48.00	0.00	CASH	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:54:42.527994-07
76942773-43f5-4d5e-a5be-742c91377fe2	RCPT-20260405-SAXQ	\N	\N	24.00	0.00	CASH	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 05:54:47.205693-07
e40ea462-60eb-43dc-b34f-570d6f4c73ae	RCPT-20260405-4XA4	b34dba65-543b-40ec-89ab-0af1d0508101	\N	136.00	0.00	CREDIT	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:03:27.042961-07
208fdafa-1e76-464f-8b4c-caf0d59e767c	RCPT-20260405-YPLQ	\N	\N	34.00	0.00	CASH	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:23:17.826478-07
52b6aed3-5405-426a-b2c8-3994e4159366	RCPT-20260405-A498	\N	\N	800.00	0.00	CASH	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	f	0.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:27:12.475232-07
39e2993e-a54c-48ab-bde3-4b73c86dcd84	RCPT-20260405-PI72	1bc787bc-83ee-453e-8f78-871e959b2607	\N	2024.00	0.00	CASH	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	t	2024.00	\N	f	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-05 06:26:47.412501-07
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transactions (id, batch_id, type, quantity, reference_type, reference_id, notes, is_fefo_override, override_reason, created_by, created_at, organization_id) FROM stdin;
f08ba400-affa-447d-a54c-12e8dfee40d0	3417c80a-bbcd-4db8-965e-183f64fed44d	OUT	1	SALE	be0287a2-c691-405f-8a7f-05d1c37c5c00	\N	f	\N	98b71fd9-9d98-4395-b114-cf28cfe62aab	2026-03-26 09:24:42.733536	fda0c216-b48c-4a42-8670-52966096499f
9319b382-473a-489d-878d-4cd08fc33a6c	bb9f8450-3f7b-405b-9190-50e32c6645d7	OUT	3	SALE	bf4e9fa1-8940-4aad-b05d-f1bbd9202c71	\N	f	\N	59e6bca9-0b11-495e-a482-69f6947081d8	2026-03-31 00:44:48.740147	37448208-174d-473e-a2eb-a031a33e298e
8d2864fd-9e2c-494d-8e43-715811290573	0704b8ba-9d3a-4d4f-802b-e56082e72597	OUT	4	SALE	6df304fc-847d-4a19-bc29-efafb8faf61b	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-03-31 03:06:04.38802	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ed96ba6d-04d9-4394-8c67-36e4c98879bd	83ef3e8b-9240-426b-bc86-2c3b5c084f9d	OUT	2	SALE	1b92f600-79c4-4d98-94d9-91716a4d1e7b	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-03-31 03:07:01.444875	cfc876dd-c6e3-4283-b705-0cd86ac95e00
afa335f4-caff-480e-841f-1baf7c9d67c1	3915643c-9142-497a-88b3-d6edc4b21807	OUT	3	SALE	9477e52e-9e80-4100-b617-9f77d081c059	\N	f	\N	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	2026-03-31 03:24:13.305792	70cd42a3-f2d6-46fe-99db-a97bfb08c020
567dae90-0d89-42d9-a9fd-d36649312c81	4460c7e6-5422-4ca2-a62c-8bd1b7cfb131	OUT	2	SALE	10c7304d-9208-44ed-9124-40a9216d2fd2	\N	f	\N	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	2026-03-31 03:25:09.207115	70cd42a3-f2d6-46fe-99db-a97bfb08c020
da75e71a-b2e1-483d-963c-e073bef5f65b	3915643c-9142-497a-88b3-d6edc4b21807	OUT	2	SALE	10c7304d-9208-44ed-9124-40a9216d2fd2	\N	f	\N	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	2026-03-31 03:25:09.973692	70cd42a3-f2d6-46fe-99db-a97bfb08c020
d56a7815-7ff4-40b1-b2fc-29e719b12287	3915643c-9142-497a-88b3-d6edc4b21807	OUT	1	SALE	522d26ab-f925-4b09-92a4-14c2ad6ca51d	\N	f	\N	c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	2026-03-31 09:23:29.612917	70cd42a3-f2d6-46fe-99db-a97bfb08c020
36bd911a-c0ae-48db-94b4-96b7d9795d3c	56204713-c662-46f6-bc6d-5266b5dfff72	OUT	3	SALE	76b9994b-aab0-44a4-8596-6a642d8d3c78	\N	f	\N	4548bc76-62a3-464d-8f6f-d1aa02298954	2026-03-31 11:37:18.865353	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b
a43c8ae9-3cb6-40ae-b020-1156e223344b	a9f7cfdc-9438-432d-9722-95595e888a92	OUT	3	SALE	ec7c2917-11db-4912-b126-d82273bb1f9c	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 03:51:10.079402	cfc876dd-c6e3-4283-b705-0cd86ac95e00
5249456c-509f-487d-9142-a8edffa6e9e7	44ce660c-60eb-47bb-a1b0-3259eda9f73d	OUT	1	SALE	e16af5c8-7cc5-4d38-9fd2-bc0fbd53c401	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 03:51:20.470926	cfc876dd-c6e3-4283-b705-0cd86ac95e00
a534fa17-ec3c-41c1-a01a-3c23d25c8d43	a9f7cfdc-9438-432d-9722-95595e888a92	OUT	1	SALE	e16af5c8-7cc5-4d38-9fd2-bc0fbd53c401	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 03:51:20.578003	cfc876dd-c6e3-4283-b705-0cd86ac95e00
814b520f-de2c-45f3-9d75-24258d7ff697	a9f7cfdc-9438-432d-9722-95595e888a92	ADJUSTMENT	1	ADJUSTMENT	22583d7a-c218-4743-b080-41882ce8c866	Inventory Audit Adjustment (V: -1, Session: 22583d7a-c218-4743-b080-41882ce8c866)	f	\N	\N	2026-04-05 03:57:22.691254	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c1f98061-45a7-4ed4-baec-8e602a26a402	08de2b53-b269-45dc-9bb1-682a8839d3f4	IN	290	PURCHASE	1fe8f235-017a-4c4b-922e-b028f65327cb	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 04:12:26.905101	cfc876dd-c6e3-4283-b705-0cd86ac95e00
9c85ee5a-8035-450a-beff-be1d8149394c	18410b59-9288-47b2-803d-52270aefe167	IN	10	PURCHASE	93ae6d3b-50d2-4918-bf95-9884cee2f668	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 04:14:14.529423	cfc876dd-c6e3-4283-b705-0cd86ac95e00
71bb3049-e26b-4ce7-8ff2-bdad82ea71a9	faad34b2-15fe-49d8-8b3d-35b0b4fb4f21	IN	200	PURCHASE	767e44d6-48a7-4f2d-bf5d-2d721a0e01d6	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 04:26:32.508529	cfc876dd-c6e3-4283-b705-0cd86ac95e00
55e21445-0813-4093-a479-536e35e34bc6	8de1fee1-0ddd-4cfe-bb39-edc8227f11a0	OUT	2	SALE	307736bc-783d-4983-b71e-e9f4bd5fe516	\N	f	\N	5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	2026-04-05 05:04:38.682209	37448208-174d-473e-a2eb-a031a33e298e
8fc6b534-4f31-40bc-a088-9fa3917e9da7	bb9f8450-3f7b-405b-9190-50e32c6645d7	OUT	3	SALE	307736bc-783d-4983-b71e-e9f4bd5fe516	\N	f	\N	5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	2026-04-05 05:04:38.780528	37448208-174d-473e-a2eb-a031a33e298e
d9ee4461-9bd4-4e5a-8c70-e40e4d491165	bb9f8450-3f7b-405b-9190-50e32c6645d7	OUT	7	SALE	dc97486e-fb9a-480a-af09-1654a9b828bc	\N	f	\N	5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	2026-04-05 05:04:53.32112	37448208-174d-473e-a2eb-a031a33e298e
b9a96da0-7162-4642-8845-0b1e9e18e2e7	44ce660c-60eb-47bb-a1b0-3259eda9f73d	ADJUSTMENT	9044	ADJUSTMENT	1b917d08-25f2-4eed-9308-2c5c21eefe46	Inventory Audit Adjustment (V: -9044, Session: 1b917d08-25f2-4eed-9308-2c5c21eefe46)	f	\N	\N	2026-04-05 05:10:06.255739	cfc876dd-c6e3-4283-b705-0cd86ac95e00
3cd7cdfc-60bf-4da5-bfe9-6326dbd36ddc	a9f7cfdc-9438-432d-9722-95595e888a92	ADJUSTMENT	430	ADJUSTMENT	1b917d08-25f2-4eed-9308-2c5c21eefe46	Inventory Audit Adjustment (V: -430, Session: 1b917d08-25f2-4eed-9308-2c5c21eefe46)	f	\N	\N	2026-04-05 05:10:06.255739	cfc876dd-c6e3-4283-b705-0cd86ac95e00
d27dfecd-3780-45e1-80f9-68f8ee3cb852	08de2b53-b269-45dc-9bb1-682a8839d3f4	ADJUSTMENT	290	ADJUSTMENT	1b917d08-25f2-4eed-9308-2c5c21eefe46	Inventory Audit Adjustment (V: -290, Session: 1b917d08-25f2-4eed-9308-2c5c21eefe46)	f	\N	\N	2026-04-05 05:10:06.255739	cfc876dd-c6e3-4283-b705-0cd86ac95e00
73b3e5a3-d947-45d7-bcbd-93b1731ec55f	18410b59-9288-47b2-803d-52270aefe167	ADJUSTMENT	10	ADJUSTMENT	1b917d08-25f2-4eed-9308-2c5c21eefe46	Inventory Audit Adjustment (V: -10, Session: 1b917d08-25f2-4eed-9308-2c5c21eefe46)	f	\N	\N	2026-04-05 05:10:06.255739	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b36a0f04-70fc-4937-813a-b8f1f89c65a2	faad34b2-15fe-49d8-8b3d-35b0b4fb4f21	ADJUSTMENT	200	ADJUSTMENT	1b917d08-25f2-4eed-9308-2c5c21eefe46	Inventory Audit Adjustment (V: -200, Session: 1b917d08-25f2-4eed-9308-2c5c21eefe46)	f	\N	\N	2026-04-05 05:10:06.255739	cfc876dd-c6e3-4283-b705-0cd86ac95e00
2e712a1d-a0c3-49e1-9aaa-7e6638d7300e	8600de43-040c-4d45-8bb1-cd263b46747e	OUT	1	SALE	6f723d89-eade-4a45-8042-aceb275b54d0	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 05:15:40.157442	cfc876dd-c6e3-4283-b705-0cd86ac95e00
add741e0-b0da-4b32-b4e9-b58e0dde6963	e260efd1-591d-490a-a30b-96157cda9630	OUT	1	SALE	6f723d89-eade-4a45-8042-aceb275b54d0	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 05:15:40.237475	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b5a876eb-24b6-495c-b62f-1638238acbed	f0487fc4-7121-44e5-93c1-13774015314a	OUT	1	SALE	6f723d89-eade-4a45-8042-aceb275b54d0	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 05:15:40.355152	cfc876dd-c6e3-4283-b705-0cd86ac95e00
c83d728a-92a0-48eb-ae5a-c13c14ac9688	e260efd1-591d-490a-a30b-96157cda9630	OUT	6	SALE	397696d8-fc94-4268-8569-48a1bd5bad5c	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 05:54:42.58575	cfc876dd-c6e3-4283-b705-0cd86ac95e00
22c41751-6f41-4b6a-ae63-d7cf44da7765	e260efd1-591d-490a-a30b-96157cda9630	OUT	3	SALE	76942773-43f5-4d5e-a5be-742c91377fe2	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 05:54:47.247411	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ed6ef047-221f-4eae-938d-e8613cc18447	35edf1d6-ee7d-447e-8cf2-372e49290d18	OUT	4	SALE	e40ea462-60eb-43dc-b34f-570d6f4c73ae	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:03:27.262202	cfc876dd-c6e3-4283-b705-0cd86ac95e00
4ad58073-2f42-425e-aed0-eb38bc27879a	0db1653d-947f-4f52-b259-d236158c1caf	IN	121	PURCHASE	8268af6f-584b-4447-ac80-6a5181b62d72	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:13:23.933971	cfc876dd-c6e3-4283-b705-0cd86ac95e00
74dc4b41-4f21-4143-ac44-0374ef9f44c1	f61596a6-df22-4555-b928-4ec9a2bab0f9	IN	50	PURCHASE	aca7a93f-07f8-4d80-877c-99345c365101	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:14:04.734853	cfc876dd-c6e3-4283-b705-0cd86ac95e00
cf10eafd-621e-40d1-9fed-aec46a15ad89	a89ad017-b37b-42b2-ad9c-841de188ca2f	IN	33	PURCHASE	9dbde227-173b-4099-8623-e0f7a0454923	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:18:49.037269	cfc876dd-c6e3-4283-b705-0cd86ac95e00
81791105-a387-4181-a5fe-f3ee1c83c414	5bf72517-92d9-4b1c-96a7-1344f1e8f137	IN	300	PURCHASE	c2e09214-74de-4314-86bf-9c9506f07068	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:22:16.60926	cfc876dd-c6e3-4283-b705-0cd86ac95e00
42215e5f-affc-4f01-b847-da964311bfe7	0db1653d-947f-4f52-b259-d236158c1caf	OUT	1	SALE	208fdafa-1e76-464f-8b4c-caf0d59e767c	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:23:18.066807	cfc876dd-c6e3-4283-b705-0cd86ac95e00
b3595fed-f2aa-4fca-bd7a-d2fb51785999	e260efd1-591d-490a-a30b-96157cda9630	OUT	253	SALE	39e2993e-a54c-48ab-bde3-4b73c86dcd84	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:26:47.462758	cfc876dd-c6e3-4283-b705-0cd86ac95e00
f054e9bf-b6e1-4593-85dd-dc30c9ffaa63	e260efd1-591d-490a-a30b-96157cda9630	OUT	100	SALE	52b6aed3-5405-426a-b2c8-3994e4159366	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:27:12.526924	cfc876dd-c6e3-4283-b705-0cd86ac95e00
ddc670b8-697e-4fb7-9874-b5695100a9cf	e260efd1-591d-490a-a30b-96157cda9630	IN	253	SALE	39e2993e-a54c-48ab-bde3-4b73c86dcd84	\N	f	\N	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:41:46.896938	cfc876dd-c6e3-4283-b705-0cd86ac95e00
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, description, features, is_active, created_at, updated_at, duration_months, costs) FROM stdin;
d355ecfc-d278-4b74-816c-f7d72b2e47af	Permium		["Suppliers","Purchases","Inventory","Intelligent Forecasting"]	t	2026-04-01 00:12:02.517614	2026-04-03 16:22:49.731547	1	800.00
32e9a33f-a38c-4655-b87c-97620d7978a9	Basic		["Up to 3 users","Full time support","Credit","Expenses"]	t	2026-03-31 11:28:41.685942	2026-04-05 03:48:10.231785	1	700.00
9b3be0f1-8469-4577-a431-bf2345e70d3a	Pro		["Suppliers","Intelligent Forecasting","Expenses","Credit","Inventory","Purchases"]	t	2026-04-01 02:25:29.23603	2026-04-05 03:59:38.114172	1	1000.00
\.


--
-- Data for Name: subscription_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_requests (id, organization_id, plan_id, status, user_notes, admin_notes, created_at, updated_at) FROM stdin;
c022cd69-5519-4dc2-a40e-41cc55d595cc	cfc876dd-c6e3-4283-b705-0cd86ac95e00	d355ecfc-d278-4b74-816c-f7d72b2e47af	PENDING	I want this features please upgrade my plan, 	\N	2026-04-05 07:52:22.67225	2026-04-05 07:52:22.67225
8774a370-5b73-4eb7-bb3a-12beab4b141e	cfc876dd-c6e3-4283-b705-0cd86ac95e00	d355ecfc-d278-4b74-816c-f7d72b2e47af	PENDING	Please upgrade to the new Plan Preminum	\N	2026-04-05 08:12:05.810379	2026-04-05 08:12:05.810379
d12f1e22-149f-46c6-988c-2a36e77fca1e	cfc876dd-c6e3-4283-b705-0cd86ac95e00	d355ecfc-d278-4b74-816c-f7d72b2e47af	PENDING		\N	2026-04-05 08:12:42.372053	2026-04-05 08:12:42.372053
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
6128a66e-71d8-42e6-8765-15a5402984f1	b2470dce-9586-46b5-8f01-177c76458db7	2600.00	BANK_TRANSFER	TXN-CBE2026040612TRXN78UIOT	2026-04-05	Payment for PO PO-202604-0001	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 04:16:26.835654	cfc876dd-c6e3-4283-b705-0cd86ac95e00
8acdc29a-cef2-4b6f-82b1-e0226f81ce56	b2470dce-9586-46b5-8f01-177c76458db7	100.00	CASH		2026-04-05	Payment for PO PO-202604-0001	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 04:17:01.466928	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0cc73fa8-b46e-4624-b335-022314b97c86	b87764fc-72e6-4d9b-9037-0f04cc7da3b5	2000.00	CASH		2026-04-05	Payment for PO PO-202604-0002	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 04:26:08.371923	cfc876dd-c6e3-4283-b705-0cd86ac95e00
0056f073-a573-4836-adae-87708288d48c	98631b40-b933-4bbf-86b5-b1bbceec5a75	726.00	CASH		2026-04-05	Payment for PO PO-202604-0003	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:12:34.91028	cfc876dd-c6e3-4283-b705-0cd86ac95e00
55585417-f2b8-48a1-85ab-dd656a356ca4	41c7c9ea-9d9d-4bab-89cb-f7522a443a0e	5900.00	CASH		2026-04-05	Payment for PO PO-202604-0004	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:14:17.786433	cfc876dd-c6e3-4283-b705-0cd86ac95e00
1022ead8-8a27-4d54-8556-ab629f6577a1	735100b1-7f13-4791-941e-5fb8040365c4	462.00	CHEQUE		2026-04-05	Payment for PO PO-202604-0005	46282536-d3c2-4d26-9a61-afd2de2c3534	2026-04-05 06:18:59.992777	cfc876dd-c6e3-4283-b705-0cd86ac95e00
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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, role, is_active, manager_pin, branch_id, organization_id, created_at, updated_at) FROM stdin;
e02e046c-eddc-4abb-9a77-80e08d5929ad	new	$2b$10$qWmWqwN.RtdC9DXAfuYzw.oZ8qwIznC6JAm.qSe0c1v6anmbKRYpm	ADMIN	t	\N	\N	82d0d253-897a-4edf-8749-bb03798004db	2026-04-01 01:25:44.814477	2026-04-01 02:04:24.427292
39ddfcb3-1462-45d5-9c6b-ef304915c1a3	bereket	$2b$10$LmGq0heC3lDlvlsp8OJBWOrHIbs7WY/7Dgom9EzYXj1CrWisndJtK	PHARMACIST	t	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 08:44:48.841922	2026-03-26 08:44:48.841922
6a6aa93e-f5f7-4685-a934-e6a11a708d89	yosief	$2b$10$XBZOCKTof.PM0GFMgEPRsOb3lgTlp9eQXxQiKDDoR79bOd3pCoew.	ADMIN	f	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 08:36:14.676204	2026-03-26 08:51:42.068207
98b71fd9-9d98-4395-b114-cf28cfe62aab	mudaye	$2b$10$SpM9bpqGWsXTdDxLeyRgDOH8CLwSbeXmK32Org9m6MKFT.Mx0nwVK	ADMIN	t	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 08:55:43.392331	2026-03-26 08:55:43.392331
416ae697-489b-4f08-a316-afdfa4566805	mudaye	$2b$10$HDBRrakDIDC4hZMlG42SPuD/hPqSrUvYqO/r9G4ekHreeEDJ4qb0K	ADMIN	t	\N	\N	1129d8da-c6a7-48fc-865a-7ab5095dc398	2026-03-26 08:58:45.820253	2026-03-26 08:59:21.949776
fbc32a57-a091-4fc3-b3a3-a7cb71b30382	beki	$2b$10$H1ARgh1riUyOoHgMquakButffXE1QdcJCDI2k0d58QQHKEig20Hvi	ADMIN	t	\N	\N	1129d8da-c6a7-48fc-865a-7ab5095dc398	2026-03-26 22:41:15.163455	2026-03-26 22:41:15.163455
0449f568-0509-4c50-a472-f4844ac13e7e	beki	$2b$10$.Z.tY7XQ2syUAZknhJ7Rp.w36qvdboN/qXlzrXpoHcpRtDoZt4OVe	ADMIN	t	\N	\N	b9034243-010c-496b-b5d4-90947a3b3974	2026-03-26 22:42:53.418108	2026-03-26 22:42:53.418108
5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	yosief	$2b$10$k11bb8Y.vF9.QlcODXHyxeglh2.H0LAy3FQkYsY22O8qW.7ELmF3K	ADMIN	t	\N	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-30 03:12:30.741684	2026-03-30 03:12:30.741684
0f953bcd-70cd-4228-afab-37d8e1ecc81c	Yosief D	$2b$10$xJQIovRLsDaWhWoKqgDq5.AF0zy0JSnFKPO4EHd.HVHdE6H974WJ2	ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-30 03:36:14.279193	2026-03-30 03:36:14.279193
41398660-3cd9-44bc-ab1a-1616c68d619f	bereket	$2b$10$kJuuYWqEBFaDa0FsHY2CPucrEpxhPqTx6CruFSo2tkiHQM/uyXzue	CASHIER	t	\N	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:31:53.379259	2026-03-31 00:31:53.379259
59e6bca9-0b11-495e-a482-69f6947081d8	admin	$2b$10$HYJePhR07AGtdqvLlPlJF.NQgwVqqJJTpBRWRJ3ks.aKpuFxGF/5O	ADMIN	t	\N	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-31 00:32:16.10403	2026-03-31 00:32:56.391867
65321d2a-a6fc-4900-abcc-5693c8f6c196	bewket	$2b$10$t3n1DAMTOdYfhZ//xpY0V..rPWsEvaKEnjliqJT5TQo4QjMsEQ.sG	ADMIN	t	\N	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 00:53:40.027339	2026-03-31 00:53:40.027339
db79319d-343f-4d8f-bb54-e4efaa70c31d	bereket	$2b$10$7MNbOGAoGINuHi.dHm7kOunP47022EXOvZmAVkaIx3uCeGy0oPWjy	ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-26 08:33:51.312164	2026-03-31 09:29:17.591983
4548bc76-62a3-464d-8f6f-d1aa02298954	samri	$2b$10$eBBTyL6M7adOMCNd9WuVfuGlVqHi6b4Rz5wxy1VhMQEXm2PkZzYvi	ADMIN	t	\N	\N	145c68ec-9ad5-46f6-9d20-9a5f6294ae7b	2026-03-31 11:32:39.45472	2026-03-31 11:34:34.224286
d95c589a-04c5-4ea3-af8d-82192031f907	new1	$2b$10$x3IVEahDcFaGpvxfZR9G1u9IoVYqec40xcoa5efVbc1H02NIU8bG.	ADMIN	t	\N	\N	82d0d253-897a-4edf-8749-bb03798004db	2026-04-01 02:02:24.94574	2026-04-01 02:02:24.94574
46282536-d3c2-4d26-9a61-afd2de2c3534	hayle	$2b$10$Rx0KiwEtksx33zgR0kIwPO3cT33HAoOBCf7fxI6wW2VSGfy24Jyv2	ADMIN	t	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 00:50:33.941235	2026-04-03 15:18:03.95072
c7a012e3-dfb0-4a01-a7d3-d60f8f96aaec	moges	$2b$10$iiFdG7w0DMGJlVg7ykMGtuyi4ncfWocGFVYFfV4jNtBaCd.xIRdCC	ADMIN	t	\N	\N	70cd42a3-f2d6-46fe-99db-a97bfb08c020	2026-03-31 00:53:22.474545	2026-04-04 03:34:50.292848
519dab08-1342-46dc-a816-7b419e816e56	superadmin	$2b$10$HYJePhR07AGtdqvLlPlJF.NQgwVqqJJTpBRWRJ3ks.aKpuFxGF/5O	SUPER_ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-25 14:45:39.568484	2026-03-31 09:29:39.372069
8fef06d5-307b-49eb-a867-6322ea49f080	admin	$2b$10$igmmcTQjo0juMmyvOhVXr.AILneDx409WC2QGrUflsJuNREatfaVy	ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-25 14:45:39.460855	2026-04-05 04:32:24.011706
196cf18c-9db4-45f0-a518-a3fe0ae0d70c	samrawit	$2b$10$oE0aoqkG9pnLQzw43TzHduFvhTydNpr2liemsIsLk7XD49cDsLsjq	ADMIN	f	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-03-31 00:49:46.046757	2026-04-05 06:01:14.513844
65b80ac0-ddb1-41a3-a1e4-24c9e9fcef4e	moges	$2b$10$tl4UZ5gn.9Nr5Bsc4Ibkwe6d0XklYTjf4A0BHZXEg/RyjU90zldna	PHARMACIST	t	\N	\N	cfc876dd-c6e3-4283-b705-0cd86ac95e00	2026-04-03 23:20:08.600613	2026-04-05 06:42:50.657752
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
-- Name: batches UQ_97d1f1bb91026691acf0c7e4664; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT "UQ_97d1f1bb91026691acf0c7e4664" UNIQUE (medicine_id, batch_number, organization_id);


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
-- Name: sales FK_83a12e5e2723eafe9a47c441457; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "FK_83a12e5e2723eafe9a47c441457" FOREIGN KEY (created_by) REFERENCES public.users(id);


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
-- Name: price_history FK_9fdbc9f1cc971e55548b433c70e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT "FK_9fdbc9f1cc971e55548b433c70e" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


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
-- Name: refunds FK_b7d1eaf9ed1c18fb9b4be69981c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "FK_b7d1eaf9ed1c18fb9b4be69981c" FOREIGN KEY (processed_by_id) REFERENCES public.users(id);


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
-- Name: customers FK_d2fc0e42b07d01fafc3fbb2bee3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "FK_d2fc0e42b07d01fafc3fbb2bee3" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


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

