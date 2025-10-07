-- lab_schema_modular_idempotent.sql
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
END$$;

-- -----------------------------------------------------------------------------
-- File: 03_functions_triggers.sql
-- Purpose: utility functions and triggers (idempotent via CREATE OR REPLACE)
-- -----------------------------------------------------------------------------
-- update_timestamp: sets updated_at on UPDATE
-- audit logger function (non-destructive, append-only)
CREATE OR REPLACE FUNCTION lab.log_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_new jsonb;
  v_old jsonb;
  v_changed_by UUID := current_setting('app.current_user', true)::UUID; -- AMBIL USER ID DARI SESSION
BEGIN
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lab.organizations ADD COLUMN IF NOT EXISTS meta JSONB;
ALTER TABLE lab.organizations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- users
CREATE TABLE IF NOT EXISTS lab.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  full_name TEXT,
  role VARCHAR(50),
  organization_id UUID REFERENCES lab.organizations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lab.users ADD COLUMN IF NOT EXISTS meta JSONB;
ALTER TABLE lab.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE lab.users ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0;
ALTER TABLE lab.users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lab.patients ADD COLUMN IF NOT EXISTS contact JSONB;
ALTER TABLE lab.patients ADD COLUMN IF NOT EXISTS identifiers JSONB;
ALTER TABLE lab.patients ADD COLUMN IF NOT EXISTS meta JSONB;
ALTER TABLE lab.patients ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- providers
CREATE TABLE IF NOT EXISTS lab.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES lab.organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  license_no VARCHAR(100),
  specialty VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lab.providers ADD COLUMN IF NOT EXISTS contact JSONB;
ALTER TABLE lab.providers ADD COLUMN IF NOT EXISTS meta JSONB;

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
  cost NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lab.tests ADD COLUMN IF NOT EXISTS meta JSONB;

CREATE TABLE IF NOT EXISTS lab.test_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Purpose: add result type and standardized codes (LOINC)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'result_data_type') THEN
    -- Define possible data types for a test result
    CREATE TYPE lab.result_data_type AS ENUM (
      'numeric', 'text', 'coded_value', 'json'
    );
  END IF;
END$$;

-- Table to store standardized codes (e.g., LOINC) for tests
CREATE TABLE IF NOT EXISTS lab.test_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES lab.tests(id) ON DELETE CASCADE,
  system VARCHAR(50) NOT NULL, -- e.g., 'LOINC', 'SNOMED'
  code VARCHAR(100) NOT NULL,
  display_name TEXT,
  PRIMARY KEY (test_id, system, code) -- Ensures uniqueness of code system per test
);

-- Alter table tests to include default result type
ALTER TABLE lab.tests ADD COLUMN IF NOT EXISTS result_data_type lab.result_data_type DEFAULT 'numeric';

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
  patient_id UUID REFERENCES lab.patients(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES lab.providers(id),
  requested_by_user UUID REFERENCES lab.users(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  clinical_history TEXT,
  priority lab.urgency DEFAULT 'routine',
  status lab.order_status DEFAULT 'requested',
  source VARCHAR(50),
  insurance JSONB,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lab.lab_orders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS ux_lab_orders_order_no_org ON lab.lab_orders (organization_id, order_no);

CREATE TABLE IF NOT EXISTS lab.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES lab.lab_orders(id) ON DELETE CASCADE,
  test_id UUID REFERENCES lab.tests(id) ON DELETE RESTRICT,
  panel_id UUID REFERENCES lab.test_panels(id) ON DELETE SET NULL,
  status lab.order_item_status DEFAULT 'requested',
  scheduled_at TIMESTAMPTZ,
  note TEXT,
  price NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- prevent duplicate same test in single order (composite unique on order_id & test_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ux_order_item_order_test'
  ) THEN
    ALTER TABLE lab.order_items ADD CONSTRAINT ux_order_item_order_test UNIQUE (order_id, test_id);
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS lab.specimens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(128) UNIQUE,
  order_item_id UUID REFERENCES lab.order_items(id) ON DELETE SET NULL,
  specimen_type_id UUID REFERENCES lab.specimen_types(id),
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
  analyzer_id UUID REFERENCES lab.users(id), -- Atau analyzer_id REFERENCES lab.equipment(id)
  
  -- Kolom Nilai
  value_text TEXT,
  value_numeric NUMERIC(18,6),
  value_json JSONB,
  
  unit_id UUID REFERENCES lab.units(id),
  reference_range TEXT,
  flag CHAR(2),
  status lab.result_status DEFAULT 'preliminary',
  comments TEXT,
  
  reported_at TIMESTAMPTZ DEFAULT now(),
  reported_by UUID REFERENCES lab.users(id),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES lab.users(id),
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_results_order_item ON lab.test_results(order_item_id);

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
  test_id UUID REFERENCES lab.tests(id) ON DELETE CASCADE,
  sex lab.gender DEFAULT 'unknown',
  age_min INT,
  age_max INT,
  age_unit VARCHAR(10) DEFAULT 'years',
  low NUMERIC(18,6),
  high NUMERIC(18,6),
  units_id UUID REFERENCES lab.units(id),
  notes TEXT
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
  invoice_id UUID REFERENCES lab.invoices(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES lab.order_items(id) ON DELETE SET NULL,
  description TEXT,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  line_total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE IF NOT EXISTS lab.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES lab.invoices(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON lab.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_specimens_order_item_id ON lab.specimens (order_item_id);
CREATE INDEX IF NOT EXISTS idx_test_results_specimen_id ON lab.test_results (specimen_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON lab.invoices (order_id);

-- GIN indexes for JSONB
CREATE INDEX IF NOT EXISTS idx_users_meta_gin ON lab.users USING gin (meta jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_patients_contact_gin ON lab.patients USING gin (contact jsonb_path_ops);

-- Full-text search sample for patients
CREATE INDEX IF NOT EXISTS idx_patients_name_tsv ON lab.patients USING gin (to_tsvector('simple', coalesce(family_name,'') || ' ' || coalesce(given_name,'')));

-- Partitioning template for lab_orders by requested_at (range). The table is created above; we convert to partitioned if not already.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'lab_orders' AND n.nspname = 'lab' AND (SELECT relkind FROM pg_class WHERE oid = c.oid) = 'p'
  ) THEN
    -- Only attempt to convert if the table is empty or small. We provide statement commented for manual activation.
    RAISE NOTICE 'lab.lab_orders is not partitioned. To enable partitioning, follow the migration steps in README.\n';
  END IF;
END$$;

-- Partition helper: create yearly partitions (example). These statements are safe to run multiple times but may be manual.
-- Example (uncomment to use after converting table to partitioned):
-- CREATE TABLE IF NOT EXISTS lab.lab_orders_y2025 PARTITION OF lab.lab_orders FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- -----------------------------------------------------------------------------
-- File: 09_triggers_attach.sql
-- Purpose: attach triggers to tables (create only if not exists)
-- -----------------------------------------------------------------------------
-- Attach update_timestamp trigger to common tables
DO $$
DECLARE
  r RECORD;
  tbls TEXT[] := ARRAY[
    'lab.users','lab.patients','lab.providers','lab.tests','lab.lab_orders',
    'lab.order_items','lab.specimens','lab.test_results','lab.invoices','lab.invoice_items'
  ];
BEGIN
  FOREACH r IN ARRAY tbls LOOP
    -- create trigger if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = ('trg_' || replace(split_part(r, '.', 2), '-', '_') || '_update_ts')) THEN
      EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION lab.update_timestamp();',
                     ('trg_' || replace(split_part(r, '.', 2), '-', '_') || '_update_ts'), r);
    END IF;
  END LOOP;
END$$;

-- Attach audit triggers to critical tables (INSERT/UPDATE/DELETE append-only)
DO $$
DECLARE
  aud_tables TEXT[] := ARRAY[
    'lab.lab_orders','lab.order_items','lab.test_results','lab.patients','lab.users'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY aud_tables LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = ('trg_audit_' || replace(split_part(t, '.', 2), '-', '_'))) THEN
      EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH ROW EXECUTE FUNCTION lab.log_changes();',
                     ('trg_audit_' || replace(split_part(t, '.', 2), '-', '_')), t);
    END IF;
  END LOOP;
END$$;

-- -----------------------------------------------------------------------------
-- File: 10_checks_and_constraints.sql
-- Purpose: useful CHECK constraints and data validation (idempotent additions)
-- -----------------------------------------------------------------------------
-- ensure age_min <= age_max in reference_ranges
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_ref_range_age_min_max') THEN
    ALTER TABLE lab.reference_ranges
      ADD CONSTRAINT chk_ref_range_age_min_max CHECK (age_min IS NULL OR age_max IS NULL OR age_min <= age_max);
  END IF;
END$$;

-- ensure price non-negative
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_item_price_nonneg') THEN
    ALTER TABLE lab.order_items ADD CONSTRAINT chk_order_item_price_nonneg CHECK (price >= 0);
  END IF;
END$$;

-- at least one of value_text / value_numeric / value_json may be present (allow multiple for complex results). If you require exactly one, adjust the constraint.
-- sample: ensure not all null
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_test_results_some_value') THEN
    ALTER TABLE lab.test_results ADD CONSTRAINT chk_test_results_some_value CHECK (
      (value_text IS NOT NULL) OR (value_numeric IS NOT NULL) OR (value_json IS NOT NULL)
    );
  END IF;
END$$;

-- ensure at least one of requested_by (provider) or requested_by_user is present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_lab_orders_requester_present') THEN
    ALTER TABLE lab.lab_orders ADD CONSTRAINT chk_lab_orders_requester_present CHECK (
      (requested_by IS NOT NULL) OR (requested_by_user IS NOT NULL) -- Order harus punya salah satu!
    );
  END IF;
END$$;

-- -----------------------------------------------------------------------------
-- File: 11_seed_data.sql
-- Purpose: seed minimal lookup data (idempotent upserts)
-- -----------------------------------------------------------------------------
-- specimen types
INSERT INTO lab.specimen_types(id, code, name)
VALUES
  ((SELECT id FROM lab.specimen_types WHERE code = 'SERUM' LIMIT 1) , 'SERUM', 'Serum')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- units
INSERT INTO lab.units (id, name, symbol)
VALUES
  ((SELECT id FROM lab.units WHERE name = 'milligram per deciliter' LIMIT 1), 'milligram per deciliter', 'mg/dL')
ON CONFLICT (name) DO UPDATE SET symbol = EXCLUDED.symbol;

-- Note: the above UPSERT pattern is intentionally simple. For richer seed data, provide CSV or dedicated seed scripts.

-- -----------------------------------------------------------------------------
-- File: 12_permissions_and_readme.sql
-- Purpose: example grants and usage notes
-- -----------------------------------------------------------------------------
-- Example: create a lab service role (do not auto-create role in environments where roles are centrally managed)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lab_service') THEN
    CREATE ROLE lab_service NOINHERIT;
  END IF;
END$$;

-- Grant minimal rights to lab_service (adjust to your security policy)
GRANT USAGE ON SCHEMA lab TO lab_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA lab TO lab_service;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA lab TO lab_service;

-- README snippet
-- To execute: run this file in order using psql or a migration tool. Example:
-- psql -v ON_ERROR_STOP=1 -f 00_extensions.sql
-- psql -v ON_ERROR_STOP=1 -f 01_schema.sql
-- ...

-- End of modular DDL
