# 📋 Catatan Penting - Konsistensi UI Design System

## 🎨 Standar Design System Labora

Semua halaman dalam aplikasi Labora HARUS mengikuti standar design system yang telah ditetapkan untuk memastikan konsistensi pengalaman pengguna.

### 🏗️ Layout Structure Wajib

Setiap halaman HARUS menggunakan struktur layout berikut:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <!-- Head section dengan meta tags lengkap -->
    <title>{{title}} - Labora Clinical Lab</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css">
    <link rel="stylesheet" href="/assets/css/labora-theme.css">
</head>
<body class="labora-body">
    <!-- HEADER - Wajib di setiap halaman -->
    <header class="labora-header">
        <!-- Navigation bar dengan logo, menu, notifications -->
    </header>

    <div class="labora-container">
        <!-- SIDEBAR - Wajib di setiap halaman -->
        <aside class="labora-sidebar">
            <!-- Menu navigasi utama -->
        </aside>

        <!-- MAIN CONTENT -->
        <main class="labora-main">
            <!-- Breadcrumb (opsional) -->
            <nav class="labora-breadcrumb">
                <!-- Breadcrumb navigation -->
            </nav>

            <!-- Page Content -->
            <div class="labora-content">
                <!-- Konten halaman -->
            </div>
        </main>
    </div>

    <!-- FOOTER - Wajib di setiap halaman -->
    <footer class="labora-footer">
        <!-- Copyright dan link bantuan -->
    </footer>

    <!-- MOBILE BOTTOM NAV - Wajib untuk mobile -->
    <nav class="mobile-bottom-nav d-lg-none">
        <!-- Bottom navigation untuk mobile -->
    </nav>
</body>
</html>
```

### 🎯 Header Requirements

**WAJIB ada di setiap halaman:**

1. **Logo & Brand**
   - Logo Labora di sebelah kiri
   - Nama "Labora" sebagai brand text
   - Link ke dashboard

2. **Notification System**
   - Icon bell dengan badge count
   - Dropdown notification preview
   - Link ke halaman notification lengkap

3. **Quick Actions**
   - Dropdown "Tambah" untuk actions cepat
   - New Order, New Patient, New Specimen

4. **User Menu**
   - Avatar pengguna
   - Dropdown dengan: Profile, Settings, Help, Logout

### 🗂️ Sidebar Requirements

**WAJIB ada di setiap halaman:**

1. **Menu Utama** (urutan wajib):
   - Dashboard
   - Manajemen Order
   - Data Pasien
   - Manajemen Sampel
   - Pemeriksaan Lab
   - Hasil Pemeriksaan
   - Laporan

2. **Menu Sekunder**:
   - Inventori
   - Quality Control

3. **Menu Admin** (jika user admin):
   - Pengguna
   - Pengaturan Sistem

4. **Status Indicator**:
   - Indikator sistem online/offline

### 🦶 Footer Requirements

**WAJIB ada di setiap halaman:**

1. **Copyright Notice**
   - "© 2024 Labora Clinical Lab System. All rights reserved."

2. **Navigation Links**:
   - Bantuan
   - Privasi
   - Dukungan

3. **Version Info**:
   - Versi aplikasi

### 📱 Mobile Navigation Requirements

**WAJIB untuk tampilan mobile:**

1. **Bottom Navigation**:
   - Dashboard
   - Orders
   - Pasien
   - Hasil
   - Laporan

2. **Responsive Behavior**:
   - Sidebar collapse di mobile
   - Bottom nav muncul di mobile
   - Header responsive

### 🎨 Color Scheme Wajib

```css
/* Primary Colors - HARUS digunakan konsisten */
--labora-primary: #0d6efd;        /* Medical Blue */
--labora-primary-dark: #0a58ca;   /* Hover state */
--labora-primary-light: #6ea8fe;  /* Light variant */

/* Status Colors - HARUS konsisten */
--labora-success: #198754;        /* Success/Completed */
--labora-danger: #dc3545;         /* Error/Cancelled */
--labora-warning: #ffc107;        /* Warning/Pending */
--labora-info: #0dcaf0;          /* Info/In Progress */

/* Lab-specific Colors */
--labora-lab-blue: #0077be;       /* Laboratory specific */
--labora-specimen-amber: #ff9800; /* Specimen tracking */
```

### 🏷️ Status Badge Standards

**WAJIB menggunakan class yang tepat:**

```css
.status-requested     { background: #e7f3ff; color: #0066cc; }
.status-collected     { background: #fff3cd; color: #856404; }
.status-received      { background: #d4edda; color: #155724; }
.status-in-progress   { background: #cce5ff; color: #004085; }
.status-completed     { background: #d1ecf1; color: #0c5460; }
.status-verified      { background: #d4edda; color: #155724; }
.status-cancelled     { background: #f8d7da; color: #721c24; }
```

### 🖱️ Interactive Elements Standards

1. **Buttons**:
   ```css
   .labora-btn          /* Base button class */
   .labora-btn-primary  /* Primary actions */
   ```

2. **Cards**:
   ```css
   .labora-card         /* Base card with shadow */
   .labora-card-header  /* Card header styling */
   ```

3. **Tables**:
   ```css
   .labora-table        /* Base table styling */
   ```

4. **Forms**:
   ```css
   .labora-form-control /* Form input styling */
   ```

### 🔧 JavaScript Requirements

**WAJIB include di setiap halaman:**

1. **Core JavaScript**:
   ```html
   <script src="/assets/js/labora-core.js"></script>
   ```

2. **Bootstrap JS**:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
   ```

### 📐 Spacing & Typography

1. **Spacing**:
   - Konsisten menggunakan Bootstrap spacing utilities
   - Padding container: `1.5rem` untuk desktop, `1rem` untuk mobile

2. **Typography**:
   - Font family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
   - Header size consistency
   - Text color consistency

### ⚠️ CRITICAL REQUIREMENTS

#### 🚫 TIDAK BOLEH:

1. **Mengubah struktur layout utama** tanpa approval
2. **Menggunakan warna di luar palette** yang sudah ditetapkan
3. **Menghilangkan header, sidebar, atau footer** dari halaman manapun
4. **Menggunakan CSS framework lain** selain Bootstrap 5
5. **Mengubah navigation structure** tanpa approval

#### ✅ HARUS:

1. **Menggunakan template layout.hbs** sebagai base template
2. **Include labora-theme.css** di setiap halaman
3. **Follow naming convention** untuk CSS classes
4. **Test responsiveness** di mobile dan desktop
5. **Maintain accessibility standards**

### 🔄 Update Process

Jika perlu mengubah design system:

1. **Diskusi tim** terlebih dahulu
2. **Update dokumentasi** ini
3. **Update template base**
4. **Test semua halaman**
5. **Deploy konsisten**

### 📱 Device Compatibility

**Target devices:**
- Desktop: 1200px+
- Tablet: 768px - 1199px  
- Mobile: 320px - 767px

**Browser support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🚀 Implementation Checklist

Untuk setiap halaman baru, pastikan:

- [ ] Menggunakan layout.hbs sebagai template
- [ ] Header lengkap dengan semua komponen
- [ ] Sidebar dengan menu yang benar
- [ ] Footer dengan link yang tepat
- [ ] Mobile bottom navigation
- [ ] Color scheme konsisten
- [ ] Status badges sesuai standar
- [ ] JavaScript core included
- [ ] Responsive di semua device
- [ ] Accessibility compliant

**Remember: Konsistensi adalah kunci user experience yang baik!**