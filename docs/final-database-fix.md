# 🔧 FINAL CORRECTED DATABASE SETUP

## 📊 SUMBER KEBENARAN: SQL SCHEMA FILE

Berdasarkan file `sql/lab_schema_modular_idempotent_v1.sql`, struktur yang BENAR adalah:

### **ORGANIZATIONS TABLE:**
```sql
CREATE TABLE IF NOT EXISTS lab.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code VARCHAR(50) UNIQUE,
  address TEXT,              -- ✅ Ada kolom address langsung
  contact JSONB,             -- ✅ Ada JSONB contact
  meta JSONB,                -- ✅ Ada JSONB meta
  is_deleted BOOLEAN DEFAULT FALSE,  -- ✅ Snake_case is_deleted
  created_at TIMESTAMPTZ DEFAULT now(), -- ✅ Snake_case created_at
  updated_at TIMESTAMPTZ DEFAULT now()  -- ✅ Snake_case updated_at
);
```

### **USERS TABLE:**
```sql
CREATE TABLE IF NOT EXISTS lab.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,     -- ✅ Ada username
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,                        -- ✅ Snake_case password_hash
  full_name TEXT,                            -- ✅ Snake_case full_name
  role VARCHAR(50),
  organization_id UUID REFERENCES lab.organizations(id), -- ✅ Snake_case
  is_active BOOLEAN DEFAULT TRUE,            -- ✅ Snake_case is_active
  meta JSONB,
  last_login_at TIMESTAMPTZ,                 -- ✅ Snake_case
  failed_login_attempts INT DEFAULT 0,       -- ✅ Snake_case
  is_deleted BOOLEAN DEFAULT FALSE,          -- ✅ Snake_case is_deleted
  created_at TIMESTAMPTZ DEFAULT now(),      -- ✅ Snake_case
  updated_at TIMESTAMPTZ DEFAULT now()       -- ✅ Snake_case
);
```

---

## ✅ SQL INSERT COMMAND YANG BENAR:

### **1. INSERT ORGANIZATION:**
```sql
INSERT INTO lab.organizations (id, name, code, address, contact, meta, is_deleted, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Lab Clinic',
  'TLC001',
  'Jl. Test No. 123, Jakarta',
  '{"phone": "+62211234567", "email": "admin@testlab.com"}',
  '{"notes": "Test organization for authentication"}',
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
```

### **2. VERIFY ORGANIZATION:**
```sql
SELECT id, name, code, address, contact, is_deleted 
FROM lab.organizations 
WHERE code = 'TLC001';
```

### **3. TEST REGISTRATION SETELAH ORG INSERT:**
```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d @test-register-fixed.json
```

---

## 📁 UPDATED TEST FILES:

### **test-register-fixed.json:**
```json
{
  "fullName": "Dr. Test User",
  "username": "testdoctor",
  "email": "testdoctor@lab.com",
  "password": "TestPassword123!",
  "confirmPassword": "TestPassword123!",
  "role": "LAB_MANAGER",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **test-login-fixed.json:**
```json
{
  "email": "testdoctor@lab.com",
  "password": "TestPassword123!",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 🎯 LANGKAH FINAL:

1. **✅ Entities sudah diperbaiki** sesuai SQL schema
2. **✅ DTOs sudah diperbaiki** sesuai struktur baru
3. **✅ Auth service sudah diperbaiki** 
4. **📝 Copy SQL organization insert di atas ke HeidiSQL**
5. **🚀 Test authentication dengan file JSON yang baru**

## 📊 CHANGES MADE:

- **Organization entity:** Sesuai SQL schema (address, contact, meta, is_deleted)
- **User entity:** Sesuai SQL schema (username, password_hash, full_name, snake_case)
- **BaseEntity:** Sesuai SQL schema (snake_case created_at, updated_at)
- **RegisterDto:** Tambah username dan fullName
- **AuthUser interface:** Ganti status menjadi isActive
- **Auth service:** Sesuai field baru

**🔑 Sekarang semua code sudah konsisten dengan SQL schema yang sudah ada!**