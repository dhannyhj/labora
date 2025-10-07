# 🚀 Quick Test Authentication - Labora

## SETUP CEPAT DATA TESTING

### 1. Buat Organization Sample
```sql
-- Jalankan di PostgreSQL
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
);
```

### 2. Ambil Organization ID
```sql
SELECT id, name FROM lab.organizations WHERE code = 'TLC001';
```

## QUICK TEST COMMANDS

### Test 1: Health Check
```bash
curl http://localhost:3000/auth/health
```

### Test 2: Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test User",
    "email": "testdoctor@lab.com", 
    "password": "TestPassword123!",
    "confirmPassword": "TestPassword123!",
    "role": "LAB_MANAGER",
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "phone": "+628123456789",
    "position": "Senior Lab Manager"
  }'
```

### Test 3: Login User
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdoctor@lab.com",
    "password": "TestPassword123!",
    "organizationId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**SIMPAN ACCESS TOKEN dari response untuk test selanjutnya!**

### Test 4: Get Profile (Ganti YOUR_TOKEN)
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Test 5: Verify Token (Ganti YOUR_TOKEN)
```bash
curl -X GET http://localhost:3000/auth/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## STATUS SERVER CHECK

✅ Server running: http://localhost:3000
✅ Database connected: PostgreSQL
✅ Authentication endpoints: 8 routes registered
✅ All modules loaded successfully

**READY FOR TESTING! 🎉**