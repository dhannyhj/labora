# 🚀 Enhanced Labora Component Quick Reference

## 🎨 New Color Variables
```css
/* Critical Values */
var(--lab-critical-high)    /* #dc2626 - Kritical tinggi */
var(--lab-critical-low)     /* #2563eb - Kritical rendah */
var(--lab-abnormal-high)    /* #f59e0b - Abnormal tinggi */
var(--lab-abnormal-low)     /* #06b6d4 - Abnormal rendah */
var(--lab-normal)           /* #059669 - Normal */
var(--lab-pending)          /* #6b7280 - Pending */

/* Specimen Colors */
var(--specimen-blood)       /* #ef4444 - Darah */
var(--specimen-serum)       /* #f59e0b - Serum */
var(--specimen-urine)       /* #fbbf24 - Urine */
var(--specimen-stool)       /* #92400e - Tinja */

/* Workflow Status */
var(--status-registered)    /* #3b82f6 - Terdaftar */
var(--status-collected)     /* #8b5cf6 - Diambil */
var(--status-processing)    /* #0891b2 - Diproses */
var(--status-verified)      /* #10b981 - Diverifikasi */
```

---

## 🧪 Top Medical Components

### Critical Alert Banner
```html
<div class="labora-critical-banner">
  <div class="labora-critical-banner-content">
    <span class="labora-panic-indicator">CRITICAL</span>
    <span>Patient: John Doe - Glucose: 450 mg/dL</span>
  </div>
</div>
```

### Enhanced Specimen Card
```html
<div class="labora-specimen-card-enhanced specimen-blood">
  <div class="labora-specimen-type-indicator"></div>
  <h3>SPE001 - Blood Sample</h3>
  <p class="text-sm text-gray-600">Complete Blood Count</p>
</div>
```

### Workflow Progress
```html
<div class="labora-workflow-stepper">
  <div class="labora-workflow-step">
    <div class="labora-step-circle completed">✓</div>
    <div class="labora-step-label completed">Collected</div>
  </div>
  <div class="labora-workflow-step">
    <div class="labora-step-circle active">2</div>
    <div class="labora-step-label active">Processing</div>
  </div>
</div>
```

### Result Trend Indicator
```html
<span class="labora-trend-indicator labora-trend-up">
  <svg class="w-4 h-4"><!-- arrow up icon --></svg>
  <span>↑ 15%</span>
</span>
```

### TAT Monitor
```html
<span class="labora-tat-indicator critical">Critical Delay</span>
<span class="labora-tat-indicator on-time">On Time</span>
<span class="labora-tat-indicator delayed">Delayed</span>
```

### Live Metrics
```html
<div class="labora-live-metric">
  <div class="labora-live-indicator"></div>
  <div class="labora-metric-big text-blue-600">24</div>
  <div class="labora-metric-label">Active Tests</div>
</div>
```

### Quick Result Input
```html
<input type="number" class="labora-quick-input" placeholder="Normal range">
<input type="number" class="labora-quick-input critical-value" value="450">
```

### QC Data Point
```html
<div class="labora-qc-data-point in-control"></div>
<div class="labora-qc-data-point warning"></div>
<div class="labora-qc-data-point out-of-control"></div>
```

### Mobile Scanner
```html
<div class="labora-mobile-scanner-overlay">
  <div class="labora-scanner-viewfinder">
    <div class="labora-scanner-frame">
      <div class="labora-scanner-line"></div>
    </div>
  </div>
</div>
```

---

## 🎯 Medical Utilities

### Quick Styling
```html
<span class="text-critical">Critical Value</span>
<span class="text-abnormal">Abnormal</span>
<span class="text-normal">Normal</span>
<div class="bg-critical-subtle">Alert background</div>
```

### Touch & Accessibility
```html
<button class="touch-target">Large for gloves</button>
<input class="focus-medical">Enhanced focus</input>
<div class="medical-contrast">High contrast</div>
```

### Modern Effects
```html
<div class="labora-glass">Glassmorphism</div>
<button class="labora-btn-neu">Neumorphism</button>
<div class="labora-hover-lift">Hover lift</div>
```

---

## 📊 Advanced Components

### Patient Timeline
```html
<div class="labora-patient-timeline">
  <div class="labora-timeline-event">
    <div class="labora-timeline-dot test-ordered"></div>
    <div>
      <h4>Test Ordered</h4>
      <p>CBC requested</p>
    </div>
  </div>
</div>
```

### Equipment Status
```html
<div class="labora-equipment-card online">
  <h4>Hematology Analyzer</h4>
  <p class="text-xs">Online</p>
</div>
```

### Real-time Alerts
```html
<div class="labora-alert-item critical">
  <div class="labora-alert-dot critical"></div>
  <div>
    <h4>Critical Glucose</h4>
    <p>450 mg/dL - John Doe</p>
  </div>
</div>
```

### Batch Processing
```html
<div class="labora-workbench-container">
  <div class="labora-specimen-queue">
    <div class="labora-queue-item selected">
      <span>SPE001 - CBC</span>
    </div>
  </div>
  <div class="labora-batch-processor">
    <div class="labora-batch-grid">
      <div class="labora-result-input-group">
        <input class="labora-quick-input">
      </div>
    </div>
  </div>
</div>
```

---

## 🎨 Component States

### Status Classes
- `.pending` - Abu-abu (pending)
- `.active` - Biru dengan animasi
- `.completed` - Hijau
- `.critical` - Merah dengan pulse
- `.warning` - Kuning
- `.error` - Merah
- `.online` - Hijau border
- `.offline` - Merah background
- `.maintenance` - Kuning background

### Color Classes
- `.specimen-blood` - Merah
- `.specimen-urine` - Kuning  
- `.specimen-serum` - Orange
- `.normal` - Hijau
- `.abnormal` - Kuning
- `.critical` - Merah

---

## 📱 Mobile Components

### Mobile Form
```html
<div class="labora-mobile-specimen-form">
  <input class="labora-mobile-input" placeholder="Patient ID">
  <button class="labora-mobile-button labora-btn-primary">Submit</button>
</div>
```

### GPS Location
```html
<div class="labora-gps-indicator">
  <svg class="w-4 h-4"><!-- location icon --></svg>
  <span>Emergency Room, Floor 2</span>
</div>
```

---

## 🚀 Animation Classes

### Micro-interactions
- `.labora-clickable` - Scale pada click
- `.labora-hover-lift` - Hover lift effect
- `.labora-pulse-once` - Single pulse animation
- `.animate-pulse` - Continuous pulse
- `.transition-all` - Smooth transitions

### Custom Animations
- `animation: scan 2s linear infinite` - Scanner line
- `.animate-fade-in-up` - Fade in from bottom
- `.animate-slide-in-right` - Slide from right

---

## 💡 Usage Tips

1. **Consistency**: Selalu gunakan `.labora-*` prefix
2. **Medical Colors**: Gunakan semantic color variables
3. **Touch Friendly**: Tambahkan `.touch-target` untuk button
4. **Accessibility**: Gunakan `.focus-medical` untuk keyboard nav
5. **Mobile**: Gunakan mobile-specific components untuk specimen collection
6. **Real-time**: Implement live indicators untuk monitoring
7. **Performance**: Gunakan CSS transforms untuk animasi

---

## 🎯 Component Count Summary

**Enhanced Medical Components: 179 Total**

- Result Interpretation: 8
- Enhanced Specimen: 6  
- Workflow Status: 12
- Dashboard Metrics: 8
- Patient Timeline: 4
- Critical Notifications: 3
- Intelligent Search: 5
- TAT Monitoring: 3
- Result Visualization: 9
- Batch Processing: 8
- Real-time Monitoring: 12
- Mobile Collection: 9
- QC Charts: 10
- UI Enhancements: 8
- Medical Utilities: 6
- Legacy Components: 68

All components are compiled and ready to use! 🎉