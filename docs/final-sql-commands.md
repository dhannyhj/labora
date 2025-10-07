# 🔧 FINAL CORRECTED SQL COMMANDS

## ❌ ERRORS FOUND:
1. Column `address`, `phone`, `email` don't exist (they're in JSONB `contact`)
2. Column `is_active` doesn't exist (it's `isActive` in camelCase)

## ✅ FINAL CORRECT SQL COMMANDS:

### **INSERT COMMAND (Copy this to HeidiSQL):**

```sql
INSERT INTO lab.organizations (id, name, code, description, contact, settings, "isActive", created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Lab Clinic',
  'TLC001',
  'Test laboratory clinic for authentication testing',
  '{
    "phone": "+62211234567",
    "email": "admin@testlab.com",
    "address": "Jl. Test No. 123, Jakarta",
    "city": "Jakarta",
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
) ON CONFLICT (id) DO NOTHING;
```

### **VERIFY COMMAND (Copy this to check data):**

```sql
SELECT 
  id, 
  name, 
  code, 
  contact->>'phone' as phone,
  contact->>'email' as email,
  contact->>'address' as address,
  "isActive"
FROM lab.organizations 
WHERE code = 'TLC001';
```

---

## 🎯 ALTERNATIVE COMMANDS (if above still fails):

### **Simple INSERT without optional fields:**

```sql
INSERT INTO lab.organizations (id, name, code)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Lab Clinic',
  'TLC001'
) ON CONFLICT (id) DO NOTHING;
```

### **Check table structure first:**

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'lab' 
  AND table_name = 'organizations'
ORDER BY ordinal_position;
```

---

## 📋 TROUBLESHOOTING STEPS:

1. **Try the main INSERT command first**
2. **If fails, try the simple INSERT**
3. **Check table structure with the schema query**
4. **Verify data with the SELECT query**

## 🚀 AFTER SUCCESSFUL INSERT:

Test authentication:
```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d @test-register.json
```

**Expected:** Success with 201 status! 🎉