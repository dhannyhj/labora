# 🔗 KONEKSI HEIDISQL KE POSTGRESQL DATABASE

## 📋 INFORMASI KONEKSI DATABASE

Berdasarkan file `.env` di project Anda, berikut konfigurasi database PostgreSQL:

### **Database Connection Details:**
```
Host/Server:    localhost
Port:          5432
Database:      labora_db
Username:      labora_user
Password:      labora123
```

---

## 🔧 CARA SETUP HEIDISQL

### **STEP 1: Buka HeidiSQL**
1. Launch HeidiSQL
2. Click "New" untuk membuat koneksi baru

### **STEP 2: Pilih Network Type**
- **Network type:** PostgreSQL (TCP/IP)

### **STEP 3: Isi Connection Settings**

#### **Settings Tab:**
- **Hostname / IP:** `localhost`
- **User:** `labora_user`
- **Password:** `labora123`
- **Port:** `5432`
- **Database:** `labora_db` (atau kosongkan dulu, bisa pilih setelah connect)

#### **Advanced Tab (Optional):**
- **SSL Mode:** Disable (karena DATABASE_SSL=false)

### **STEP 4: Test Connection**
1. Click "Open" atau "Test" untuk test koneksi
2. Jika berhasil, Anda akan terhubung ke database

---

## 🎯 SETELAH TERHUBUNG

### **1. Pilih Database `labora_db`**
### **2. Navigate ke Schema `lab`**
### **3. Jalankan SQL untuk insert organization:**

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

### **4. Verify Data Inserted:**
```sql
SELECT id, name, code, status FROM lab.organizations WHERE code = 'TLC001';
```

---

## ⚠️ TROUBLESHOOTING

### **Error: "Connection refused"**
**Penyebab:** PostgreSQL server tidak running
**Solusi:** 
```bash
# Start PostgreSQL service (Windows)
net start postgresql

# Atau jika menggunakan Docker:
docker-compose up -d
```

### **Error: "Authentication failed"**
**Penyebab:** Username/password salah
**Solusi:** Double-check credentials di file `.env`

### **Error: "Database does not exist"**
**Penyebab:** Database `labora_db` belum dibuat
**Solusi:**
1. Connect tanpa specify database
2. Create database dengan SQL: `CREATE DATABASE labora_db;`
3. Atau jalankan migration: `npm run migration:run`

### **Error: "Schema lab does not exist"**
**Penyebab:** Schema belum dibuat
**Solusi:** Jalankan migration script atau SQL schema setup

---

## 🚀 QUICK CHECKLIST

- [ ] HeidiSQL installed
- [ ] PostgreSQL service running
- [ ] Connection settings configured dengan credentials di atas
- [ ] Test connection berhasil
- [ ] Database `labora_db` accessible
- [ ] Schema `lab` visible
- [ ] Organization data inserted
- [ ] Ready untuk testing authentication!

**🔑 Setelah organization data berhasil di-insert, authentication testing akan 100% working!**