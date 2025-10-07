# 🧪 Panduan Testing Sistem Authentication Labora

## 📋 OVERVIEW TESTING

Panduan ini akan membantu Anda melakukan testing komprehensif terhadap sistem authentication yang baru selesai dibuat.

---

## 🚀 1. PERSIAPAN TESTING

### Start Server
```bash
# Terminal 1 - Start development server
cd c:\webapps\labora_v1
npm run start:dev

# Tunggu sampai muncul:
# [Nest] xxx LOG [NestApplication] Nest application successfully started
# Server running on http://localhost:3000
```

### Tools yang Dibutuhkan
- **Postman** (Recommended) atau **Thunder Client** (VS Code Extension)
- **cURL** (Command line testing)
- **Browser** (untuk endpoint GET)

---

## 🔧 2. ENDPOINTS YANG TERSEDIA

### Public Endpoints (No Authentication Required)
```
GET  /auth/health          - Health check
POST /auth/login           - User login
POST /auth/register        - User registration
POST /auth/refresh         - Token refresh
```

### Protected Endpoints (Authentication Required)
```
GET  /auth/profile         - Get user profile
GET  /auth/verify          - Verify token
POST /auth/change-password - Change password
POST /auth/logout          - User logout
```

---

## 📝 3. TESTING STEP-BY-STEP

### Step 1: Health Check
**Test apakah server berjalan dengan baik**

**Request:**
```http
GET http://localhost:3000/auth/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication service is healthy",
  "data": {
    "service": "Authentication",
    "status": "operational",
    "timestamp": "2025-10-07T..."
  }
}
```

### Step 2: Register User Baru
**Buat user untuk testing**

**Request:**
```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Dr. Test User",
  "email": "testdoctor@lab.com",
  "password": "TestPassword123!",
  "confirmPassword": "TestPassword123!",
  "role": "LAB_MANAGER",
  "organizationId": "ORGANIZATION_ID_DARI_DATABASE",
  "phone": "+628123456789",
  "position": "Senior Lab Manager"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-uuid",
    "email": "testdoctor@lab.com",
    "name": "Dr. Test User",
    "role": "LAB_MANAGER",
    "organizationId": "org-uuid",
    "status": "active",
    "permissions": ["manage:users", "manage:tests", ...]
  }
}
```

**❗ CATATAN:** Anda perlu organization ID yang valid dari database. Lihat bagian "Setup Data Testing" di bawah.

### Step 3: Login User
**Test login dengan user yang baru dibuat**

**Request:**
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "testdoctor@lab.com",
  "password": "TestPassword123!",
  "organizationId": "ORGANIZATION_ID_DARI_DATABASE"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "user-uuid",
      "email": "testdoctor@lab.com",
      "name": "Dr. Test User",
      "role": "LAB_MANAGER",
      "organizationId": "org-uuid",
      "permissions": [...]
    }
  }
}
```

**💾 SIMPAN ACCESS TOKEN untuk testing selanjutnya!**

### Step 4: Get User Profile
**Test protected endpoint dengan token**

**Request:**
```http
GET http://localhost:3000/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user-uuid",
    "email": "testdoctor@lab.com",
    "name": "Dr. Test User",
    "role": "LAB_MANAGER",
    "organizationId": "org-uuid",
    "permissions": [...]
  }
}
```

### Step 5: Verify Token
**Test token validation**

**Request:**
```http
GET http://localhost:3000/auth/verify
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "user": {...},
    "expiresIn": 850
  }
}
```

### Step 6: Change Password
**Test password change functionality**

**Request:**
```http
POST http://localhost:3000/auth/change-password
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "TestPassword123!",
  "newPassword": "NewTestPassword456!",
  "confirmPassword": "NewTestPassword456!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Step 7: Refresh Token
**Test token refresh**

**Request:**
```http
POST http://localhost:3000/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-access-token",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

### Step 8: Logout
**Test logout functionality**

**Request:**
```http
POST http://localhost:3000/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🗃️ 4. SETUP DATA TESTING

### Buat Organization Untuk Testing
Sebelum testing registration, Anda perlu data organization di database:

```sql
-- Insert ke PostgreSQL
INSERT INTO lab.organizations (id, name, code, address, phone, email, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Test Lab Clinic',
  'TLC001',
  'Jl. Test No. 123, Jakarta',
  '+62211234567',
  'admin@testlab.com',
  'active',
  NOW(),
  NOW()
);

-- Ambil ID yang baru dibuat
SELECT id, name FROM lab.organizations WHERE code = 'TLC001';
```

**Copy ID organization ini untuk digunakan dalam testing registration dan login.**

---

## 🧪 5. TESTING DENGAN POSTMAN

### Import Collection
Buat Postman collection dengan requests berikut:

1. **Health Check**
   - Method: GET
   - URL: `{{base_url}}/auth/health`

2. **Register**
   - Method: POST
   - URL: `{{base_url}}/auth/register`
   - Body: JSON (lihat Step 2)

3. **Login**
   - Method: POST  
   - URL: `{{base_url}}/auth/login`
   - Body: JSON (lihat Step 3)
   - Tests: Set accessToken as environment variable

4. **Profile**
   - Method: GET
   - URL: `{{base_url}}/auth/profile`
   - Headers: Authorization: Bearer {{accessToken}}

5. **Change Password**
   - Method: POST
   - URL: `{{base_url}}/auth/change-password`
   - Headers: Authorization: Bearer {{accessToken}}
   - Body: JSON (lihat Step 6)

6. **Logout**
   - Method: POST
   - URL: `{{base_url}}/auth/logout`
   - Headers: Authorization: Bearer {{accessToken}}

### Environment Variables
```
base_url: http://localhost:3000
accessToken: (akan di-set otomatis dari login response)
refreshToken: (akan di-set otomatis dari login response)
organizationId: (your organization UUID)
```

---

## ⚠️ 6. TESTING ERROR SCENARIOS

### Test Invalid Login
```json
POST /auth/login
{
  "email": "wrong@email.com",
  "password": "wrongpassword"
}
```
**Expected:** 401 Unauthorized

### Test Weak Password Registration
```json
POST /auth/register
{
  "password": "123",
  "confirmPassword": "123"
}
```
**Expected:** 400 Bad Request

### Test Expired Token
Tunggu 15 menit (token expiry) kemudian test protected endpoint.
**Expected:** 401 Unauthorized

### Test Access Without Token
```http
GET /auth/profile
(No Authorization header)
```
**Expected:** 401 Unauthorized

### Test Wrong Token Format
```http
GET /auth/profile
Authorization: Bearer invalid-token
```
**Expected:** 401 Unauthorized

---

## 📊 7. TESTING CHECKLIST

### ✅ Basic Authentication
- [ ] Health check endpoint responds
- [ ] User registration works
- [ ] User login returns valid tokens
- [ ] Protected endpoints require authentication
- [ ] Token validation works correctly
- [ ] User profile retrieval works
- [ ] Password change functionality works
- [ ] Logout functionality works
- [ ] Token refresh works

### ✅ Security Testing
- [ ] Invalid credentials rejected
- [ ] Weak passwords rejected
- [ ] Expired tokens rejected
- [ ] Invalid token format rejected
- [ ] Missing authorization header rejected
- [ ] Password confirmation validation works
- [ ] Organization isolation works (if applicable)

### ✅ Error Handling
- [ ] Appropriate error messages returned
- [ ] Correct HTTP status codes
- [ ] Consistent response format
- [ ] No sensitive data leaked in errors

---

## 🎯 8. EXPECTED RESULTS

**✅ SUCCESSFUL TESTING INDICATES:**
- Authentication system is working correctly
- Security measures are in place
- All endpoints respond as expected
- Error handling is appropriate
- Token management is functional

**❌ IF TESTS FAIL:**
- Check server logs for errors
- Verify database connection
- Confirm organization data exists
- Check request format and headers
- Verify environment variables

---

## 🚀 QUICK START TESTING

**Fastest way to test:**

1. **Start server:** `npm run start:dev`
2. **Test health:** `curl http://localhost:3000/auth/health`
3. **Create organization data** (see SQL above)
4. **Test registration** with Postman/cURL
5. **Test login** and save token
6. **Test protected endpoints** with token

**Selamat testing! Sistem authentication Labora siap digunakan! 🎉**