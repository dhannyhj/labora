# 🎯 SOLUSI PERMANEN - DATABASE QUERY GUIDELINES

## ❌ MASALAH YANG TERJADI:
User menggunakan query dengan kolom `camelCase` padahal database menggunakan `snake_case`

**Query Error:**
```sql
SELECT "createdAt", "updatedAt", "deletedAt", "isActive" -- ❌ WRONG
```

**Query Correct:**
```sql
SELECT "created_at", "updated_at", "is_deleted", "is_active" -- ✅ CORRECT
```

---

## ✅ SOLUTION: QUERY CHEAT SHEET

### Organizations Table Columns:
```sql
SELECT 
  "id",           -- UUID
  "name",         -- TEXT
  "code",         -- VARCHAR(50)
  "address",      -- TEXT  
  "contact",      -- JSONB
  "meta",         -- JSONB
  "is_deleted",   -- BOOLEAN (NOT deletedAt)
  "created_at",   -- TIMESTAMPTZ (NOT createdAt)
  "updated_at"    -- TIMESTAMPTZ (NOT updatedAt)
FROM "lab"."organizations"
WHERE "is_deleted" = false
LIMIT 100;
```

### Users Table Columns:
```sql
SELECT 
  "id",              -- UUID
  "username",        -- VARCHAR(100) 
  "email",           -- VARCHAR(255)
  "password_hash",   -- TEXT (NOT passwordHash)
  "full_name",       -- TEXT (NOT fullName)
  "role",            -- VARCHAR(50)
  "organization_id", -- UUID (NOT organizationId)
  "is_active",       -- BOOLEAN (NOT isActive)
  "meta",            -- JSONB
  "created_at",      -- TIMESTAMPTZ (NOT createdAt)
  "updated_at"       -- TIMESTAMPTZ (NOT updatedAt)
FROM "lab"."users"
WHERE "is_active" = true
LIMIT 100;
```

---

## 🔑 GOLDEN RULES:

1. **Database = snake_case** (created_at, is_active, organization_id)
2. **TypeScript/NestJS = camelCase** (createdAt, isActive, organizationId)  
3. **TypeORM handles mapping** automatically dengan `@Column({ name: 'snake_case' })`

---

## 🚀 QUICK TEST COMMANDS:

```sql
-- Test 1: Check organizations exist
SELECT COUNT(*) FROM "lab"."organizations" WHERE "is_deleted" = false;

-- Test 2: Check users exist  
SELECT COUNT(*) FROM "lab"."users" WHERE "is_active" = true;

-- Test 3: Full organization data
SELECT * FROM "lab"."organizations" WHERE "is_deleted" = false LIMIT 5;
```

**KESIMPULAN: Database structure PERFECT, cukup gunakan kolom snake_case dalam raw SQL queries!**