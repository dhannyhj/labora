# Panduan Component Classes Labora

## Overview
Labora Clinical Lab System menggunakan pendekatan **Component Classes** dengan prefix `.labora-*` untuk menciptakan konsistensi desain dan menghindari penggunaan utility classes mentah di template files.

## Filosofi Design System

### ✅ **Yang Direkomendasikan (Component Classes)**
```html
<!-- Gunakan component classes -->
<button class="labora-btn labora-btn-primary">
  Simpan Data
</button>

<div class="labora-card">
  <div class="labora-card-header">
    <h3>Judul Card</h3>
  </div>
  <div class="labora-card-body">
    <p>Konten card</p>
  </div>
</div>
```

### ❌ **Yang Dihindari (Raw Utility Classes)**
```html
<!-- Hindari utility classes mentah -->
<button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600">
  Simpan Data
</button>

<div class="bg-white rounded-xl shadow-card p-6 border border-gray-200">
  <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
    <h3>Judul Card</h3>
  </div>
  <div class="p-6">
    <p>Konten card</p>
  </div>
</div>
```

## Kategori Component Classes

### 1. **Layout Components**
```css
.labora-header       /* Header utama aplikasi */
.labora-sidebar      /* Sidebar navigasi */
.labora-main         /* Main content area */
.labora-content      /* Content container */
.labora-footer       /* Footer aplikasi */
```

### 2. **Card Components**
```css
.labora-card         /* Card utama dengan shadow */
.labora-card-header  /* Header card dengan border */
.labora-card-body    /* Body card dengan padding */
.labora-card-simple  /* Card sederhana tanpa header */
```

### 3. **Button Components**
```css
.labora-btn             /* Base button style */
.labora-btn-primary     /* Primary action button */
.labora-btn-secondary   /* Secondary button */
.labora-btn-success     /* Success state button */
.labora-btn-danger      /* Danger/delete button */
.labora-btn-sm          /* Small size button */
.labora-btn-lg          /* Large size button */
```

### 4. **Form Components**
```css
.labora-input        /* Input field styling */
.labora-select       /* Select dropdown styling */
.labora-textarea     /* Textarea styling */
.labora-label        /* Form label styling */
.labora-error        /* Error message styling */
```

### 5. **Navigation Components**
```css
.labora-nav-item     /* Navigation menu item */
.labora-nav-icon     /* Navigation icon */
.labora-breadcrumb   /* Breadcrumb navigation */
.labora-breadcrumb-item        /* Breadcrumb item */
.labora-breadcrumb-separator   /* Breadcrumb separator */
```

### 6. **Table Components**
```css
.labora-table        /* Table container */
.labora-table-header /* Table header row */
.labora-table th     /* Table header cell */
.labora-table td     /* Table data cell */
```

### 7. **Status & Badge Components**
```css
.labora-badge        /* Base badge styling */
.status-requested    /* Status: Requested */
.status-collected    /* Status: Collected */
.status-received     /* Status: Received */
.status-in-progress  /* Status: In Progress */
.status-completed    /* Status: Completed */
.status-verified     /* Status: Verified */
.status-cancelled    /* Status: Cancelled */
```

### 8. **Medical/Lab Specific Components**
```css
.specimen-container  /* Specimen info container */
.test-result-card   /* Test result display */
.critical-result    /* Critical result highlight */
.normal-result      /* Normal result highlight */
```

### 9. **Stats & Dashboard Components**
```css
.labora-stats-card           /* Stats card container */
.labora-stats-card.gradient-blue    /* Blue gradient stats */
.labora-stats-card.gradient-green   /* Green gradient stats */
.labora-stats-card.gradient-yellow  /* Yellow gradient stats */
.labora-stats-card.gradient-red     /* Red gradient stats */
.labora-stats-icon           /* Stats icon container */
.labora-stats-number         /* Large stats number */
.labora-stats-label          /* Stats label text */
.labora-stats-change         /* Stats change indicator */
```

### 10. **Activity & Timeline Components**
```css
.labora-activity-item        /* Activity item container */
.labora-activity-item.success       /* Success activity */
.labora-activity-item.info          /* Info activity */
.labora-activity-item.warning       /* Warning activity */
.labora-activity-item.danger        /* Danger activity */
.labora-activity-icon        /* Activity icon */
.labora-activity-content     /* Activity content */
.labora-activity-title       /* Activity title */
.labora-activity-subtitle    /* Activity subtitle */
```

### 11. **Notification Components**
```css
.labora-notification         /* Base notification */
.labora-notification-success /* Success notification */
.labora-notification-error   /* Error notification */
.labora-notification-warning /* Warning notification */
.labora-notification-info    /* Info notification */
```

### 12. **Modal Components**
```css
.labora-modal-overlay    /* Modal background overlay */
.labora-modal            /* Modal container */
.labora-modal-header     /* Modal header */
.labora-modal-body       /* Modal body content */
.labora-modal-footer     /* Modal footer actions */
```

### 13. **Loading Components**
```css
.labora-spinner          /* Loading spinner */
.labora-skeleton         /* Skeleton loading placeholder */
```

## Implementasi di Template Files

### Header Component (header.hbs)
```handlebars
<header class="labora-header">
  <div class="flex justify-between items-center h-16">
    <!-- Logo -->
    <div class="flex items-center">
      <img class="h-8 w-auto" src="/assets/images/labora-logo.png" alt="Labora">
    </div>
    
    <!-- Search -->
    <div class="hidden md:block flex-1 max-w-lg mx-8">
      <input type="text" 
             class="labora-input pl-10 dark:bg-gray-700" 
             placeholder="Cari pasien, spesimen, atau test...">
    </div>
    
    <!-- Actions -->
    <div class="flex items-center space-x-4">
      <button class="labora-btn labora-btn-secondary p-2">
        <i class="fas fa-plus"></i>
      </button>
    </div>
  </div>
</header>
```

### Sidebar Component (sidebar.hbs)
```handlebars
<aside class="labora-sidebar">
  <nav class="flex-1 p-4 space-y-1">
    <a href="/" class="labora-nav-item active">
      <i class="fas fa-chart-pie labora-nav-icon"></i>
      <span>Dashboard</span>
    </a>
    <a href="/patients" class="labora-nav-item">
      <i class="fas fa-user-friends labora-nav-icon"></i>
      <span>Data Pasien</span>
    </a>
  </nav>
</aside>
```

### Layout Main Content
```handlebars
<main class="labora-main">
  <!-- Breadcrumb -->
  <div class="labora-card-header">
    <nav class="labora-breadcrumb">
      <ol class="flex items-center space-x-2">
        <li>
          <a href="/" class="labora-breadcrumb-item">
            <i class="fas fa-home"></i>
          </a>
        </li>
        <li>
          <i class="fas fa-chevron-right labora-breadcrumb-separator"></i>
          <span class="labora-breadcrumb-item active">Dashboard</span>
        </li>
      </ol>
    </nav>
  </div>
  
  <!-- Content -->
  <div class="labora-content">
    <div class="labora-card">
      <div class="labora-card-header">
        <h3>Dashboard</h3>
      </div>
      <div class="labora-card-body">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="labora-stats-card gradient-blue">
            <div class="flex items-center justify-between">
              <div>
                <p class="labora-stats-label">Total Pasien</p>
                <p class="labora-stats-number">1,245</p>
                <p class="labora-stats-change">+12% dari bulan lalu</p>
              </div>
              <div class="labora-stats-icon bg-blue-400">
                <i class="fas fa-user-friends text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
```

## Keuntungan Component Classes

### 1. **Konsistensi Design**
- Semua komponen menggunakan styling yang seragam
- Mudah maintain dan update theme secara global
- Mengurangi inconsistency dalam UI

### 2. **Developer Experience**
- Lebih mudah dibaca dan dipahami
- Autocomplete yang lebih baik di IDE
- Debugging yang lebih mudah

### 3. **Maintainability**
- Perubahan styling hanya perlu dilakukan di satu tempat
- Tidak ada duplikasi utility classes
- Easier refactoring

### 4. **Performance**
- CSS output yang lebih efficient
- Smaller bundle size
- Better compression

### 5. **Team Collaboration**
- Shared vocabulary antar developer
- Easier code review
- Self-documenting code

## Best Practices

### 1. **Prefix Konsisten**
Semua component classes menggunakan prefix `.labora-` untuk menghindari konflik dengan framework lain.

### 2. **Hierarki yang Jelas**
```css
.labora-card              /* Parent */
  .labora-card-header     /* Child */
  .labora-card-body       /* Child */
  .labora-card-footer     /* Child */
```

### 3. **Modifier Classes**
```css
.labora-btn               /* Base */
.labora-btn-primary       /* Modifier */
.labora-btn-sm            /* Size modifier */
```

### 4. **State Classes**
```css
.labora-nav-item          /* Base */
.labora-nav-item.active   /* State */
```

### 5. **Dark Mode Support**
Semua component classes mendukung dark mode melalui CSS variables dan dark: modifiers.

## Migration Checklist

Untuk memastikan semua file sudah menggunakan component classes:

- [x] **Layout Files**
  - [x] `layout.hbs` - Main layout structure
  - [x] `partials/header.hbs` - Header component
  - [x] `partials/sidebar.hbs` - Sidebar component

- [x] **Component Classes Created**
  - [x] Layout components (header, sidebar, main, content)
  - [x] Card components (card, card-header, card-body)
  - [x] Button components (btn, btn-primary, btn-secondary, etc.)
  - [x] Form components (input, select, textarea, label)
  - [x] Navigation components (nav-item, nav-icon, breadcrumb)
  - [x] Table components (table, table-header)
  - [x] Status badge components
  - [x] Stats dashboard components
  - [x] Activity timeline components
  - [x] Notification components
  - [x] Modal components

- [x] **CSS Compilation**
  - [x] TailwindCSS build dengan component classes baru
  - [x] Dark mode support terintegrasi
  - [x] Responsive design working

## Conclusion

Dengan implementasi component classes `.labora-*`, aplikasi Labora sekarang memiliki:

1. **Design System yang Konsisten** - Semua komponen menggunakan styling yang seragam
2. **Code yang Maintainable** - Mudah untuk update dan maintain
3. **Developer Experience yang Baik** - Mudah dibaca dan dipahami
4. **Performance yang Optimal** - CSS output yang efficient
5. **Scalability** - Mudah untuk add komponen baru dengan pattern yang sama

Semua utility classes mentah telah diganti dengan component classes yang appropriate, menciptakan codebase yang lebih clean, maintainable, dan professional untuk sistem laboratorium klinik.