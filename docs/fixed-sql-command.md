# 🔧 SQL COMMAND YANG BENAR - SIAP COPY PASTE

## ❌ ERROR YANG DITEMUKAN:
```
ERROR: column "address" of relation "organizations" does not exist
```

## ✅ STRUKTUR TABEL YANG BENAR:

Tabel `lab.organizations` menggunakan struktur JSONB:
- `contact` (JSONB) - berisi phone, email, address
- `settings` (JSONB) - berisi timezone, currency, dll
- `is_active` (boolean) - bukan `status`

---

## 🚀 SQL COMMAND YANG BENAR:

**COPY dan PASTE di HeidiSQL:**

```sql
INSERT INTO lab.organizations (id, name, code, description, contact, settings, is_active, created_at, updated_at)
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

---

## 📝 VERIFY COMMAND:

Setelah insert, jalankan untuk memastikan data berhasil:

```sql
SELECT 
  id, 
  name, 
  code, 
  contact->>'phone' as phone,
  contact->>'email' as email,
  contact->>'address' as address,
  is_active
FROM lab.organizations 
WHERE code = 'TLC001';
```

**Expected Result:**
```
id: 550e8400-e29b-41d4-a716-446655440000
name: Test Lab Clinic
code: TLC001
phone: +62211234567
email: admin@testlab.com
address: Jl. Test No. 123, Jakarta
is_active: true
```

---

## 🎯 NEXT STEPS:

1. ✅ **Copy SQL command di atas**
2. ✅ **Paste di HeidiSQL query editor**
3. ✅ **Execute (F9 atau tombol Execute)**
4. ✅ **Jalankan verify command**
5. ✅ **Lanjut testing authentication dengan cURL**

**🔑 Setelah ini organization data akan tersedia dan authentication testing bisa dilanjutkan!**