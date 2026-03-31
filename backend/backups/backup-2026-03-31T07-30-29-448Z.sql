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
    "createdById" uuid
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
\.


--
-- Data for Name: audit_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_sessions (id, status, notes, created_at, completed_at, organization_id, "createdById") FROM stdin;
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, batch_number, medicine_id, expiry_date, purchase_price, selling_price, initial_quantity, quantity_remaining, is_locked, is_quarantined, supplier_id, notes, branch_id, organization_id, created_at, deleted_at) FROM stdin;
3417c80a-bbcd-4db8-965e-183f64fed44d	BN-2003-ER	63d8e81b-16f5-429e-ab69-cb5ac2191c29	2030-10-22	12.00	14.00	200	199	f	f	\N	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 09:24:02.214113-07	\N
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

COPY public.expenses (id, name, category, amount, frequency, description, expense_date, receipt_reference, is_recurring, created_by, branch_id, created_at, organization_id) FROM stdin;
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

COPY public.medicines (id, name, generic_name, category, unit, is_controlled, barcode, sku, supplier_barcode, preferred_supplier_id, minimum_stock_level, is_active, branch_id, organization_id, created_at, updated_at, deleted_at) FROM stdin;
63d8e81b-16f5-429e-ab69-cb5ac2191c29	Amoxicilin	Amoxicilin 500 mg	Antibotics	TAB	f	\N	\N	\N	\N	14	t	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 09:22:35.033995-07	2026-03-26 09:23:22.820811-07	\N
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
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, subscription_plan, is_active, created_at, updated_at) FROM stdin;
b9034243-010c-496b-b5d4-90947a3b3974	Legehar Pharmacy	BASIC	f	2026-03-26 03:42:42.659531	2026-03-26 05:02:17.91139
70cd42a3-f2d6-46fe-99db-a97bfb08c020	Tikur Anbesa	SILVER	f	2026-03-26 03:42:51.300241	2026-03-26 05:02:19.503543
3c237b12-f5c1-4acc-aa65-a357457502b8	Misrak Pharmacy	GOLD	f	2026-03-26 03:43:15.403954	2026-03-26 05:02:20.438824
38b3d5d1-a571-4bb2-9fe2-baa624b23a76	Meba Pharmac	GOLD	f	2026-03-26 03:43:34.091573	2026-03-26 05:02:21.210524
a901c94d-650e-44ee-990d-98bc16e5099b	Endalew Pharccy	BASIC	f	2026-03-26 03:43:52.027533	2026-03-26 05:02:22.445424
916b6916-5d14-4d8c-96dc-08012d109252	test	BASIC	f	2026-03-26 03:43:55.682051	2026-03-26 05:02:23.420749
cfc876dd-c6e3-4283-b705-0cd86ac95e00	Abinet Pharmacy	BASIC	t	2026-03-26 03:42:00.082377	2026-03-26 05:02:33.696709
05665c34-24c4-4da7-9d5b-00da25f59211	rwrqwrwqr	BASIC	t	2026-03-26 03:43:59.763636	2026-03-26 05:02:35.409829
bdf9576c-279b-429c-a39b-5be84d599601	qrrq   qdq	BASIC	t	2026-03-26 03:44:03.872554	2026-03-26 05:02:36.189803
fcea3215-62f8-4649-bf4f-bb9ed2ecb20d	Akukulu Pharmacy	BASIC	t	2026-03-26 03:42:09.245933	2026-03-26 07:34:46.203445
fda0c216-b48c-4a42-8670-52966096499f	Tiruwerk Pharmacy	BASIC	f	2026-03-26 03:43:42.892625	2026-03-26 22:35:55.553762
5a039500-ac55-438b-9525-de0325561df8	Danu Orthopedic Pharmacy	BASIC	t	2026-03-26 03:42:31.692345	2026-03-26 22:36:07.79936
00000000-0000-0000-0000-000000000000	Legacy Default Organization	SILVER	t	2026-03-25 14:45:39.303842	2026-03-26 22:36:28.233355
1129d8da-c6a7-48fc-865a-7ab5095dc398	tereawewa	BASIC	t	2026-03-25 15:26:27.141748	2026-03-26 22:39:56.641279
37448208-174d-473e-a2eb-a031a33e298e	Health First	BASIC	t	2026-03-30 03:12:30.741684	2026-03-30 03:12:30.741684
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, name, is_active, branch_id, phone, age, gender, address, allergies, chronic_conditions, created_at, updated_at, organization_id) FROM stdin;
b087255d-c174-4e0f-8492-391befe6df1e	Ato, Getaneh	t	\N	0987654321	\N	\N		\N	\N	2026-03-26 09:24:39.466592	2026-03-26 09:24:39.466592	fda0c216-b48c-4a42-8670-52966096499f
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

COPY public.purchase_order_items (id, purchase_order_id, medicine_id, quantity_ordered, quantity_received, unit_price, subtotal, organization_id, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, po_number, supplier_id, status, total_amount, notes, payment_method, payment_status, total_paid, branch_id, organization_id, created_by, approved_by, expected_delivery, cheque_bank_name, cheque_number, cheque_issue_date, cheque_due_date, cheque_amount, created_at, updated_at) FROM stdin;
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
99869e5f-5663-4c04-8c81-d68c6998b3b2	be0287a2-c691-405f-8a7f-05d1c37c5c00	63d8e81b-16f5-429e-ab69-cb5ac2191c29	3417c80a-bbcd-4db8-965e-183f64fed44d	1	14.00	14.00	f	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 09:24:42.647742-07
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, receipt_number, patient_id, prescription_id, total_amount, discount, payment_method, split_payments, created_by, is_refunded, refund_amount, prescription_image_url, is_controlled_transaction, branch_id, organization_id, created_at) FROM stdin;
be0287a2-c691-405f-8a7f-05d1c37c5c00	RCPT-20260326-5JCI	b087255d-c174-4e0f-8492-391befe6df1e	\N	14.00	0.00	CASH	\N	98b71fd9-9d98-4395-b114-cf28cfe62aab	f	0.00	\N	f	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 09:24:42.647742-07
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transactions (id, batch_id, type, quantity, reference_type, reference_id, notes, is_fefo_override, override_reason, created_by, created_at, organization_id) FROM stdin;
f08ba400-affa-447d-a54c-12e8dfee40d0	3417c80a-bbcd-4db8-965e-183f64fed44d	OUT	1	SALE	be0287a2-c691-405f-8a7f-05d1c37c5c00	\N	f	\N	98b71fd9-9d98-4395-b114-cf28cfe62aab	2026-03-26 09:24:42.733536	fda0c216-b48c-4a42-8670-52966096499f
\.


--
-- Data for Name: supplier_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_contracts (id, supplier_id, effective_date, expiry_date, discount_percentage, return_policy, notes, created_at, organization_id) FROM stdin;
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
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, contact_person, phone, email, address, credit_limit, payment_terms, average_lead_time, is_active, created_at, updated_at, organization_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, role, is_active, manager_pin, branch_id, organization_id, created_at, updated_at) FROM stdin;
519dab08-1342-46dc-a816-7b419e816e56	superadmin	$2b$10$LbiGeYbQfqqoHPnlBjTVquoYvyrVNwR5SE2lFQcjO5h89bNJ/TNs2	SUPER_ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-25 14:45:39.568484	2026-03-25 15:22:51.748956
8fef06d5-307b-49eb-a867-6322ea49f080	admin	$2b$10$25sQayLl2K7rpaQrbkNS1e/t8h9oBLKC9L0CID/t/FJE2MhAuVL1.	ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-25 14:45:39.460855	2026-03-26 08:26:59.389063
db79319d-343f-4d8f-bb54-e4efaa70c31d	bereket	$2b$10$7MNbOGAoGINuHi.dHm7kOunP47022EXOvZmAVkaIx3uCeGy0oPWjy	AUDITOR	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-26 08:33:51.312164	2026-03-26 08:44:19.152833
39ddfcb3-1462-45d5-9c6b-ef304915c1a3	bereket	$2b$10$LmGq0heC3lDlvlsp8OJBWOrHIbs7WY/7Dgom9EzYXj1CrWisndJtK	PHARMACIST	t	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 08:44:48.841922	2026-03-26 08:44:48.841922
6a6aa93e-f5f7-4685-a934-e6a11a708d89	yosief	$2b$10$XBZOCKTof.PM0GFMgEPRsOb3lgTlp9eQXxQiKDDoR79bOd3pCoew.	ADMIN	f	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 08:36:14.676204	2026-03-26 08:51:42.068207
98b71fd9-9d98-4395-b114-cf28cfe62aab	mudaye	$2b$10$SpM9bpqGWsXTdDxLeyRgDOH8CLwSbeXmK32Org9m6MKFT.Mx0nwVK	ADMIN	t	\N	\N	fda0c216-b48c-4a42-8670-52966096499f	2026-03-26 08:55:43.392331	2026-03-26 08:55:43.392331
416ae697-489b-4f08-a316-afdfa4566805	mudaye	$2b$10$HDBRrakDIDC4hZMlG42SPuD/hPqSrUvYqO/r9G4ekHreeEDJ4qb0K	ADMIN	t	\N	\N	1129d8da-c6a7-48fc-865a-7ab5095dc398	2026-03-26 08:58:45.820253	2026-03-26 08:59:21.949776
fbc32a57-a091-4fc3-b3a3-a7cb71b30382	beki	$2b$10$H1ARgh1riUyOoHgMquakButffXE1QdcJCDI2k0d58QQHKEig20Hvi	ADMIN	t	\N	\N	1129d8da-c6a7-48fc-865a-7ab5095dc398	2026-03-26 22:41:15.163455	2026-03-26 22:41:15.163455
0449f568-0509-4c50-a472-f4844ac13e7e	beki	$2b$10$.Z.tY7XQ2syUAZknhJ7Rp.w36qvdboN/qXlzrXpoHcpRtDoZt4OVe	ADMIN	t	\N	\N	b9034243-010c-496b-b5d4-90947a3b3974	2026-03-26 22:42:53.418108	2026-03-26 22:42:53.418108
5a0b96ce-0ed3-4d67-8d45-a5b7bbc5d8d2	yosief	$2b$10$k11bb8Y.vF9.QlcODXHyxeglh2.H0LAy3FQkYsY22O8qW.7ELmF3K	ADMIN	t	\N	\N	37448208-174d-473e-a2eb-a031a33e298e	2026-03-30 03:12:30.741684	2026-03-30 03:12:30.741684
0f953bcd-70cd-4228-afab-37d8e1ecc81c	Yosief D	$2b$10$xJQIovRLsDaWhWoKqgDq5.AF0zy0JSnFKPO4EHd.HVHdE6H974WJ2	ADMIN	t	\N	\N	00000000-0000-0000-0000-000000000000	2026-03-30 03:36:14.279193	2026-03-30 03:36:14.279193
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

