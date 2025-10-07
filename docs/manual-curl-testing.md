# 🧪 Manual Testing Authentication - cURL Commands

## ⚠️ LANGKAH WAJIB SEBELUM TESTING

### 1. Setup Organization Data
**PENTING:** Sebelum testing, pastikan data organization sudah ada di database PostgreSQL.

Jalankan SQL berikut di database PostgreSQL Anda:

```sql
-- 1. Connect ke database labora_db
-- 2. Jalankan SQL ini:

INSERT INTO lab.organizations (id, name, code, address, phone, email, status, created_at, updated_at)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Lab Clinic',
  'TLC001', 
  'Jl. Test No. 123, Jakarta',
  '+62211234567',
  'admin@testlab.com',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Verify data
SELECT id, name, code FROM lab.organizations WHERE code = 'TLC001';
```

**Atau gunakan GUI database tool seperti pgAdmin, DBeaver, atau Navicat.**

### 2. Pastikan Server Running
```bash
# Pastikan server masih berjalan di terminal lain
npm run start:dev
```

---

## 🚀 TESTING COMMANDS

### Test 1: Health Check ✅
```bash
curl -X GET http://localhost:3000/auth/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication service is healthy",
  "data": { ... }
}
```

### Test 2: Register User
```bash
curl -X POST http://localhost:3000/auth/register ^
  -H "Content-Type: application/json" ^
  -d @test-register.json
```

**Atau manual (Windows CMD):**
```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d "{\"name\": \"Dr. Test User\", \"email\": \"testdoctor@lab.com\", \"password\": \"TestPassword123!\", \"confirmPassword\": \"TestPassword123!\", \"role\": \"LAB_MANAGER\", \"organizationId\": \"123e4567-e89b-12d3-a456-426614174000\", \"phone\": \"+628123456789\"}"
```

### Test 3: Login User
Buat file `test-login.json`:
```json
{
  "email": "testdoctor@lab.com",
  "password": "TestPassword123!",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000"
}
```

```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d @test-login.json
```

**🔑 SIMPAN ACCESS TOKEN dari response untuk testing selanjutnya!**

### Test 4: Get Profile (Ganti YOUR_TOKEN)
```bash
curl -X GET http://localhost:3000/auth/profile ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Test 5: Verify Token
```bash
curl -X GET http://localhost:3000/auth/verify ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Test 6: Change Password
Buat file `test-change-password.json`:
```json
{
  "currentPassword": "TestPassword123!",
  "newPassword": "NewTestPassword456!",
  "confirmPassword": "NewTestPassword456!"
}
```

```bash
curl -X POST http://localhost:3000/auth/change-password ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -d @test-change-password.json
```

### Test 7: Logout
```bash
curl -X POST http://localhost:3000/auth/logout ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🧪 ERROR TESTING

### Invalid Login
```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"wrong@email.com\", \"password\": \"wrong\"}"
```
**Expected:** 401 Unauthorized

### Access Without Token
```bash
curl -X GET http://localhost:3000/auth/profile
```
**Expected:** 401 Unauthorized

---

## 📋 TROUBLESHOOTING

### Error: "Organization ID must be a valid UUID"
- **Solusi:** Pastikan data organization sudah ada di database
- **Check:** Jalankan SQL SELECT untuk verify data

### Error: "Invalid credentials"
- **Solusi:** Pastikan email/password benar
- **Check:** User sudah terdaftar dengan data yang benar

### Error: "Connection refused"
- **Solusi:** Pastikan server running di port 3000
- **Check:** `npm run start:dev` di terminal terpisah

### Error: JSON parsing
- **Solusi:** Gunakan file JSON terpisah dengan `-d @filename.json`
- **Check:** Format JSON valid (gunakan JSON validator online)

---

## 🎯 TESTING CHECKLIST

- [ ] Health check responds (200 OK)
- [ ] Organization data exists in database
- [ ] User registration works (201 Created)
- [ ] User login returns tokens (200 OK)
- [ ] Protected endpoints require token (401 without token)
- [ ] Profile endpoint works with token (200 OK)
- [ ] Token verification works (200 OK)
- [ ] Password change works (200 OK)
- [ ] Error scenarios return appropriate codes

**✅ Jika semua test pass, authentication system siap production!**