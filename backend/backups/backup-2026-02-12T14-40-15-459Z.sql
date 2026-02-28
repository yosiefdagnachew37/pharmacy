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
    frequency character varying NOT NULL,
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
    doctor_name character varying NOT NULL,
    facility character varying NOT NULL,
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
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity, entity_id, old_values, new_values, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, batch_number, medicine_id, expiry_date, purchase_price, selling_price, initial_quantity, quantity_remaining, created_at) FROM stdin;
7b014786-a344-428b-9217-47bd76ee9a4d	B-EXP-01	31647160-8e82-4325-bd88-238d5b6811dc	2026-02-27	\N	\N	100	100	2026-02-12 03:02:58.786442
1f815aac-252d-49ad-bed0-06e79ee64fd6	B-LONG-01	31647160-8e82-4325-bd88-238d5b6811dc	2028-02-12	\N	\N	1000	1000	2026-02-12 03:02:58.816693
c73f1445-4b79-4a67-84ee-1a9505030e38	B-A	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-02-22	\N	\N	50	50	2026-02-12 03:10:01.792647
f62196bc-0862-43c6-86f0-21ac19569857	B-B	c3c85c9f-784a-4bad-83bb-9919447899b5	2026-03-04	\N	\N	100	100	2026-02-12 03:10:01.811789
9e22136e-e6e1-4886-b6f6-f9480268860b	B-A	15bfc12a-cdb4-4374-ac1b-33c5291d6323	2026-02-22	\N	\N	50	0	2026-02-12 03:20:50.777855
48564e2a-0cbc-4a8b-bc87-84fd3bd69c85	B-B	15bfc12a-cdb4-4374-ac1b-33c5291d6323	2026-03-04	\N	\N	100	80	2026-02-12 03:20:50.799962
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, name, generic_name, category, unit, is_controlled, minimum_stock_level, created_at, updated_at) FROM stdin;
31647160-8e82-4325-bd88-238d5b6811dc	Amoxicillin 250mg	Amoxicillin	Antibiotic	Capsule	f	50	2026-02-12 03:02:58.535092	2026-02-12 03:02:58.535092
c3c85c9f-784a-4bad-83bb-9919447899b5	Ibuprofen 400mg	\N	\N	Tablet	f	10	2026-02-12 03:10:01.720672	2026-02-12 03:10:01.720672
15bfc12a-cdb4-4374-ac1b-33c5291d6323	Ibuprofen 400mg	\N	\N	Tablet	f	10	2026-02-12 03:20:50.61231	2026-02-12 03:20:50.61231
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, name, phone, age, gender, address, allergies, chronic_conditions, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (id, prescription_id, medicine_id, dosage, frequency, duration, quantity_dispensed) FROM stdin;
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, patient_id, doctor_name, facility, prescription_number, prescription_image_path, notes, created_at) FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, medicine_id, batch_id, quantity, unit_price, subtotal) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, receipt_number, patient_id, prescription_id, total_amount, discount, payment_method, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transactions (id, batch_id, type, quantity, reference_type, reference_id, notes, created_by, created_at) FROM stdin;
43e69de8-3550-446c-b4df-7d0f0dac480d	9e22136e-e6e1-4886-b6f6-f9480268860b	OUT	50	TEST	TEST-1770895250816	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-12 03:20:50.817284
bbee6c95-8d9c-45be-ac63-b3985d02c464	48564e2a-0cbc-4a8b-bc87-84fd3bd69c85	OUT	20	TEST	TEST-1770895250816	\N	820407c9-380d-437b-8bc2-e7cb8831e452	2026-02-12 03:20:50.817284
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, role, is_active, created_at, updated_at) FROM stdin;
820407c9-380d-437b-8bc2-e7cb8831e452	admin	$2b$10$xXAljox1GPzoCrpR5SX1wOWDckvmjqpuWhuMjyTE0KUmd4SUSXjV6	ADMIN	t	2026-02-12 02:57:50.996201	2026-02-12 02:57:50.996201
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

