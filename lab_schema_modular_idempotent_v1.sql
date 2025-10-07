-- lab_schema_modular_idempotent.sql (FIXED & ENHANCED VERSION)
-- Modular & idempotent PostgreSQL DDL for "Aplikasi Laboratorium Klinik"
-- Target: scalable (small -> medium, ready for large/transactional growth)
-- Run files in order; each section is idempotent and safe for repeated runs.
-- Recommended executor: psql with a migration tool (Flyway/Liquibase/Sqitch) or sequential psql runs.
-- -----------------------------------------------------------------------------
-- File: 00_extensions.sql
-- Purpose: create required extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin; -- optional but useful
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- -----------------------------------------------------------------------------
-- File: 01_schema.sql
-- Purpose: create logical schema
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS lab;

SET search_path = lab, public;

-- -----------------------------------------------------------------------------
-- File: 02_types.sql
-- Purpose: create enums and lookup types (idempotent guard)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE lab.order_status AS ENUM (
      'requested', 'collected', 'received', 'in_progress', 'completed', 'verified', 'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'specimen_status') THEN
    CREATE TYPE lab.specimen_status AS ENUM (
      'collected', 'in_transit', 'received', 'rejected', 'stored', 'consumed'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'result_status') THEN
    CREATE TYPE lab.result_status AS ENUM ('preliminary', 'final', 'amended');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency') THEN
    CREATE TYPE lab.urgency AS ENUM ('routine', 'urgent', 'stat');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
    CREATE TYPE lab.gender AS ENUM ('male','female','other','unknown');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_item_status') THEN
    CREATE TYPE lab.order_item_status AS ENUM ('requested','queued','collected','cancelled','in_progress','completed','verified');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE lab.invoice_status AS ENUM ('draft','issued','paid','partial','void');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'result_data_type') THEN
    CREATE TYPE lab.result_data_type AS ENUM (
      'numeric', 'text', 'coded_value', 'json'
    );
  END IF;
END$$;

-- -----------------------------------------------------------------------------
-- File: 03_functions_triggers.sql
-- Purpose: utility functions and triggers (idempotent via CREATE OR REPLACE)
-- -----------------------------------------------------------------------------

-- FIX: Add missing update_timestamp function
CREATE OR REPLACE FUNCTION lab.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FIX: Enhanced audit logger function with safe error handling
CREATE OR REPLACE FUNCTION lab.log_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_new jsonb;
  v_old jsonb;
  v_changed_by UUID;
BEGIN
  -- FIX: Safe extraction of current user with error handling
  BEGIN
    v_changed_by := nullif(current_setting('app.current_user', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_changed_by := NULL;
  END;

  IF TG_OP = 'DELETE' THEN
    v_old := row_to_json(OLD)::jsonb;
    INSERT INTO lab.audit_logs(entity_table, entity_id, action, changed_by, changed_at, change)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, v_changed_by, now(), jsonb_build_object('old', v_old));
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    v_new := row_to_json(NEW)::jsonb;
    INSERT INTO lab.audit_logs(entity_table, entity_id, action, changed_by, changed_at, change)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, v_changed_by, now(), jsonb_build_object('new', v_new));
    RETURN NEW;
  ELSE
    v_new := row_to_json(NEW)::jsonb;
    v_old := row_to_json(OLD)::jsonb;
    -- Hanya log jika ada perubahan data (mengabaikan perubahan pada updated_at jika ada)
    IF v_new - 'updated_at' IS DISTINCT FROM v_old - 'updated_at' THEN
      INSERT INTO lab.audit_logs(entity_table, entity_id, action, changed_by, changed_at, change)
      VALUES (TG_TABLE_NAME, NEW.id, TG_OP, v_changed_by, now(), jsonb_build_object('old', v_old, 'new', v_new));
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- helper function to set current application user in session (to be used by app)
CREATE OR REPLACE FUNCTION lab.set_app_user(p_user uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user', p_user::text, true);
END;
$$ LANGUAGE plpgsql;

-- ENHANCEMENT: Helper function to set organization context for RLS
CREATE OR REPLACE FUNCTION lab.set_app_org(p_org uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_org', p_org::text, true);
END;
$$ LANGUAGE plpgsql;

-- ENHANCEMENT: Status transition validation function
CREATE OR REPLACE FUNCTION lab.validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Cannot change from cancelled except to cancelled
  IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
    RAISE EXCEPTION 'Cannot change status from cancelled to %', NEW.status;
  END IF;
  
  -- Cannot go backwards in workflow
  IF OLD.status = 'completed' AND NEW.status IN ('requested', 'collected', 'received', 'in_progress') THEN
    RAISE EXCEPTION 'Cannot revert from completed to %', NEW.status;
  END IF;
  
  IF OLD.status = 'verified' AND NEW.status != 'verified' AND NEW.status != 'amended' THEN
    RAISE EXCEPTION 'Verified orders can only be amended, not changed to %', NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ENHANCEMENT: Helper function for age conversion
CREATE OR REPLACE FUNCTION lab.age_to_days(age INT, unit VARCHAR)
RETURNS INT AS $$
BEGIN
  RETURN CASE 
    WHEN unit = 'days' THEN age
    WHEN unit = 'weeks' THEN age * 7
    WHEN unit = 'months' THEN age * 30
    WHEN unit = 'years' THEN age * 365
    ELSE age * 365
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ENHANCEMENT: Critical value detection function
CREATE OR REPLACE FUNCTION lab.check_critical_value()
RETURNS TRIGGER AS $$
DECLARE
  v_is_critical BOOLEAN := FALSE;
  v_ref_low NUMERIC;
  v_ref_high NUMERIC;
  v_patient_gender lab.gender;
  v_patient_age_days INT;
BEGIN
  -- Only check numeric values
  IF NEW.value_numeric IS NOT NULL THEN
    -- Get patient demographics
    SELECT p.gender, 
           EXTRACT(DAYS FROM AGE(now(), p.birth_date))::INT
    INTO v_patient_gender, v_patient_age_days
    FROM lab.patients p 
    JOIN lab.lab_orders lo ON lo.patient_id = p.id
    JOIN lab.order_items oi ON oi.order_id = lo.id
    WHERE oi.id = NEW.order_item_id;
    
    -- Get applicable reference range
    SELECT low, high INTO v_ref_low, v_ref_high
    FROM lab.reference_ranges rr
    JOIN lab.order_items oi ON oi.test_id = rr.test_id
    WHERE oi.id = NEW.order_item_id
      AND (rr.sex = 'unknown' OR rr.sex = v_patient_gender)
      AND (rr.age_min_days IS NULL OR v_patient_age_days >= rr.age_min_days)
      AND (rr.age_max_days IS NULL OR v_patient_age_days <= rr.age_max_days)
    ORDER BY 
      CASE WHEN rr.sex = v_patient_gender THEN 1 ELSE 2 END,
      rr.age_min_days DESC NULLS LAST
    LIMIT 1;
    
    -- Define critical as significantly outside normal range
    IF v_ref_low IS NOT NULL AND NEW.value_numeric < v_ref_low * 0.5 THEN
      v_is_critical := TRUE;
    ELSIF v_ref_high IS NOT NULL AND NEW.value_numeric > v_ref_high * 1.5 THEN
      v_is_critical := TRUE;
    END IF;
    
    -- Auto-flag critical values
    IF v_is_critical AND NEW.flag IS NULL THEN
      NEW.flag := 'CC'; -- Critical
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- File: 04_core_tables.sql
-- Purpose: core entities (idempotent CREATE TABLE IF NOT EXISTS + ALTER IF NEEDED)
-- -----------------------------------------------------------------------------
-- organizations
CREATE TABLE IF NOT EXISTS lab.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code VARCHAR(50) UNIQUE,
  address TEXT,
  contact JSONB,
  meta JSONB,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- users
CREATE TABLE IF NOT EXISTS lab.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT, -- Must be bcrypt/argon2, never plaintext
  full_name TEXT,
  role VARCHAR(50),
  organization_id UUID REFERENCES lab.organizations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  meta JSONB,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON COLUMN lab.users.password_hash IS 'Must be bcrypt/argon2 hash, never plaintext';

-- patients
CREATE TABLE IF NOT EXISTS lab.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn VARCHAR(64) UNIQUE,
  family_name VARCHAR(200),
  given_name VARCHAR(200),
  other_names VARCHAR(200),
  gender lab.gender DEFAULT 'unknown',
  birth_date DATE,
  address TEXT,
  contact JSONB,
  identifiers JSONB,
  meta JSONB,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- providers
CREATE TABLE IF NOT EXISTS lab.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES lab.organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  license_no VARCHAR(100),
  specialty VARCHAR(100),
  contact JSONB,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- File: 05_catalogue_tables.sql
-- Purpose: specimen types, units, tests, panels
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lab.specimen_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS lab.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS lab.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name VARCHAR(100),
  description TEXT,
  specimen_type_id UUID REFERENCES lab.specimen_types(id),
  default_unit_id UUID REFERENCES lab.units(id),
  method VARCHAR(200),
  department VARCHAR(100),
  result_data_type lab.result_data_type DEFAULT 'numeric',
  cost NUMERIC(12,2) DEFAULT 0,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table to store standardized codes (e.g., LOINC) for tests
CREATE TABLE IF NOT EXISTS lab.test_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES lab.tests(id) ON DELETE CASCADE,
  system VARCHAR(50) NOT NULL, -- e.g., 'LOINC', 'SNOMED'
  code VARCHAR(100) NOT NULL,
  display_name TEXT,
  UNIQUE (test_id, system, code)
);

CREATE TABLE IF NOT EXISTS lab.test_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.panel_items (
  panel_id UUID REFERENCES lab.test_panels(id) ON DELETE CASCADE,
  test_id UUID REFERENCES lab.tests(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (panel_id, test_id)
);

-- -----------------------------------------------------------------------------
-- File: 06_orders_specimens_results.sql
-- Purpose: orders, items, specimens, results, attachments
-- -----------------------------------------------------------------------------
-- order_no sequence (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'order_no_seq') THEN
    CREATE SEQUENCE lab.order_no_seq START 100000;
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS lab.lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no BIGINT NOT NULL DEFAULT nextval('lab.order_no_seq'),
  organization_id UUID REFERENCES lab.organizations(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES lab.patients(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES lab.providers(id),
  requested_by_user UUID REFERENCES lab.users(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  clinical_history TEXT,
  priority lab.urgency DEFAULT 'routine',
  status lab.order_status DEFAULT 'requested',
  source VARCHAR(50),
  insurance JSONB,
  meta JSONB,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- FIX: Ensure at least one requester is present
  CONSTRAINT chk_lab_orders_requester_present CHECK (
    (requested_by IS NOT NULL) OR (requested_by_user IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_lab_orders_order_no_org ON lab.lab_orders (organization_id, order_no);

CREATE TABLE IF NOT EXISTS lab.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES lab.lab_orders(id) ON DELETE CASCADE,
  test_id UUID REFERENCES lab.tests(id) ON DELETE RESTRICT,
  panel_id UUID REFERENCES lab.test_panels(id) ON DELETE SET NULL,
  status lab.order_item_status DEFAULT 'requested',
  scheduled_at TIMESTAMPTZ,
  note TEXT,
  price NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- FIX: Ensure price is non-negative
  CONSTRAINT chk_order_item_price_nonneg CHECK (price >= 0)
);

-- FIX: Prevent duplicate same test in single order
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ux_order_item_order_test'
  ) THEN
    ALTER TABLE lab.order_items ADD CONSTRAINT ux_order_item_order_test UNIQUE (order_id, test_id);
  END IF;
END$$;

-- ENHANCEMENT: Worksheet/Batch table
CREATE TABLE IF NOT EXISTS lab.worksheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_no VARCHAR(50) UNIQUE,
  test_id UUID REFERENCES lab.tests(id),
  analyzer_id UUID REFERENCES lab.equipment(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  qc_passed BOOLEAN,
  reviewed_by UUID REFERENCES lab.users(id),
  comments TEXT,
  meta JSONB
);

CREATE TABLE IF NOT EXISTS lab.specimens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(128) UNIQUE,
  order_item_id UUID NOT NULL REFERENCES lab.order_items(id) ON DELETE CASCADE, -- FIX: Made NOT NULL
  specimen_type_id UUID REFERENCES lab.specimen_types(id),
  worksheet_id UUID REFERENCES lab.worksheets(id), -- ENHANCEMENT: Link to worksheet
  collected_at TIMESTAMPTZ,
  collected_by UUID REFERENCES lab.users(id),
  container VARCHAR(100),
  volume_ml NUMERIC(8,3),
  storage_location VARCHAR(200),
  status lab.specimen_status DEFAULT 'collected',
  received_at TIMESTAMPTZ,
  received_by UUID REFERENCES lab.users(id),
  rejected_reason TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES lab.order_items(id) ON DELETE CASCADE,
  specimen_id UUID REFERENCES lab.specimens(id) ON DELETE SET NULL,
  analyzer_id UUID REFERENCES lab.users(id),
  
  -- Kolom Nilai
  value_text TEXT,
  value_numeric NUMERIC(18,6),
  value_json JSONB,
  
  unit_id UUID REFERENCES lab.units(id),
  reference_range TEXT,
  flag CHAR(2), -- H=High, L=Low, HH=Critical High, LL=Critical Low, CC=Critical
  status lab.result_status DEFAULT 'preliminary',
  comments TEXT,
  
  reported_at TIMESTAMPTZ DEFAULT now(),
  reported_by UUID REFERENCES lab.users(id),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES lab.users(id),
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- FIX: At least one value must be present
  CONSTRAINT chk_test_results_some_value CHECK (
    (value_text IS NOT NULL) OR (value_numeric IS NOT NULL) OR (value_json IS NOT NULL)
  ),
  -- FIX: Must link to either order_item or specimen
  CONSTRAINT chk_test_results_linkage CHECK (
    order_item_id IS NOT NULL OR specimen_id IS NOT NULL
  ),
  -- FIX: Verified results must have verifier info
  CONSTRAINT chk_test_results_verified CHECK (
    (status != 'final' AND status != 'amended') OR 
    (verified_by IS NOT NULL AND verified_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_test_results_order_item ON lab.test_results(order_item_id);

-- ENHANCEMENT: Result interpretations table
CREATE TABLE IF NOT EXISTS lab.result_interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES lab.test_results(id) ON DELETE CASCADE,
  interpretation TEXT,
  is_critical BOOLEAN DEFAULT FALSE,
  delta_check_flag BOOLEAN DEFAULT FALSE,
  previous_value NUMERIC(18,6),
  previous_date TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  notified_to UUID REFERENCES lab.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES lab.organizations(id) ON DELETE SET NULL,
  order_id UUID REFERENCES lab.lab_orders(id) ON DELETE CASCADE,
  result_id UUID REFERENCES lab.test_results(id) ON DELETE CASCADE,
  file_name TEXT,
  file_path TEXT,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES lab.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- File: 07_reference_ranges_billing_inventory_audit.sql
-- Purpose: reference ranges, billing, inventory, audit
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lab.reference_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES lab.tests(id) ON DELETE CASCADE,
  sex lab.gender DEFAULT 'unknown',
  age_min INT,
  age_max INT,
  age_unit VARCHAR(10) DEFAULT 'years',
  age_min_days INT, -- ENHANCEMENT: Better age precision
  age_max_days INT, -- ENHANCEMENT: Better age precision
  low NUMERIC(18,6),
  high NUMERIC(18,6),
  units_id UUID REFERENCES lab.units(id),
  notes TEXT,
  -- FIX: Ensure logical age range
  CONSTRAINT chk_ref_range_age_min_max CHECK (
    age_min IS NULL OR age_max IS NULL OR age_min <= age_max
  )
);

CREATE TABLE IF NOT EXISTS lab.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no VARCHAR(100) UNIQUE,
  organization_id UUID REFERENCES lab.organizations(id),
  patient_id UUID REFERENCES lab.patients(id),
  order_id UUID REFERENCES lab.lab_orders(id),
  billed_at TIMESTAMPTZ DEFAULT now(),
  due_at TIMESTAMPTZ,
  status lab.invoice_status DEFAULT 'issued',
  total_amount NUMERIC(12,2) DEFAULT 0,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES lab.invoices(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES lab.order_items(id) ON DELETE SET NULL,
  description TEXT,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  line_total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE IF NOT EXISTS lab.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES lab.invoices(id) ON DELETE CASCADE,
  paid_at TIMESTAMPTZ DEFAULT now(),
  amount NUMERIC(12,2) NOT NULL,
  method VARCHAR(50),
  meta JSONB
);

CREATE TABLE IF NOT EXISTS lab.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES lab.organizations(id),
  name TEXT,
  model TEXT,
  serial_no TEXT,
  location TEXT,
  last_service_at TIMESTAMPTZ,
  meta JSONB
);

CREATE TABLE IF NOT EXISTS lab.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES lab.organizations(id),
  sku VARCHAR(100) UNIQUE,
  name TEXT,
  quantity NUMERIC(12,3) DEFAULT 0,
  unit VARCHAR(50),
  expiry_date DATE,
  meta JSONB
);

-- ENHANCEMENT: Quality Control table
CREATE TABLE IF NOT EXISTS lab.qc_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES lab.tests(id),
  control_lot VARCHAR(50),
  control_level VARCHAR(20),
  measured_value NUMERIC(18,6),
  expected_mean NUMERIC(18,6),
  expected_sd NUMERIC(18,6),
  z_score NUMERIC(8,3) GENERATED ALWAYS AS (
    CASE 
      WHEN expected_sd > 0 THEN (measured_value - expected_mean) / expected_sd
      ELSE NULL
    END
  ) STORED,
  in_control BOOLEAN,
  measured_at TIMESTAMPTZ DEFAULT now(),
  measured_by UUID REFERENCES lab.users(id),
  comments TEXT,
  meta JSONB
);

CREATE TABLE IF NOT EXISTS lab.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_table TEXT NOT NULL,
  entity_id UUID,
  action VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES lab.users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  change JSONB
);

-- -----------------------------------------------------------------------------
-- File: 08_indexes_and_partitions.sql
-- Purpose: additional indexes, partitioning templates, maintenance helpers
-- -----------------------------------------------------------------------------
-- Common useful indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient_id ON lab.lab_orders (patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status_priority ON lab.lab_orders (status, priority);
CREATE INDEX IF NOT EXISTS idx_lab_orders_requested_at ON lab.lab_orders (requested_at DESC); -- FIX: Added
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON lab.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON lab.order_items (status); -- FIX: Added
CREATE INDEX IF NOT EXISTS idx_specimens_order_item_id ON lab.specimens (order_item_id);
CREATE INDEX IF NOT EXISTS idx_specimens_collected_at ON lab.specimens (collected_at DESC); -- FIX: Added
CREATE INDEX IF NOT EXISTS idx_specimens_worksheet ON lab.specimens (worksheet_id); -- ENHANCEMENT
CREATE INDEX IF NOT EXISTS idx_test_results_specimen_id ON lab.test_results (specimen_id);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON lab.test_results (status); -- FIX: Added
CREATE INDEX IF NOT EXISTS idx_test_results_reported_at ON lab.test_results (reported_at DESC); -- FIX: Added
CREATE INDEX IF NOT EXISTS idx_result_interp_result ON lab.result_interpretations (result_id); -- ENHANCEMENT
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON lab.invoices (order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON lab.invoices (status); -- FIX: Added
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON lab.audit_logs (entity_table, entity_id); -- FIX: Added
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON lab.audit_logs (changed_at DESC); -- FIX: Added
CREATE INDEX IF NOT EXISTS idx_qc_results_test_date ON lab.qc_results (test_id, measured_at DESC); -- ENHANCEMENT

-- GIN indexes for JSONB
CREATE INDEX IF NOT EXISTS idx_users_meta_gin ON lab.users USING gin (meta jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_patients_contact_gin ON lab.patients USING gin (contact jsonb_path_ops);

-- Full-text search sample for patients
CREATE INDEX IF NOT EXISTS idx_patients_name_tsv ON lab.patients USING gin (to_tsvector('simple', coalesce(family_name,'') || ' ' || coalesce(given_name,'')));

-- Partitioning note for future scaling
COMMENT ON TABLE lab.audit_logs IS 'Consider partitioning by changed_at (monthly) when data grows beyond 10M rows';
COMMENT ON TABLE lab.lab_orders IS 'Consider partitioning by requested_at (yearly) when data grows beyond 5M rows';

-- -----------------------------------------------------------------------------
-- File: 09_triggers_attach.sql
-- Purpose: attach triggers to tables (create only if not exists)
-- -----------------------------------------------------------------------------
-- Attach update_timestamp trigger to common tables
DO $$
DECLARE
  tbls TEXT[] := ARRAY[
    'lab.users','lab.patients','lab.providers','lab.tests','lab.lab_orders',
    'lab.order_items','lab.specimens','lab.test_results','lab.invoices','lab.invoice_items'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = ('trg_' || replace(split_part(t, '.', 2), '-', '_') || '_update_ts')
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION lab.update_timestamp()',
        ('trg_' || replace(split_part(t, '.', 2), '-', '_') || '_update_ts'), 
        t
      );
    END IF;
  END LOOP;
END$$;

-- Attach audit triggers to critical tables
DO $$
DECLARE
  aud_tables TEXT[] := ARRAY[
    'lab.lab_orders','lab.order_items','lab.test_results','lab.patients','lab.users'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY aud_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = ('trg_audit_' || replace(split_part(t, '.', 2), '-', '_'))
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH ROW EXECUTE FUNCTION lab.log_changes()',
        ('trg_audit_' || replace(split_part(t, '.', 2), '-', '_')), 
        t
      );
    END IF;
  END LOOP;
END$$;

-- ENHANCEMENT: Attach status transition validation trigger
DROP TRIGGER IF EXISTS trg_validate_order_status ON lab.lab_orders;
CREATE TRIGGER trg_validate_order_status
  BEFORE UPDATE OF status ON lab.lab_orders
  FOR EACH ROW
  EXECUTE FUNCTION lab.validate_order_status_transition();

-- ENHANCEMENT: Attach critical value detection trigger
DROP TRIGGER IF EXISTS trg_check_critical_value ON lab.test_results;
CREATE TRIGGER trg_check_critical_value
  BEFORE INSERT OR UPDATE OF value_numeric ON lab.test_results
  FOR EACH ROW
  WHEN (NEW.value_numeric IS NOT NULL)
  EXECUTE FUNCTION lab.check_critical_value();

-- -----------------------------------------------------------------------------
-- File: 10_views.sql
-- Purpose: useful views for common queries
-- -----------------------------------------------------------------------------

-- View: Complete order details with patient info
CREATE OR REPLACE VIEW lab.v_order_summary AS
SELECT 
  o.id as order_id,
  o.order_no,
  o.requested_at,
  o.status as order_status,
  o.priority,
  p.mrn,
  p.given_name || ' ' || p.family_name as patient_name,
  p.gender,
  p.birth_date,
  EXTRACT(YEAR FROM AGE(now(), p.birth_date))::INT as patient_age_years,
  pr.name as provider_name,
  org.name as organization_name,
  COUNT(DISTINCT oi.id) as total_tests,
  COUNT(DISTINCT CASE WHEN oi.status = 'completed' THEN oi.id END) as completed_tests,
  COUNT(DISTINCT CASE WHEN oi.status = 'verified' THEN oi.id END) as verified_tests
FROM lab.lab_orders o
JOIN lab.patients p ON p.id = o.patient_id
LEFT JOIN lab.providers pr ON pr.id = o.requested_by
LEFT JOIN lab.organizations org ON org.id = o.organization_id
LEFT JOIN lab.order_items oi ON oi.order_id = o.id
WHERE o.is_deleted = FALSE
GROUP BY o.id, p.id, pr.name, org.name;

-- View: Pending results requiring verification
CREATE OR REPLACE VIEW lab.v_pending_verification AS
SELECT 
  tr.id as result_id,
  o.order_no,
  o.priority,
  p.mrn,
  p.given_name || ' ' || p.family_name as patient_name,
  t.name as test_name,
  t.code as test_code,
  tr.value_numeric,
  tr.value_text,
  tr.flag,
  tr.reported_at,
  tr.status,
  u.full_name as reported_by_name,
  EXTRACT(EPOCH FROM (now() - tr.reported_at))/3600 as hours_pending
FROM lab.test_results tr
JOIN lab.order_items oi ON oi.id = tr.order_item_id
JOIN lab.lab_orders o ON o.id = oi.order_id
JOIN lab.patients p ON p.id = o.patient_id
JOIN lab.tests t ON t.id = oi.test_id
LEFT JOIN lab.users u ON u.id = tr.reported_by
WHERE tr.status = 'preliminary'
  AND tr.verified_by IS NULL
ORDER BY 
  CASE o.priority 
    WHEN 'stat' THEN 1 
    WHEN 'urgent' THEN 2 
    ELSE 3 
  END,
  tr.reported_at ASC;

-- View: Critical results requiring notification
CREATE OR REPLACE VIEW lab.v_critical_results AS
SELECT 
  tr.id as result_id,
  o.order_no,
  o.priority,
  p.mrn,
  p.given_name || ' ' || p.family_name as patient_name,
  p.contact,
  t.name as test_name,
  tr.value_numeric,
  tr.value_text,
  tr.flag,
  tr.reference_range,
  ri.interpretation,
  ri.notified_at,
  ri.notified_to,
  tr.reported_at,
  pr.name as ordering_provider,
  pr.contact as provider_contact
FROM lab.test_results tr
JOIN lab.result_interpretations ri ON ri.result_id = tr.id
JOIN lab.order_items oi ON oi.id = tr.order_item_id
JOIN lab.lab_orders o ON o.id = oi.order_id
JOIN lab.patients p ON p.id = o.patient_id
JOIN lab.tests t ON t.id = oi.test_id
LEFT JOIN lab.providers pr ON pr.id = o.requested_by
WHERE ri.is_critical = TRUE
  AND ri.notified_at IS NULL
ORDER BY tr.reported_at ASC;

-- View: Daily workload statistics
CREATE OR REPLACE VIEW lab.v_daily_workload AS
SELECT 
  DATE(o.requested_at) as order_date,
  o.organization_id,
  org.name as organization_name,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT oi.id) as total_tests,
  COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
  COUNT(DISTINCT CASE WHEN oi.status = 'verified' THEN oi.id END) as verified_tests,
  COUNT(DISTINCT CASE WHEN o.priority = 'stat' THEN o.id END) as stat_orders,
  COUNT(DISTINCT CASE WHEN o.priority = 'urgent' THEN o.id END) as urgent_orders,
  AVG(EXTRACT(EPOCH FROM (o.updated_at - o.requested_at))/3600)::NUMERIC(10,2) as avg_tat_hours
FROM lab.lab_orders o
LEFT JOIN lab.organizations org ON org.id = o.organization_id
LEFT JOIN lab.order_items oi ON oi.order_id = o.id
WHERE o.is_deleted = FALSE
  AND o.requested_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(o.requested_at), o.organization_id, org.name
ORDER BY order_date DESC;

-- View: QC status summary
CREATE OR REPLACE VIEW lab.v_qc_summary AS
SELECT 
  t.id as test_id,
  t.code as test_code,
  t.name as test_name,
  qc.control_level,
  COUNT(*) as total_measurements,
  AVG(qc.z_score) as avg_z_score,
  STDDEV(qc.z_score) as stddev_z_score,
  COUNT(CASE WHEN qc.in_control = TRUE THEN 1 END) as in_control_count,
  COUNT(CASE WHEN qc.in_control = FALSE THEN 1 END) as out_of_control_count,
  MAX(qc.measured_at) as last_measured_at
FROM lab.qc_results qc
JOIN lab.tests t ON t.id = qc.test_id
WHERE qc.measured_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY t.id, t.code, t.name, qc.control_level
ORDER BY t.code, qc.control_level;

-- -----------------------------------------------------------------------------
-- File: 11_rls_policies.sql
-- Purpose: Row Level Security for multi-tenant isolation
-- -----------------------------------------------------------------------------

-- Enable RLS on key tables
ALTER TABLE lab.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Organization isolation for orders
CREATE POLICY org_isolation_orders ON lab.lab_orders
  FOR ALL
  USING (
    organization_id = nullif(current_setting('app.current_org', true), '')::UUID
    OR current_setting('app.bypass_rls', true) = 'true'
  );

-- Policy: Organization isolation for patients (via orders)
CREATE POLICY org_isolation_patients ON lab.patients
  FOR ALL
  USING (
    id IN (
      SELECT DISTINCT patient_id 
      FROM lab.lab_orders 
      WHERE organization_id = nullif(current_setting('app.current_org', true), '')::UUID
    )
    OR current_setting('app.bypass_rls', true) = 'true'
  );

-- Policy: Organization isolation for order items (via orders)
CREATE POLICY org_isolation_order_items ON lab.order_items
  FOR ALL
  USING (
    order_id IN (
      SELECT id FROM lab.lab_orders 
      WHERE organization_id = nullif(current_setting('app.current_org', true), '')::UUID
    )
    OR current_setting('app.bypass_rls', true) = 'true'
  );

-- Policy: Organization isolation for test results (via order items)
CREATE POLICY org_isolation_test_results ON lab.test_results
  FOR ALL
  USING (
    order_item_id IN (
      SELECT oi.id FROM lab.order_items oi
      JOIN lab.lab_orders o ON o.id = oi.order_id
      WHERE o.organization_id = nullif(current_setting('app.current_org', true), '')::UUID
    )
    OR current_setting('app.bypass_rls', true) = 'true'
  );

-- Policy: Organization isolation for invoices
CREATE POLICY org_isolation_invoices ON lab.invoices
  FOR ALL
  USING (
    organization_id = nullif(current_setting('app.current_org', true), '')::UUID
    OR current_setting('app.bypass_rls', true) = 'true'
  );

-- -----------------------------------------------------------------------------
-- File: 12_seed_data.sql
-- Purpose: seed minimal lookup data (idempotent upserts)
-- -----------------------------------------------------------------------------

-- Specimen types
INSERT INTO lab.specimen_types(code, name, description)
VALUES
  ('SERUM', 'Serum', 'Blood serum specimen'),
  ('PLASMA', 'Plasma', 'Blood plasma specimen'),
  ('WHOLE_BLOOD', 'Whole Blood', 'Whole blood specimen'),
  ('URINE', 'Urine', 'Urine specimen'),
  ('CSF', 'Cerebrospinal Fluid', 'CSF specimen'),
  ('STOOL', 'Stool', 'Fecal specimen')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Common units
INSERT INTO lab.units (name, symbol)
VALUES
  ('milligram per deciliter', 'mg/dL'),
  ('gram per deciliter', 'g/dL'),
  ('millimole per liter', 'mmol/L'),
  ('micromole per liter', 'µmol/L'),
  ('international units per liter', 'IU/L'),
  ('cells per microliter', 'cells/µL'),
  ('percent', '%'),
  ('millimeter per hour', 'mm/hr'),
  ('picogram', 'pg'),
  ('femtoliter', 'fL')
ON CONFLICT (name) DO UPDATE SET symbol = EXCLUDED.symbol;

-- Sample tests (basic hematology panel)
INSERT INTO lab.tests (code, name, short_name, department, result_data_type, cost)
VALUES
  ('CBC-WBC', 'White Blood Cell Count', 'WBC', 'Hematology', 'numeric', 50.00),
  ('CBC-RBC', 'Red Blood Cell Count', 'RBC', 'Hematology', 'numeric', 50.00),
  ('CBC-HGB', 'Hemoglobin', 'HGB', 'Hematology', 'numeric', 50.00),
  ('CBC-HCT', 'Hematocrit', 'HCT', 'Hematology', 'numeric', 50.00),
  ('CBC-PLT', 'Platelet Count', 'PLT', 'Hematology', 'numeric', 50.00),
  ('GLUC-FAST', 'Fasting Blood Glucose', 'FBS', 'Chemistry', 'numeric', 30.00),
  ('HBA1C', 'Hemoglobin A1c', 'HbA1c', 'Chemistry', 'numeric', 150.00)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  cost = EXCLUDED.cost;

-- Sample reference ranges
DO $
DECLARE
  v_wbc_id UUID;
  v_hgb_id UUID;
  v_glucose_id UUID;
  v_cells_ul UUID;
  v_g_dl UUID;
  v_mg_dl UUID;
BEGIN
  -- Get test IDs
  SELECT id INTO v_wbc_id FROM lab.tests WHERE code = 'CBC-WBC';
  SELECT id INTO v_hgb_id FROM lab.tests WHERE code = 'CBC-HGB';
  SELECT id INTO v_glucose_id FROM lab.tests WHERE code = 'GLUC-FAST';
  
  -- Get unit IDs
  SELECT id INTO v_cells_ul FROM lab.units WHERE symbol = 'cells/µL';
  SELECT id INTO v_g_dl FROM lab.units WHERE symbol = 'g/dL';
  SELECT id INTO v_mg_dl FROM lab.units WHERE symbol = 'mg/dL';
  
  -- Insert reference ranges
  INSERT INTO lab.reference_ranges (test_id, sex, age_min, age_max, age_unit, low, high, units_id, notes)
  VALUES
    (v_wbc_id, 'unknown', 18, NULL, 'years', 4000, 11000, v_cells_ul, 'Adult reference range'),
    (v_hgb_id, 'male', 18, NULL, 'years', 13.5, 17.5, v_g_dl, 'Adult male'),
    (v_hgb_id, 'female', 18, NULL, 'years', 12.0, 16.0, v_g_dl, 'Adult female'),
    (v_glucose_id, 'unknown', 18, NULL, 'years', 70, 100, v_mg_dl, 'Fasting glucose - normal')
  ON CONFLICT DO NOTHING;
END$;

-- -----------------------------------------------------------------------------
-- File: 13_permissions.sql
-- Purpose: example grants and usage notes
-- -----------------------------------------------------------------------------

-- Create service roles (only if they don't exist)
DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lab_service') THEN
    CREATE ROLE lab_service NOINHERIT LOGIN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lab_readonly') THEN
    CREATE ROLE lab_readonly NOINHERIT LOGIN;
  END IF;
END$;

-- Grant minimal rights to lab_service (full access)
GRANT USAGE ON SCHEMA lab TO lab_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA lab TO lab_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA lab TO lab_service;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA lab TO lab_service;

-- Grant read-only access
GRANT USAGE ON SCHEMA lab TO lab_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA lab TO lab_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA lab TO lab_readonly;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA lab GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO lab_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA lab GRANT USAGE, SELECT ON SEQUENCES TO lab_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA lab GRANT SELECT ON TABLES TO lab_readonly;

-- -----------------------------------------------------------------------------
-- File: 14_comments_documentation.sql
-- Purpose: comprehensive documentation
-- -----------------------------------------------------------------------------

COMMENT ON SCHEMA lab IS 'Clinical Laboratory Information System - Production Ready Schema with Audit, QC, Multi-tenant Support, and RLS';

-- Table comments
COMMENT ON TABLE lab.organizations IS 'Healthcare organizations/facilities running lab services';
COMMENT ON TABLE lab.users IS 'System users (lab staff, doctors, admin). Password must be hashed with bcrypt/argon2';
COMMENT ON TABLE lab.patients IS 'Patient demographics and identifiers';
COMMENT ON TABLE lab.providers IS 'Healthcare providers (doctors) who order tests';
COMMENT ON TABLE lab.specimen_types IS 'Lookup table for specimen types (blood, urine, etc)';
COMMENT ON TABLE lab.units IS 'Measurement units for test results';
COMMENT ON TABLE lab.tests IS 'Laboratory test catalog with pricing';
COMMENT ON TABLE lab.test_codes IS 'Standardized codes (LOINC, SNOMED) for interoperability';
COMMENT ON TABLE lab.test_panels IS 'Groups of tests ordered together (e.g., Lipid Panel)';
COMMENT ON TABLE lab.panel_items IS 'Many-to-many relationship between panels and tests';
COMMENT ON TABLE lab.lab_orders IS 'Lab test orders/requisitions from providers';
COMMENT ON TABLE lab.order_items IS 'Individual tests within an order';
COMMENT ON TABLE lab.worksheets IS 'Batch processing groups for efficient workflow';
COMMENT ON TABLE lab.specimens IS 'Physical specimens collected from patients';
COMMENT ON TABLE lab.test_results IS 'Laboratory test results with multiple value types';
COMMENT ON TABLE lab.result_interpretations IS 'Clinical interpretations, critical flags, delta checks';
COMMENT ON TABLE lab.attachments IS 'File attachments (PDFs, images) linked to orders/results';
COMMENT ON TABLE lab.reference_ranges IS 'Normal ranges by age, sex for result interpretation';
COMMENT ON TABLE lab.invoices IS 'Billing invoices for lab services';
COMMENT ON TABLE lab.invoice_items IS 'Line items on invoices';
COMMENT ON TABLE lab.payments IS 'Payment records against invoices';
COMMENT ON TABLE lab.equipment IS 'Lab equipment/analyzers inventory';
COMMENT ON TABLE lab.inventory_items IS 'Lab supplies and reagents inventory';
COMMENT ON TABLE lab.qc_results IS 'Quality control measurements for test accuracy validation';
COMMENT ON TABLE lab.audit_logs IS 'Comprehensive audit trail of all data changes (consider partitioning by month)';

-- Function comments
COMMENT ON FUNCTION lab.update_timestamp() IS 'Automatically updates updated_at column on row modification';
COMMENT ON FUNCTION lab.log_changes() IS 'Audit trigger function that logs all INSERT/UPDATE/DELETE operations';
COMMENT ON FUNCTION lab.set_app_user(uuid) IS 'Set current application user for audit trail (call at session start)';
COMMENT ON FUNCTION lab.set_app_org(uuid) IS 'Set current organization for RLS policies (call at session start)';
COMMENT ON FUNCTION lab.validate_order_status_transition() IS 'Enforces valid state machine transitions for order status';
COMMENT ON FUNCTION lab.check_critical_value() IS 'Auto-detects and flags critical test results';
COMMENT ON FUNCTION lab.age_to_days(int, varchar) IS 'Converts age in various units to days for reference range matching';

-- View comments
COMMENT ON VIEW lab.v_order_summary IS 'Complete order overview with patient info and test completion status';
COMMENT ON VIEW lab.v_pending_verification IS 'Results awaiting verification, prioritized by urgency and age';
COMMENT ON VIEW lab.v_critical_results IS 'Critical results requiring immediate provider notification';
COMMENT ON VIEW lab.v_daily_workload IS 'Daily statistics for workload monitoring and KPIs';
COMMENT ON VIEW lab.v_qc_summary IS 'Quality control performance summary for test validation';

-- -----------------------------------------------------------------------------
-- USAGE INSTRUCTIONS
-- -----------------------------------------------------------------------------

-- To execute this schema:
-- 1. Create database: createdb labdb
-- 2. Run schema: psql -d labdb -f lab_schema_modular_idempotent_FIXED.sql
-- 3. Verify: psql -d labdb -c "\dt lab.*"

-- Application usage pattern:
/*
-- At session start, set context:
SELECT lab.set_app_user('a1b2c3d4-...'::uuid);  -- Current user ID
SELECT lab.set_app_org('e5f6g7h8-...'::uuid);   -- Current organization ID

-- For admin operations bypassing RLS:
SET app.bypass_rls = 'true';

-- Example: Create order
INSERT INTO lab.lab_orders (patient_id, requested_by, priority)
VALUES ('patient-uuid', 'provider-uuid', 'routine')
RETURNING id;

-- Example: Add test to order
INSERT INTO lab.order_items (order_id, test_id, price)
SELECT 'order-uuid', id, cost FROM lab.tests WHERE code = 'CBC-WBC';

-- Example: Enter result
INSERT INTO lab.test_results (order_item_id, value_numeric, unit_id, status, reported_by)
VALUES ('order-item-uuid', 8500, 'unit-uuid', 'preliminary', 'user-uuid');

-- Critical values will be auto-flagged by trigger
-- Status transitions are validated automatically
-- All changes are logged in audit_logs
*/

-- Maintenance tasks:
/*
-- Monitor audit log size:
SELECT 
  pg_size_pretty(pg_total_relation_size('lab.audit_logs')) as size,
  count(*) as row_count
FROM lab.audit_logs;

-- Partition audit_logs when > 10M rows (see commented template in triggers section)

-- Archive old audit logs (example: keep last 2 years)
DELETE FROM lab.audit_logs WHERE changed_at < now() - INTERVAL '2 years';

-- Monitor QC failures:
SELECT * FROM lab.v_qc_summary WHERE out_of_control_count > 0;

-- Check pending verifications:
SELECT * FROM lab.v_pending_verification WHERE hours_pending > 24;
*/

-- -----------------------------------------------------------------------------
-- END OF SCHEMA
-- -----------------------------------------------------------------------------