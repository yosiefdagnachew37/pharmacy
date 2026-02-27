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
    'SELL'
);


ALTER TYPE public.audit_logs_action_enum OWNER TO postgres;

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
-- Name: sales_payment_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sales_payment_method_enum AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'INSURANCE',
    'MOBILE_PAYMENT'
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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.batches OWNER TO postgres;

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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.medicines OWNER TO postgres;

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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sale_id uuid NOT NULL,
    medicine_id uuid NOT NULL,
    batch_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
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
    created_at timestamp without time zone DEFAULT now() NOT NULL
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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_transactions OWNER TO postgres;

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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity, entity_id, old_values, new_values, ip_address, created_at) FROM stdin;
872337cc-09d2-4146-8826-bc6109420d1b	820407c9-380d-437b-8bc2-e7cb8831e452	UPDATE	medicines	31647160-8e82-4325-bd88-238d5b6811dc	{"name":"Amoxicillin 250mg","category":"Antibiotic","unit":"Capsule"}	{"name":"Amoxicillin 250mg","generic_name":"Amoxicillin","category":"Antibiotic","unit":"Capsule","minimum_stock_level":53,"is_controlled":false}	\N	2026-02-26 00:58:31.568825
3abe91b9-aeea-494e-96e2-ffdf998a8bf2	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	medicines	15bfc12a-cdb4-4374-ac1b-33c5291d6323	{"name":"Ibuprofen 400mg"}	\N	\N	2026-02-26 00:59:04.301687
98a49ebb-123f-4dae-a73b-7e8fee5b36de	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	0b204657-ad9c-4a61-9e68-5174245e3450	\N	{"name":"Omeprazole","generic_name":"Omeprazole","category":"Anti Acid","unit":"TAB","is_controlled":true,"minimum_stock_level":47}	\N	2026-02-26 01:01:21.553553
2a46fe3e-34b4-4993-bc2b-8dbedec58cc8	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	batches	3d613881-9ef4-499f-8e2b-9e774d78b1c6	\N	{"batch_number":"BN-2026-2w3","medicine_id":"0b204657-ad9c-4a61-9e68-5174245e3450","initial_quantity":250}	\N	2026-02-26 01:03:20.812778
77326c2d-6163-499d-a173-99b7bc49a6b2	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	2a009784-b726-4789-b85c-572737885abe	\N	{"total_amount":"6.00","items_count":1}	\N	2026-02-26 01:32:41.771731
c587abc3-71e5-40dc-b382-5764c4570c77	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	27d8a3b7-495a-4504-bab6-efdd8797407d	\N	{"total_amount":"1.50","items_count":1}	\N	2026-02-26 01:38:29.082649
3db4c776-ac3b-4c77-ae61-bff546f5033c	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	c694402d-ddfa-49e2-b871-a63e9e5e9c07	\N	{"total_amount":"3.00","items_count":1}	\N	2026-02-26 01:57:15.266066
8bd8bd48-e9db-41df-b3d5-f39fb18f56cf	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	c6d884e5-3048-4a12-b47c-c9b928726d1b	\N	{"total_amount":"1.50","items_count":1}	\N	2026-02-26 02:11:34.068539
24c5d6a2-0215-4252-9a00-caf768f892b0	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	d28ed9bc-edc1-4d5f-9e58-60a84b123730	\N	{"total_amount":"1.50","items_count":1}	\N	2026-02-26 02:12:26.981236
3391cc91-60a3-4fb6-a48f-7078e730b4bd	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	8c936d4c-d7cf-408a-ac9a-65bbf1a68acf	\N	{"name":"Ominpradazonilan","generic_name":"","category":"antibiotics","unit":"TAB","is_controlled":false,"minimum_stock_level":10}	\N	2026-02-26 02:23:10.565558
39a90f71-5c25-43c8-ac5a-0c8d8597b604	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	8046f4b5-f4e7-460d-bb7d-995f53e4e37d	\N	{"name":"bbbbbb","generic_name":"tyuuuu","category":"nmnuij","unit":"TAB","is_controlled":false,"minimum_stock_level":10}	\N	2026-02-26 02:42:13.884369
4f9f92e5-0c6d-40bd-87b8-a74662463ab0	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	prescriptions	ae64b5fd-0c85-4f49-8c0d-c0779f06a33c	\N	{"patient_id":"2c76602c-eca7-4c25-a0d2-57fce3e72943","doctor_name":"Dr Yosief","items_count":1}	\N	2026-02-26 02:55:31.746711
cb46b8ac-ef4c-48d2-8eaa-975469e77326	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	patients	bbd5c074-3e23-46c3-bb14-cb7353d99429	\N	{"name":"Mebrau Lemma"}	\N	2026-02-26 03:45:58.26533
d3c2057d-edc4-4734-a56f-f17a6b7b37b3	820407c9-380d-437b-8bc2-e7cb8831e452	DELETE	patients	bbd5c074-3e23-46c3-bb14-cb7353d99429	{"name":"Mebrau Lemma"}	\N	\N	2026-02-26 03:46:41.626478
07a2985a-0dab-491f-8d02-49378459f4a4	820407c9-380d-437b-8bc2-e7cb8831e452	CREATE	medicines	a89d4771-8aa0-476c-9669-ef4f85632228	\N	{"name":"Omipraole 600mg","generic_name":"Omipraole","category":"antibiotic","unit":"TAB","is_controlled":false,"minimum_stock_level":14}	\N	2026-02-27 00:27:58.204322
8cf40ca9-97d9-47c5-98c1-931ef34cbda7	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	b924aa72-7f1a-435c-88d5-39138af5180e	\N	{"total_amount":"15.00","items_count":1}	\N	2026-02-27 00:31:51.83231
ea185b34-43ad-4bef-b419-b6f4d869c3ca	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	d1703da1-70f0-408e-a14c-1ed28c4408e2	\N	{"total_amount":"15.00","items_count":1}	\N	2026-02-27 00:31:59.846631
e827121f-a4f0-446f-af09-5ef21f66e25c	820407c9-380d-437b-8bc2-e7cb8831e452	SELL	sales	102377eb-9f6e-4c88-839f-d1d6bc97ab23	\N	{"total_amount":"52.50","items_count":2}	\N	2026-02-27 00:33:00.623395
db58f086-2e3d-4f8b-bcca-57ee592dba54	290cda07-f939-4337-a1d3-d592282ecfb1	SELL	sales	4fc0073f-7482-4906-8a65-6583ab6067bc	\N	{"total_amount":"3.50","items_count":1}	\N	2026-02-27 01:17:25.821216
e4921ba7-a9d3-41dd-85f6-72a005875d77	290cda07-f939-4337-a1d3-d592282ecfb1	CREATE	patients	87e6f352-791f-4117-acb6-827f54762224	\N	{"name":"Hiryakos Desu"}	\N	2026-02-27 01:18:41.800982
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, batch_number, medicine_id, expiry_date, purchase_price, selling_price, initial_quantity, quantity_remaining, created_at) FROM stdin;
7b014786-a344-428b-9217-47bd76ee9a4d	B-EXP-01	31647160-8e82-4325-bd88-238d5b6811dc	2026-02-27	\N	\N	100	100	2026-02-12 03:02:58.786442
1f815aac-252d-49ad-bed0-06e79ee64fd6	B-LONG-01	31647160-8e82-4325-bd88-238d5b6811dc	2028-02-12	\N	\N	1000	1000	2026-02-12 03:02:58.816693
c73f1445-4b79-4a67-84ee-1a9505030e38	B-A	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-02-22	\N	\N	50	50	2026-02-12 03:10:01.792647
f62196bc-0862-43c6-86f0-21ac19569857	B-B	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-04	\N	\N	100	100	2026-02-12 03:10:01.811789
706ca62d-649f-419d-87a9-fdbc44fc4171	AMX-2026-001	5cd30f81-e390-4ab6-96da-d48ffad951c8	2027-08-20	2.50	5.00	200	200	2026-02-19 22:32:30.074808
eae59d9c-65d0-4c2d-9b97-d4a08f1828cf	AMX-2026-002	5cd30f81-e390-4ab6-96da-d48ffad951c8	2027-02-20	2.50	5.00	150	150	2026-02-19 22:32:30.074808
8ce50289-2798-4f8c-864f-93b22f5b7df6	PCM-2026-001	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2028-02-20	0.50	1.50	500	500	2026-02-19 22:32:30.074808
9da7afb2-5553-4123-89ca-aa3eb08ff099	MET-2026-001	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2027-05-20	1.20	3.50	250	250	2026-02-19 22:32:30.074808
197db4c8-873d-48aa-8a53-07fd98143bdc	CIP-2026-001	6291d56a-efab-4620-a3cd-882f38fcf477	2027-06-20	3.00	7.00	150	150	2026-02-19 22:32:30.074808
98455d97-69d7-45fd-a9cf-0661955b2095	OMP-2026-001	d3473968-0bbd-4957-b049-4201fbe7679a	2027-04-20	1.80	4.50	200	200	2026-02-19 22:32:30.074808
0b862270-ddbe-4c60-998d-0a75183dce82	CET-2026-001	69262d94-eaf1-44af-a9a8-ff809ed4605c	2027-10-20	0.60	2.00	300	300	2026-02-19 22:32:30.074808
90ac1823-f6ea-4df9-98ff-bdbee0a3c909	AZI-2026-001	c385708f-7efb-452e-b265-44cdb2ee0feb	2026-12-20	4.00	8.50	120	120	2026-02-19 22:32:30.074808
a4ea98aa-7dfb-4c9f-adc3-06c0bd6cd0e3	MOR-2026-001	d4f891ca-62bc-4736-b6c6-b4efc17b509d	2027-02-20	15.00	25.00	30	30	2026-02-19 22:32:30.074808
9b5c2eb5-1d56-43fa-9614-383101fcfeaa	DIA-2026-001	1eeee917-9632-4f45-88f6-478488d24070	2027-08-20	5.00	12.00	50	50	2026-02-19 22:32:30.074808
47d860a9-0170-4534-a289-fe6cc8d315ba	MTZ-2026-001	11a8ad44-9fce-4f83-a892-07913f2e28dd	2027-06-20	1.50	4.00	200	200	2026-02-19 22:32:30.074808
8b0841a5-ad03-460a-b3d0-7090d27f04a6	MTZ-2024-002	11a8ad44-9fce-4f83-a892-07913f2e28dd	2026-01-20	1.50	4.00	50	50	2026-02-19 22:32:30.074808
5a2844fc-8d1f-44e3-943c-205222a589cc	LOS-2026-001	282864b6-c783-4e9c-8dd9-0a396a587cf2	2027-10-20	2.00	5.50	150	150	2026-02-19 22:32:30.074808
3d613881-9ef4-499f-8e2b-9e774d78b1c6	BN-2026-2w3	0b204657-ad9c-4a61-9e68-5174245e3450	2026-08-25	4000.00	6000.00	250	250	2026-02-26 01:03:20.768916
7542d965-94f7-4755-80ee-2d9db6fb413a	INS-2026-001	e7d43cba-f748-4e65-8a21-c83589765dfc	2026-08-20	35.00	55.00	20	14	2026-02-19 22:32:30.074808
3405105d-9a5f-4b37-98ec-73b85d2c79c0	PCM-2025-003	7712158f-3b06-4d5b-8264-5f9bd8eb1656	2026-04-20	0.50	1.50	100	87	2026-02-19 22:32:30.074808
9b3923cf-65ea-4e8b-b332-bacb92dde4ef	SAL-2026-001	a3f6eb40-5c31-4628-81eb-87ffe3051d7f	2028-02-20	8.00	15.00	40	35	2026-02-19 22:32:30.074808
ee817cc5-4207-42cf-b82f-aa55b2f1a383	AML-2026-001	191649b1-8b84-4824-96d5-7204708c38d8	2027-12-20	0.80	2.50	180	177	2026-02-19 22:32:30.074808
ec43068a-e327-435e-8718-cb18c7e88431	MET-2025-002	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	2026-05-20	1.20	3.50	80	79	2026-02-19 22:32:30.074808
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, name, generic_name, category, unit, is_controlled, minimum_stock_level, created_at, updated_at) FROM stdin;
c3c85c9f-784a-4bad-83bb-9919447899b5	Ibuprofen 400mg	\N	\N	Tablet	f	12	2026-02-12 03:10:01.720672	2026-02-18 23:03:54.94869
5cd30f81-e390-4ab6-96da-d48ffad951c8	Amoxicillin 500mg	Amoxicillin	Antibiotics	Capsule	f	50	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
7712158f-3b06-4d5b-8264-5f9bd8eb1656	Paracetamol 500mg	Acetaminophen	Painkillers	Tablet	f	100	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	Metformin 850mg	Metformin HCl	Antidiabetics	Tablet	f	60	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
6291d56a-efab-4620-a3cd-882f38fcf477	Ciprofloxacin 500mg	Ciprofloxacin	Antibiotics	Tablet	f	40	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
d3473968-0bbd-4957-b049-4201fbe7679a	Omeprazole 20mg	Omeprazole	Antacids	Capsule	f	50	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
191649b1-8b84-4824-96d5-7204708c38d8	Amlodipine 5mg	Amlodipine Besylate	Antihypertensives	Tablet	f	40	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
69262d94-eaf1-44af-a9a8-ff809ed4605c	Cetirizine 10mg	Cetirizine HCl	Antihistamines	Tablet	f	60	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
c385708f-7efb-452e-b265-44cdb2ee0feb	Azithromycin 250mg	Azithromycin	Antibiotics	Tablet	f	30	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
d4f891ca-62bc-4736-b6c6-b4efc17b509d	Morphine 10mg	Morphine Sulfate	Opioid Analgesics	Ampoule	t	10	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
1eeee917-9632-4f45-88f6-478488d24070	Diazepam 5mg	Diazepam	Anxiolytics	Tablet	t	15	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
a3f6eb40-5c31-4628-81eb-87ffe3051d7f	Salbutamol Inhaler	Salbutamol	Bronchodilators	Inhaler	f	20	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
11a8ad44-9fce-4f83-a892-07913f2e28dd	Metronidazole 400mg	Metronidazole	Antibiotics	Tablet	f	50	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
282864b6-c783-4e9c-8dd9-0a396a587cf2	Losartan 50mg	Losartan Potassium	Antihypertensives	Tablet	f	30	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
e7d43cba-f748-4e65-8a21-c83589765dfc	Insulin Glargine 100IU	Insulin Glargine	Antidiabetics	Vial	f	10	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
31647160-8e82-4325-bd88-238d5b6811dc	Amoxicillin 250mg	Amoxicillin	Antibiotic	Capsule	f	53	2026-02-12 03:02:58.535092	2026-02-26 00:58:31.521142
0b204657-ad9c-4a61-9e68-5174245e3450	Omeprazole	Omeprazole	Anti Acid	TAB	t	47	2026-02-26 01:01:21.52353	2026-02-26 01:01:21.52353
8c936d4c-d7cf-408a-ac9a-65bbf1a68acf	Ominpradazonilan		antibiotics	TAB	f	10	2026-02-26 02:23:10.52786	2026-02-26 02:23:10.52786
8046f4b5-f4e7-460d-bb7d-995f53e4e37d	bbbbbb	tyuuuu	nmnuij	TAB	f	10	2026-02-26 02:42:13.843931	2026-02-26 02:42:13.843931
a89d4771-8aa0-476c-9669-ef4f85632228	Omipraole 600mg	Omipraole	antibiotic	TAB	f	14	2026-02-27 00:27:57.789301	2026-02-27 00:27:57.789301
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, name, phone, age, gender, address, allergies, chronic_conditions, created_at, updated_at) FROM stdin;
2c76602c-eca7-4c25-a0d2-57fce3e72943	Abel Tesfaye	0912345678	30	MALE	Addis Ababa, Bole	["PenicillinAspirin"]	\N	2026-02-18 23:09:52.43903	2026-02-18 23:09:52.43903
597eed12-93a5-47ca-8a94-de9dedc2f322	Hana Mekonnen	0923456789	25	FEMALE	Addis Ababa, Piassa	["Dust","Pollen"]	\N	2026-02-18 23:11:58.278702	2026-02-18 23:11:58.278702
c5e77f78-4928-4390-8d7a-31ec17850862	Abebe Kebede	0911223344	45	MALE	Addis Ababa, Bole	["Penicillin"]	["Hypertension"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
8836f603-6842-437e-af58-ceecb0bd65bc	Fatima Ali	0922334455	32	FEMALE	Addis Ababa, Kirkos	[]	["Diabetes Type 2"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
a67930fe-1f77-4df9-8e49-4ff26891a001	Daniel Tesfaye	0933445566	28	MALE	Addis Ababa, Arada	["Sulfa drugs"]	[]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
a1881281-7d43-4c17-aa65-9ef2bb4ab0a8	Sara Mohammed	0944556677	55	FEMALE	Addis Ababa, Yeka	[]	["Asthma","Hypertension"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
a4b784da-0894-437f-8939-5420f5b589ac	Yonas Gebre	0955667788	67	MALE	Addis Ababa, Nifas Silk	["Aspirin"]	["Diabetes Type 2","Arthritis"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
9fd27ce9-7cdc-4ba5-bc2f-1d0f9e783175	Meron Hailu	0966778899	22	FEMALE	Addis Ababa, Gulele	[]	[]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
82791f9d-522f-4671-a93a-e96d3a59cc26	Tewodros Bekele	0977889900	38	MALE	Addis Ababa, Lideta	["Codeine"]	["Gastritis"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
ef4f65fe-c08a-4de9-990d-9e06a77ede21	Hana Solomon	0988990011	41	FEMALE	Addis Ababa, Kolfe Keranio	[]	["Hypothyroidism"]	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
87e6f352-791f-4117-acb6-827f54762224	Hiryakos Desu	098765421	30	MALE	Adama 	["Peanuts"]	\N	2026-02-27 01:18:41.75693	2026-02-27 01:18:41.75693
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (id, prescription_id, medicine_id, dosage, frequency, duration, quantity_dispensed) FROM stdin;
620aee38-4b6a-48eb-8457-443153b15f8f	ae64b5fd-0c85-4f49-8c0d-c0779f06a33c	191649b1-8b84-4824-96d5-7204708c38d8	2	\N	8	0
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, patient_id, doctor_name, facility, prescription_number, prescription_image_path, notes, created_at) FROM stdin;
ae64b5fd-0c85-4f49-8c0d-c0779f06a33c	2c76602c-eca7-4c25-a0d2-57fce3e72943	Dr Yosief	\N	\N	\N	\N	2026-02-26 02:55:31.627937
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, medicine_id, batch_id, quantity, unit_price, subtotal) FROM stdin;
a699c6e2-7f9c-4cf7-ae56-96f11bd79f4b	2a009784-b726-4789-b85c-572737885abe	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	4	1.50	6.00
ab6d45cc-8f54-4f16-a461-fb826a7a2156	27d8a3b7-495a-4504-bab6-efdd8797407d	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	1	1.50	1.50
cf5ab578-8281-4da1-83fc-2f09850c3628	c694402d-ddfa-49e2-b871-a63e9e5e9c07	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	2	1.50	3.00
1eb5cad2-7088-4c86-8d68-543c2f3625b0	c6d884e5-3048-4a12-b47c-c9b928726d1b	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	1	1.50	1.50
dc9a0cc3-d2c4-4ebe-baaf-c1c8e48c5d95	d28ed9bc-edc1-4d5f-9e58-60a84b123730	7712158f-3b06-4d5b-8264-5f9bd8eb1656	3405105d-9a5f-4b37-98ec-73b85d2c79c0	1	1.50	1.50
850249b9-bc92-4ce4-adf1-c9d3cbc8acdc	b924aa72-7f1a-435c-88d5-39138af5180e	a3f6eb40-5c31-4628-81eb-87ffe3051d7f	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	1	15.00	15.00
22318ac6-67fa-4bf8-8eb2-ba66d185d576	d1703da1-70f0-408e-a14c-1ed28c4408e2	a3f6eb40-5c31-4628-81eb-87ffe3051d7f	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	1	15.00	15.00
822d070e-c2ad-4c62-9bf2-ba79efda7d34	102377eb-9f6e-4c88-839f-d1d6bc97ab23	a3f6eb40-5c31-4628-81eb-87ffe3051d7f	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	3	15.00	45.00
99c7e6b1-c2ff-419a-96dd-8d2fe09d1b46	102377eb-9f6e-4c88-839f-d1d6bc97ab23	191649b1-8b84-4824-96d5-7204708c38d8	ee817cc5-4207-42cf-b82f-aa55b2f1a383	3	2.50	7.50
a88aca34-464d-4f98-95f6-b878be8310ff	4fc0073f-7482-4906-8a65-6583ab6067bc	6b9ed5b6-43da-413f-be2b-a50cb1d6a00b	ec43068a-e327-435e-8718-cb18c7e88431	1	3.50	3.50
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, receipt_number, patient_id, prescription_id, total_amount, discount, payment_method, created_by, created_at) FROM stdin;
2a009784-b726-4789-b85c-572737885abe	\N	\N	\N	6.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:32:41.303825
27d8a3b7-495a-4504-bab6-efdd8797407d	\N	\N	\N	1.50	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:38:28.617968
c694402d-ddfa-49e2-b871-a63e9e5e9c07	\N	\N	\N	3.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:57:14.728221
c6d884e5-3048-4a12-b47c-c9b928726d1b	\N	\N	\N	1.50	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 02:11:33.601522
d28ed9bc-edc1-4d5f-9e58-60a84b123730	\N	\N	\N	1.50	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 02:12:26.47675
b924aa72-7f1a-435c-88d5-39138af5180e	\N	\N	\N	15.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:31:51.38277
d1703da1-70f0-408e-a14c-1ed28c4408e2	\N	\N	\N	15.00	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:31:59.560881
102377eb-9f6e-4c88-839f-d1d6bc97ab23	\N	\N	\N	52.50	0.00	CASH	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:33:00.165323
4fc0073f-7482-4906-8a65-6583ab6067bc	\N	\N	\N	3.50	0.00	CASH	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-27 01:17:25.199985
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transactions (id, batch_id, type, quantity, reference_type, reference_id, notes, created_by, created_at) FROM stdin;
be061fa5-afbe-4bdb-891c-07a53b59808f	7542d965-94f7-4755-80ee-2d9db6fb413a	OUT	3	SALE	0e02c0fe-99b0-4d97-8fa2-61bab31885e3	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:18:27.139706
57e2096a-c3f8-40fd-ad00-9a147a6531cb	7542d965-94f7-4755-80ee-2d9db6fb413a	OUT	3	SALE	ff0e8e96-08bb-4058-9d77-add460a3d999	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:18:52.408753
59824acc-e7c1-40de-82ce-a3f4115214e1	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	4	SALE	e08c1455-f6d3-438a-84e5-115884be2fc8	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:26:02.873299
3ca9a8cc-e3aa-4658-8c56-1083b9108a86	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	4	SALE	2a009784-b726-4789-b85c-572737885abe	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:32:41.516404
66505b04-dcb1-4471-bbcd-7330c2242a81	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	1	SALE	27d8a3b7-495a-4504-bab6-efdd8797407d	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:38:28.851779
573b2f9e-e049-49b1-b6d7-f3f87be8e0f8	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	2	SALE	c694402d-ddfa-49e2-b871-a63e9e5e9c07	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 01:57:14.972648
ed59bdc0-18ad-4cd6-bcc3-657a64fb0b3c	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	1	SALE	c6d884e5-3048-4a12-b47c-c9b928726d1b	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 02:11:33.810493
e6429bc1-8106-46c9-8dae-9bc49905350d	3405105d-9a5f-4b37-98ec-73b85d2c79c0	OUT	1	SALE	d28ed9bc-edc1-4d5f-9e58-60a84b123730	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-26 02:12:26.67632
27b0d1dc-0592-4e32-9fbe-4dd9dd9cfc13	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	OUT	1	SALE	b924aa72-7f1a-435c-88d5-39138af5180e	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:31:51.656517
a8f41d4d-44cd-4d93-90cc-f8a236028dc1	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	OUT	1	SALE	d1703da1-70f0-408e-a14c-1ed28c4408e2	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:31:59.597428
cf8034f0-ac59-4638-a604-97be82920631	9b3923cf-65ea-4e8b-b332-bacb92dde4ef	OUT	3	SALE	102377eb-9f6e-4c88-839f-d1d6bc97ab23	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:33:00.394218
53cdf617-dd33-4bbc-8b4b-e0c791ab13ae	ee817cc5-4207-42cf-b82f-aa55b2f1a383	OUT	3	SALE	102377eb-9f6e-4c88-839f-d1d6bc97ab23	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-27 00:33:00.485099
edcfe365-e65f-4041-9140-9c290d08f4e4	ec43068a-e327-435e-8718-cb18c7e88431	OUT	1	SALE	4fc0073f-7482-4906-8a65-6583ab6067bc	\N	290cda07-f939-4337-a1d3-d592282ecfb1	2026-02-27 01:17:25.454046
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, role, is_active, created_at, updated_at) FROM stdin;
820407c9-380d-437b-8bc2-e7cb8831e452	admin	$2b$10$xXAljox1GPzoCrpR5SX1wOWDckvmjqpuWhuMjyTE0KUmd4SUSXjV6	ADMIN	t	2026-02-12 02:57:50.996201	2026-02-12 02:57:50.996201
987bb607-6bdb-4906-be4c-524c4cc026fd	pharmacist	$2b$10$cEL82FELEU6LwUhsyY38/eeaj5tqPrSYYcsnOyDQjLvoxpY1z5JHi	PHARMACIST	t	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
290cda07-f939-4337-a1d3-d592282ecfb1	cashier	$2b$10$6y5GqIcEAV/O9Ui8/ofHjuj6d4YZZZc44nNL.V9WBNbL.93kugVcW	CASHIER	t	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
f20ba115-7052-4f6d-9b4b-f0a3c777b0b5	auditor	$2b$10$3ZZX1LL5v8YK6EUGF2YwS.1kn2.HfBA77iA6glgcHV5BCRxKJdVzu	AUDITOR	t	2026-02-19 22:32:30.074808	2026-02-19 22:32:30.074808
\.


--
-- Name: prescriptions PK_097b2cc2f2b7e56825468188503; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT "PK_097b2cc2f2b7e56825468188503" PRIMARY KEY (id);


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
-- Name: sales PK_4f0bc990ae81dba46da680895ea; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY (id);


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
-- Name: medicines PK_77b93851766f7ab93f71f44b18b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT "PK_77b93851766f7ab93f71f44b18b" PRIMARY KEY (id);


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
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: IDX_07f8fe9649327c6cffe35c5849; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_07f8fe9649327c6cffe35c5849" ON public.medicines USING btree (name);


--
-- Name: IDX_4189d6a832feca8867fdda65e5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4189d6a832feca8867fdda65e5" ON public.batches USING btree (expiry_date);


--
-- Name: IDX_6dfe79109b2975245d622f55e8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6dfe79109b2975245d622f55e8" ON public.sales USING btree (created_at);


--
-- Name: sale_items FK_1b3b68db226a9c68c4acc1dafe0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "FK_1b3b68db226a9c68c4acc1dafe0" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: prescription_items FK_47969d67ea9e2ef9827c9f40d84; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT "FK_47969d67ea9e2ef9827c9f40d84" FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- Name: sale_items FK_6510bee02a86eca458a8572af6e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "FK_6510bee02a86eca458a8572af6e" FOREIGN KEY (batch_id) REFERENCES public.batches(id);


--
-- Name: sales FK_742b48cee8319453602e7d6fd4b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "FK_742b48cee8319453602e7d6fd4b" FOREIGN KEY (patient_id) REFERENCES public.patients(id);


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
-- Name: prescription_items FK_a603d92d4a8459db5fbe45a4aea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT "FK_a603d92d4a8459db5fbe45a4aea" FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;


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
-- Name: stock_transactions FK_ee68e055bbe7743dbed5ee62a24; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT "FK_ee68e055bbe7743dbed5ee62a24" FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

