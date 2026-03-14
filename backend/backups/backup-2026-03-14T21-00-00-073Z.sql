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
    'AUDITOR'
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
    message character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    status public.alerts_status_enum DEFAULT 'ACTIVE'::public.alerts_status_enum NOT NULL,
    reference_id character varying
);


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
    notes text
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_controlled_transaction boolean DEFAULT false NOT NULL
);


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
    "createdById" uuid
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    is_quarantined boolean DEFAULT false NOT NULL,
    supplier_id character varying,
    notes text,
    branch_id character varying,
    deleted_at timestamp without time zone
);


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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    payment_date timestamp without time zone DEFAULT now() NOT NULL
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    branch_id character varying
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.forecast_results OWNER TO postgres;

--
-- Name: goods_receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods_receipts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_order_id uuid NOT NULL,
    received_by uuid,
    notes text,
    received_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    minimum_stock_level integer DEFAULT 10 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    barcode character varying,
    sku character varying,
    supplier_barcode character varying,
    preferred_supplier_id character varying,
    current_selling_price numeric(10,2),
    is_active boolean DEFAULT true NOT NULL,
    branch_id character varying,
    deleted_at timestamp without time zone
);


ALTER TABLE public.medicines OWNER TO postgres;

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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    phone character varying,
    age integer,
    gender public.patients_gender_enum,
    address text,
    allergies text,
    chronic_conditions text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    branch_id character varying
);


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
    quantity_dispensed integer DEFAULT 0 NOT NULL
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: price_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    medicine_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    created_by uuid,
    approved_by uuid,
    expected_delivery date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    branch_id character varying,
    cheque_bank_name character varying,
    cheque_number character varying,
    cheque_issue_date date,
    cheque_due_date date,
    cheque_amount numeric(12,2)
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchase_recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_recommendations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    medicine_id uuid NOT NULL,
    recommended_quantity integer NOT NULL,
    estimated_cost numeric(10,2),
    reasoning text,
    urgency text,
    status public.purchase_recommendations_status_enum DEFAULT 'PENDING'::public.purchase_recommendations_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    reorder_point integer DEFAULT 0 NOT NULL,
    safety_stock integer DEFAULT 0 NOT NULL,
    avg_daily_sales numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    suggested_supplier_id character varying
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    receipt_number character varying,
    patient_id uuid,
    prescription_id uuid,
    total_amount numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    payment_method public.sales_payment_method_enum DEFAULT 'CASH'::public.sales_payment_method_enum NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    split_payments jsonb,
    is_refunded boolean DEFAULT false NOT NULL,
    refund_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    prescription_image_url character varying,
    is_controlled_transaction boolean DEFAULT false NOT NULL,
    branch_id character varying
);


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
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_fefo_override boolean DEFAULT false NOT NULL,
    override_reason text
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    manager_pin character varying,
    branch_id character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerts (id, type, message, created_at, status, reference_id) FROM stdin;
688e06af-aff7-4231-a7b1-073fdf0a3bfb	LOW_STOCK	Medicine Omipraole 600mg is low on stock (0 units remaining)	2026-02-27 00:31:52.036942	ACTIVE	a89d4771-8aa0-476c-9669-ef4f85632228
6b0481a5-294d-4d05-bc41-573cc3b5d6bc	LOW_STOCK	Medicine Ominpradazonilan is low on stock (0 units remaining)	2026-02-27 00:31:51.978198	RESOLVED	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf
cbabdeee-4f59-468e-aa6e-17b6bc36422e	LOW_STOCK	Medicine Ominpradazonilan is low on stock (0 units remaining)	2026-02-27 01:17:26.043164	ACTIVE	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf
823c6783-da20-4e13-96ee-06960c57f97b	LOW_STOCK	Medicine bbbbbb is low on stock (0 units remaining)	2026-02-27 00:31:52.010928	RESOLVED	8046f4b5-f4e7-460d-bb7d-995f53e4e37d
f3afb1c8-a6e6-4172-9639-d9ed9ae92077	LOW_STOCK	Medicine bbbbbb is low on stock (0 units remaining)	2026-03-02 05:41:01.198494	ACTIVE	8046f4b5-f4e7-460d-bb7d-995f53e4e37d
bb464628-afb8-438e-9cab-8fd941f85558	LOW_STOCK	Medicine fozip is low on stock (7 units remaining)	2026-03-02 05:41:01.278474	ACTIVE	9cc32250-f7f4-4110-bcf3-12674f8d7ee2
102140ba-fca7-4aeb-9564-ec49d2cd9049	EXPIRED	CRITICAL: Batch B-B of Ibuprofen 400mg has EXPIRED on 2026-03-04	2026-03-12 14:00:00.482274	ACTIVE	c3c85c9f-784a-4bad-83bb-9919447899b5
d3a6eea2-ffb8-4ac6-91cf-c2b247b26442	EXPIRED	CRITICAL: Batch MTZ-2024-002 of Metronidazole 400mg has EXPIRED on 2026-01-20	2026-03-12 14:00:00.602935	ACTIVE	11a8ad44-9fce-4f83-a892-07913f2e28dd
94bc075e-ec79-430e-aeef-e9da8d91e15c	EXPIRED	CRITICAL: Batch B-EXP-01 of Amoxicillin 250mg has EXPIRED on 2026-02-27	2026-03-12 14:00:00.63852	ACTIVE	31647160-8e82-4325-bd88-238d5b6811dc
d94bcacf-5dab-4c39-b592-ef01025db110	EXPIRY	Batch 123 of fozip expires soon on 2026-03-18	2026-03-12 14:00:00.812989	ACTIVE	9cc32250-f7f4-4110-bcf3-12674f8d7ee2
3983916e-d94e-44da-8084-d63d213329ad	LOW_STOCK	Medicine Amoxicillin 500mg is low on stock (0 units remaining)	2026-03-14 12:56:16.382625	ACTIVE	5cd30f81-e390-4ab6-96da-d48ffad951c8
cdd06058-fa05-4a58-b1f4-6e4de53f0773	LOW_STOCK	Medicine Paracetamol 500mg is low on stock (0 units remaining)	2026-03-14 12:56:16.450533	ACTIVE	7712158f-3b06-4d5b-8264-5f9bd8eb1656
9ca83d0c-814d-4162-ba3f-9bd34222d3d6	LOW_STOCK	Medicine Metformin 850mg is low on stock (0 units remaining)	2026-03-14 12:56:16.5245	ACTIVE	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b
88f4e3a3-13f9-4ae8-9dc8-de57b0ce313a	LOW_STOCK	Medicine Ciprofloxacin 500mg is low on stock (0 units remaining)	2026-03-14 12:56:16.642054	ACTIVE	6291d56a-efab-4620-a3cd-882f38fcf477
0442ddb5-4054-40a8-ba07-562fbf7da5e3	LOW_STOCK	Medicine Omeprazole 20mg is low on stock (0 units remaining)	2026-03-14 12:56:16.781337	ACTIVE	d3473968-0bbd-4957-b049-4201fbe7679a
c33bdb70-8ab3-4a3d-b36b-f8236338ac21	LOW_STOCK	Medicine Amlodipine 5mg is low on stock (0 units remaining)	2026-03-14 12:56:16.847709	ACTIVE	191649b1-8b84-4824-96d5-7204708c38d8
6c74130b-aa1e-4b0a-ae23-a96ab4dc9ebd	LOW_STOCK	Medicine Cetirizine 10mg is low on stock (0 units remaining)	2026-03-14 12:56:16.908465	ACTIVE	69262d94-eaf1-44af-a9a8-ff809ed4605c
57e4ef16-6369-4252-8715-cb1319c78e99	LOW_STOCK	Medicine Azithromycin 250mg is low on stock (0 units remaining)	2026-03-14 12:56:16.962534	ACTIVE	c385708f-7efb-452e-b265-44cdb2ee0feb
a14697c6-fb9e-4899-996b-30ff3225f06d	LOW_STOCK	Medicine Morphine 10mg is low on stock (0 units remaining)	2026-03-14 12:56:17.029331	ACTIVE	d4f891ca-62bc-4736-b6c6-b4efc17b509d
a1c9729d-77d4-4edd-a3bb-69123d4e16fa	LOW_STOCK	Medicine Diazepam 5mg is low on stock (0 units remaining)	2026-03-14 12:56:17.084703	ACTIVE	1eeee917-9632-4f45-88f6-478488d24070
6c9679c3-3d2d-4c23-8fc8-718945571dda	LOW_STOCK	Medicine Salbutamol Inhaler is low on stock (0 units remaining)	2026-03-14 12:56:17.149033	ACTIVE	a3f6eb40-5c31-4628-81eb-87ffe3051d7f
5a66dd24-8867-4193-a0c7-da113a338465	LOW_STOCK	Medicine Metronidazole 400mg is low on stock (0 units remaining)	2026-03-14 12:56:17.210619	ACTIVE	11a8ad44-9fce-4f83-a892-07913f2e28dd
00fdb10d-2f69-48dd-b93c-9c634a9482b5	LOW_STOCK	Medicine Insulin Glargine 100IU is low on stock (0 units remaining)	2026-03-14 12:56:17.283016	ACTIVE	e7d43cba-f748-4e65-8a21-c83589765dfc
e234580a-de2c-4068-9c3c-4c7aeee4eef1	LOW_STOCK	Medicine Amoxicillin 250mg is low on stock (0 units remaining)	2026-03-14 12:56:17.389451	ACTIVE	31647160-8e82-4325-bd88-238d5b6811dc
e20d2f73-f0bc-4f47-99f0-21773f8ef74b	LOW_STOCK	Medicine Omeprazole is low on stock (0 units remaining)	2026-03-14 12:56:17.448712	ACTIVE	0b204657-ad9c-4a61-9e68-5174245e3450
74ba652f-e685-4864-bf2c-7d8212af3d24	EXPIRY	Batch B-Gh-Lo of Ominpradazonilan expires soon on 2026-04-03	2026-03-14 14:00:00.833014	ACTIVE	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf
\.


--
-- Data for Name: audit_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_items (id, session_id, medicine_id, batch_id, system_quantity, scanned_quantity, variance, notes) FROM stdin;
00e8740c-72c1-40d3-8dcf-c5b26b8ad72b	5a639309-e920-4ec3-a99b-d515d5a1dc7d	31647160-8e82-4325-bd88-238d5b6811dc	1f815aac-252d-49ad-bed0-06e79ee64fd6	1000	0	-1000	\N
3e6e1594-c0a9-482f-97fe-f315784e0006	5a639309-e920-4ec3-a99b-d515d5a1dc7d	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	281	0	-281	\N
65780b64-0c3b-4f7f-809a-28f8b66afa87	5a639309-e920-4ec3-a99b-d515d5a1dc7d	5cd30f81-e390-4ab6-96da-d48ffad951c8	eae59d9c-65d0-4c2d-9b97-d4a08f1828cf	150	0	-150	\N
8620a566-56b4-41c0-8169-17b04570fc38	5a639309-e920-4ec3-a99b-d515d5a1dc7d	c385708f-7efb-452e-b265-44cdb2ee0feb	90ac1823-f6ea-4df9-98ff-bdbee0a3c909	120	0	-120	\N
f34836d7-f95f-4a37-a84d-7801970923b9	5a639309-e920-4ec3-a99b-d515d5a1dc7d	d4f891ca-62bc-4736-b6c6-b4efc17b509d	a4ea98aa-7dfb-4c9f-adc3-06c0bd6cd0e3	30	0	-30	\N
b3769c69-2799-4830-99c1-62a9c85a3e98	5a639309-e920-4ec3-a99b-d515d5a1dc7d	1eeee917-9632-4f45-88f6-478488d24070	9b5c2eb5-1d56-43fa-9614-383101fcfeaa	50	0	-50	\N
2f31bf9c-b630-4d97-87d6-407796e96ff9	5a639309-e920-4ec3-a99b-d515d5a1dc7d	11a8ad44-9fce-4f83-a892-07913f2e28dd	47d860a9-0170-4534-a289-fe6cc8d315ba	200	0	-200	\N
7dfb1e68-a180-46ea-a15a-6849d7e1b6e3	5a639309-e920-4ec3-a99b-d515d5a1dc7d	282864b6-c783-4e9c-8dd9-0a396a587cf2	5a2844fc-8d1f-44e3-943c-205222a589cc	150	0	-150	\N
dfa789c9-2a36-4dfc-ada2-947a744e07d4	5a639309-e920-4ec3-a99b-d515d5a1dc7d	0b204657-ad9c-4a61-9e68-5174245e3450	3d613881-9ef4-499f-8e2b-9e774d78b1c6	250	0	-250	\N
1d41f93e-f44a-4d66-bc8c-01ea75021be9	5a639309-e920-4ec3-a99b-d515d5a1dc7d	e7d43cba-f748-4e65-8a21-c83589765dfc	7542d965-94f7-4755-80ee-2d9db6fb413a	14	0	-14	\N
45810c51-465e-4894-9414-6b6a582c9e44	5a639309-e920-4ec3-a99b-d515d5a1dc7d	6291d56a-efab-4620-a3cd-882f38fcf477	197db4c8-873d-48aa-8a53-07fd98143bdc	138	0	-138	\N
1ce1ec3f-40e3-4837-ad03-bf08668b0afc	5a639309-e920-4ec3-a99b-d515d5a1dc7d	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	87	0	-87	\N
5da55fae-8482-4d61-9aef-a4dc273a643a	5a639309-e920-4ec3-a99b-d515d5a1dc7d	a3f6eb40-5c31-4628-81eb-87ffe3051d7f	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	35	0	-35	\N
b4e0259f-a425-4cf3-bf3b-92ebfaa2e46d	5a639309-e920-4ec3-a99b-d515d5a1dc7d	d3473968-0bbd-4957-b049-4201fbe7679a	98455d97-69d7-45fd-a9cf-0661955b2095	190	0	-190	\N
91cba30d-3c59-4d86-9f5f-7517a92306c6	5a639309-e920-4ec3-a99b-d515d5a1dc7d	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	ec43068a-e327-435e-8718-cb18c7e88431	79	0	-79	\N
139074fb-f365-493d-ac46-d7b545457bc4	5a639309-e920-4ec3-a99b-d515d5a1dc7d	9cc32250-f7f4-4110-bcf3-12674f8d7ee2	64a6b456-9278-44d2-83e7-87b53f2491a7	7	0	-7	\N
940e9428-c52a-44a4-b314-ff45296fa1e3	5a639309-e920-4ec3-a99b-d515d5a1dc7d	31647160-8e82-4325-bd88-238d5b6811dc	7b014786-a344-428b-9217-47bd76ee9a4d	100	0	-100	\N
09b90c24-8644-4d64-a620-8bc76362c5d6	5a639309-e920-4ec3-a99b-d515d5a1dc7d	c3c85c9f-784a-4bad-83bb-9919447899b5	c73f1445-4b79-4a67-84ee-1a9505030e38	50	0	-50	\N
adc89c72-cc00-4a32-bc1f-cf52a0888ae7	5a639309-e920-4ec3-a99b-d515d5a1dc7d	c3c85c9f-784a-4bad-83bb-9919447899b5	f62196bc-0862-43c6-86f0-21ac19569857	100	0	-100	\N
f7de5610-d17c-475e-901d-f0d8075d13e1	5a639309-e920-4ec3-a99b-d515d5a1dc7d	11a8ad44-9fce-4f83-a892-07913f2e28dd	8b0841a5-ad03-460a-b3d0-7090d27f04a6	50	0	-50	\N
af5a03c9-f76f-4921-9e40-a35810816099	5a639309-e920-4ec3-a99b-d515d5a1dc7d	69262d94-eaf1-44af-a9a8-ff809ed4605c	0b862270-ddbe-4c60-998d-0a75183dce82	293	0	-293	\N
55e1493e-7902-4533-88af-d5cfdc60c138	5a639309-e920-4ec3-a99b-d515d5a1dc7d	191649b1-8b84-4824-96d5-7204708c38d8	ee817cc5-4207-42cf-b82f-aa55b2f1a383	171	0	-171	\N
643fcb56-d5bb-4e3a-8703-f0c34d49e05c	5a639309-e920-4ec3-a99b-d515d5a1dc7d	5cd30f81-e390-4ab6-96da-d48ffad951c8	706ca62d-649f-419d-87a9-fdbc44fc4171	193	0	-193	\N
0b1f7ae1-d2a7-4036-a918-881ab1d3be14	5a639309-e920-4ec3-a99b-d515d5a1dc7d	7712158f-3b06-4d5b-8264-5f9bd8eb1656	8ce50289-2798-4f8c-864f-93b22f5b7df6	491	0	-491	\N
eb0356f4-3b79-4ae0-90cf-b73b4aac257d	5a639309-e920-4ec3-a99b-d515d5a1dc7d	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	9da7afb2-5553-4123-89ca-aa3eb08ff099	236	0	-236	\N
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity, entity_id, old_values, new_values, ip_address, created_at, is_controlled_transaction) FROM stdin;
872337cc-09d2-4146-8826-bc6109420d1b	820407c9-380d-437b-8bc2-e7cb8831e452	UPDATE	medicines	31647160-8e82-4325-bd88-238d5b6811dc	{"name":"Amoxicillin 250mg","category":"Antibiotic","unit":"Capsule"}	{"name":"Amoxicillin 250mg","generic_name":"Amoxicillin","category":"Antibiotic","unit":"Capsule","minimum_stock_level":53,"is_controlled":false}	\N	2026-02-26 00:58:31.568825	f
3abe91b9-aeea-494e-96e2-ffdf998a8bf2	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	medicines	15bfc12a-cdb4-4374-ac1b-33c5291d6323	{"name":"Ibuprofen 400mg"}	\N	\N	2026-02-26 00:59:04.301687	f
98a49ebb-123f-4dae-a73b-7e8fee5b36de	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	0b204657-ad9c-4a61-9e68-5174245e3450	\N	{"name":"Omeprazole","generic_name":"Omeprazole","category":"Anti Acid","unit":"TAB","is_controlled":true,"minimum_stock_level":47}	\N	2026-02-26 01:01:21.553553	f
2a46fe3e-34b4-4993-bc2b-8dbedec58cc8	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	3d613881-9ef4-499f-8e2b-9e774d78b1c6	\N	{"batch_number":"BN-2026-2w3","medicine_id":"0b204657-ad9c-4a61-9e68-5174245e3450","initial_quantity":250}	\N	2026-02-26 01:03:20.812778	f
77326c2d-6163-499d-a173-99b7bc49a6b2	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	2a009784-b726-4789-b85c-572737885abe	\N	{"total_amount":"6.00","items_count":1}	\N	2026-02-26 01:32:41.771731	f
c587abc3-71e5-40dc-b382-5764c4570c77	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	27d8a3b7-495a-4504-bab6-efdd8797407d	\N	{"total_amount":"1.50","items_count":1}	\N	2026-02-26 01:38:29.082649	f
3db4c776-ac3b-4c77-ae61-bff546f5033c	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	c694402d-ddfa-49e2-b871-a63e9e5e9c07	\N	{"total_amount":"3.00","items_count":1}	\N	2026-02-26 01:57:15.266066	f
8bd8bd48-e9db-41df-b3d5-f39fb18f56cf	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	c6d884e5-3048-4a12-b47c-c9b928726d1b	\N	{"total_amount":"1.50","items_count":1}	\N	2026-02-26 02:11:34.068539	f
24c5d6a2-0215-4252-9a00-caf768f892b0	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	d28ed9bc-edc1-4d5f-9e58-60a84b123730	\N	{"total_amount":"1.50","items_count":1}	\N	2026-02-26 02:12:26.981236	f
3391cc91-60a3-4fb6-a48f-7078e730b4bd	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf	\N	{"name":"Ominpradazonilan","generic_name":"","category":"antibiotics","unit":"TAB","is_controlled":false,"minimum_stock_level":10}	\N	2026-02-26 02:23:10.565558	f
39a90f71-5c25-43c8-ac5a-0c8d8597b604	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	8046f4b5-f4e7-460d-bb7d-995f53e4e37d	\N	{"name":"bbbbbb","generic_name":"tyuuuu","category":"nmnuij","unit":"TAB","is_controlled":false,"minimum_stock_level":10}	\N	2026-02-26 02:42:13.884369	f
4f9f92e5-0c6d-40bd-87b8-a74662463ab0	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	prescriptions	ae64b5fd-0c85-4f49-8c0d-c0779f06a33c	\N	{"patient_id":"2c76602c-eca7-4c25-a0d2-57fce3e72943","doctor_name":"Dr Yosief","items_count":1}	\N	2026-02-26 02:55:31.746711	f
cb46b8ac-ef4c-48d2-8eaa-975469e77326	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	patients	bbd5c074-3e23-46c3-bb14-cb7353d99429	\N	{"name":"Mebrau Lemma"}	\N	2026-02-26 03:45:58.26533	f
d3c2057d-edc4-4734-a56f-f17a6b7b37b3	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	patients	bbd5c074-3e23-46c3-bb14-cb7353d99429	{"name":"Mebrau Lemma"}	\N	\N	2026-02-26 03:46:41.626478	f
07a2985a-0dab-491f-8d02-49378459f4a4	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	a89d4771-8aa0-476c-9669-ef4f85632228	\N	{"name":"Omipraole 600mg","generic_name":"Omipraole","category":"antibiotic","unit":"TAB","is_controlled":false,"minimum_stock_level":14}	\N	2026-02-27 00:27:58.204322	f
8cf40ca9-97d9-47c5-98c1-931ef34cbda7	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	b924aa72-7f1a-435c-88d5-39138af5180e	\N	{"total_amount":"15.00","items_count":1}	\N	2026-02-27 00:31:51.83231	f
ea185b34-43ad-4bef-b419-b6f4d869c3ca	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	d1703da1-70f0-408e-a14c-1ed28c4408e2	\N	{"total_amount":"15.00","items_count":1}	\N	2026-02-27 00:31:59.846631	f
e827121f-a4f0-446f-af09-5ef21f66e25c	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	102377eb-9f6e-4c88-839f-d1d6bc97ab23	\N	{"total_amount":"52.50","items_count":2}	\N	2026-02-27 00:33:00.623395	f
db58f086-2e3d-4f8b-bcca-57ee592dba54	290cda07-f939-4337-a1d3-d592282ecfb1	SELL	sales	4fc0073f-7482-4906-8a65-6583ab6067bc	\N	{"total_amount":"3.50","items_count":1}	\N	2026-02-27 01:17:25.821216	f
e4921ba7-a9d3-41dd-85f6-72a005875d77	290cda07-f939-4337-a1d3-d592282ecfb1	CREATE	patients	87e6f352-791f-4117-acb6-827f54762224	\N	{"name":"Hiryakos Desu"}	\N	2026-02-27 01:18:41.800982	f
27812e47-ba90-4500-a21e-6454e8bc3a4e	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	9cc32250-f7f4-4110-bcf3-12674f8d7ee2	\N	{"name":"fozip","generic_name":"dapaglifoz","category":"edocrime","unit":"TAB","is_controlled":false,"minimum_stock_level":10}	\N	2026-03-02 05:37:19.609267	f
2fcb37ab-1bfc-43eb-8286-1de9bc3361ca	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	64a6b456-9278-44d2-83e7-87b53f2491a7	\N	{"batch_number":"123","medicine_id":"9cc32250-f7f4-4110-bcf3-12674f8d7ee2","initial_quantity":15}	\N	2026-03-02 05:39:22.551493	f
d237e9a0-622a-4e19-890c-7c2e2d094dec	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	0539391f-40f7-439c-ac86-e1b2da769016	\N	{"total_amount":"480.00","items_count":1}	\N	2026-03-02 05:41:00.936566	f
5c76506a-d769-4d46-b932-6d90abd7217b	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	patients	2c090309-6aa9-469e-9e7e-641cd7e43d36	\N	{"name":"yebegashet "}	\N	2026-03-02 05:46:33.189191	f
e8a29a26-b9ad-4ef2-b00a-fb50549c99da	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	prescriptions	5e3d9890-bd3e-4684-ab87-346b9f1d1198	\N	{"patient_id":"2c090309-6aa9-469e-9e7e-641cd7e43d36","doctor_name":"dr bereket","items_count":1}	\N	2026-03-02 05:47:25.08303	f
d22e15ed-be78-4646-9314-c321b7c9460a	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	prescriptions	2716c11b-19b6-4568-baa3-b62f743d566e	\N	{"patient_id":"2c090309-6aa9-469e-9e7e-641cd7e43d36","doctor_name":"Dr Yosief","items_count":1}	\N	2026-03-02 06:24:24.4139	f
f1ac1b4c-eb6b-4952-8214-fe8f693d39a6	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	62cba462-8aca-475f-b6b7-ea4f45db059c	\N	{"batch_number":"B-Gh-Lo","medicine_id":"8c936d4c-d7cf-408a-ac9a-65bbf1a68acf","initial_quantity":10000}	\N	2026-03-12 14:27:13.876975	f
d91267aa-85b9-46f4-a1ca-6bc54014693b	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	984f5eb2-b7ff-4ad9-80fd-158308a18012	\N	{"batch_number":"Batch #  B-A","medicine_id":"c3c85c9f-784a-4bad-83bb-9919447899b5","initial_quantity":3450}	\N	2026-03-12 14:33:02.989556	f
38f076ba-bfc8-42ca-91ac-d59cb35c907c	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	medicines	8046f4b5-f4e7-460d-bb7d-995f53e4e37d	{"name":"bbbbbb"}	\N	\N	2026-03-14 09:50:16.944868	f
7d741425-7c7b-41fb-aa24-bfdc2661f9f9	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	3f34574a-82f9-405b-879d-5380b48eb051	\N	{"batch_number":"BN-2026-12","medicine_id":"9cc32250-f7f4-4110-bcf3-12674f8d7ee2","initial_quantity":340}	\N	2026-03-14 09:54:35.110614	f
980074b0-8ddd-4796-9381-c8af8ee98d57	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	prescriptions	9c47673d-fde3-46b4-a5b5-51f6e0edb101	\N	{"patient_id":"2c76602c-eca7-4c25-a0d2-57fce3e72943","doctor_name":"Dr TEST","items_count":1}	\N	2026-03-14 10:02:49.588653	f
ce8e9a67-9419-4a3d-8b46-13bfbe1a3120	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	3ec2633d-d379-405a-a5de-a90cdf756348	\N	{"batch_number":"BN-2023","medicine_id":"8c936d4c-d7cf-408a-ac9a-65bbf1a68acf","initial_quantity":20}	\N	2026-03-14 11:19:29.714413	f
e8231fb0-d272-4888-a89e-215ea2f20390	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	e7bbde18-de54-470e-bac9-85977d8cbf42	\N	{"name":"test","generic_name":"tsey","category":"tytty","unit":"TAB","is_controlled":false,"minimum_stock_level":56,"current_selling_price":2}	\N	2026-03-14 11:51:32.414574	f
09213dac-913a-4ae4-9d84-3fc41f1a766c	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	b81a17cf-5ac6-43c3-90ed-207ddb1df165	\N	{"name":"test 2","generic_name":"tst2","category":"est","unit":"TAB","is_controlled":false,"minimum_stock_level":10,"current_selling_price":0.9}	\N	2026-03-14 11:53:35.734877	f
8e2b1f00-51ea-4ef9-94d1-75a7cd8aa825	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	89bef3f3-9e8e-41db-b072-fc0eff9e7ae2	\N	{"batch_number":"uiiwcwc","medicine_id":"e7bbde18-de54-470e-bac9-85977d8cbf42","initial_quantity":10}	\N	2026-03-14 11:54:18.248786	f
afb48872-ce7c-4cee-8f06-d4ebd54ab79c	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	ac40aca6-4fcb-4716-b5db-b3fe4ae383e6	\N	{"batch_number":"tyytyty","medicine_id":"b81a17cf-5ac6-43c3-90ed-207ddb1df165","initial_quantity":50}	\N	2026-03-14 11:56:00.477406	f
3903beb3-9152-42b2-aee8-e1f853b84e5f	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	ecc64659-b8ea-48f0-88f9-02f4394a17f2	\N	{"batch_number":"huuiuui","medicine_id":"e7bbde18-de54-470e-bac9-85977d8cbf42","initial_quantity":40}	\N	2026-03-14 11:58:00.818124	f
16b68c72-0c93-49ff-911d-1f70d4b493bd	820407c9-380d-437b-8bc2-e7cb8831e452	UPDATE	medicines	e7bbde18-de54-470e-bac9-85977d8cbf42	{"name":"test","category":"tytty","unit":"TAB"}	{"name":"test","generic_name":"tsey","category":"tytty","unit":"TAB","minimum_stock_level":35,"is_controlled":false,"current_selling_price":2}	\N	2026-03-14 11:58:39.748393	f
d13d8d15-3ff4-4c3b-b2ad-ea5e5926f8a5	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	batches	89bef3f3-9e8e-41db-b072-fc0eff9e7ae2	{"batch_number":"uiiwcwc"}	\N	\N	2026-03-14 11:59:33.133226	f
f2859001-dba0-4d2d-be56-1e648bf705dd	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	medicines	e7bbde18-de54-470e-bac9-85977d8cbf42	{"name":"test"}	\N	\N	2026-03-14 11:59:55.948253	f
b31bf60a-c9ca-40e3-a086-967dee2b31d6	820407c9-380d-437b-8bc2-e7cb8831e452	UPDATE	medicines	31647160-8e82-4325-bd88-238d5b6811dc	{"name":"Amoxicillin 250mg","category":"Antibiotic","unit":"Capsule"}	{"name":"Amoxicillin 250mg","generic_name":"Amoxicillin","category":"Antibiotic","unit":"Capsule","minimum_stock_level":51,"is_controlled":false,"current_selling_price":0}	\N	2026-03-14 12:07:56.975081	f
f0e6a98b-45bb-40d9-8a95-487d45698dea	820407c9-380d-437b-8bc2-e7cb8831e452	UPDATE	medicines	31647160-8e82-4325-bd88-238d5b6811dc	{"name":"Amoxicillin 250mg","category":"Antibiotic","unit":"Capsule"}	{"name":"Amoxicillin 250mg","generic_name":"Amoxicillin","category":"Antibiotic","unit":"Capsule","minimum_stock_level":51,"is_controlled":false,"current_selling_price":2.1}	\N	2026-03-14 12:08:18.087924	f
a78607df-fee3-4e71-8eb9-029559e7cafc	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	medicines	282864b6-c783-4e9c-8dd9-0a396a587cf2	{"name":"Losartan 50mg"}	\N	\N	2026-03-14 12:30:25.818531	f
08883d68-c655-4537-a1c3-c42352c9986f	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	batches	5a2844fc-8d1f-44e3-943c-205222a589cc	{"batch_number":"LOS-2026-001"}	\N	\N	2026-03-14 12:31:06.992371	f
b16cf04f-7561-47ad-8776-1b44ef418668	820407c9-380d-437b-8bc2-e7cb8831e452	UPDATE	medicines	0b204657-ad9c-4a61-9e68-5174245e3450	{"name":"Omeprazole","category":"Anti Acid","unit":"TAB"}	{"name":"Omeprazole","generic_name":"Omeprazole","category":"Anti Acid","unit":"TAB","minimum_stock_level":47,"is_controlled":true,"current_selling_price":1.4}	\N	2026-03-14 12:39:07.189277	f
84640250-4ad9-4729-af3a-93d5fa077799	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	medicines	8c79f4c3-ffd5-42be-afe3-8f38d82dd25a	{"name":"Amlodijossy"}	\N	\N	2026-03-14 12:49:01.862665	f
2765ecd2-9de8-443c-8519-d26c97bc4619	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	557f6938-dcf8-453d-9202-207c8fff4ce4	\N	{"total_amount":"47.00","items_count":1}	\N	2026-03-14 12:56:16.561607	f
b6b52c60-b2b3-4b0d-8319-72a5e1ccb334	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	710eb019-0bec-4590-94cd-76d4cede9eeb	\N	{"total_amount":"180.00","items_count":1}	\N	2026-03-14 13:10:23.920483	f
4936869d-cd7c-4798-8432-e281bf1869c3	820407c9-380d-437b-8bc2-e7cb8831e452	REFUND	sales	710eb019-0bec-4590-94cd-76d4cede9eeb	\N	{"amount":180,"medicine_id":"9cc32250-f7f4-4110-bcf3-12674f8d7ee2"}	\N	2026-03-14 13:49:04.91736	f
e7f0d0ca-4c9b-45ca-a7c5-15dadb58a0bf	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	e210f66b-c935-4dd1-bae5-07e48d16e25a	\N	{"total_amount":"141.00","items_count":1}	\N	2026-03-14 13:51:59.037166	f
205a6307-36a7-4e22-85f9-a0a083d2e0e4	820407c9-380d-437b-8bc2-e7cb8831e452	REFUND	sales	e210f66b-c935-4dd1-bae5-07e48d16e25a	\N	{"amount":141,"medicine_id":"8c936d4c-d7cf-408a-ac9a-65bbf1a68acf"}	\N	2026-03-14 13:57:10.738138	f
a727c817-8b04-47fb-8b34-c6ae0436dd02	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	bf0e385f-d4af-46b5-bb60-082abf70b324	\N	{"total_amount":"15.00","items_count":1}	\N	2026-03-14 13:58:43.563045	f
\.


--
-- Data for Name: audit_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_sessions (id, status, notes, created_at, completed_at, "createdById") FROM stdin;
5a639309-e920-4ec3-a99b-d515d5a1dc7d	COMPLETED	Q1	2026-03-12 13:17:37.360609	2026-03-13 00:20:15.251	820407c9-380d-437b-8bc2-e7cb8831e452
c31372b2-eb05-4ff0-a77d-21d4e871aed9	COMPLETED	hu\n	2026-03-12 14:20:28.152735	2026-03-14 19:39:37.713	820407c9-380d-437b-8bc2-e7cb8831e452
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, batch_number, medicine_id, expiry_date, purchase_price, selling_price, initial_quantity, quantity_remaining, created_at, is_locked, is_quarantined, supplier_id, notes, branch_id, deleted_at) FROM stdin;
7b014786-a344-428b-9217-47bd76ee9a4d	B-EXP-01	31647160-8e82-4325-bd88-238d5b6811dc	2026-02-27	\N	\N	100	0	2026-02-12 03:02:58.786442	t	f	\N	\N	\N	\N
62cba462-8aca-475f-b6b7-ea4f45db059c	B-Gh-Lo	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf	2026-04-03	0.00	0.00	10000	9999	2026-03-12 14:27:13.841957	f	f	\N	\N	\N	\N
c73f1445-4b79-4a67-84ee-1a9505030e38	B-A	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-02-22	\N	\N	50	0	2026-02-12 03:10:01.792647	t	f	\N	\N	\N	\N
984f5eb2-b7ff-4ad9-80fd-158308a18012	Batch #  B-A	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-07-01	0.00	0.00	3450	3445	2026-03-12 14:33:02.924047	f	f	\N	\N	\N	\N
f62196bc-0862-43c6-86f0-21ac19569857	B-B	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-04	\N	\N	100	0	2026-02-12 03:10:01.811789	t	f	\N	\N	\N	\N
8b0841a5-ad03-460a-b3d0-7090d27f04a6	MTZ-2024-002	11a8ad44-9fce-4f83-a892-07913f2e28dd	2026-01-20	1.50	4.00	50	0	2026-02-19 22:32:30.074808	t	f	\N	\N	\N	\N
0b862270-ddbe-4c60-998d-0a75183dce82	CET-2026-001	69262d94-eaf1-44af-a9a8-ff809ed4605c	2027-10-20	0.60	2.00	300	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
ee817cc5-4207-42cf-b82f-aa55b2f1a383	AML-2026-001	191649b1-8b84-4824-96d5-7204708c38d8	2027-12-20	0.80	2.50	180	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
706ca62d-649f-419d-87a9-fdbc44fc4171	AMX-2026-001	5cd30f81-e390-4ab6-96da-d48ffad951c8	2027-08-20	2.50	5.00	200	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
1f815aac-252d-49ad-bed0-06e79ee64fd6	B-LONG-01	31647160-8e82-4325-bd88-238d5b6811dc	2028-02-12	\N	\N	1000	0	2026-02-12 03:02:58.816693	f	f	\N	\N	\N	\N
8ca35b97-efe1-48f3-a250-723d650326f3	IBU-2026-001	c3c85c9f-784a-4bad-83bb-9919447899b5	2027-11-12	1.00	3.00	300	0	2026-03-12 11:26:54.762115	f	f	\N	\N	\N	\N
eae59d9c-65d0-4c2d-9b97-d4a08f1828cf	AMX-2026-002	5cd30f81-e390-4ab6-96da-d48ffad951c8	2027-02-20	2.50	5.00	150	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
90ac1823-f6ea-4df9-98ff-bdbee0a3c909	AZI-2026-001	c385708f-7efb-452e-b265-44cdb2ee0feb	2026-12-20	4.00	8.50	120	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
a4ea98aa-7dfb-4c9f-adc3-06c0bd6cd0e3	MOR-2026-001	d4f891ca-62bc-4736-b6c6-b4efc17b509d	2027-02-20	15.00	25.00	30	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
9b5c2eb5-1d56-43fa-9614-383101fcfeaa	DIA-2026-001	1eeee917-9632-4f45-88f6-478488d24070	2027-08-20	5.00	12.00	50	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
47d860a9-0170-4534-a289-fe6cc8d315ba	MTZ-2026-001	11a8ad44-9fce-4f83-a892-07913f2e28dd	2027-06-20	1.50	4.00	200	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
8ce50289-2798-4f8c-864f-93b22f5b7df6	PCM-2026-001	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2028-02-20	0.50	1.50	500	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
9da7afb2-5553-4123-89ca-aa3eb08ff099	MET-2026-001	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2027-05-20	1.20	3.50	250	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
3d613881-9ef4-499f-8e2b-9e774d78b1c6	BN-2026-2w3	0b204657-ad9c-4a61-9e68-5174245e3450	2026-08-25	4000.00	6000.00	250	0	2026-02-26 01:03:20.768916	f	f	\N	\N	\N	\N
3ec2633d-d379-405a-a5de-a90cdf756348	BN-2023	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf	2026-04-04	34.00	47.00	20	20	2026-03-14 11:19:29.633899	f	f	\N	\N	\N	\N
ac40aca6-4fcb-4716-b5db-b3fe4ae383e6	tyytyty	b81a17cf-5ac6-43c3-90ed-207ddb1df165	2029-10-14	5.00	7.00	50	50	2026-03-14 11:56:00.393644	f	f	\N	\N	\N	\N
5a2844fc-8d1f-44e3-943c-205222a589cc	LOS-2026-001	282864b6-c783-4e9c-8dd9-0a396a587cf2	2027-10-20	2.00	5.50	150	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	2026-03-14 12:31:06.622567
3f34574a-82f9-405b-879d-5380b48eb051	BN-2026-12	9cc32250-f7f4-4110-bcf3-12674f8d7ee2	2026-03-19	23.00	25.00	340	340	2026-03-14 09:54:35.06092	f	f	\N	\N	\N	\N
7542d965-94f7-4755-80ee-2d9db6fb413a	INS-2026-001	e7d43cba-f748-4e65-8a21-c83589765dfc	2026-08-20	35.00	55.00	20	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
197db4c8-873d-48aa-8a53-07fd98143bdc	CIP-2026-001	6291d56a-efab-4620-a3cd-882f38fcf477	2027-06-20	3.00	7.00	150	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
3405105d-9a5f-4b37-98ec-73b85d2c79c0	PCM-2025-003	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-04-20	0.50	1.50	100	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
9b3923cf-65ea-4e8b-b332-bacb92dde4ef	SAL-2026-001	a3f6eb40-5c31-4628-81eb-87ffe3051d7f	2028-02-20	8.00	15.00	40	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
98455d97-69d7-45fd-a9cf-0661955b2095	OMP-2026-001	d3473968-0bbd-4957-b049-4201fbe7679a	2027-04-20	1.80	4.50	200	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
ec43068a-e327-435e-8718-cb18c7e88431	MET-2025-002	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-05-20	1.20	3.50	80	0	2026-02-19 22:32:30.074808	f	f	\N	\N	\N	\N
64a6b456-9278-44d2-83e7-87b53f2491a7	123	9cc32250-f7f4-4110-bcf3-12674f8d7ee2	2026-03-18	50.00	60.00	15	0	2026-03-02 05:39:22.496991	f	f	\N	\N	\N	\N
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, address, phone, is_headquarters, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cheque_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cheque_records (id, customer_id, cheque_number, bank_name, amount, due_date, status, notes, created_at) FROM stdin;
\.


--
-- Data for Name: credit_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_payments (id, customer_id, credit_record_id, amount, payment_method, reference_number, received_by, payment_date) FROM stdin;
30dd1173-4ba7-4bdf-b9fd-69f5d6feeecd	c66c3d66-4f95-4de4-a5a1-b5d930302c84	\N	3.00	MOBILE_PAYMENT		820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 11:26:43.511376
\.


--
-- Data for Name: credit_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_records (id, customer_id, sale_id, original_amount, paid_amount, due_date, status, notes, created_at) FROM stdin;
647dcdef-5029-4b6c-b2a7-946b01f62a51	11cf432f-60b7-402f-b420-f1cf3238ea6e	532144b2-d3fe-4848-8632-9454b58b5063	6.00	0.00	2026-03-27	UNPAID	\N	2026-02-14 21:26:54.861
bdc73b60-01f1-4583-82a5-ef3ea72de5f4	11cf432f-60b7-402f-b420-f1cf3238ea6e	8db95f25-b280-4654-9afb-637b9b409712	10.00	0.00	2026-03-27	UNPAID	\N	2026-02-27 21:26:54.897
1254edc7-5376-4b8a-9afc-f742e336cf3b	6c35bf47-75ff-4f6a-aef1-7233d92e22ee	546a72d5-b2a5-42f3-aac8-12d2884cdff2	4.00	0.00	2026-03-27	UNPAID	\N	2026-02-14 21:26:54.922
c8118b57-867b-495d-8cf1-ef7be51a50b8	11cf432f-60b7-402f-b420-f1cf3238ea6e	a8a68323-7eac-428b-8a02-ca11a3204ab5	7.00	0.00	2026-03-27	UNPAID	\N	2026-02-11 21:26:54.942
ee3f3249-a656-45c8-b483-b3559ca94f78	2a31975d-2d9b-4b88-b97f-0e0b9b7f74a1	1e1b979f-732c-48dd-8658-d4ca249eac0e	7.50	0.00	2026-03-27	UNPAID	\N	2026-02-23 22:08:34.04
00946b98-d7b5-4451-89cc-07a42b38f4c6	0ec733c5-a60a-4e29-a218-7abc53a78441	27555f3e-5eae-453b-8348-792abf8aa88e	9.00	0.00	2026-03-27	UNPAID	\N	2026-02-18 22:08:34.095
4b4b3642-e406-451c-9f99-8f915a2fb992	2a31975d-2d9b-4b88-b97f-0e0b9b7f74a1	9afe9d04-48db-47a0-811f-5b27f21acba3	10.50	0.00	2026-03-27	UNPAID	\N	2026-03-02 22:08:34.11
86ad26c7-576a-4309-926c-be7a1413512a	c66c3d66-4f95-4de4-a5a1-b5d930302c84	7624bb8b-e6be-4e3d-92cc-6fc49f604a07	3.00	3.00	2026-03-27	PAID	\N	2026-03-12 22:08:34.124
d39a0224-6d08-4bdf-8f2a-aec35da15554	9fd27ce9-7cdc-4ba5-bc2f-1d0f9e783175	710eb019-0bec-4590-94cd-76d4cede9eeb	180.00	0.00	2026-04-13	UNPAID	Credit sale automatically logged from POS	2026-03-14 13:10:22.711861
3fca65bd-625d-4b25-a77d-e83958db4c24	82791f9d-522f-4671-a93a-e96d3a59cc26	e210f66b-c935-4dd1-bae5-07e48d16e25a	141.00	0.00	2026-04-13	UNPAID	Credit sale automatically logged from POS	2026-03-14 13:51:58.150174
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, address, total_credit, is_active, created_at, updated_at) FROM stdin;
6fd249f2-8a52-4c19-9618-151562efc78c	Daniel Tesfaye	0933445566	Addis Ababa, Arada	0.00	t	2026-03-12 11:26:54.762115	2026-03-12 11:26:54.762115
5c8f8f9d-bb84-4821-8e31-175f3b7b9c97	Sara Mohammed	0944556677	Addis Ababa, Yeka	0.00	t	2026-03-12 11:26:54.762115	2026-03-12 11:26:54.762115
6c35bf47-75ff-4f6a-aef1-7233d92e22ee	Fatima Ali	0922334455	Addis Ababa, Kirkos	4.00	t	2026-03-12 11:26:54.762115	2026-03-12 11:26:54.762115
11cf432f-60b7-402f-b420-f1cf3238ea6e	Abebe Kebede	0911223344	Addis Ababa, Bole	23.00	t	2026-03-12 11:26:54.762115	2026-03-12 11:26:54.762115
5d069213-2ed5-456b-8579-924e8fad4954	Sara Mohammed	0944556677	Addis Ababa, Yeka	0.00	t	2026-03-12 12:08:33.971898	2026-03-12 12:08:33.971898
0ec733c5-a60a-4e29-a218-7abc53a78441	Abebe Kebede	0911223344	Addis Ababa, Bole	9.00	t	2026-03-12 12:08:33.971898	2026-03-12 12:08:33.971898
2a31975d-2d9b-4b88-b97f-0e0b9b7f74a1	Daniel Tesfaye	0933445566	Addis Ababa, Arada	18.00	t	2026-03-12 12:08:33.971898	2026-03-12 12:08:33.971898
c66c3d66-4f95-4de4-a5a1-b5d930302c84	Fatima Ali	0922334455	Addis Ababa, Kirkos	0.00	t	2026-03-12 12:08:33.971898	2026-03-14 11:26:43.511376
9fd27ce9-7cdc-4ba5-bc2f-1d0f9e783175	Meron Hailu	0966778899	Addis Ababa, Gulele	180.00	t	2026-03-14 13:10:22.711861	2026-03-14 13:10:22.711861
82791f9d-522f-4671-a93a-e96d3a59cc26	Tewodros Bekele	0977889900	Addis Ababa, Lideta	141.00	t	2026-03-14 13:51:58.150174	2026-03-14 13:51:58.150174
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, name, category, amount, frequency, description, expense_date, receipt_reference, is_recurring, created_by, created_at, branch_id) FROM stdin;
73ec771e-d314-4cc1-ae9c-daea0b287d77	Pharmacy Rent	RENT	15000.00	MONTHLY	\N	2026-03-12	\N	t	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-12 11:26:54.762115	\N
6252e8f3-857b-4439-a297-c86c35f7d54f	Staff Salary	SALARY	25000.00	MONTHLY	\N	2026-03-12	\N	t	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-12 11:26:54.762115	\N
ffbb3f1a-64fe-403f-8b06-f2ab87740861	Electricity Bill	ELECTRICITY	1200.00	MONTHLY	\N	2026-03-12	\N	t	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-12 11:26:54.762115	\N
8f6a56b2-4167-4fba-8868-2eb0bb8925fb	Water Bill	WATER	400.00	MONTHLY	\N	2026-03-12	\N	t	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-12 11:26:54.762115	\N
13797160-ae04-481c-b26e-39ea4decfd88	Internet (Ethio Telecom)	INTERNET	1500.00	MONTHLY	\N	2026-03-12	\N	t	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-12 11:26:54.762115	\N
059cb68a-635e-492d-9cda-4975e94c1c0a	Printer Maintenance	MAINTENANCE	800.00	ONE_TIME	\N	2026-03-12	\N	f	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-12 11:26:54.762115	\N
\.


--
-- Data for Name: forecast_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forecast_results (id, medicine_id, target_date, method, predicted_demand, confidence_score, historical_data_points, created_at) FROM stdin;
506a4384-5775-4547-b781-b545ca83abac	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-19	LINEAR_REGRESSION	0.16	5.75	[[0, 0], [1, 0], [2, 0], [3, 3], [4, 0], [5, 1], [6, 0], [7, 0], [8, 4], [9, 3], [10, 3], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 1], [17, 0], [18, 3], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 1], [29, 0]]	2026-03-12 13:17:17.530772
7502423c-3238-4060-ba3e-b6662cbf0683	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-19	SMA	1.00	70.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-12 13:17:17.530772
943cc468-d23a-43ca-aef8-5f76192b0f4b	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-19	WMA	1.50	75.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-12 13:17:17.530772
1308a5e0-056f-4965-98a4-f5dbff3bae19	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-19	LINEAR_REGRESSION	2.50	0.04	[[0, 0], [1, 1], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 3], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 3], [14, 0], [15, 0], [16, 0], [17, 1], [18, 0], [19, 1], [20, 0], [21, 0], [22, 0], [23, 0], [24, 3], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-12 13:17:17.802785
539028db-68af-4e3f-9549-571a44a8e5ee	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-19	SMA	3.00	70.00	[0, 3, 0, 0, 0, 0, 0]	2026-03-12 13:17:17.802785
73bf2a34-fdea-4891-83db-bfbcdc9cf743	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-19	WMA	1.50	75.00	[0, 3, 0, 0, 0, 0, 0]	2026-03-12 13:17:17.802785
538fe106-2f2c-4e77-9548-8f56953bc978	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-19	LINEAR_REGRESSION	0.00	6.26	[[0, 0], [1, 3], [2, 2], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 2], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-12 13:17:17.828535
9dda2733-989c-4bba-900c-f062387ae9ef	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-19	SMA	2.00	70.00	[0, 2, 0, 0, 0, 0, 0]	2026-03-12 13:17:17.828535
7a5566c6-758a-452a-8fb8-4a84e0db39d5	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-19	WMA	1.00	75.00	[0, 2, 0, 0, 0, 0, 0]	2026-03-12 13:17:17.828535
061181f1-dba4-4d6c-90da-d153c547590a	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-19	LINEAR_REGRESSION	0.57	1.02	[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 3], [6, 0], [7, 0], [8, 1], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 2], [21, 1], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-12 13:17:17.86828
0e167395-5012-4c93-b061-04a098e7e987	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-19	SMA	0.00	70.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-12 13:17:17.86828
e114de3a-fbeb-412c-bbb4-0e82d6b32f3b	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-19	WMA	0.00	75.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-12 13:17:17.86828
854bb862-0142-4e11-8cf6-217a31f72776	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-19	LINEAR_REGRESSION	1.81	0.50	[[0, 0], [1, 0], [2, 0], [3, 0], [4, 6], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 2], [17, 0], [18, 0], [19, 0], [20, 3], [21, 3], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-12 13:17:17.897232
fd7bc5a0-a427-45a8-98f1-2c3500305a6d	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-19	SMA	0.00	70.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-12 13:17:17.897232
6f11aa31-b52e-4104-a337-a567f43bf25e	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-19	WMA	0.00	75.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-12 13:17:17.897232
22110295-aae6-43e8-a49c-8c5d6470e08b	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-19	LINEAR_REGRESSION	0.16	5.75	[[0, 0], [1, 0], [2, 0], [3, 3], [4, 0], [5, 1], [6, 0], [7, 0], [8, 4], [9, 3], [10, 3], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 1], [17, 0], [18, 3], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 1], [29, 0]]	2026-03-12 13:17:25.191568
8eec5fe9-425f-4b01-916a-cd947d822432	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-19	SMA	1.00	70.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-12 13:17:25.191568
70d8eef2-5d26-4276-898b-17280fe36a61	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-19	WMA	1.50	75.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-12 13:17:25.191568
9191803a-4467-4075-8a84-1e5708b0c3c0	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-19	LINEAR_REGRESSION	2.50	0.04	[[0, 0], [1, 1], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 3], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 3], [14, 0], [15, 0], [16, 0], [17, 1], [18, 0], [19, 1], [20, 0], [21, 0], [22, 0], [23, 0], [24, 3], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-12 13:17:25.295684
e905a091-8b3b-46c9-ac9c-099b7216c018	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-19	SMA	3.00	70.00	[0, 3, 0, 0, 0, 0, 0]	2026-03-12 13:17:25.295684
4f674b11-497f-434e-a28b-1167ed2cafb2	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-19	WMA	1.50	75.00	[0, 3, 0, 0, 0, 0, 0]	2026-03-12 13:17:25.295684
ca733338-ba03-40d9-98ba-c7709a4fad61	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-19	LINEAR_REGRESSION	0.00	6.26	[[0, 0], [1, 3], [2, 2], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 2], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-12 13:17:25.328323
0b6de81c-2607-4ac5-adf4-c00d9e21cf35	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-19	SMA	2.00	70.00	[0, 2, 0, 0, 0, 0, 0]	2026-03-12 13:17:25.328323
78900973-55eb-4050-bc60-334c3d4f0a98	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-19	WMA	1.00	75.00	[0, 2, 0, 0, 0, 0, 0]	2026-03-12 13:17:25.328323
af4e8c3e-ee14-4391-875d-90787a6df974	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-19	LINEAR_REGRESSION	0.57	1.02	[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 3], [6, 0], [7, 0], [8, 1], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 2], [21, 1], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-12 13:17:25.371185
9072ddbb-8de2-4d3f-b5d0-a58c11f2209e	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-19	SMA	0.00	70.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-12 13:17:25.371185
3b0de128-11ef-4461-8761-ccde7d7ac83d	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-19	WMA	0.00	75.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-12 13:17:25.371185
40c0d92f-8126-4060-9991-acd3e3874a72	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-19	LINEAR_REGRESSION	1.81	0.50	[[0, 0], [1, 0], [2, 0], [3, 0], [4, 6], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 2], [17, 0], [18, 0], [19, 0], [20, 3], [21, 3], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-12 13:17:25.408925
be49ccf1-60ee-42e0-b778-61b6a312f1fa	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-19	SMA	0.00	70.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-12 13:17:25.408925
13c7cfad-4375-4e34-a734-91324b75fdfe	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-19	WMA	0.00	75.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-12 13:17:25.408925
51c23625-1689-4763-8c8b-ad36b455896d	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-21	LINEAR_REGRESSION	0.00	13.11	[[0, 0], [1, 3], [2, 0], [3, 1], [4, 0], [5, 0], [6, 4], [7, 3], [8, 3], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 1], [15, 0], [16, 3], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 1], [27, 0], [28, 0], [29, 0]]	2026-03-14 11:27:34.739735
1759d1b3-aedd-4e96-b4a9-9aee8fddeaa1	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-21	SMA	1.00	70.00	[0, 0, 0, 1, 0, 0, 0]	2026-03-14 11:27:34.739735
e113f9e6-6f22-4665-8575-e2d5fc60b313	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-21	WMA	1.00	75.00	[0, 0, 0, 1, 0, 0, 0]	2026-03-14 11:27:34.739735
fdeda66e-478f-4ba7-971c-0815d2f9e58e	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-21	SMA	11.00	70.00	[0, 0, 0, 0, 0, 11, 0]	2026-03-14 11:27:41.56523
4db297ec-d53e-4893-9d80-67d715021d5a	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-21	WMA	16.50	75.00	[0, 0, 0, 0, 0, 11, 0]	2026-03-14 11:27:41.56523
ea5d765a-21b7-4f43-a640-2817724c0c0e	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-21	SMA	1.00	70.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-14 13:54:55.022758
2a29ac2c-1d03-48dd-8e6a-58598b6c74d8	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-21	WMA	1.50	75.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-14 13:54:55.022758
90950584-34ff-4536-b451-c3df2594b729	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-21	LINEAR_REGRESSION	11.67	6.62	[[0, 2], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 2], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 11], [29, 0]]	2026-03-14 11:27:35.049136
0cdc051e-31b1-4d38-87c3-b9d20838e530	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-21	SMA	11.00	70.00	[0, 0, 0, 0, 0, 11, 0]	2026-03-14 11:27:35.049136
02936729-84c6-4535-a5bd-accc097bffe9	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-21	WMA	16.50	75.00	[0, 0, 0, 0, 0, 11, 0]	2026-03-14 11:27:35.049136
10aecfff-05f4-4d1b-9bc8-cdef1955aff2	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-21	LINEAR_REGRESSION	1.16	1.28	[[0, 0], [1, 0], [2, 6], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 2], [15, 0], [16, 0], [17, 0], [18, 3], [19, 3], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 1], [29, 0]]	2026-03-14 11:27:35.351574
08dd0b00-41e6-4691-b360-caf5512d203b	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-21	SMA	1.00	70.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-14 11:27:35.351574
dd7b4b0b-1a06-462a-8a47-623126ddd497	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-21	WMA	1.50	75.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-14 11:27:35.351574
ef587f61-6b53-44be-b173-061ff463a920	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-21	LINEAR_REGRESSION	1.75	0.32	[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 3], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 3], [12, 0], [13, 0], [14, 0], [15, 1], [16, 0], [17, 1], [18, 0], [19, 0], [20, 0], [21, 0], [22, 3], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-14 11:27:35.755398
242ccba8-3d38-472e-bf14-0894ec801f99	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-21	SMA	0.00	70.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-14 11:27:35.755398
78aabc8f-15ed-41ab-afe8-50a89bd7463e	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-21	WMA	0.00	75.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-14 11:27:35.755398
2a72635b-cad5-4d86-933f-6a276159c6d2	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-21	LINEAR_REGRESSION	2.88	0.17	[[0, 0], [1, 0], [2, 0], [3, 3], [4, 0], [5, 0], [6, 1], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 2], [19, 1], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 3], [29, 0]]	2026-03-14 11:27:35.922702
6e2b4d49-d68e-4da8-aafb-dd67dd3ac054	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-21	SMA	3.00	70.00	[0, 0, 0, 0, 0, 3, 0]	2026-03-14 11:27:35.922702
4664b191-4a44-4f72-bb70-d1d2f48363f8	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-21	WMA	4.50	75.00	[0, 0, 0, 0, 0, 3, 0]	2026-03-14 11:27:35.922702
e77208a3-cbcb-4f41-9ac4-69227cdb3cd6	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-21	LINEAR_REGRESSION	0.00	13.11	[[0, 0], [1, 3], [2, 0], [3, 1], [4, 0], [5, 0], [6, 4], [7, 3], [8, 3], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 1], [15, 0], [16, 3], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 1], [27, 0], [28, 0], [29, 0]]	2026-03-14 11:27:41.276446
df9e5ff1-b998-4df5-8650-1b1adea40d2a	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-21	SMA	1.00	70.00	[0, 0, 0, 1, 0, 0, 0]	2026-03-14 11:27:41.276446
9a1b6613-e69b-465f-8662-7edb6b009378	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-21	WMA	1.00	75.00	[0, 0, 0, 1, 0, 0, 0]	2026-03-14 11:27:41.276446
53aaee1c-d970-4618-9bf2-1f21f7160dfa	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-21	LINEAR_REGRESSION	11.67	6.62	[[0, 2], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 2], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 11], [29, 0]]	2026-03-14 11:27:41.56523
6de220ac-b086-41b7-9574-7616250d68d5	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-21	LINEAR_REGRESSION	1.16	1.28	[[0, 0], [1, 0], [2, 6], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 2], [15, 0], [16, 0], [17, 0], [18, 3], [19, 3], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 1], [29, 0]]	2026-03-14 11:27:41.675902
b48f5564-6175-44ce-9244-3c5a7a81b158	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-21	SMA	1.00	70.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-14 11:27:41.675902
9db9ae4c-bf21-4954-8064-def990bb6b1e	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-21	WMA	1.50	75.00	[0, 0, 0, 0, 0, 1, 0]	2026-03-14 11:27:41.675902
3a826a48-2e09-4656-a87c-01115a8b7234	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-21	LINEAR_REGRESSION	1.75	0.32	[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 3], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 3], [12, 0], [13, 0], [14, 0], [15, 1], [16, 0], [17, 1], [18, 0], [19, 0], [20, 0], [21, 0], [22, 3], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-14 11:27:41.865685
0ac7e24e-1be7-49b8-8281-ef9999826ede	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-21	SMA	0.00	70.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-14 11:27:41.865685
4f996ee4-29dc-410f-aed1-860a40da55a0	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-21	WMA	0.00	75.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-14 11:27:41.865685
5efa0b64-25c5-4389-8ca1-1052e81f7efe	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-21	LINEAR_REGRESSION	2.88	0.17	[[0, 0], [1, 0], [2, 0], [3, 3], [4, 0], [5, 0], [6, 1], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 2], [19, 1], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 3], [29, 0]]	2026-03-14 11:27:41.985437
760e0b42-9d0e-45c6-b663-57cba56783ab	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-21	SMA	3.00	70.00	[0, 0, 0, 0, 0, 3, 0]	2026-03-14 11:27:41.985437
b5fe33d4-743f-40aa-80dc-964d62a29526	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-21	WMA	4.50	75.00	[0, 0, 0, 0, 0, 3, 0]	2026-03-14 11:27:41.985437
38e71885-0533-43ea-a5dd-53ec1891c1ea	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-21	LINEAR_REGRESSION	0.00	13.11	[[0, 0], [1, 3], [2, 0], [3, 1], [4, 0], [5, 0], [6, 4], [7, 3], [8, 3], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 1], [15, 0], [16, 3], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 1], [27, 0], [28, 0], [29, 0]]	2026-03-14 13:54:54.860596
11e53205-0557-4453-af11-ac7d23b2cb47	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-21	SMA	1.00	70.00	[0, 0, 0, 1, 0, 0, 0]	2026-03-14 13:54:54.860596
7372ba9d-6051-4fe1-8fe1-f8fefd03028e	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-21	WMA	1.00	75.00	[0, 0, 0, 1, 0, 0, 0]	2026-03-14 13:54:54.860596
69267563-6929-4bdc-bae3-169be629db12	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-21	LINEAR_REGRESSION	11.67	6.62	[[0, 2], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 2], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 11], [29, 0]]	2026-03-14 13:54:54.949076
69511159-ef08-4a58-8895-90b8daa45572	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-21	SMA	11.00	70.00	[0, 0, 0, 0, 0, 11, 0]	2026-03-14 13:54:54.949076
2e9e7c30-c64e-4e98-85b9-a7905cc2887f	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-03-21	WMA	16.50	75.00	[0, 0, 0, 0, 0, 11, 0]	2026-03-14 13:54:54.949076
7a05bc5b-8751-41be-98ae-17ea240abf9f	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-03-21	LINEAR_REGRESSION	1.16	1.28	[[0, 0], [1, 0], [2, 6], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 2], [15, 0], [16, 0], [17, 0], [18, 3], [19, 3], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 1], [29, 0]]	2026-03-14 13:54:55.022758
3d764ec0-7350-4557-b6a1-72e63d8af1b5	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-21	LINEAR_REGRESSION	1.75	0.32	[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 3], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 3], [12, 0], [13, 0], [14, 0], [15, 1], [16, 0], [17, 1], [18, 0], [19, 0], [20, 0], [21, 0], [22, 3], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0]]	2026-03-14 13:54:55.088121
6d248aa4-a163-4509-b024-a43685d3e588	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-21	SMA	0.00	70.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-14 13:54:55.088121
301b4113-d701-4958-aa43-40be5359b0db	6291d56a-efab-4620-a3cd-882f38fcf477	2026-03-21	WMA	0.00	75.00	[0, 0, 0, 0, 0, 0, 0]	2026-03-14 13:54:55.088121
913f8697-7954-4d66-9492-85d0174e38f0	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-21	LINEAR_REGRESSION	2.88	0.17	[[0, 0], [1, 0], [2, 0], [3, 3], [4, 0], [5, 0], [6, 1], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 2], [19, 1], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 3], [29, 0]]	2026-03-14 13:54:55.153909
e41de28d-0604-4cb9-b504-ab5ccc746288	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-21	SMA	3.00	70.00	[0, 0, 0, 0, 0, 3, 0]	2026-03-14 13:54:55.153909
d45ce70e-5bed-4388-8156-93c930540df5	d3473968-0bbd-4957-b049-4201fbe7679a	2026-03-21	WMA	4.50	75.00	[0, 0, 0, 0, 0, 3, 0]	2026-03-14 13:54:55.153909
\.


--
-- Data for Name: goods_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goods_receipts (id, purchase_order_id, received_by, notes, received_at) FROM stdin;
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, name, generic_name, category, unit, is_controlled, minimum_stock_level, created_at, updated_at, barcode, sku, supplier_barcode, preferred_supplier_id, current_selling_price, is_active, branch_id, deleted_at) FROM stdin;
c3c85c9f-784a-4bad-83bb-9919447899b5	Ibuprofen 400mg	\N	\N	Tablet	f	12	2026-02-12 03:10:01.720672	2026-02-18 23:03:54.94869	\N	\N	\N	\N	\N	t	\N	\N
5cd30f81-e390-4ab6-96da-d48ffad951c8	Amoxicillin 500mg	Amoxicillin	Antibiotics	Capsule	f	50	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
7712158f-3b06-4d5b-8264-5f9bd8eb1656	Paracetamol 500mg	Acetaminophen	Painkillers	Tablet	f	100	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	Metformin 850mg	Metformin HCl	Antidiabetics	Tablet	f	60	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
6291d56a-efab-4620-a3cd-882f38fcf477	Ciprofloxacin 500mg	Ciprofloxacin	Antibiotics	Tablet	f	40	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
d3473968-0bbd-4957-b049-4201fbe7679a	Omeprazole 20mg	Omeprazole	Antacids	Capsule	f	50	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
191649b1-8b84-4824-96d5-7204708c38d8	Amlodipine 5mg	Amlodipine Besylate	Antihypertensives	Tablet	f	40	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
69262d94-eaf1-44af-a9a8-ff809ed4605c	Cetirizine 10mg	Cetirizine HCl	Antihistamines	Tablet	f	60	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
c385708f-7efb-452e-b265-44cdb2ee0feb	Azithromycin 250mg	Azithromycin	Antibiotics	Tablet	f	30	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
d4f891ca-62bc-4736-b6c6-b4efc17b509d	Morphine 10mg	Morphine Sulfate	Opioid Analgesics	Ampoule	t	10	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
1eeee917-9632-4f45-88f6-478488d24070	Diazepam 5mg	Diazepam	Anxiolytics	Tablet	t	15	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
a3f6eb40-5c31-4628-81eb-87ffe3051d7f	Salbutamol Inhaler	Salbutamol	Bronchodilators	Inhaler	f	20	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
11a8ad44-9fce-4f83-a892-07913f2e28dd	Metronidazole 400mg	Metronidazole	Antibiotics	Tablet	f	50	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
e7d43cba-f748-4e65-8a21-c83589765dfc	Insulin Glargine 100IU	Insulin Glargine	Antidiabetics	Vial	f	10	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N	\N	\N	\N	t	\N	\N
8c936d4c-d7cf-408a-ac9a-65bbf1a68acf	Ominpradazonilan		antibiotics	TAB	f	10	2026-02-26 02:23:10.52786	2026-02-26 02:23:10.52786	\N	\N	\N	\N	\N	t	\N	\N
a89d4771-8aa0-476c-9669-ef4f85632228	Omipraole 600mg	Omipraole	antibiotic	TAB	f	14	2026-02-27 00:27:57.789301	2026-02-27 00:27:57.789301	\N	\N	\N	\N	\N	t	\N	\N
9cc32250-f7f4-4110-bcf3-12674f8d7ee2	fozip	dapaglifoz	edocrime	TAB	f	10	2026-03-02 05:37:19.258858	2026-03-02 05:37:19.258858	\N	\N	\N	\N	\N	t	\N	\N
b81a17cf-5ac6-43c3-90ed-207ddb1df165	test 2	tst2	est	TAB	f	10	2026-03-14 11:53:35.705118	2026-03-14 11:53:35.705118	\N	\N	\N	\N	0.90	t	\N	\N
31647160-8e82-4325-bd88-238d5b6811dc	Amoxicillin 250mg	Amoxicillin	Antibiotic	Capsule	f	51	2026-02-12 03:02:58.535092	2026-03-14 12:08:18.041386	\N	\N	\N	\N	2.10	t	\N	\N
282864b6-c783-4e9c-8dd9-0a396a587cf2	Losartan 50mg	Losartan Potassium	Antihypertensives	Tablet	f	30	2026-02-19 22:32:30.074808	2026-03-14 12:30:25.780739	\N	\N	\N	\N	\N	t	\N	2026-03-14 12:30:25.780739
0b204657-ad9c-4a61-9e68-5174245e3450	Omeprazole	Omeprazole	Anti Acid	TAB	t	47	2026-02-26 01:01:21.52353	2026-03-14 12:39:07.134512	\N	\N	\N	\N	1.40	t	\N	\N
8c79f4c3-ffd5-42be-afe3-8f38d82dd25a	Amlodijossy	amlodijo	Lasvehs	ML	f	78	2026-03-14 12:48:42.283805	2026-03-14 12:49:01.83806	\N	\N	\N	\N	\N	t	\N	2026-03-14 12:49:01.83806
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, created_at) FROM stdin;
cb92b92c-7dfc-44e8-868e-f0ec34467613	\N	Expiring Batch Alert	CRITICAL: Batch B-EXP-01 of Amoxicillin 250mg has EXPIRED on 2026-02-27	EXPIRING	f	2026-03-12 14:00:00.651963
4157c768-1d15-43d5-96cf-1a7bd8d241d8	\N	Expired Batches Locked	4 batch(es) have been automatically locked due to expiration.	EXPIRING	t	2026-03-12 02:00:00.220349
79f1e921-bbb7-4aeb-9bda-4803f0c2c4c0	\N	Low Stock Alert	Medicine Salbutamol Inhaler is low on stock (0 units remaining)	LOW_STOCK	f	2026-03-14 12:56:17.166961
a031a867-818e-42c5-8775-4fdae939e514	\N	New Sale Completed	A sale of $180.00 has been processed (Receipt: N/A)	SALE	f	2026-03-14 13:10:23.568676
44d52e5c-6308-4ca7-9a71-d61f14bc306b	\N	New Sale Completed	A sale of $141.00 has been processed (Receipt: RCPT-20260314-SFGI)	SALE	f	2026-03-14 13:51:58.801843
ba186da4-32b1-401b-be54-a97b6a54d15a	\N	New Sale Completed	A sale of $15.00 has been processed (Receipt: RCPT-20260314-5WU4)	SALE	f	2026-03-14 13:58:43.316446
4a3e03d8-67d4-49e3-bd0a-8a68f08c45c9	\N	Expiring Batch Alert	Batch B-Gh-Lo of Ominpradazonilan expires soon on 2026-04-03	EXPIRING	f	2026-03-14 14:00:00.865196
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, name, phone, age, gender, address, allergies, chronic_conditions, created_at, updated_at, is_active, branch_id) FROM stdin;
2c76602c-eca7-4c25-a0d2-57fce3e72943	Abel Tesfaye	0912345678	30	MALE	Addis Ababa, Bole	["PenicillinAspirin"]	\N	2026-02-18 23:09:52.43903	2026-02-18 23:09:52.43903	t	\N
597eed12-93a5-47ca-8a94-de9dedc2f322	Hana Mekonnen	0923456789	25	FEMALE	Addis Ababa, Piassa	["Dust","Pollen"]	\N	2026-02-18 23:11:58.278702	2026-02-18 23:11:58.278702	t	\N
c5e77f78-4928-4390-8d7a-31ec17850862	Abebe Kebede	0911223344	45	MALE	Addis Ababa, Bole	["Penicillin"]	["Hypertension"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	t	\N
8836f603-6842-437e-af58-ceecb0bd65bc	Fatima Ali	0922334455	32	FEMALE	Addis Ababa, Kirkos	[]	["Diabetes Type 2"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	t	\N
a67930fe-1f77-4df9-8e49-4ff26891a001	Daniel Tesfaye	0933445566	28	MALE	Addis Ababa, Arada	["Sulfa drugs"]	[]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	t	\N
a1881281-7d43-4c17-aa65-9ef2bb4ab0a8	Sara Mohammed	0944556677	55	FEMALE	Addis Ababa, Yeka	[]	["Asthma","Hypertension"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	t	\N
a4b784da-0894-437f-8939-5420f5b589ac	Yonas Gebre	0955667788	67	MALE	Addis Ababa, Nifas Silk	["Aspirin"]	["Diabetes Type 2","Arthritis"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	t	\N
9fd27ce9-7cdc-4ba5-bc2f-1d0f9e783175	Meron Hailu	0966778899	22	FEMALE	Addis Ababa, Gulele	[]	[]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	t	\N
82791f9d-522f-4671-a93a-e96d3a59cc26	Tewodros Bekele	0977889900	38	MALE	Addis Ababa, Lideta	["Codeine"]	["Gastritis"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	t	\N
ef4f65fe-c08a-4de9-990d-9e06a77ede21	Hana Solomon	0988990011	41	FEMALE	Addis Ababa, Kolfe Keranio	[]	["Hypothyroidism"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	t	\N
87e6f352-791f-4117-acb6-827f54762224	Hiryakos Desu	098765421	30	MALE	Adama 	["Peanuts"]	\N	2026-02-27 01:18:41.75693	2026-02-27 01:18:41.75693	t	\N
2c090309-6aa9-469e-9e7e-641cd7e43d36	yebegashet 	0995327012	31	FEMALE	addis abab	["debatis"]	\N	2026-03-02 05:46:33.136751	2026-03-02 05:46:33.136751	t	\N
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (id, prescription_id, medicine_id, dosage, frequency, duration, quantity_dispensed) FROM stdin;
3a183b79-fe0e-46af-9543-a35f9d0e5768	5e3d9890-bd3e-4684-ab87-346b9f1d1198	0b204657-ad9c-4a61-9e68-5174245e3450	1x3	\N	59	0
751c733c-fc48-4311-9ade-b7725ffa7f68	b0ad336b-d8ce-4b2f-ad46-1f742fbccea5	5cd30f81-e390-4ab6-96da-d48ffad951c8	500mg	TID	7 days	21
4017e640-ebe4-423a-a3d7-b4650ae66b69	ca975aa3-f568-4e75-a265-717504e5332b	5cd30f81-e390-4ab6-96da-d48ffad951c8	500mg	TID	7 days	21
6964f93c-2124-47a5-9462-6e06c1ad112f	9c47673d-fde3-46b4-a5b5-51f6e0edb101	a89d4771-8aa0-476c-9669-ef4f85632228	21	\N	3	0
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, patient_id, doctor_name, facility, prescription_number, prescription_image_path, notes, created_at) FROM stdin;
5e3d9890-bd3e-4684-ab87-346b9f1d1198	2c090309-6aa9-469e-9e7e-641cd7e43d36	dr bereket	\N	\N	\N	\N	2026-03-02 05:47:24.783254
b0ad336b-d8ce-4b2f-ad46-1f742fbccea5	c5e77f78-4928-4390-8d7a-31ec17850862	Dr. Smith	General Hospital	\N	\N	Infection	2026-03-12 11:26:54.762115
ca975aa3-f568-4e75-a265-717504e5332b	c5e77f78-4928-4390-8d7a-31ec17850862	Dr. Smith	General Hospital	\N	\N	Infection	2026-03-12 12:08:33.971898
9c47673d-fde3-46b4-a5b5-51f6e0edb101	2c76602c-eca7-4c25-a0d2-57fce3e72943	Dr TEST	\N	\N	\N	\N	2026-03-14 10:02:49.435704
\.


--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_history (id, medicine_id, supplier_id, unit_price, recorded_at) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, medicine_id, quantity_ordered, quantity_received, unit_price, subtotal, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, po_number, supplier_id, status, total_amount, notes, payment_method, payment_status, total_paid, created_by, approved_by, expected_delivery, created_at, updated_at, branch_id, cheque_bank_name, cheque_number, cheque_issue_date, cheque_due_date, cheque_amount) FROM stdin;
5285bdd7-5993-49f4-b07e-0770f4be8cff	PO-2025-001	fff6e9dd-5be4-495b-aba9-cc1302316233	COMPLETED	300.00	\N	CASH	PAID	300.00	820407c9-380d-437b-8bc2-e7cb8831e452	820407c9-380d-437b-8bc2-e7cb8831e452	\N	2026-02-23 21:26:54.822	2026-02-23 21:26:54.822	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: purchase_recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_recommendations (id, medicine_id, recommended_quantity, estimated_cost, reasoning, urgency, status, created_at, reorder_point, safety_stock, avg_daily_sales, suggested_supplier_id) FROM stdin;
1d68785e-541d-47a0-b6a4-017d586df55b	7712158f-3b06-4d5b-8264-5f9bd8eb1656	71	0.00	Avg Daily Sales: 0.5. Safety Stock: 9. Reorder Point: 13. Predicted 7-day demand is 17 units (Model: WMA). Current stock is 0. 30-day forecast recommends ordering 71 units.	CRITICAL	PENDING	2026-03-14 11:27:35.172112	13	9	0.50	\N
36f1c413-d7b4-48f5-b477-701f62920fa6	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	20	0.00	Avg Daily Sales: 0.5. Safety Stock: 6. Reorder Point: 10. Predicted 7-day demand is 2 units (Model: WMA). Current stock is 0. 30-day forecast recommends ordering 20 units.	CRITICAL	PENDING	2026-03-14 11:27:35.472709	10	6	0.50	\N
a506b30c-1917-4417-a39d-ddbede26495c	6291d56a-efab-4620-a3cd-882f38fcf477	14	0.00	Avg Daily Sales: 0.4. Safety Stock: 4. Reorder Point: 7. Predicted 7-day demand is 0 units (Model: WMA). Current stock is 0. 30-day forecast recommends ordering 14 units.	CRITICAL	PENDING	2026-03-14 11:27:35.849745	7	4	0.37	\N
a8593328-8c4f-43dd-8422-69788c76b65f	d3473968-0bbd-4957-b049-4201fbe7679a	20	0.00	Avg Daily Sales: 0.3. Safety Stock: 4. Reorder Point: 7. Predicted 7-day demand is 5 units (Model: WMA). Current stock is 0. 30-day forecast recommends ordering 20 units.	CRITICAL	PENDING	2026-03-14 11:27:36.03225	7	4	0.33	\N
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refunds (id, sale_id, medicine_id, quantity, amount, reason, processed_by_id, created_at) FROM stdin;
7fd053be-d2ec-4c5a-9ca5-0ce0920eb8ca	710eb019-0bec-4590-94cd-76d4cede9eeb	9cc32250-f7f4-4110-bcf3-12674f8d7ee2	3	180.00		820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:49:04.144888
b38df43e-3983-47c3-a351-a03765eaa6f4	e210f66b-c935-4dd1-bae5-07e48d16e25a	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf	3	141.00		820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:57:08.936895
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, medicine_id, batch_id, quantity, unit_price, subtotal, created_at) FROM stdin;
a699c6e2-7f9c-4cf7-ae56-96f11bd79f4b	2a009784-b726-4789-b85c-572737885abe	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	4	1.50	6.00	2026-03-12 07:19:49.951357
ab6d45cc-8f54-4f16-a461-fb826a7a2156	27d8a3b7-495a-4504-bab6-efdd8797407d	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	1	1.50	1.50	2026-03-12 07:19:49.951357
cf5ab578-8281-4da1-83fc-2f09850c3628	c694402d-ddfa-49e2-b871-a63e9e5e9c07	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	2	1.50	3.00	2026-03-12 07:19:49.951357
1eb5cad2-7088-4c86-8d68-543c2f3625b0	c6d884e5-3048-4a12-b47c-c9b928726d1b	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	1	1.50	1.50	2026-03-12 07:19:49.951357
dc9a0cc3-d2c4-4ebe-baaf-c1c8e48c5d95	d28ed9bc-edc1-4d5f-9e58-60a84b123730	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	1	1.50	1.50	2026-03-12 07:19:49.951357
850249b9-bc92-4ce4-adf1-c9d3cbc8acdc	b924aa72-7f1a-435c-88d5-39138af5180e	a3f6eb40-5c31-4628-81eb-87ffe3051d7f	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	1	15.00	15.00	2026-03-12 07:19:49.951357
22318ac6-67fa-4bf8-8eb2-ba66d185d576	d1703da1-70f0-408e-a14c-1ed28c4408e2	a3f6eb40-5c31-4628-81eb-87ffe3051d7f	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	1	15.00	15.00	2026-03-12 07:19:49.951357
822d070e-c2ad-4c62-9bf2-ba79efda7d34	102377eb-9f6e-4c88-839f-d1d6bc97ab23	a3f6eb40-5c31-4628-81eb-87ffe3051d7f	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	3	15.00	45.00	2026-03-12 07:19:49.951357
99c7e6b1-c2ff-419a-96dd-8d2fe09d1b46	102377eb-9f6e-4c88-839f-d1d6bc97ab23	191649b1-8b84-4824-96d5-7204708c38d8	ee817cc5-4207-42cf-b82f-aa55b2f1a383	3	2.50	7.50	2026-03-12 07:19:49.951357
a88aca34-464d-4f98-95f6-b878be8310ff	4fc0073f-7482-4906-8a65-6583ab6067bc	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	ec43068a-e327-435e-8718-cb18c7e88431	1	3.50	3.50	2026-03-12 07:19:49.951357
05644ee9-efe3-4c60-8714-b1b59e8065f5	0539391f-40f7-439c-ac86-e1b2da769016	9cc32250-f7f4-4110-bcf3-12674f8d7ee2	64a6b456-9278-44d2-83e7-87b53f2491a7	8	60.00	480.00	2026-03-12 07:19:49.951357
68d7c381-d9b0-4c2a-8046-465067a1a05e	532144b2-d3fe-4848-8632-9454b58b5063	69262d94-eaf1-44af-a9a8-ff809ed4605c	0b862270-ddbe-4c60-998d-0a75183dce82	3	2.00	6.00	2026-02-14 21:26:54.861
35d538b3-fc4b-41a7-ab9e-34309be15584	9a3bcf5b-8559-4b16-adeb-686cf21f9cfa	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	9da7afb2-5553-4123-89ca-aa3eb08ff099	2	3.50	7.00	2026-02-26 21:26:54.88
5f2ab908-e7e6-4841-9a72-45fa6c958963	ea5bb323-b957-47c7-901e-d85314816716	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	3	3.00	9.00	2026-02-28 21:26:54.884
07c435e7-c1cb-4f14-a4a5-4b3bc5a4cc15	b83a06be-b745-46e6-bdfe-2e5d534dc6b2	6291d56a-efab-4620-a3cd-882f38fcf477	197db4c8-873d-48aa-8a53-07fd98143bdc	3	7.00	21.00	2026-02-17 21:26:54.889
2515a02d-e64e-46d3-ace7-ee91acc391c2	99004267-4733-468a-983b-02b32759d20f	7712158f-3b06-4d5b-8264-5f9bd8eb1656	8ce50289-2798-4f8c-864f-93b22f5b7df6	3	1.50	4.50	2026-02-11 21:26:54.894
eea55b3c-1c6c-49b8-9fce-1f981741b0c7	8db95f25-b280-4654-9afb-637b9b409712	5cd30f81-e390-4ab6-96da-d48ffad951c8	706ca62d-649f-419d-87a9-fdbc44fc4171	2	5.00	10.00	2026-02-27 21:26:54.897
a1e7a75b-089f-4296-8bbf-97f9829a994a	fc2e3786-6ba3-4ca2-8451-89029cec256b	69262d94-eaf1-44af-a9a8-ff809ed4605c	0b862270-ddbe-4c60-998d-0a75183dce82	1	2.00	2.00	2026-02-20 21:26:54.905
6e19741f-09f8-4839-bcbe-04636711ea62	9e15a036-12d7-4719-bfee-e9bc15aa1062	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	1	3.00	3.00	2026-03-10 21:26:54.909
c80efb8b-7daa-4cc3-9c0a-5e0ac52fff6e	66c88050-32fe-4184-a5f5-1fde414afecd	d3473968-0bbd-4957-b049-4201fbe7679a	98455d97-69d7-45fd-a9cf-0661955b2095	1	4.50	4.50	2026-03-03 21:26:54.914
50064595-d62a-4b15-9775-20c04d4ba693	ecf4fbc5-5c03-4d8f-808c-98a7079033d2	5cd30f81-e390-4ab6-96da-d48ffad951c8	706ca62d-649f-419d-87a9-fdbc44fc4171	3	5.00	15.00	2026-03-09 21:26:54.918
bae6a25c-7030-448e-84c0-b5f1a3d86157	546a72d5-b2a5-42f3-aac8-12d2884cdff2	69262d94-eaf1-44af-a9a8-ff809ed4605c	0b862270-ddbe-4c60-998d-0a75183dce82	2	2.00	4.00	2026-02-14 21:26:54.922
d276e32e-43e7-4119-9cb1-92dd702c4a9f	f15ed7c6-fe01-455a-bde4-3f4f927fab52	d3473968-0bbd-4957-b049-4201fbe7679a	98455d97-69d7-45fd-a9cf-0661955b2095	1	4.50	4.50	2026-02-18 21:26:54.928
62047bcf-50f4-460a-bbfb-60c6af596bde	a7dc83a4-a92c-4c3e-b6cc-0635a1032cab	7712158f-3b06-4d5b-8264-5f9bd8eb1656	8ce50289-2798-4f8c-864f-93b22f5b7df6	2	1.50	3.00	2026-03-06 21:26:54.932
496243f6-dcb0-42a1-9016-3cd9cdf179d9	cd8fd044-bd41-4920-8d62-57939b879543	191649b1-8b84-4824-96d5-7204708c38d8	ee817cc5-4207-42cf-b82f-aa55b2f1a383	2	2.50	5.00	2026-02-13 21:26:54.936
5bb33d5f-15df-4cd5-842d-3e228bdf79e6	a6434828-d208-4c9f-af74-7b503bb53791	6291d56a-efab-4620-a3cd-882f38fcf477	197db4c8-873d-48aa-8a53-07fd98143bdc	1	7.00	7.00	2026-03-01 21:26:54.939
336fe583-5fdf-423e-8241-39896d535b72	a8a68323-7eac-428b-8a02-ca11a3204ab5	6291d56a-efab-4620-a3cd-882f38fcf477	197db4c8-873d-48aa-8a53-07fd98143bdc	1	7.00	7.00	2026-02-11 21:26:54.942
32d7e4f2-24cc-48d0-b6fa-6e92c9613cf8	acf00dde-213a-4eb8-9eda-09fb242040b2	6291d56a-efab-4620-a3cd-882f38fcf477	197db4c8-873d-48aa-8a53-07fd98143bdc	1	7.00	7.00	2026-02-27 21:26:54.947
6e221da6-0490-43e6-9cfc-ad2a877ee675	a2d7e776-db9b-421b-aef7-f8d656977824	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	1	3.00	3.00	2026-02-26 21:26:54.951
14733a99-9e19-4bd0-8920-84eda8180ccf	4404cfdf-8a1d-423e-9d3b-3e153a6daf45	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	3	3.00	9.00	2026-02-13 21:26:54.958
8aeb6092-6cf8-46ea-8b67-836fcbedd719	174c2d33-acdc-4535-98c2-5f2ceb923d33	7712158f-3b06-4d5b-8264-5f9bd8eb1656	8ce50289-2798-4f8c-864f-93b22f5b7df6	2	1.50	3.00	2026-02-12 21:26:54.963
1977b2fa-3a41-4afc-a7bc-a9f32cc404db	1e1b979f-732c-48dd-8658-d4ca249eac0e	191649b1-8b84-4824-96d5-7204708c38d8	ee817cc5-4207-42cf-b82f-aa55b2f1a383	3	2.50	7.50	2026-02-23 22:08:34.04
1ae162e3-e9bd-43b8-a84b-3b9c82fe95f2	2ed4c846-de79-4cb7-b8c3-9a4d6d9c0bff	5cd30f81-e390-4ab6-96da-d48ffad951c8	706ca62d-649f-419d-87a9-fdbc44fc4171	1	5.00	5.00	2026-03-01 22:08:34.082
c5c3a39b-abcd-46a5-8a5f-c793c85b9ad2	276ee29a-0b10-4ce6-a1f0-c3c96b3e7ad2	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	9da7afb2-5553-4123-89ca-aa3eb08ff099	3	3.50	10.50	2026-03-03 22:08:34.085
a4c49bd4-c9b7-4c7b-b850-5386b30579b5	94f89631-7073-43d8-a96f-3148fe5c8a4e	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	1	3.00	3.00	2026-02-15 22:08:34.088
6baf318c-9645-478e-be3c-a2ee2beb6d0d	45b352d7-9900-417e-aab3-5b53b850655f	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	3	3.00	9.00	2026-02-19 22:08:34.091
5533401a-af5e-4f3d-b781-9c015279c72c	27555f3e-5eae-453b-8348-792abf8aa88e	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	3	3.00	9.00	2026-02-18 22:08:34.095
209d14a2-0b83-4c57-9dc9-fdd174a47c9a	e66b03d4-42b5-40c8-98e9-e063b04cf1d1	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	3	3.00	9.00	2026-02-20 22:08:34.099
5543312b-8bc2-45f7-b7d7-6058cad74724	800e3fd6-6c13-45e5-8ba0-7909d338694f	d3473968-0bbd-4957-b049-4201fbe7679a	98455d97-69d7-45fd-a9cf-0661955b2095	3	4.50	13.50	2026-03-12 22:08:34.102
2fd84be0-d6fa-49cb-bbce-ca1cd541c2fb	61a59bf2-4b28-4f6e-98f0-15156c477d2f	d3473968-0bbd-4957-b049-4201fbe7679a	98455d97-69d7-45fd-a9cf-0661955b2095	3	4.50	13.50	2026-02-15 22:08:34.104
358a55b6-3a35-40db-a6f4-c42344c104f5	9ce8057d-40f5-4ac2-b81c-4d1c318dce7c	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	9da7afb2-5553-4123-89ca-aa3eb08ff099	3	3.50	10.50	2026-02-14 22:08:34.107
c3d87340-ca13-44ff-82bd-38dc96cf4119	9afe9d04-48db-47a0-811f-5b27f21acba3	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	9da7afb2-5553-4123-89ca-aa3eb08ff099	3	3.50	10.50	2026-03-02 22:08:34.11
0a3ab7fb-1f14-4876-87ae-ff96aa4cab10	b270c181-6446-4046-8b2b-d3e7d5b2a46c	69262d94-eaf1-44af-a9a8-ff809ed4605c	0b862270-ddbe-4c60-998d-0a75183dce82	1	2.00	2.00	2026-02-24 22:08:34.114
83aa2403-2159-474f-a769-29fe53d06d7f	c1e193f0-3af1-4396-a49c-2ab46e63ae5d	191649b1-8b84-4824-96d5-7204708c38d8	ee817cc5-4207-42cf-b82f-aa55b2f1a383	1	2.50	2.50	2026-02-19 22:08:34.117
f2f94bf8-957e-4f62-800d-3be361072b04	30db1259-054b-41e6-a8bc-9c20209632c2	5cd30f81-e390-4ab6-96da-d48ffad951c8	706ca62d-649f-419d-87a9-fdbc44fc4171	1	5.00	5.00	2026-02-16 22:08:34.119
2dfdf53a-9cff-4c9b-adaf-de135e1509a0	3ff6d7eb-b987-4f13-b33a-092ddd2840b4	6291d56a-efab-4620-a3cd-882f38fcf477	197db4c8-873d-48aa-8a53-07fd98143bdc	3	7.00	21.00	2026-03-06 22:08:34.122
181c2053-dba6-43cf-b7c8-35ee4cd0d288	7624bb8b-e6be-4e3d-92cc-6fc49f604a07	7712158f-3b06-4d5b-8264-5f9bd8eb1656	8ce50289-2798-4f8c-864f-93b22f5b7df6	2	1.50	3.00	2026-03-12 22:08:34.124
1ec97f56-ba85-410e-93dc-6b3fdc27f14c	d3422720-67ef-4ae1-b18d-087100cb5839	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	9da7afb2-5553-4123-89ca-aa3eb08ff099	3	3.50	10.50	2026-02-14 22:08:34.129
8aaea1b0-6d64-453a-a00a-9f30eaf0a5a0	1593abba-e26e-4142-baaa-6542ec83ca16	c3c85c9f-784a-4bad-83bb-9919447899b5	8ca35b97-efe1-48f3-a250-723d650326f3	1	3.00	3.00	2026-02-18 22:08:34.132
8b65d99d-b7df-4efe-b0b4-6129c46191da	59e940b7-164b-43a2-9031-368a6b8b047e	6291d56a-efab-4620-a3cd-882f38fcf477	197db4c8-873d-48aa-8a53-07fd98143bdc	3	7.00	21.00	2026-02-23 22:08:34.134
a402a18f-a953-4e5c-a07b-5a47a688b58f	0310a4d7-764a-40f1-aab5-7f11dfd9d55e	d3473968-0bbd-4957-b049-4201fbe7679a	98455d97-69d7-45fd-a9cf-0661955b2095	2	4.50	9.00	2026-03-02 22:08:34.136
dd698e0e-6dac-4c40-898c-7dfb2fb4eb88	557f6938-dcf8-453d-9202-207c8fff4ce4	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf	62cba462-8aca-475f-b6b7-ea4f45db059c	1	47.00	47.00	2026-03-14 12:56:15.541633
5f5a1903-5c36-41a9-89dc-6ea932c08128	710eb019-0bec-4590-94cd-76d4cede9eeb	9cc32250-f7f4-4110-bcf3-12674f8d7ee2	3f34574a-82f9-405b-879d-5380b48eb051	3	60.00	180.00	2026-03-14 13:10:22.711861
d6c246c0-49c9-4a8a-bb4e-92cfd6666d7d	e210f66b-c935-4dd1-bae5-07e48d16e25a	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf	62cba462-8aca-475f-b6b7-ea4f45db059c	3	47.00	141.00	2026-03-14 13:51:58.150174
822bea94-5e15-4fc7-b399-e410cecf317c	bf0e385f-d4af-46b5-bb60-082abf70b324	c3c85c9f-784a-4bad-83bb-9919447899b5	984f5eb2-b7ff-4ad9-80fd-158308a18012	5	3.00	15.00	2026-03-14 13:58:42.79234
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, receipt_number, patient_id, prescription_id, total_amount, discount, payment_method, created_by, created_at, split_payments, is_refunded, refund_amount, prescription_image_url, is_controlled_transaction, branch_id) FROM stdin;
2a009784-b726-4789-b85c-572737885abe	\N	\N	\N	6.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:32:41.303825	\N	f	0.00	\N	f	\N
27d8a3b7-495a-4504-bab6-efdd8797407d	\N	\N	\N	1.50	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:38:28.617968	\N	f	0.00	\N	f	\N
c694402d-ddfa-49e2-b871-a63e9e5e9c07	\N	\N	\N	3.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:57:14.728221	\N	f	0.00	\N	f	\N
c6d884e5-3048-4a12-b47c-c9b928726d1b	\N	\N	\N	1.50	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 02:11:33.601522	\N	f	0.00	\N	f	\N
d28ed9bc-edc1-4d5f-9e58-60a84b123730	\N	\N	\N	1.50	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 02:12:26.47675	\N	f	0.00	\N	f	\N
b924aa72-7f1a-435c-88d5-39138af5180e	\N	\N	\N	15.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:31:51.38277	\N	f	0.00	\N	f	\N
d1703da1-70f0-408e-a14c-1ed28c4408e2	\N	\N	\N	15.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:31:59.560881	\N	f	0.00	\N	f	\N
102377eb-9f6e-4c88-839f-d1d6bc97ab23	\N	\N	\N	52.50	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:33:00.165323	\N	f	0.00	\N	f	\N
4fc0073f-7482-4906-8a65-6583ab6067bc	\N	\N	\N	3.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-27 01:17:25.199985	\N	f	0.00	\N	f	\N
0539391f-40f7-439c-ac86-e1b2da769016	\N	\N	\N	480.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-02 05:41:00.376267	\N	f	0.00	\N	f	\N
710eb019-0bec-4590-94cd-76d4cede9eeb	\N	9fd27ce9-7cdc-4ba5-bc2f-1d0f9e783175	\N	180.00	0.00	CREDIT	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:10:22.711861	\N	t	180.00	\N	f	\N
bf0e385f-d4af-46b5-bb60-082abf70b324	RCPT-20260314-5WU4	87e6f352-791f-4117-acb6-827f54762224	\N	15.00	0.00	SPLIT	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:58:42.79234	[{"amount": 10, "method": "CASH"}, {"amount": 5, "method": "CREDIT_CARD"}]	f	0.00	\N	f	\N
532144b2-d3fe-4848-8632-9454b58b5063	REC1001	c5e77f78-4928-4390-8d7a-31ec17850862	\N	6.00	0.00	CREDIT	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-14 21:26:54.861	\N	f	0.00	\N	f	\N
9a3bcf5b-8559-4b16-adeb-686cf21f9cfa	REC1002	8836f603-6842-437e-af58-ceecb0bd65bc	\N	7.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-26 21:26:54.88	\N	f	0.00	\N	f	\N
ea5bb323-b957-47c7-901e-d85314816716	REC1003	a1881281-7d43-4c17-aa65-9ef2bb4ab0a8	\N	9.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-28 21:26:54.884	\N	f	0.00	\N	f	\N
b83a06be-b745-46e6-bdfe-2e5d534dc6b2	REC1004	8836f603-6842-437e-af58-ceecb0bd65bc	\N	21.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-17 21:26:54.889	\N	f	0.00	\N	f	\N
99004267-4733-468a-983b-02b32759d20f	REC1005	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	4.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-11 21:26:54.894	\N	f	0.00	\N	f	\N
8db95f25-b280-4654-9afb-637b9b409712	REC1006	c5e77f78-4928-4390-8d7a-31ec17850862	\N	10.00	0.00	CREDIT	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-27 21:26:54.897	\N	f	0.00	\N	f	\N
fc2e3786-6ba3-4ca2-8451-89029cec256b	REC1007	8836f603-6842-437e-af58-ceecb0bd65bc	\N	2.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-20 21:26:54.905	\N	f	0.00	\N	f	\N
9e15a036-12d7-4719-bfee-e9bc15aa1062	REC1008	a1881281-7d43-4c17-aa65-9ef2bb4ab0a8	\N	3.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-10 21:26:54.909	\N	f	0.00	\N	f	\N
66c88050-32fe-4184-a5f5-1fde414afecd	REC1009	c5e77f78-4928-4390-8d7a-31ec17850862	\N	4.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-03 21:26:54.914	\N	f	0.00	\N	f	\N
ecf4fbc5-5c03-4d8f-808c-98a7079033d2	REC1010	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	15.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-09 21:26:54.918	\N	f	0.00	\N	f	\N
546a72d5-b2a5-42f3-aac8-12d2884cdff2	REC1011	8836f603-6842-437e-af58-ceecb0bd65bc	\N	4.00	0.00	CREDIT	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-14 21:26:54.922	\N	f	0.00	\N	f	\N
f15ed7c6-fe01-455a-bde4-3f4f927fab52	REC1012	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	4.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-18 21:26:54.928	\N	f	0.00	\N	f	\N
a7dc83a4-a92c-4c3e-b6cc-0635a1032cab	REC1013	a1881281-7d43-4c17-aa65-9ef2bb4ab0a8	\N	3.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-06 21:26:54.932	\N	f	0.00	\N	f	\N
cd8fd044-bd41-4920-8d62-57939b879543	REC1014	8836f603-6842-437e-af58-ceecb0bd65bc	\N	5.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-13 21:26:54.936	\N	f	0.00	\N	f	\N
a6434828-d208-4c9f-af74-7b503bb53791	REC1015	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	7.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-01 21:26:54.939	\N	f	0.00	\N	f	\N
a8a68323-7eac-428b-8a02-ca11a3204ab5	REC1016	c5e77f78-4928-4390-8d7a-31ec17850862	\N	7.00	0.00	CREDIT	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-11 21:26:54.942	\N	f	0.00	\N	f	\N
acf00dde-213a-4eb8-9eda-09fb242040b2	REC1017	8836f603-6842-437e-af58-ceecb0bd65bc	\N	7.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-27 21:26:54.947	\N	f	0.00	\N	f	\N
a2d7e776-db9b-421b-aef7-f8d656977824	REC1018	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	3.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-26 21:26:54.951	\N	f	0.00	\N	f	\N
4404cfdf-8a1d-423e-9d3b-3e153a6daf45	REC1019	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	9.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-13 21:26:54.958	\N	f	0.00	\N	f	\N
174c2d33-acdc-4535-98c2-5f2ceb923d33	REC1020	c5e77f78-4928-4390-8d7a-31ec17850862	\N	3.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-12 21:26:54.963	\N	f	0.00	\N	f	\N
1e1b979f-732c-48dd-8658-d4ca249eac0e	REC1001	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	7.50	0.00	CREDIT	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-23 22:08:34.04	\N	f	0.00	\N	f	\N
2ed4c846-de79-4cb7-b8c3-9a4d6d9c0bff	REC1002	a1881281-7d43-4c17-aa65-9ef2bb4ab0a8	\N	5.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-01 22:08:34.082	\N	f	0.00	\N	f	\N
276ee29a-0b10-4ce6-a1f0-c3c96b3e7ad2	REC1003	a1881281-7d43-4c17-aa65-9ef2bb4ab0a8	\N	10.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-03 22:08:34.085	\N	f	0.00	\N	f	\N
94f89631-7073-43d8-a96f-3148fe5c8a4e	REC1004	a1881281-7d43-4c17-aa65-9ef2bb4ab0a8	\N	3.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-15 22:08:34.088	\N	f	0.00	\N	f	\N
45b352d7-9900-417e-aab3-5b53b850655f	REC1005	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	9.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-19 22:08:34.091	\N	f	0.00	\N	f	\N
27555f3e-5eae-453b-8348-792abf8aa88e	REC1006	c5e77f78-4928-4390-8d7a-31ec17850862	\N	9.00	0.00	CREDIT	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-18 22:08:34.095	\N	f	0.00	\N	f	\N
e66b03d4-42b5-40c8-98e9-e063b04cf1d1	REC1007	c5e77f78-4928-4390-8d7a-31ec17850862	\N	9.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-20 22:08:34.099	\N	f	0.00	\N	f	\N
800e3fd6-6c13-45e5-8ba0-7909d338694f	REC1008	c5e77f78-4928-4390-8d7a-31ec17850862	\N	13.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-12 22:08:34.102	\N	f	0.00	\N	f	\N
61a59bf2-4b28-4f6e-98f0-15156c477d2f	REC1009	8836f603-6842-437e-af58-ceecb0bd65bc	\N	13.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-15 22:08:34.104	\N	f	0.00	\N	f	\N
9ce8057d-40f5-4ac2-b81c-4d1c318dce7c	REC1010	c5e77f78-4928-4390-8d7a-31ec17850862	\N	10.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-14 22:08:34.107	\N	f	0.00	\N	f	\N
9afe9d04-48db-47a0-811f-5b27f21acba3	REC1011	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	10.50	0.00	CREDIT	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-02 22:08:34.11	\N	f	0.00	\N	f	\N
b270c181-6446-4046-8b2b-d3e7d5b2a46c	REC1012	a67930fe-1f77-4df9-8e49-4ff26891a001	\N	2.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-24 22:08:34.114	\N	f	0.00	\N	f	\N
c1e193f0-3af1-4396-a49c-2ab46e63ae5d	REC1013	a1881281-7d43-4c17-aa65-9ef2bb4ab0a8	\N	2.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-19 22:08:34.117	\N	f	0.00	\N	f	\N
30db1259-054b-41e6-a8bc-9c20209632c2	REC1014	c5e77f78-4928-4390-8d7a-31ec17850862	\N	5.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-16 22:08:34.119	\N	f	0.00	\N	f	\N
3ff6d7eb-b987-4f13-b33a-092ddd2840b4	REC1015	8836f603-6842-437e-af58-ceecb0bd65bc	\N	21.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-06 22:08:34.122	\N	f	0.00	\N	f	\N
7624bb8b-e6be-4e3d-92cc-6fc49f604a07	REC1016	8836f603-6842-437e-af58-ceecb0bd65bc	\N	3.00	0.00	CREDIT	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-12 22:08:34.124	\N	f	0.00	\N	f	\N
d3422720-67ef-4ae1-b18d-087100cb5839	REC1017	8836f603-6842-437e-af58-ceecb0bd65bc	\N	10.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-14 22:08:34.129	\N	f	0.00	\N	f	\N
1593abba-e26e-4142-baaa-6542ec83ca16	REC1018	c5e77f78-4928-4390-8d7a-31ec17850862	\N	3.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-18 22:08:34.132	\N	f	0.00	\N	f	\N
59e940b7-164b-43a2-9031-368a6b8b047e	REC1019	c5e77f78-4928-4390-8d7a-31ec17850862	\N	21.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-23 22:08:34.134	\N	f	0.00	\N	f	\N
0310a4d7-764a-40f1-aab5-7f11dfd9d55e	REC1020	8836f603-6842-437e-af58-ceecb0bd65bc	\N	9.00	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-03-02 22:08:34.136	\N	f	0.00	\N	f	\N
557f6938-dcf8-453d-9202-207c8fff4ce4	\N	a4b784da-0894-437f-8939-5420f5b589ac	\N	47.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 12:56:15.541633	\N	f	0.00	\N	f	\N
e210f66b-c935-4dd1-bae5-07e48d16e25a	RCPT-20260314-SFGI	82791f9d-522f-4671-a93a-e96d3a59cc26	\N	141.00	0.00	CREDIT	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:51:58.150174	\N	t	141.00	\N	f	\N
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transactions (id, batch_id, type, quantity, reference_type, reference_id, notes, created_by, created_at, is_fefo_override, override_reason) FROM stdin;
be061fa5-afbe-4bdb-891c-07a53b59808f	7542d965-94f7-4755-80ee-2d9db6fb413a	OUT	3	SALE	0e02c0fe-99b0-4d97-8fa2-61bab31885e3	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:18:27.139706	f	\N
57e2096a-c3f8-40fd-ad00-9a147a6531cb	7542d965-94f7-4755-80ee-2d9db6fb413a	OUT	3	SALE	ff0e8e96-08bb-4058-9d77-add460a3d999	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:18:52.408753	f	\N
59824acc-e7c1-40de-82ce-a3f4115214e1	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	4	SALE	e08c1455-f6d3-438a-84e5-115884be2fc8	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:26:02.873299	f	\N
3ca9a8cc-e3aa-4658-8c56-1083b9108a86	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	4	SALE	2a009784-b726-4789-b85c-572737885abe	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:32:41.516404	f	\N
66505b04-dcb1-4471-bbcd-7330c2242a81	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	1	SALE	27d8a3b7-495a-4504-bab6-efdd8797407d	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:38:28.851779	f	\N
573b2f9e-e049-49b1-b6d7-f3f87be8e0f8	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	2	SALE	c694402d-ddfa-49e2-b871-a63e9e5e9c07	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:57:14.972648	f	\N
ed59bdc0-18ad-4cd6-bcc3-657a64fb0b3c	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	1	SALE	c6d884e5-3048-4a12-b47c-c9b928726d1b	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 02:11:33.810493	f	\N
e6429bc1-8106-46c9-8dae-9bc49905350d	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	1	SALE	d28ed9bc-edc1-4d5f-9e58-60a84b123730	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 02:12:26.67632	f	\N
27b0d1dc-0592-4e32-9fbe-4dd9dd9cfc13	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	OUT	1	SALE	b924aa72-7f1a-435c-88d5-39138af5180e	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:31:51.656517	f	\N
a8f41d4d-44cd-4d93-90cc-f8a236028dc1	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	OUT	1	SALE	d1703da1-70f0-408e-a14c-1ed28c4408e2	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:31:59.597428	f	\N
cf8034f0-ac59-4638-a604-97be82920631	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	OUT	3	SALE	102377eb-9f6e-4c88-839f-d1d6bc97ab23	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:33:00.394218	f	\N
53cdf617-dd33-4bbc-8b4b-e0c791ab13ae	ee817cc5-4207-42cf-b82f-aa55b2f1a383	OUT	3	SALE	102377eb-9f6e-4c88-839f-d1d6bc97ab23	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:33:00.485099	f	\N
edcfe365-e65f-4041-9140-9c290d08f4e4	ec43068a-e327-435e-8718-cb18c7e88431	OUT	1	SALE	4fc0073f-7482-4906-8a65-6583ab6067bc	\N	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-27 01:17:25.454046	f	\N
e0ac9204-c2ff-4eca-aa79-7f5fd1e38867	64a6b456-9278-44d2-83e7-87b53f2491a7	OUT	8	SALE	0539391f-40f7-439c-ac86-e1b2da769016	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-02 05:41:00.655571	f	\N
dc89cf9c-a32d-495b-a562-57afa8bf9525	1f815aac-252d-49ad-bed0-06e79ee64fd6	ADJUSTMENT	1000	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -1000, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
417639f3-5d93-4bf9-bedb-9f9075078dec	8ca35b97-efe1-48f3-a250-723d650326f3	ADJUSTMENT	281	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -281, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
d5254043-c2fd-4ca3-b61e-0afc35f45952	eae59d9c-65d0-4c2d-9b97-d4a08f1828cf	ADJUSTMENT	150	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -150, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
72c5d071-ae55-4f54-bd51-e5d61dcb4747	90ac1823-f6ea-4df9-98ff-bdbee0a3c909	ADJUSTMENT	120	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -120, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
80f92777-d5be-4f7c-9a37-cace7ad12200	a4ea98aa-7dfb-4c9f-adc3-06c0bd6cd0e3	ADJUSTMENT	30	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -30, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
2b3b49f6-8e52-42fb-bb9a-91b5ec2265f2	9b5c2eb5-1d56-43fa-9614-383101fcfeaa	ADJUSTMENT	50	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -50, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
5ef4984b-3dff-4932-8f48-7496c7ffa4f3	47d860a9-0170-4534-a289-fe6cc8d315ba	ADJUSTMENT	200	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -200, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
749e8683-890f-4b24-9b86-82f0b814210a	5a2844fc-8d1f-44e3-943c-205222a589cc	ADJUSTMENT	150	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -150, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
28614e25-8355-4c52-b068-7fae07f1095a	3d613881-9ef4-499f-8e2b-9e774d78b1c6	ADJUSTMENT	250	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -250, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
578e539f-2146-43f0-8d9f-b71864c7469b	7542d965-94f7-4755-80ee-2d9db6fb413a	ADJUSTMENT	14	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -14, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
1a6fc0ae-57c1-4e9a-8630-3f1be8d986a5	197db4c8-873d-48aa-8a53-07fd98143bdc	ADJUSTMENT	138	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -138, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
67023a0d-fde5-4543-84ee-9dc6097b8c02	3405105d-9a5f-4b37-98ec-73b85d2c79c0	ADJUSTMENT	87	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -87, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
c66e2380-968e-4772-bc6c-6c48935bd9c8	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	ADJUSTMENT	35	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -35, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
09428367-c7c6-4fcf-aafc-ffacb5e7c478	98455d97-69d7-45fd-a9cf-0661955b2095	ADJUSTMENT	190	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -190, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
41af5c38-7560-436a-bd40-d5c104b76216	ec43068a-e327-435e-8718-cb18c7e88431	ADJUSTMENT	79	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -79, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
fa4df0b4-f509-4fd5-acbd-02be83781215	64a6b456-9278-44d2-83e7-87b53f2491a7	ADJUSTMENT	7	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -7, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
35737118-83bf-41dc-9399-674971d32b97	7b014786-a344-428b-9217-47bd76ee9a4d	ADJUSTMENT	100	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -100, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
61536656-4503-4e05-b484-ba888bdc5706	c73f1445-4b79-4a67-84ee-1a9505030e38	ADJUSTMENT	50	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -50, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
53d6e7a7-850b-4786-b32e-1b3372b13031	f62196bc-0862-43c6-86f0-21ac19569857	ADJUSTMENT	100	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -100, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
900f94c3-5055-4279-ad79-8d945e9d6a55	8b0841a5-ad03-460a-b3d0-7090d27f04a6	ADJUSTMENT	50	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -50, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
394640da-34a7-42e5-9d6f-136eb19981d7	0b862270-ddbe-4c60-998d-0a75183dce82	ADJUSTMENT	293	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -293, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
46362c7f-df8b-4236-891d-3c6f9bf639b3	ee817cc5-4207-42cf-b82f-aa55b2f1a383	ADJUSTMENT	171	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -171, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
5cbd44ca-4154-4f07-8e27-bf8c471648bc	706ca62d-649f-419d-87a9-fdbc44fc4171	ADJUSTMENT	193	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -193, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
adcdd23a-b7a0-4aa6-abc5-171981daafee	8ce50289-2798-4f8c-864f-93b22f5b7df6	ADJUSTMENT	491	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -491, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
63ec8c09-2338-406f-aab3-a908aa3532e9	9da7afb2-5553-4123-89ca-aa3eb08ff099	ADJUSTMENT	236	ADJUSTMENT	5a639309-e920-4ec3-a99b-d515d5a1dc7d	Inventory Audit Adjustment (V: -236, Session: 5a639309-e920-4ec3-a99b-d515d5a1dc7d)	\N	2026-03-12 14:20:14.535055	f	\N
2780e776-a344-4522-92cc-a9a8176a43d6	62cba462-8aca-475f-b6b7-ea4f45db059c	OUT	1	SALE	557f6938-dcf8-453d-9202-207c8fff4ce4	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 12:56:15.864463	f	\N
5ef5bdff-d7dd-45a7-8ddf-29f1104c6555	3f34574a-82f9-405b-879d-5380b48eb051	OUT	3	SALE	710eb019-0bec-4590-94cd-76d4cede9eeb	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:10:23.182841	f	\N
9f1ce106-915f-462e-ae77-d48752f8b63f	3f34574a-82f9-405b-879d-5380b48eb051	IN	3	SALE	710eb019-0bec-4590-94cd-76d4cede9eeb	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:49:04.758456	f	\N
ebadae60-f1dc-4486-b0a6-23c4b185e143	62cba462-8aca-475f-b6b7-ea4f45db059c	OUT	3	SALE	e210f66b-c935-4dd1-bae5-07e48d16e25a	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:51:58.505693	f	\N
1ff79ade-fde2-44dd-9543-e54b036f41c0	62cba462-8aca-475f-b6b7-ea4f45db059c	IN	3	SALE	e210f66b-c935-4dd1-bae5-07e48d16e25a	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:57:10.376021	f	\N
0f7fb158-a9cb-4d55-a5a7-0e5f5303d314	984f5eb2-b7ff-4ad9-80fd-158308a18012	OUT	5	SALE	bf0e385f-d4af-46b5-bb60-082abf70b324	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-03-14 13:58:43.03096	f	\N
\.


--
-- Data for Name: supplier_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_contracts (id, supplier_id, effective_date, expiry_date, discount_percentage, return_policy, notes, created_at) FROM stdin;
c0cc8d0a-375c-4375-ba3b-74070915471b	292b7126-fca9-4a87-a3ea-2c640310d8f0	2026-03-20	2026-04-03	10.00			2026-03-12 14:06:23.862523
\.


--
-- Data for Name: supplier_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_payments (id, purchase_order_id, amount, payment_method, transaction_reference, payment_date, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: supplier_performance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_performance (id, supplier_id, period, on_time_deliveries, total_deliveries, price_variance, returned_items, total_items, quality_rating, computed_score, created_at) FROM stdin;
3e39ed86-92da-4a31-9434-4dcf74b043a4	292b7126-fca9-4a87-a3ea-2c640310d8f0	2026-03	50	91	0.90	0	81	3.5	0.51	2026-03-12 14:07:17.287841
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, contact_person, phone, email, address, credit_limit, payment_terms, average_lead_time, is_active, created_at, updated_at) FROM stdin;
fff6e9dd-5be4-495b-aba9-cc1302316233	EPHARM	Dawit Alemu	0112233445	sales@epharm.com.et	Addis Ababa	500000.00	NET_30	5	t	2026-03-12 11:26:54.762115	2026-03-12 11:26:54.762115
e106e287-e07d-4504-bf55-b00359b67ce3	Cadila Pharmaceuticals	Hanna Tadesse	0113344556	info@cadila.et	Gelan	200000.00	NET_15	3	t	2026-03-12 11:26:54.762115	2026-03-12 11:26:54.762115
292b7126-fca9-4a87-a3ea-2c640310d8f0	Julphar Ethiopia	Kebede Worku	0114455667	orders@julphar.et	Addis Ababa	300000.00	NET_30	7	t	2026-03-12 11:26:54.762115	2026-03-12 11:26:54.762115
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, role, is_active, created_at, updated_at, manager_pin, branch_id) FROM stdin;
820407c9-380d-437b-8bc2-e7cb8831e452	admin	$2b$10$xXAljox1GPzoCrpR5SX1wOWDckvmjqpuWhuMjyTE0KUmd4SUSXjV6	ADMIN	t	2026-02-12 02:57:50.996201	2026-02-12 02:57:50.996201	\N	\N
987bb607-6bdb-4906-be4c-524c4cc026fd	pharmacist	$2b$10$cEL82FELEU6LwUhsyY38/eeaj5tqPrSYYcsnOyDQjLvoxpY1z5JHi	PHARMACIST	t	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N
290cda07-f939-4337-a1d3-d592282ecfb1	cashier	$2b$10$6y5GqIcEAV/O9Ui8/ofHjuj6d4YZZZc44nNL.V9WBNbL.93kugVcW	CASHIER	t	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N
f20ba115-7052-4f6d-9b4b-f0a3c777b0b5	auditor	$2b$10$3ZZX1LL5v8YK6EUGF2YwS.1kn2.HfBA77iA6glgcHV5BCRxKJdVzu	AUDITOR	t	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808	\N	\N
\.


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
-- Name: medicines UQ_5b1334d794bdf0ec82799a832f7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT "UQ_5b1334d794bdf0ec82799a832f7" UNIQUE (barcode);


--
-- Name: purchase_orders UQ_74065a5d2b8c4c14b8b8fcf0159; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "UQ_74065a5d2b8c4c14b8b8fcf0159" UNIQUE (po_number);


--
-- Name: medicines UQ_a1bfe1fe5e202bf1414e9835f34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT "UQ_a1bfe1fe5e202bf1414e9835f34" UNIQUE (sku);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


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
-- Name: sale_items FK_1b3b68db226a9c68c4acc1dafe0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "FK_1b3b68db226a9c68c4acc1dafe0" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: supplier_contracts FK_22e44813af6b8328bb21446bc96; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_contracts
    ADD CONSTRAINT "FK_22e44813af6b8328bb21446bc96" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: purchase_recommendations FK_24fce6714d45db43ca415cef37b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_recommendations
    ADD CONSTRAINT "FK_24fce6714d45db43ca415cef37b" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON DELETE CASCADE;


--
-- Name: purchase_orders FK_396e7d9c9ddef24e5af83a23316; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_396e7d9c9ddef24e5af83a23316" FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: credit_records FK_3c1d2f983fb8f9814db7d0e8722; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_records
    ADD CONSTRAINT "FK_3c1d2f983fb8f9814db7d0e8722" FOREIGN KEY (sale_id) REFERENCES public.sales(id);


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
-- Name: refunds FK_b7d1eaf9ed1c18fb9b4be69981c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "FK_b7d1eaf9ed1c18fb9b4be69981c" FOREIGN KEY (processed_by_id) REFERENCES public.users(id);


--
-- Name: audit_logs FK_bd2726fd31b35443f2245b93ba0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY (user_id) REFERENCES public.users(id);


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
-- Name: purchase_orders FK_d16a885aa88447ccfd010e739b0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_d16a885aa88447ccfd010e739b0" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


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
-- PostgreSQL database dump complete
--

