# 🧪 TESTING AUTHENTICATION - STEP BY STEP SOLUTION

## ⚠️ MASALAH YANG DITEMUKAN:

1. ✅ **Server Running** - Health check berhasil
2. ❌ **Database Organization Missing** - Data organization belum ada
3. ❌ **PowerShell JSON Escaping** - Error format JSON di PowerShell

---

## 🔧 SOLUSI LANGKAH DEMI LANGKAH:

### STEP 1: Setup Organization Data
**WAJIB dilakukan terlebih dahulu!**

Jalankan SQL berikut di PostgreSQL database `labora_db`:

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

**Cara menjalankan:**
- **Option A:** pgAdmin/DBeaver/Navicat (Recommended)
- **Option B:** Command line: `psql -U postgres -d labora_db -c "INSERT INTO..."`

### STEP 2: Test Registration (Manual)
```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d @test-register-fixed.json
```

**Expected Response (SUCCESS):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid-here",
    "name": "Dr. Test User",
    "email": "testdoctor@lab.com",
    "role": "LAB_MANAGER"
  }
}
```

**Expected Response (if organization not found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Organization not found"
}
```

### STEP 3: Test Login
```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d @test-login-fixed.json
```

### STEP 4: Test Protected Endpoints
Gunakan access token dari login response:
```bash
curl -X GET http://localhost:3000/auth/profile -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📁 FILES YANG SUDAH DIPERBAIKI:

- ✅ `test-register.json` - UUID diperbaiki ke format yang valid
- ✅ `test-login.json` - UUID disesuaikan
- ✅ `test-auth.ps1` - Error handling diperbaiki
- ✅ `setup-db.ps1` - Quick setup script untuk database

---

## 🐛 DEBUGGING YANG SUDAH DILAKUKAN:

1. **UUID Validation Issue** ✅ SOLVED
   - Problem: UUID format tidak dikenali
   - Solution: Ganti ke UUID format standard `550e8400-e29b-41d4-a716-446655440000`

2. **PowerShell JSON Escaping** ✅ IDENTIFIED
   - Problem: JSON escaping di PowerShell command line bermasalah
   - Solution: Gunakan file JSON terpisah dengan `-d @filename.json`

3. **Organization Data Missing** ⚠️ NEED ACTION
   - Problem: Database belum ada data organization
   - Solution: Jalankan SQL INSERT command di database

---

## 🎯 NEXT STEPS:

1. **Setup database organization** (CRITICAL)
2. **Test registration endpoint** 
3. **Jika registration berhasil, lanjut ke login dan protected endpoints**
4. **Jika semua test pass, authentication system READY!**

---

## 🚀 QUICK TESTING COMMANDS:

Setelah database setup:

```bash
# Test 1: Health Check
curl -X GET http://localhost:3000/auth/health

# Test 2: Registration  
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d @test-register.json

# Test 3: Login
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d @test-login.json

# Test 4: Profile (ganti TOKEN dengan hasil login)
curl -X GET http://localhost:3000/auth/profile -H "Authorization: Bearer TOKEN"
```

**🔑 Authentication system sudah LENGKAP, tinggal setup database organization data!**