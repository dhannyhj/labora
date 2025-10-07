# 🎯 Quick Reference: Medical Components Cheat Sheet

## 📋 **INSTANT COMPONENT LOOKUP**

### **🧪 SPECIMEN WORKFLOW**
```html
<!-- Specimen Tracking -->
<div class="labora-specimen-tracker">
  <div class="labora-specimen-card">
    <span class="labora-specimen-status collected|in-transit|received|rejected">
      Status Text
    </span>
  </div>
</div>

<!-- Barcode Scanner -->
<div class="labora-barcode-scanner">
  <div class="labora-scanner-overlay">
    <!-- Scanner camera view -->
  </div>
  <div class="labora-scanner-result">
    <!-- Scan result -->
  </div>
</div>

<!-- Chain of Custody -->
<div class="labora-specimen-timeline">
  <div class="labora-timeline-item">
    <div class="labora-timeline-marker completed|active|pending"></div>
    <div>Event description</div>
  </div>
</div>
```

### **📋 TEST ORDERING**
```html
<!-- Test Selection -->
<div class="labora-test-selector">
  <div class="labora-test-item [selected]">
    <h4>Test Name</h4>
    <p>Description</p>
    <span>Price</span>
  </div>
</div>

<!-- Order Summary -->
<div class="labora-order-summary">
  <div class="labora-order-item">
    <span>Test</span>
    <span>Price</span>
  </div>
  <div class="labora-order-total">Total</div>
</div>

<!-- Urgency Selection -->
<div class="labora-urgency-selector">
  <div class="labora-urgency-option routine|urgent|stat [selected]">
    Priority Level
  </div>
</div>
```

### **📊 RESULT ENTRY**
```html
<!-- Result Input -->
<div class="labora-result-input">
  <div class="labora-result-grid">
    <div class="labora-result-item [critical|abnormal]">
      <div class="labora-result-field">
        <label>Test Name</label>
        <input class="labora-result-input-field [critical]">
        <div class="labora-reference-ranges">Reference: X-Y</div>
        <span class="labora-result-indicator normal|abnormal|critical">
          Status
        </span>
      </div>
    </div>
  </div>
</div>

<!-- Verification Queue -->
<div class="labora-verification-queue">
  <div class="labora-verification-item">
    <div class="labora-verification-header">Header</div>
    <div class="labora-verification-actions">
      <button class="labora-btn labora-btn-success">Approve</button>
    </div>
  </div>
</div>
```

### **👤 PATIENT MANAGEMENT**
```html
<!-- Patient Search -->
<div class="labora-patient-search">
  <input class="labora-input" placeholder="Search patients...">
  <div class="labora-patient-dropdown">
    <div class="labora-patient-item">
      <div class="labora-patient-avatar">XX</div>
      <div>Patient Info</div>
    </div>
  </div>
</div>

<!-- Patient Card -->
<div class="labora-patient-card">
  <div class="labora-patient-header">
    <div class="labora-patient-avatar">XX</div>
    <div class="labora-patient-info">
      Patient details
    </div>
  </div>
</div>
```

### **🚨 CRITICAL ALERTS**
```html
<!-- Critical Value Alert -->
<div class="labora-critical-alert">
  <div class="labora-panic-value">PANIC VALUE</div>
  <div class="labora-alert-header">
    <i class="fas fa-exclamation-triangle labora-alert-icon"></i>
    <span class="labora-alert-title">Alert Title</span>
  </div>
  <div class="labora-alert-content">
    Alert details
  </div>
  <div class="labora-alert-actions">
    <button class="labora-btn labora-btn-danger">Action</button>
  </div>
</div>

<!-- System Alerts -->
<div class="labora-system-alert">System notification</div>
<div class="labora-equipment-alert">Equipment alert</div>
```

---

## 🎨 **STATUS COLOR QUICK REF**

```css
/* Specimen Status */
.collected     → Blue background
.in-transit    → Yellow background  
.received      → Green background
.rejected      → Red background

/* Result Indicators */
.normal        → Green background
.abnormal      → Yellow background
.critical      → Red background + pulse animation

/* Equipment Status */
.online        → Green background
.offline       → Red background
.maintenance   → Yellow background

/* Urgency Levels */
.routine       → Gray styling
.urgent        → Yellow styling
.stat          → Red styling
```

---

## 📱 **MOBILE COMPONENTS**

```html
<!-- Mobile Scanner -->
<div class="labora-mobile-scanner">
  Mobile barcode interface
</div>

<!-- Mobile Result Entry -->
<div class="labora-mobile-result-entry">
  <input> <!-- Auto-sized for gloves -->
</div>

<!-- Mobile Specimens -->
<div class="labora-mobile-specimen-list">
  Touch-friendly specimen list
</div>

<!-- Mobile Alerts -->
<div class="labora-mobile-alerts">
  Fixed positioned alerts
</div>
```

---

## 🔬 **QUALITY CONTROL**

```html
<!-- QC Chart -->
<div class="labora-qc-chart">
  QC control chart display
</div>

<!-- QC Violation -->
<div class="labora-qc-violation">
  QC rule violation alert
</div>

<!-- Equipment Status -->
<span class="labora-equipment-status online|offline|maintenance">
  Status
</span>
```

---

## ⏱️ **TURNAROUND TIME**

```html
<!-- TAT Monitor -->
<div class="labora-tat-monitor">
  TAT dashboard
</div>

<!-- TAT Indicator -->
<span class="labora-tat-indicator on-time|delayed|critical">
  TAT Status
</span>
```

---

## 🚀 **DEVELOPMENT SHORTCUTS**

### **Common Patterns**
```html
<!-- Standard Page Layout -->
<main class="labora-main">
  <div class="labora-content">
    <div class="labora-card">
      <div class="labora-card-header">Title</div>
      <div class="labora-card-body">
        <!-- Use medical components here -->
      </div>
    </div>
  </div>
</main>

<!-- Modal with Medical Content -->
<div class="labora-modal-overlay">
  <div class="labora-modal">
    <div class="labora-modal-header">Title</div>
    <div class="labora-modal-body">
      <!-- Medical components -->
    </div>
    <div class="labora-modal-footer">
      <button class="labora-btn labora-btn-primary">Action</button>
    </div>
  </div>
</div>
```

### **Form Integration**
```html
<!-- Medical Form -->
<form class="space-y-6">
  <div class="labora-patient-demographics">
    <div>
      <label class="labora-label">Patient Name</label>
      <input class="labora-input">
    </div>
  </div>
  
  <div class="labora-test-selector">
    <!-- Test selection components -->
  </div>
  
  <div class="labora-urgency-selector">
    <!-- Urgency components -->
  </div>
</form>
```

---

## ✅ **COMPONENT CHECKLIST FOR PAGES**

### **Patient Page Needs:**
- [ ] `.labora-patient-search`
- [ ] `.labora-patient-card`  
- [ ] `.labora-patient-history`
- [ ] `.labora-patient-demographics`

### **Specimen Page Needs:**
- [ ] `.labora-specimen-tracker`
- [ ] `.labora-specimen-timeline`
- [ ] `.labora-barcode-scanner`
- [ ] `.labora-specimen-status`

### **Test Page Needs:**
- [ ] `.labora-test-selector`
- [ ] `.labora-order-summary`
- [ ] `.labora-urgency-selector`
- [ ] `.labora-test-catalog`

### **Results Page Needs:**
- [ ] `.labora-result-input`
- [ ] `.labora-verification-queue`
- [ ] `.labora-critical-alert`
- [ ] `.labora-reference-ranges`

---

*Use this cheat sheet for instant component reference during development. All components are medical-tested and accessibility-compliant!* 🏥✅