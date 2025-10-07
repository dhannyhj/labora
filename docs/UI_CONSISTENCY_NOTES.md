# 📋 Catatan Penting - Konsistensi UI Design System

## 🎨 Standar Design System Labora (TailwindCSS + Flowbite)

⚡ **UPDATE:** Aplikasi Labora telah bermigrasi dari Bootstrap 5 ke TailwindCSS + Flowbite untuk UI yang lebih modern, performant, dan customizable.

Semua halaman dalam aplikasi Labora HARUS mengikuti standar design system yang telah ditetapkan untuk memastikan konsistensi pengalaman pengguna.

### 🏗️ Layout Structure Wajib

Setiap halaman HARUS menggunakan struktur layout berikut:

```html
<!DOCTYPE html>
<html lang="id" class="h-full">
<head>
    <!-- Head section dengan meta tags lengkap -->
    <title>{{title}} - Labora Clinical Lab System</title>
    
    <!-- TailwindCSS -->
    <link rel="stylesheet" href="/assets/css/tailwind-output.css">
    
    <!-- Flowbite CSS -->
    <link href="https://cdn.jsdelivr.net/npm/flowbite@2.2.1/dist/flowbite.min.css" rel="stylesheet" />
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body class="font-sans antialiased bg-gray-50 text-gray-900 min-h-full flex flex-col">
    <!-- HEADER - Wajib di setiap halaman -->
    <header class="labora-header">
        <!-- Navigation bar dengan logo, search, notifications, user menu -->
    </header>

    <div class="flex flex-1 overflow-hidden">
        <!-- SIDEBAR - Wajib di setiap halaman -->
        <aside class="labora-sidebar hidden lg:flex">
            <!-- Menu navigasi utama -->
        </aside>

        <!-- MAIN CONTENT -->
        <main class="labora-main flex-1 min-w-0">
            <!-- Breadcrumb (opsional) -->
            <div class="bg-white border-b border-gray-200 px-6 py-3">
                <!-- Breadcrumb navigation -->
            </div>

            <!-- Page Content -->
            <div class="labora-content">
                <!-- Konten halaman -->
            </div>
        </main>
    </div>

    <!-- MOBILE BOTTOM NAV - Wajib untuk mobile -->
    <nav class="mobile-bottom-nav lg:hidden">
        <!-- Bottom navigation untuk mobile -->
    </nav>

    <!-- FOOTER - Wajib di setiap halaman -->
    <footer class="labora-footer bg-white border-t border-gray-200 mt-auto">
        <!-- Copyright dan system status -->
    </footer>

    <!-- Flowbite JS -->
    <script src="https://cdn.jsdelivr.net/npm/flowbite@2.2.1/dist/flowbite.min.js"></script>
</body>
</html>
```

### 🎯 Header Requirements

**WAJIB ada di setiap halaman:**

1. **Logo & Brand**
   - Logo Labora di sebelah kiri dengan class `h-8 w-auto`
   - Nama "Labora" sebagai brand text dengan `text-xl font-bold text-gray-900`
   - Subtitle "Clinical Lab System" dengan `text-xs text-gray-500`
   - Link ke dashboard

2. **Global Search Bar**
   - Search input dengan class `labora-input` dan `focus:ring-labora-500`
   - Placeholder: "Cari pasien, spesimen, atau test..."
   - Hidden di mobile, tampil di md:block

3. **Quick Actions**
   - Tambah Test button dengan `fas fa-plus`
   - Barcode Scanner button dengan `fas fa-qrcode`
   - Hidden di mobile (lg:flex)

4. **Notification System**
   - Icon bell dengan badge count menggunakan Flowbite dropdown
   - Dropdown notification preview dengan `notifications-dropdown`
   - Badge merah untuk unread notifications

5. **User Menu**
   - Avatar pengguna dengan class `h-8 w-8 rounded-full bg-labora-500`
   - User name dan role di sebelah kanan (hidden lg:block)
   - Dropdown dengan: Profile, Settings, Help, Logout
   - Menggunakan Flowbite dropdown component

### 🗂️ Sidebar Requirements

**WAJIB ada di setiap halaman:**

1. **Sidebar Structure**:
   ```html
   <aside class="labora-sidebar hidden lg:flex" id="desktop-sidebar">
       <div class="p-4 border-b border-gray-200">
           <!-- Sidebar header -->
       </div>
       <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
           <!-- Navigation sections -->
       </nav>
       <div class="p-4 border-t border-gray-200">
           <!-- System status -->
       </div>
   </aside>
   ```

2. **Menu Sections** (urutan wajib dengan spacing):
   - **Dashboard**: `Dashboard`, `Analytics`
   - **Manajemen Pasien**: `Data Pasien`, `Appointment`
   - **Operasional Lab**: `Test Requests`, `Spesimen`, `Hasil Lab`, `Reports`
   - **Quality Control**: `QC Data`, `Kalibrasi`
   - **Inventory**: `Reagents`, `Equipment`
   - **Administrasi**: `Pengguna`, `Pengaturan`

3. **Navigation Items**:
   ```html
   <a href="/path" class="labora-nav-item {{#ifEquals currentPage 'page'}}active{{/ifEquals}}">
       <i class="fas fa-icon labora-nav-icon"></i>
       <span class="nav-text">Menu Name</span>
   </a>
   ```

4. **Mobile Sidebar**:
   - Sliding sidebar dengan transform classes
   - Overlay dengan `bg-black bg-opacity-50`
   - Close button dengan `fas fa-times`

5. **System Status Indicator**:
   - Green dot untuk online: `w-2 h-2 bg-green-400 rounded-full`
   - Status text: "System Online"

### 🦶 Footer Requirements

**WAJIB ada di setiap halaman:**

1. **Layout Structure**:
   ```html
   <footer class="labora-footer bg-white border-t border-gray-200 mt-auto">
       <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div class="flex flex-col sm:flex-row justify-between items-center py-4">
               <!-- Footer content -->
           </div>
       </div>
   </footer>
   ```

2. **Copyright Notice**:
   - "© 2024 Labora Clinical Lab System. All rights reserved."
   - Class: `text-sm text-gray-500`

3. **System Info**:
   - Version info: `text-xs text-gray-400`
   - System status dengan green dot: `w-2 h-2 bg-green-400 rounded-full`
   - Status text: `text-xs text-gray-500`

### 📱 Mobile Navigation Requirements

**WAJIB untuk tampilan mobile:**

1. **Bottom Navigation Structure**:
   ```html
   <nav class="mobile-bottom-nav lg:hidden">
       <div class="grid grid-cols-5 h-16">
           <!-- Navigation items -->
       </div>
   </nav>
   ```

2. **Navigation Items**:
   - Home, Tests, Add (center dengan floating style), Results, Profile
   - Class untuk item: `mobile-nav-item`
   - Class untuk active: `active`
   - Icons dengan `mobile-nav-icon`

3. **Responsive Behavior**:
   - Sidebar dengan `lg:hidden` dan `translate-x-full` untuk mobile
   - Header dengan hamburger menu untuk mobile
   - Bottom nav dengan `lg:hidden`

### 🎨 TailwindCSS Color Scheme Wajib

```css
/* Labora Brand Colors - HARUS digunakan konsisten */
--labora-50: #eff6ff;
--labora-100: #dbeafe;
--labora-200: #bfdbfe;
--labora-300: #93c5fd;
--labora-400: #60a5fa;
--labora-500: #3b82f6;    /* Primary brand color */
--labora-600: #2563eb;    /* Hover states */
--labora-700: #1d4ed8;
--labora-800: #1e40af;
--labora-900: #1e3a8a;

/* Medical Status Colors - HARUS konsisten */
--medical-success: #10b981;   /* Success/Completed/Normal */
--medical-danger: #ef4444;    /* Error/Cancelled/Critical */
--medical-warning: #f59e0b;   /* Warning/Pending */
--medical-info: #06b6d4;      /* Info/In Progress */

/* Lab-specific Colors */
--lab-specimen: #f59e0b;      /* Specimen tracking */
--lab-test: #8b5cf6;          /* Test processing */
--lab-result: #10b981;        /* Results ready */
```

### 🏷️ TailwindCSS Component Classes

**WAJIB menggunakan custom component classes:**

```css
/* Layout Components */
.labora-header     /* Header styling dengan shadow dan border */
.labora-sidebar    /* Sidebar dengan proper width dan overflow */
.labora-main       /* Main content area dengan flex properties */
.labora-content    /* Content padding dan spacing */
.labora-footer     /* Footer dengan border dan background */

/* Card Components */
.labora-card              /* Base card dengan rounded corners dan shadow */
.labora-card-header       /* Card header dengan border dan background */
.labora-card-body         /* Card body dengan padding */
.labora-card-simple       /* Simplified card variant */

/* Button Components */
.labora-btn               /* Base button dengan transitions */
.labora-btn-primary       /* Primary button dengan labora colors */
.labora-btn-secondary     /* Secondary button dengan gray colors */
.labora-btn-success       /* Success button dengan green colors */
.labora-btn-danger        /* Danger button dengan red colors */
.labora-btn-sm            /* Small button variant */
.labora-btn-lg            /* Large button variant */

/* Form Components */
.labora-input             /* Input fields dengan focus states */
.labora-select            /* Select dropdowns */
.labora-textarea          /* Textarea fields */
.labora-label             /* Form labels */
.labora-error             /* Error message styling */

/* Navigation Components */
.labora-nav-item          /* Navigation links dengan hover states */
.labora-nav-item.active   /* Active navigation state */
.labora-nav-icon          /* Navigation icons */

/* Status Badges */
.labora-badge             /* Base badge styling */
.status-requested         /* Requested status - blue */
.status-collected         /* Collected status - yellow */
.status-received          /* Received status - green */
.status-in-progress       /* In progress status - blue */
.status-completed         /* Completed status - green */
.status-verified          /* Verified status - emerald */
.status-cancelled         /* Cancelled status - red */

/* Medical Specific */
.specimen-container       /* Container dengan specimen border */
.test-result-card         /* Test result display */
.critical-result          /* Critical value highlighting */
.normal-result            /* Normal result highlighting */

/* Mobile Components */
.mobile-bottom-nav        /* Mobile bottom navigation */
.mobile-nav-item          /* Mobile navigation items */
.mobile-nav-item.active   /* Active mobile navigation */
.mobile-nav-icon          /* Mobile navigation icons */
```

### 🖱️ Interactive Elements Standards

1. **Buttons**:
   ```html
   <!-- Primary Action -->
   <button class="labora-btn labora-btn-primary">Save Changes</button>
   
   <!-- Secondary Action -->
   <button class="labora-btn labora-btn-secondary">Cancel</button>
   
   <!-- Danger Action -->
   <button class="labora-btn labora-btn-danger">Delete</button>
   
   <!-- Small Button -->
   <button class="labora-btn labora-btn-primary labora-btn-sm">Quick Action</button>
   ```

2. **Cards**:
   ```html
   <!-- Standard Card -->
   <div class="labora-card">
       <div class="labora-card-header">
           <h3 class="text-lg font-semibold text-gray-900">Card Title</h3>
       </div>
       <div class="labora-card-body">
           <!-- Card content -->
       </div>
   </div>
   
   <!-- Simple Card -->
   <div class="labora-card-simple">
       <!-- Simple content -->
   </div>
   ```

3. **Tables**:
   ```html
   <div class="labora-table">
       <table class="w-full">
           <thead class="labora-table-header">
               <tr>
                   <th class="px-6 py-4 text-left">Column</th>
               </tr>
           </thead>
           <tbody>
               <tr class="hover:bg-gray-50">
                   <td class="px-6 py-4">Data</td>
               </tr>
           </tbody>
       </table>
   </div>
   ```

4. **Forms**:
   ```html
   <div class="space-y-4">
       <div>
           <label class="labora-label">Field Label</label>
           <input type="text" class="labora-input" placeholder="Enter value">
           <p class="labora-error">Error message</p>
       </div>
       <div>
           <label class="labora-label">Select Field</label>
           <select class="labora-select">
               <option>Choose option</option>
           </select>
       </div>
   </div>
   ```

5. **Notifications**:
   ```html
   <!-- Toast Notification -->
   <div class="labora-notification labora-notification-success">
       <div class="p-4 flex items-center justify-between">
           <span class="text-sm text-gray-900">Success message</span>
           <button type="button" onclick="this.parentElement.parentElement.remove()">
               <i class="fas fa-times"></i>
           </button>
       </div>
   </div>
   ```

### 🔧 JavaScript Requirements

**WAJIB include di setiap halaman:**

1. **Core JavaScript Stack**:
   ```html
   <!-- Flowbite JS - WAJIB untuk interactions -->
   <script src="https://cdn.jsdelivr.net/npm/flowbite@2.2.1/dist/flowbite.min.js"></script>
   
   <!-- Custom Labora JavaScript -->
   <script>
       // Global functions sudah tersedia:
       // - showToast(message, type, duration)
       // - showLoading()
       // - hideLoading()
   </script>
   ```

2. **Utility Functions**:
   ```javascript
   // Toast Notifications
   showToast('Operation successful!', 'success', 5000);
   showToast('Error occurred!', 'error', 5000);
   showToast('Warning message!', 'warning', 5000);
   showToast('Info message!', 'info', 5000);
   
   // Loading States
   showLoading();  // Show loading overlay
   hideLoading();  // Hide loading overlay
   ```

### 📐 Spacing & Typography Standards

1. **Spacing System** (TailwindCSS):
   ```css
   /* Container Padding */
   .labora-content { @apply p-6; }              /* Desktop: 24px */
   
   /* Card Spacing */
   .labora-card-body { @apply p-6; }            /* Card padding: 24px */
   .labora-card-header { @apply px-6 py-4; }    /* Header padding */
   
   /* Form Spacing */
   .space-y-4 > * + * { margin-top: 1rem; }    /* Form field spacing */
   .space-y-6 > * + * { margin-top: 1.5rem; }  /* Section spacing */
   
   /* Mobile Adjustments */
   @media (max-width: 640px) {
       .labora-content { @apply p-4; }          /* Mobile: 16px */
   }
   ```

2. **Typography Scale**:
   ```css
   /* Headers */
   h1 { @apply text-2xl font-bold text-gray-900; }     /* Main page title */
   h2 { @apply text-xl font-semibold text-gray-900; }  /* Section title */
   h3 { @apply text-lg font-semibold text-gray-900; }  /* Card title */
   h4 { @apply text-base font-medium text-gray-900; }  /* Sub-section */
   
   /* Body Text */
   p { @apply text-sm text-gray-600; }                  /* Regular text */
   .text-muted { @apply text-xs text-gray-500; }        /* Helper text */
   
   /* Font Family */
   body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
   ```

3. **Responsive Breakpoints**:
   ```css
   /* TailwindCSS Breakpoints */
   sm: 640px    /* Small devices */
   md: 768px    /* Medium devices */
   lg: 1024px   /* Large devices */
   xl: 1280px   /* Extra large devices */
   2xl: 1536px  /* 2X large devices */
   ```

### 🎯 TailwindCSS Build Process

1. **Development**:
   ```bash
   # Watch mode untuk development
   npm run build:css:watch
   
   # Single build
   npm run build:css
   ```

2. **Configuration Files**:
   - `tailwind.config.js` - TailwindCSS configuration dengan Labora theme
   - `postcss.config.js` - PostCSS configuration
   - `frontend/assets/css/labora-theme.css` - Source file dengan @tailwind directives

### ⚠️ CRITICAL REQUIREMENTS

#### 🚫 TIDAK BOLEH:

1. **Mengubah struktur layout utama** tanpa approval tim
2. **Menggunakan warna di luar TailwindCSS palette** yang sudah ditetapkan
3. **Menghilangkan header, sidebar, atau footer** dari halaman manapun
4. **Menggunakan CSS framework lain** selain TailwindCSS + Flowbite
5. **Mengubah navigation structure** tanpa approval tim
6. **Menggunakan inline styles** - harus menggunakan utility classes
7. **Import CSS frameworks lain** yang bisa conflict dengan TailwindCSS

#### ✅ HARUS:

1. **Menggunakan template layout.hbs** sebagai base template
2. **Include tailwind-output.css** di setiap halaman
3. **Follow TailwindCSS naming convention** untuk utility classes
4. **Menggunakan custom .labora-* component classes** untuk konsistensi
5. **Test responsiveness** di mobile dan desktop (sm, md, lg, xl breakpoints)
6. **Maintain accessibility standards** dengan proper ARIA labels
7. **Menggunakan Flowbite components** untuk advanced interactions
8. **Build CSS dengan npm run build:css** setiap ada perubahan styling

### 🔄 Update Process

Jika perlu mengubah design system:

1. **Diskusi tim** dan approval terlebih dahulu
2. **Update tailwind.config.js** untuk theme changes
3. **Update labora-theme.css** untuk custom components
4. **Rebuild CSS** dengan `npm run build:css`
5. **Update dokumentasi** ini
6. **Update template layout.hbs** jika diperlukan
7. **Test semua halaman** untuk konsistensi
8. **Deploy konsisten** ke semua environment

### 📱 Device Compatibility

**Target devices yang didukung:**
- **Desktop**: 1200px+ (xl:, 2xl:)
- **Tablet**: 768px - 1199px (md:, lg:)
- **Mobile**: 320px - 767px (default, sm:)

**Browser support minimum:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Performance targets:**
- First Contentful Paint: < 1.5s
- CSS bundle size: < 100KB (optimized)
- TailwindCSS purging: Enabled untuk production

### 🎨 Dark Mode Support

```css
/* Dark mode classes sudah dipersiapkan */
@media (prefers-color-scheme: dark) {
  .dark { @apply bg-gray-900 text-gray-100; }
  .dark .labora-header { @apply bg-gray-800 border-gray-700; }
  .dark .labora-sidebar { @apply bg-gray-800 border-gray-700; }
  .dark .labora-card { @apply bg-gray-800 border-gray-700; }
  /* ... dan seterusnya */
}
```

---

## 🚀 Implementation Checklist

Untuk setiap halaman baru, pastikan:

### 📋 Layout & Structure
- [ ] Menggunakan layout.hbs sebagai template
- [ ] Header lengkap dengan logo, search, notifications, user menu
- [ ] Sidebar dengan navigation menu yang benar dan urutan standar
- [ ] Footer dengan copyright dan system status
- [ ] Mobile bottom navigation untuk responsive

### 🎨 Styling & Design
- [ ] TailwindCSS + Flowbite CSS included
- [ ] Custom .labora-* component classes digunakan dengan benar
- [ ] Color scheme konsisten dengan Labora palette
- [ ] Status badges sesuai standar (.status-*)
- [ ] Typography menggunakan TailwindCSS scale

### ⚡ Functionality & JavaScript
- [ ] Flowbite JavaScript included untuk interactions
- [ ] Global utility functions tersedia (showToast, showLoading)
- [ ] Dropdown menus menggunakan Flowbite components
- [ ] Form validations dan error handling

### 📱 Responsive & Accessibility
- [ ] Responsive di semua breakpoints (sm, md, lg, xl)
- [ ] Mobile-first design approach
- [ ] Proper ARIA labels dan accessibility attributes
- [ ] Keyboard navigation support
- [ ] Focus management untuk modals dan dropdowns

### 🔧 Development & Build
- [ ] CSS build process berjalan dengan `npm run build:css`
- [ ] Tidak ada inline styles atau hardcoded colors
- [ ] Performance optimized (purged unused CSS)
- [ ] Cross-browser compatibility tested

**Remember: Konsistensi dengan TailwindCSS utility-first approach adalah kunci user experience yang baik! 🎯**

---

## 📈 Migration Benefits

### ⚡ Performance Improvements
- **Bundle size**: 80% reduction dari Bootstrap (~200KB → ~40KB)
- **Loading speed**: Faster dengan utility-first CSS
- **Development speed**: Faster dengan utility classes

### 🎨 Design Flexibility  
- **Customization**: Unlimited dengan TailwindCSS utilities
- **Consistency**: Better dengan design system approach
- **Maintenance**: Easier dengan component-based architecture

### 👨‍💻 Developer Experience
- **Productivity**: Higher dengan utility-first workflow
- **Learning curve**: Shorter dengan intuitive class names
- **Documentation**: Better dengan TailwindCSS ecosystem