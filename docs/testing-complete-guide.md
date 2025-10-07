# 🚀 PANDUAN LENGKAP TESTING AUTHENTICATION SYSTEM

## 📋 LANGKAH-LANGKAH TESTING

### STEP 1: Setup Database Organization Data
**WAJIB dilakukan sebelum testing!**

#### Option A: Menggunakan GUI Database Tool (Recommended)
1. Buka pgAdmin, DBeaver, atau Navicat
2. Connect ke database `labora_db`
3. Jalankan file SQL: `sql/setup-test-organization.sql`

#### Option B: Command Line (jika psql tersedia)
```bash
psql -U postgres -d labora_db -f sql/setup-test-organization.sql
```

#### Option C: Manual SQL Insert
Connect ke database dan jalankan:
```sql
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
```

### STEP 2: Pastikan Server Running
```bash
npm run start:dev
```
Server harus running di http://localhost:3000

### STEP 3: Pilih Method Testing

#### Option A: PowerShell Script (Automated)
```powershell
# Jalankan script automated testing
.\test-auth.ps1
```

#### Option B: Manual cURL Commands
Ikuti panduan di `docs/manual-curl-testing.md`

#### Option C: Thunder Client (jika punya Premium)
Import collection: `thunder-client-collection.json`

#### Option D: Postman
Import collection: `Labora-Auth-API.postman_collection.json`

---

## 🧪 TESTING SCENARIOS

### 1. Health Check
**Endpoint:** `GET /auth/health`
**Expected:** Status 200, response JSON dengan success: true

### 2. User Registration
**Endpoint:** `POST /auth/register`
**Data:** Test user dengan organization ID yang valid
**Expected:** Status 201, user berhasil dibuat

### 3. User Login
**Endpoint:** `POST /auth/login`
**Data:** Email/password yang sudah terdaftar
**Expected:** Status 200, dapat access & refresh token

### 4. Protected Endpoints (dengan token)
- **GET /auth/profile** - Dapatkan data user
- **GET /auth/verify** - Verify token masih valid
- **POST /auth/change-password** - Ubah password
- **POST /auth/logout** - Logout user

### 5. Error Testing
- Login dengan credentials salah (Expected: 401)
- Access protected endpoint tanpa token (Expected: 401)
- Access dengan token invalid (Expected: 401)

---

## 🔧 TROUBLESHOOTING

### Error: "Organization ID must be a valid UUID"
**Penyebab:** Data organization belum ada di database
**Solusi:** Jalankan setup-test-organization.sql

### Error: "Invalid credentials"
**Penyebab:** Email/password salah atau user belum terdaftar
**Solusi:** Pastikan registration berhasil dengan data yang benar

### Error: Connection refused
**Penyebab:** Server tidak running
**Solusi:** Jalankan `npm run start:dev`

### Error: PowerShell execution policy
**Penyebab:** Execution policy PowerShell terlalu restrictive
**Solusi:** 
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: JSON parsing (cURL)
**Penyebab:** Format JSON atau escaping bermasalah
**Solusi:** Gunakan file JSON terpisah dengan `-d @filename.json`

---

## 📊 EXPECTED RESULTS

### Successful Registration Response:
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

### Successful Login Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

### Profile Response:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Dr. Test User",
    "email": "testdoctor@lab.com",
    "role": "LAB_MANAGER",
    "organization": { ... }
  }
}
```

---

## ✅ TESTING CHECKLIST

- [ ] Database organization data sudah ada
- [ ] Server running di localhost:3000
- [ ] Health check responds (200 OK)
- [ ] User registration works (201 Created)
- [ ] User login returns tokens (200 OK)
- [ ] Protected endpoints require authentication
- [ ] Profile endpoint works with valid token
- [ ] Token verification works
- [ ] Password change functionality works
- [ ] Logout clears token
- [ ] Error scenarios return proper HTTP codes
- [ ] All JWT tokens have proper expiration
- [ ] Role-based access control works

**🎉 Jika semua checklist ✅, authentication system SIAP PRODUCTION!**

---

## 📂 FILES YANG DIBUAT UNTUK TESTING

1. `sql/setup-test-organization.sql` - Setup data organization
2. `test-auth.ps1` - PowerShell automated testing script
3. `test-register.json` - Test data untuk registration
4. `test-login.json` - Test data untuk login
5. `test-change-password.json` - Test data untuk change password
6. `docs/manual-curl-testing.md` - Manual cURL commands
7. `Labora-Auth-API.postman_collection.json` - Postman collection
8. `thunder-client-collection.json` - Thunder Client collection

## 🔄 NEXT STEPS SETELAH TESTING

1. **Jika semua test PASS:**
   - Authentication system siap untuk integration
   - Bisa mulai implement frontend authentication
   - Bisa mulai develop protected routes untuk lab modules

2. **Jika ada test yang FAIL:**
   - Review error messages
   - Check database connection
   - Verify organization data exists
   - Check server logs untuk detail error