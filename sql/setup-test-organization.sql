-- =====================================================
-- LABORA AUTHENTICATION TESTING - ORGANIZATION SETUP
-- =====================================================
-- File: setup-test-organization.sql
-- Purpose: Insert test organization data for authentication testing
-- Database: PostgreSQL labora_db
-- Schema: lab

-- Connect to your PostgreSQL database first, then run this script

\echo '🔧 Setting up test organization for authentication testing...'

-- 1. Insert test organization
INSERT INTO lab.organizations (
    id, 
    name, 
    code, 
    description,
    contact,
    settings,
    is_active,
    created_at, 
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Test Lab Clinic',
    'TLC001',
    'Test laboratory clinic for authentication testing',
    '{
      "phone": "+62211234567",
      "email": "admin@testlab.com",
      "address": "Jl. Sudirman No. 123, Jakarta Pusat",
      "city": "Jakarta",
      "state": "DKI Jakarta",
      "zipCode": "10250",
      "country": "Indonesia"
    }',
    '{
      "timezone": "Asia/Jakarta",
      "dateFormat": "DD/MM/YYYY",
      "currency": "IDR",
      "defaultLanguage": "id"
    }',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    contact = EXCLUDED.contact,
    settings = EXCLUDED.settings,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 2. Insert additional test organizations for more testing scenarios
INSERT INTO lab.organizations (
    id, 
    name, 
    code, 
    address, 
    phone, 
    email, 
    status, 
    created_at, 
    updated_at
) VALUES 
(
    '123e4567-e89b-12d3-a456-426614174001',
    'Labora Klinik Utama',
    'LKU001',
    'Jl. Thamrin No. 456, Jakarta Pusat, DKI Jakarta 10350',
    '+62212345678',
    'info@laboraklinik.com',
    'active',
    NOW(),
    NOW()
),
(
    '123e4567-e89b-12d3-a456-426614174002',
    'Diagnos Lab Center',
    'DLC001',
    'Jl. Gatot Subroto No. 789, Jakarta Selatan, DKI Jakarta 12190',
    '+62213456789',
    'contact@diagnoslab.com',
    'inactive',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 3. Verify the data was inserted
\echo '✅ Verifying organization data...'
SELECT 
    id,
    name,
    code,
    status,
    email
FROM lab.organizations 
WHERE code IN ('TLC001', 'LKU001', 'DLC001')
ORDER BY code;

-- 4. Show total organizations count
SELECT COUNT(*) as total_organizations FROM lab.organizations;

\echo '🎉 Test organizations setup completed!'
\echo ''
\echo '📝 Organization IDs for testing:'
\echo '   Primary Test Lab: 123e4567-e89b-12d3-a456-426614174000'
\echo '   Labora Klinik:    123e4567-e89b-12d3-a456-426614174001'  
\echo '   Diagnos Lab:      123e4567-e89b-12d3-a456-426614174002'
\echo ''
\echo '🚀 Ready for authentication testing!'