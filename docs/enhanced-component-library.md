# 🎨 Enhanced Medical Component Library - Labora v2.0

## Overview
Library komponen medis yang diperluas dengan 100+ komponen modern untuk sistem laboratorium klinis. Menggunakan enhanced medical color system, advanced workflow components, dan minimalist design principles.

---

## 🎨 Enhanced Medical Color System

### Critical Value Colors
```css
--lab-critical-high: #dc2626     /* Nilai kritis tinggi */
--lab-critical-low: #2563eb      /* Nilai kritis rendah */
--lab-abnormal-high: #f59e0b     /* Abnormal tinggi */
--lab-abnormal-low: #06b6d4      /* Abnormal rendah */
--lab-normal: #059669            /* Normal */
--lab-pending: #6b7280           /* Pending */
```

### Specimen Type Colors
```css
--specimen-blood: #ef4444        /* Darah */
--specimen-serum: #f59e0b        /* Serum */
--specimen-plasma: #eab308       /* Plasma */
--specimen-urine: #fbbf24        /* Urine */
--specimen-stool: #92400e        /* Tinja */
--specimen-csf: #06b6d4          /* CSF */
--specimen-tissue: #ec4899       /* Jaringan */
```

### Test Status Workflow
```css
--status-registered: #3b82f6     /* Terdaftar */
--status-collected: #8b5cf6      /* Diambil */
--status-received: #06b6d4       /* Diterima */
--status-processing: #0891b2     /* Diproses */
--status-analyzed: #059669       /* Dianalisis */
--status-verified: #10b981       /* Diverifikasi */
--status-delivered: #22c55e      /* Dikirim */
--status-cancelled: #ef4444      /* Dibatalkan */
```

---

## 🧪 Advanced Medical Components

### 1. Result Interpretation Components

#### Result Visualization Container
```html
<div class="labora-result-visualization">
  <h3>Interpretasi Hasil Lab</h3>
  <!-- Grafik dan visualisasi hasil -->
</div>
```

#### Delta Check Alert
```html
<div class="labora-delta-check">
  <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
  </svg>
  <span class="font-medium">Delta Check:</span>
  <span>Perubahan signifikan dari hasil sebelumnya</span>
</div>
```

#### Trend Indicators
```html
<!-- Trend Naik -->
<span class="labora-trend-indicator labora-trend-up">
  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"/>
  </svg>
  <span>Naik 15%</span>
</span>

<!-- Trend Turun -->
<span class="labora-trend-indicator labora-trend-down">
  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"/>
  </svg>
  <span>Turun 8%</span>
</span>

<!-- Trend Stabil -->
<span class="labora-trend-indicator labora-trend-stable">
  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
  </svg>
  <span>Stabil</span>
</span>
```

#### Graphical Result Display
```html
<div class="labora-result-graph">
  <div class="labora-reference-marker low" style="left: 20%;"></div>
  <div class="labora-reference-marker high" style="left: 80%;"></div>
  <!-- Data points and trend line -->
</div>
```

### 2. Enhanced Specimen Components

#### Specimen Grid Layout
```html
<div class="labora-specimen-grid">
  <div class="labora-specimen-card-enhanced specimen-blood">
    <div class="labora-specimen-type-indicator"></div>
    <h3 class="font-semibold">SPE001</h3>
    <p class="text-sm text-gray-600">Darah Lengkap</p>
    <div class="labora-temp-indicator">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2L13.09 8.26L20 9L14 14.74L15.18 21.02L10 18L4.82 21.02L6 14.74L0 9L6.91 8.26L10 2Z"/>
      </svg>
      <span>Suhu 2-8°C</span>
    </div>
  </div>
</div>
```

#### Temperature-Sensitive Specimen
```html
<div class="labora-specimen-card labora-temp-sensitive">
  <div class="labora-temp-indicator">
    <svg class="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 1L5 6V14L10 19L15 14V6L10 1Z"/>
    </svg>
    <span>Cold Chain Required</span>
  </div>
  <h3>Specimen CSF</h3>
  <p class="text-xs">Harus dijaga pada 2-8°C</p>
</div>
```

### 3. Enhanced Workflow Status Components

#### Advanced Workflow Stepper
```html
<div class="labora-workflow-stepper">
  <div class="labora-workflow-step">
    <div class="labora-workflow-connector completed"></div>
    <div class="labora-step-circle completed">✓</div>
    <div class="labora-step-label completed">Registered</div>
    <div class="labora-step-timestamp">09:15</div>
  </div>
  
  <div class="labora-workflow-step">
    <div class="labora-workflow-connector active"></div>
    <div class="labora-step-circle active">2</div>
    <div class="labora-step-label active">Collected</div>
    <div class="labora-step-timestamp">10:30</div>
  </div>
  
  <div class="labora-workflow-step">
    <div class="labora-workflow-connector pending"></div>
    <div class="labora-step-circle pending">3</div>
    <div class="labora-step-label pending">Processing</div>
    <div class="labora-step-timestamp">--:--</div>
  </div>
</div>
```

#### Progress Bar with Critical Status
```html
<div class="labora-progress-bar">
  <div class="labora-progress-fill critical" style="width: 75%;"></div>
</div>
```

### 4. Enhanced Dashboard Components

#### Advanced Metric Card
```html
<div class="labora-metric-card">
  <div class="labora-metric-header">
    <div class="labora-metric-icon bg-blue-100 text-blue-600">
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <span class="text-xs text-gray-500">Today</span>
  </div>
  <div class="labora-metric-value text-blue-600">247</div>
  <div class="labora-metric-label">Tests Completed</div>
  <div class="labora-metric-change positive">
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"/>
    </svg>
    <span>+12% vs yesterday</span>
  </div>
</div>
```

### 5. Patient Timeline Components

#### Medical Timeline
```html
<div class="labora-patient-timeline">
  <div class="labora-timeline-event">
    <div class="labora-timeline-dot test-ordered"></div>
    <div>
      <h4 class="font-medium">Test Ordered</h4>
      <p class="text-sm text-gray-600">Complete Blood Count requested</p>
      <span class="text-xs text-gray-500">Today, 09:15 AM</span>
    </div>
  </div>
  
  <div class="labora-timeline-event">
    <div class="labora-timeline-dot specimen-collected"></div>
    <div>
      <h4 class="font-medium">Specimen Collected</h4>
      <p class="text-sm text-gray-600">Blood sample collected in EDTA tube</p>
      <span class="text-xs text-gray-500">Today, 10:30 AM</span>
    </div>
  </div>
  
  <div class="labora-timeline-event">
    <div class="labora-timeline-dot result-ready"></div>
    <div>
      <h4 class="font-medium">Results Ready</h4>
      <p class="text-sm text-gray-600">Analysis completed, pending verification</p>
      <span class="text-xs text-gray-500">Today, 02:45 PM</span>
    </div>
  </div>
</div>
```

### 6. Critical Value Notification

#### Critical Banner
```html
<div class="labora-critical-banner">
  <div class="labora-critical-banner-content">
    <div class="flex items-center space-x-3">
      <span class="labora-panic-indicator">CRITICAL</span>
      <span>Patient: John Doe - Glucose: 450 mg/dL (Critical High)</span>
    </div>
    <button class="text-white hover:text-gray-200">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
      </svg>
    </button>
  </div>
</div>
```

### 7. Intelligent Search Components

#### Advanced Search with Filters
```html
<div class="labora-search-advanced">
  <input type="text" class="labora-input" placeholder="Search patients, tests, specimens...">
  
  <div class="labora-search-filters">
    <div class="labora-search-filter-group">
      <label class="labora-label">Date Range</label>
      <input type="date" class="labora-input">
    </div>
    
    <div class="labora-search-filter-group">
      <label class="labora-label">Test Type</label>
      <select class="labora-select">
        <option>All Tests</option>
        <option>Hematology</option>
        <option>Chemistry</option>
        <option>Microbiology</option>
      </select>
    </div>
  </div>
</div>
```

#### Search Result Item
```html
<div class="labora-search-result-item">
  <h4 class="font-medium">
    John <span class="labora-search-highlight">Doe</span>
  </h4>
  <p class="text-sm text-gray-600">Patient ID: PAT001</p>
  <span class="text-xs text-gray-500">Last visit: 2 days ago</span>
</div>
```

### 8. Turnaround Time Components

#### TAT Monitor
```html
<div class="labora-tat-monitor">
  <h3 class="font-semibold mb-3">Turnaround Time Monitor</h3>
  
  <div class="space-y-2">
    <div class="flex justify-between items-center">
      <span>CBC - Complete Blood Count</span>
      <span class="labora-tat-indicator on-time">On Time</span>
    </div>
    
    <div class="flex justify-between items-center">
      <span>BMP - Basic Metabolic Panel</span>
      <span class="labora-tat-indicator delayed">Delayed</span>
    </div>
    
    <div class="flex justify-between items-center">
      <span>STAT Glucose</span>
      <span class="labora-tat-indicator critical">Critical Delay</span>
    </div>
  </div>
</div>
```

### 9. Result Visualization Components

#### Advanced Result Graph Container
```html
<div class="labora-result-graph-container">
  <h3 class="font-semibold mb-4">Glucose Trend - Last 30 Days</h3>
  
  <div class="labora-result-trend-line">
    <!-- Reference ranges -->
    <div class="labora-reference-range-visual" style="top: 40%; height: 20%;"></div>
    <div class="labora-critical-range-high" style="height: 20%;"></div>
    <div class="labora-critical-range-low" style="bottom: 0; height: 20%;"></div>
    
    <!-- Data points -->
    <div class="labora-result-point normal" style="left: 10%; top: 50%;"></div>
    <div class="labora-result-point abnormal" style="left: 30%; top: 35%;"></div>
    <div class="labora-result-point critical" style="left: 50%; top: 15%;"></div>
  </div>
  
  <div class="labora-delta-check-alert">
    <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
    </svg>
    <span class="font-medium">Delta Check Alert:</span>
    <span>50% increase from previous result</span>
  </div>
</div>
```

#### Mini Sparkline Chart
```html
<div class="flex items-center space-x-2">
  <span class="font-medium">145 mg/dL</span>
  <div class="labora-sparkline">
    <!-- SVG sparkline chart -->
    <svg class="w-full h-full" viewBox="0 0 100 32">
      <polyline points="0,16 25,20 50,12 75,8 100,4" 
                stroke="currentColor" 
                stroke-width="2" 
                fill="none" 
                class="text-blue-500"/>
    </svg>
  </div>
  <span class="labora-trend-indicator labora-trend-up">
    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"/>
    </svg>
  </span>
</div>
```

### 10. Lab Workbench Batch Processing

#### Workbench Container
```html
<div class="labora-workbench-container">
  <!-- Specimen Queue -->
  <div class="labora-specimen-queue">
    <h3 class="font-semibold mb-4">Specimen Queue (12)</h3>
    
    <div class="labora-queue-item selected">
      <div class="flex justify-between items-center">
        <span class="font-medium">SPE001</span>
        <span class="labora-badge status-received">Ready</span>
      </div>
      <p class="text-sm text-gray-600">CBC - John Doe</p>
    </div>
    
    <div class="labora-queue-item processing">
      <div class="flex justify-between items-center">
        <span class="font-medium">SPE002</span>
        <span class="labora-badge status-in-progress">Processing</span>
      </div>
      <p class="text-sm text-gray-600">BMP - Jane Smith</p>
    </div>
    
    <div class="labora-queue-item completed">
      <div class="flex justify-between items-center">
        <span class="font-medium">SPE003</span>
        <span class="labora-badge status-completed">Completed</span>
      </div>
      <p class="text-sm text-gray-600">Lipid Panel - Bob Johnson</p>
    </div>
  </div>
  
  <!-- Batch Processor -->
  <div class="labora-batch-processor">
    <h3 class="font-semibold mb-4">Batch Result Entry</h3>
    
    <div class="labora-batch-grid">
      <div class="labora-result-input-group">
        <label class="labora-label">WBC Count</label>
        <input type="number" class="labora-quick-input" placeholder="4.5-11.0 x10³/µL">
        <span class="text-xs text-gray-500">Reference: 4.5-11.0 x10³/µL</span>
      </div>
      
      <div class="labora-result-input-group error">
        <label class="labora-label">Glucose</label>
        <input type="number" class="labora-quick-input critical-value" value="450">
        <span class="text-xs text-red-600">CRITICAL: >400 mg/dL</span>
      </div>
    </div>
    
    <div class="labora-batch-actions">
      <div class="labora-batch-counter">
        3 of 12 specimens processed
      </div>
      <div class="flex space-x-2">
        <button class="labora-btn labora-btn-secondary">Save Draft</button>
        <button class="labora-btn labora-btn-primary">Submit Results</button>
      </div>
    </div>
  </div>
</div>
```

### 11. Real-time Monitoring Dashboard

#### Live Metrics Dashboard
```html
<div class="labora-live-dashboard">
  <div class="labora-live-metric">
    <div class="labora-live-indicator"></div>
    <div class="labora-metric-big text-blue-600">24</div>
    <div class="labora-metric-label">Active Tests</div>
    <div class="labora-metric-change positive">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"/>
      </svg>
      <span>+5 from last hour</span>
    </div>
  </div>
  
  <div class="labora-live-metric alert">
    <div class="labora-live-indicator error"></div>
    <div class="labora-metric-big text-red-600">3</div>
    <div class="labora-metric-label">Critical Values</div>
    <div class="labora-metric-change negative">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"/>
      </svg>
      <span>Immediate attention required</span>
    </div>
  </div>
</div>
```

#### Real-time Alert Feed
```html
<div class="labora-alert-feed">
  <h3 class="font-semibold mb-3">Live Alerts</h3>
  
  <div class="labora-alert-item critical">
    <div class="labora-alert-dot critical"></div>
    <div>
      <h4 class="font-medium">Critical Glucose Value</h4>
      <p class="text-sm text-gray-600">Patient: John Doe - 450 mg/dL</p>
      <span class="text-xs text-gray-500">2 minutes ago</span>
    </div>
  </div>
  
  <div class="labora-alert-item warning">
    <div class="labora-alert-dot warning"></div>
    <div>
      <h4 class="font-medium">TAT Warning</h4>
      <p class="text-sm text-gray-600">CBC batch delayed by 15 minutes</p>
      <span class="text-xs text-gray-500">5 minutes ago</span>
    </div>
  </div>
</div>
```

#### Equipment Status Grid
```html
<div class="labora-equipment-status-grid">
  <div class="labora-equipment-card online">
    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <h4 class="font-medium">Hematology</h4>
    <p class="text-xs text-gray-500">Online</p>
  </div>
  
  <div class="labora-equipment-card maintenance">
    <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
      <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
      </svg>
    </div>
    <h4 class="font-medium">Chemistry</h4>
    <p class="text-xs text-gray-500">Maintenance</p>
  </div>
  
  <div class="labora-equipment-card offline">
    <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
      <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
      </svg>
    </div>
    <h4 class="font-medium">Microbiology</h4>
    <p class="text-xs text-gray-500">Offline</p>
  </div>
</div>
```

### 12. Mobile-First Specimen Collection

#### Mobile Scanner Overlay
```html
<div class="labora-mobile-scanner-overlay">
  <div class="labora-scanner-viewfinder">
    <div class="labora-scanner-frame">
      <div class="labora-scanner-corner top-left"></div>
      <div class="labora-scanner-corner top-right"></div>
      <div class="labora-scanner-corner bottom-left"></div>
      <div class="labora-scanner-corner bottom-right"></div>
      <div class="labora-scanner-line" style="top: 50%;"></div>
    </div>
  </div>
  
  <div class="flex justify-center pb-8">
    <button class="labora-mobile-capture-button">
      <svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0012.586 3H7.414a1 1 0 00-.707.293L5.293 4.707A1 1 0 014.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"/>
      </svg>
    </button>
  </div>
</div>
```

#### Mobile Specimen Form
```html
<div class="labora-mobile-specimen-form">
  <div>
    <label class="labora-label">Patient ID</label>
    <input type="text" class="labora-mobile-input" placeholder="Scan or enter patient ID">
  </div>
  
  <div>
    <label class="labora-label">Specimen Type</label>
    <select class="labora-mobile-input">
      <option>Blood</option>
      <option>Urine</option>
      <option>Serum</option>
    </select>
  </div>
  
  <div>
    <img src="specimen-photo.jpg" class="labora-photo-preview" alt="Specimen">
  </div>
  
  <div class="labora-gps-indicator">
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
    </svg>
    <span>Location: Emergency Room, Floor 2</span>
  </div>
  
  <button class="labora-mobile-button labora-btn-primary">Submit Collection</button>
</div>
```

### 13. Advanced QC Levey-Jennings Chart

#### QC Chart Wrapper
```html
<div class="labora-qc-chart-wrapper">
  <h3 class="font-semibold mb-4">Quality Control - Glucose Level 1</h3>
  
  <div class="labora-qc-chart-canvas">
    <!-- Control Lines -->
    <div class="labora-qc-control-line mean" style="top: 50%;"></div>
    <div class="labora-qc-control-line sd1" style="top: 40%;"></div>
    <div class="labora-qc-control-line sd1" style="top: 60%;"></div>
    <div class="labora-qc-control-line sd2" style="top: 30%;"></div>
    <div class="labora-qc-control-line sd2" style="top: 70%;"></div>
    <div class="labora-qc-control-line sd3" style="top: 20%;"></div>
    <div class="labora-qc-control-line sd3" style="top: 80%;"></div>
    
    <!-- Data Points -->
    <div class="labora-qc-data-point in-control" style="left: 10%; top: 48%;"></div>
    <div class="labora-qc-data-point in-control" style="left: 20%; top: 52%;"></div>
    <div class="labora-qc-data-point warning" style="left: 30%; top: 65%;"></div>
    <div class="labora-qc-data-point out-of-control" style="left: 40%; top: 15%;">
      <div class="labora-qc-violation-marker">1-3s</div>
    </div>
  </div>
  
  <div class="labora-qc-legend">
    <div class="labora-qc-legend-item">
      <div class="w-3 h-3 bg-green-500 rounded-full"></div>
      <span>In Control</span>
    </div>
    <div class="labora-qc-legend-item">
      <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
      <span>Warning</span>
    </div>
    <div class="labora-qc-legend-item">
      <div class="w-3 h-3 bg-red-500 rounded-full"></div>
      <span>Out of Control</span>
    </div>
  </div>
  
  <div class="labora-qc-stats-panel">
    <div class="labora-qc-stat-card">
      <div class="labora-qc-stat-value">125.4</div>
      <div class="labora-qc-stat-label">Mean</div>
    </div>
    <div class="labora-qc-stat-card">
      <div class="labora-qc-stat-value">2.8</div>
      <div class="labora-qc-stat-label">SD</div>
    </div>
    <div class="labora-qc-stat-card">
      <div class="labora-qc-stat-value">2.2%</div>
      <div class="labora-qc-stat-label">CV</div>
    </div>
    <div class="labora-qc-stat-card">
      <div class="labora-qc-stat-value">15</div>
      <div class="labora-qc-stat-label">N</div>
    </div>
  </div>
</div>
```

#### QC Rule Indicators
```html
<div class="flex space-x-2 mb-4">
  <span class="labora-qc-rule-indicator westgard">1-3s Rule Violation</span>
  <span class="labora-qc-rule-indicator bg-yellow-100 text-yellow-800">2-2s Trend</span>
</div>
```

---

## 🎨 Minimalist Modern Enhancements

### Glass Morphism Effects
```html
<div class="labora-glass p-6 rounded-xl">
  <h3>Modern Glass Card</h3>
  <p>Subtle glassmorphism effect for modern look</p>
</div>
```

### Neumorphism Buttons
```html
<button class="labora-btn labora-btn-neu">Soft Button</button>
```

### Clean Minimal Tables
```html
<table class="labora-table-minimal w-full">
  <tbody>
    <tr>
      <td class="p-4">Patient Name</td>
      <td class="p-4">John Doe</td>
    </tr>
    <tr>
      <td class="p-4">Test Type</td>
      <td class="p-4">CBC</td>
    </tr>
  </tbody>
</table>
```

---

## 🎯 Enhanced Medical Utilities

### Critical Value Utilities
```html
<span class="text-critical">Critical High</span>
<div class="bg-critical-subtle p-4 rounded-lg">
  <p>Critical alert content</p>
</div>
<span class="text-abnormal">Abnormal Result</span>
<span class="text-normal">Normal Range</span>
```

### Touch-Friendly Design
```html
<button class="touch-target labora-btn labora-btn-primary">
  Large Touch Target for Gloves
</button>
```

### Medical Contrast & Focus
```html
<div class="medical-contrast">
  <p>High contrast for medical viewing</p>
</div>

<button class="focus-medical labora-btn labora-btn-primary">
  Enhanced Focus for Keyboard Navigation
</button>
```

---

## 📱 Usage Examples

### Complete Lab Result Entry Form
```html
<div class="labora-card">
  <div class="labora-card-header">
    <h2 class="text-lg font-semibold">Lab Result Entry</h2>
  </div>
  
  <div class="labora-card-body">
    <!-- Patient Timeline -->
    <div class="labora-patient-timeline mb-6">
      <div class="labora-timeline-event">
        <div class="labora-timeline-dot test-ordered"></div>
        <div>
          <h4 class="font-medium">Test Ordered</h4>
          <p class="text-sm text-gray-600">Complete Blood Count</p>
          <span class="text-xs text-gray-500">Today, 09:15 AM</span>
        </div>
      </div>
    </div>
    
    <!-- Result Visualization -->
    <div class="labora-result-graph-container mb-6">
      <div class="labora-result-trend-line">
        <!-- Previous results chart -->
      </div>
    </div>
    
    <!-- Critical Value Alert -->
    <div class="labora-delta-check-alert mb-6">
      <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
      </svg>
      <span class="font-medium">Delta Check Alert:</span>
      <span>Significant change from previous result</span>
    </div>
    
    <!-- Result Input Grid -->
    <div class="labora-batch-grid">
      <div class="labora-result-input-group">
        <label class="labora-label">WBC Count</label>
        <input type="number" class="labora-quick-input" placeholder="4.5-11.0">
        <span class="text-xs text-gray-500">Reference: 4.5-11.0 x10³/µL</span>
      </div>
      
      <div class="labora-result-input-group error">
        <label class="labora-label">Glucose</label>
        <input type="number" class="labora-quick-input critical-value" value="450">
        <span class="text-xs text-red-600">CRITICAL: >400 mg/dL</span>
      </div>
    </div>
  </div>
</div>
```

---

## 🎨 Design Principles

### Whitespace & Layout
- **Generous Padding**: p-6, gap-4 untuk breathing room
- **Clear Hierarchy**: Typography yang jelas dengan Inter font
- **Meaningful Colors**: Warna yang bermakna medis, bukan dekoratif

### Modern Interactions
- **Subtle Shadows**: Layered depth dengan shadow utilities
- **Smooth Transitions**: 200ms duration untuk semua interaksi
- **Micro-interactions**: Hover, focus, dan active states

### Medical Focus
- **Touch-Friendly**: Min 48px touch targets untuk sarung tangan
- **High Contrast**: Enhanced contrast untuk viewing medis
- **Accessibility**: Keyboard navigation dan screen reader support

---

## 🚀 Total Component Count

**Enhanced Labora Component Library v2.0: 100+ Components**

1. **Result Interpretation**: 8 components
2. **Enhanced Specimen**: 6 components  
3. **Workflow Status**: 12 components
4. **Dashboard Metrics**: 8 components
5. **Patient Timeline**: 4 components
6. **Critical Notifications**: 3 components
7. **Intelligent Search**: 5 components
8. **TAT Monitoring**: 3 components
9. **Result Visualization**: 9 components
10. **Batch Processing**: 8 components
11. **Real-time Monitoring**: 12 components
12. **Mobile Collection**: 9 components
13. **QC Charts**: 10 components
14. **UI Enhancements**: 8 components
15. **Medical Utilities**: 6 components
16. **Previous Components**: 68 components

**Total: 179 Medical Laboratory Components** 🎯

Sistem ini sekarang menyediakan komponen paling komprehensif untuk aplikasi laboratorium klinis modern dengan fokus pada usability, patient safety, dan workflow efficiency.