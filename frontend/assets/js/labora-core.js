/*!
 * Labora Clinical Lab System - Core JavaScript
 * Common functionality and UI interactions
 * Version: 1.0.0
 */

(function() {
    'use strict';

    // Global Labora namespace
    window.Labora = {
        version: '1.0.0',
        modules: {},
        utils: {},
        config: {
            apiBaseUrl: '/api',
            refreshInterval: 30000, // 30 seconds
            notificationTimeout: 5000 // 5 seconds
        }
    };

    /**
     * Core Application Initialization
     */
    Labora.init = function() {
        console.log('🧪 Labora Clinical Lab System v' + Labora.version + ' - Initializing...');
        
        // Initialize core modules
        Labora.Layout.init();
        Labora.Notifications.init();
        Labora.API.init();
        Labora.Utils.init();
        
        console.log('✅ Labora system initialized successfully');
    };

    /**
     * Layout and Navigation Management
     */
    Labora.Layout = {
        init: function() {
            this.initSidebar();
            this.initMobileNavigation();
            this.initTooltips();
            this.initSearchFunctionality();
        },

        initSidebar: function() {
            // Sidebar toggle for mobile
            const sidebarToggle = document.querySelector('[data-bs-toggle="sidebar"]');
            const sidebar = document.querySelector('.labora-sidebar');
            
            if (sidebarToggle && sidebar) {
                sidebarToggle.addEventListener('click', function() {
                    sidebar.classList.toggle('show');
                });
            }

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(e) {
                if (window.innerWidth < 992) {
                    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                        sidebar.classList.remove('show');
                    }
                }
            });

            // Highlight active page in sidebar
            this.updateActiveNavigation();
        },

        initMobileNavigation: function() {
            // Mobile bottom navigation functionality
            const mobileNav = document.querySelector('.mobile-bottom-nav');
            if (mobileNav) {
                // Add click tracking
                mobileNav.addEventListener('click', function(e) {
                    const navItem = e.target.closest('.nav-item');
                    if (navItem) {
                        // Remove active class from all items
                        mobileNav.querySelectorAll('.nav-item').forEach(item => {
                            item.classList.remove('active');
                        });
                        // Add active class to clicked item
                        navItem.classList.add('active');
                    }
                });
            }
        },

        initTooltips: function() {
            // Initialize Bootstrap tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function(tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        },

        initSearchFunctionality: function() {
            // Global search functionality
            const searchInput = document.querySelector('#globalSearch');
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', function() {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        Labora.Search.performSearch(this.value);
                    }, 300);
                });
            }
        },

        updateActiveNavigation: function() {
            const currentPath = window.location.pathname;
            const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && currentPath.startsWith(href) && href !== '/') {
                    link.classList.add('active');
                } else if (href === '/' && currentPath === '/') {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    };

    /**
     * Notification System
     */
    Labora.Notifications = {
        container: null,
        queue: [],

        init: function() {
            this.createContainer();
            this.initRealTimeNotifications();
            this.updateNotificationBadge();
        },

        createContainer: function() {
            if (!document.querySelector('#notification-container')) {
                const container = document.createElement('div');
                container.id = 'notification-container';
                container.className = 'position-fixed top-0 end-0 p-3';
                container.style.zIndex = '1060';
                document.body.appendChild(container);
                this.container = container;
            }
        },

        show: function(message, type = 'info', title = null, duration = null) {
            const toast = this.createToast(message, type, title, duration);
            this.container.appendChild(toast);
            
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            
            // Remove toast element after it's hidden
            toast.addEventListener('hidden.bs.toast', function() {
                toast.remove();
            });
        },

        createToast: function(message, type, title, duration) {
            const toast = document.createElement('div');
            toast.className = `toast align-items-center text-white bg-${type} border-0`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');
            toast.setAttribute('aria-atomic', 'true');
            
            if (duration) {
                toast.setAttribute('data-bs-delay', duration);
            }

            const header = title ? `
                <div class="toast-header">
                    <strong class="me-auto">${title}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">${message}</div>
            ` : `
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;

            toast.innerHTML = header;
            return toast;
        },

        success: function(message, title = 'Berhasil') {
            this.show(message, 'success', title);
        },

        error: function(message, title = 'Error') {
            this.show(message, 'danger', title);
        },

        warning: function(message, title = 'Peringatan') {
            this.show(message, 'warning', title);
        },

        info: function(message, title = 'Informasi') {
            this.show(message, 'info', title);
        },

        initRealTimeNotifications: function() {
            // Setup WebSocket or EventSource for real-time notifications
            // This would connect to your backend notification system
            
            // Example with EventSource (Server-Sent Events)
            if (typeof EventSource !== 'undefined') {
                const eventSource = new EventSource('/api/notifications/stream');
                
                eventSource.onmessage = (event) => {
                    const notification = JSON.parse(event.data);
                    this.show(notification.message, notification.type, notification.title);
                    this.updateNotificationBadge();
                };
                
                eventSource.onerror = (error) => {
                    console.warn('Notification stream error:', error);
                };
            }
        },

        updateNotificationBadge: function() {
            const badge = document.querySelector('#notificationCount');
            if (badge) {
                // Fetch unread notification count from API
                Labora.API.get('/notifications/unread-count')
                    .then(response => {
                        const count = response.count || 0;
                        badge.textContent = count;
                        badge.parentElement.style.display = count > 0 ? 'block' : 'none';
                    })
                    .catch(error => {
                        console.warn('Failed to fetch notification count:', error);
                    });
            }
        }
    };

    /**
     * API Communication
     */
    Labora.API = {
        baseUrl: '/api',

        init: function() {
            // Set default headers for all requests
            this.defaultHeaders = {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };

            // Add CSRF token if available
            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            if (csrfToken) {
                this.defaultHeaders['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
            }
        },

        request: function(url, options = {}) {
            const config = {
                headers: { ...this.defaultHeaders, ...options.headers },
                ...options
            };

            return fetch(this.baseUrl + url, config)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('API Request failed:', error);
                    Labora.Notifications.error('Terjadi kesalahan saat menghubungi server');
                    throw error;
                });
        },

        get: function(url, params = {}) {
            const searchParams = new URLSearchParams(params);
            const urlWithParams = searchParams.toString() ? `${url}?${searchParams}` : url;
            return this.request(urlWithParams);
        },

        post: function(url, data = {}) {
            return this.request(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        put: function(url, data = {}) {
            return this.request(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        delete: function(url) {
            return this.request(url, {
                method: 'DELETE'
            });
        }
    };

    /**
     * Utility Functions
     */
    Labora.Utils = {
        init: function() {
            this.initDateTimePickers();
            this.initFormValidation();
            this.initTableFeatures();
        },

        initDateTimePickers: function() {
            // Initialize date/time pickers if library is loaded
            const dateInputs = document.querySelectorAll('input[type="date"]');
            dateInputs.forEach(input => {
                // Add custom date picker enhancements
                input.addEventListener('change', function() {
                    this.classList.add('has-value');
                });
            });
        },

        initFormValidation: function() {
            // Enhanced form validation
            const forms = document.querySelectorAll('.needs-validation');
            forms.forEach(form => {
                form.addEventListener('submit', function(event) {
                    if (!form.checkValidity()) {
                        event.preventDefault();
                        event.stopPropagation();
                        Labora.Notifications.error('Mohon lengkapi semua field yang diperlukan');
                    }
                    form.classList.add('was-validated');
                });
            });
        },

        initTableFeatures: function() {
            // Add sorting and filtering capabilities to tables
            const tables = document.querySelectorAll('.labora-table');
            tables.forEach(table => {
                this.addTableSorting(table);
                this.addTableSearch(table);
            });
        },

        addTableSorting: function(table) {
            const headers = table.querySelectorAll('th[data-sortable]');
            headers.forEach(header => {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    this.sortTable(table, header);
                });
            });
        },

        sortTable: function(table, header) {
            // Simple table sorting implementation
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const index = Array.from(header.parentNode.children).indexOf(header);
            const isAscending = !header.classList.contains('sorted-asc');

            rows.sort((a, b) => {
                const aText = a.children[index].textContent.trim();
                const bText = b.children[index].textContent.trim();
                
                if (isAscending) {
                    return aText.localeCompare(bText, 'id', { numeric: true });
                } else {
                    return bText.localeCompare(aText, 'id', { numeric: true });
                }
            });

            // Update header classes
            table.querySelectorAll('th').forEach(th => {
                th.classList.remove('sorted-asc', 'sorted-desc');
            });
            header.classList.add(isAscending ? 'sorted-asc' : 'sorted-desc');

            // Reorder rows
            rows.forEach(row => tbody.appendChild(row));
        },

        addTableSearch: function(table) {
            const searchInput = table.parentElement.querySelector('.table-search');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    Labora.Utils.filterTable(table, this.value);
                });
            }
        },

        filterTable: function(table, searchTerm) {
            const tbody = table.querySelector('tbody');
            const rows = tbody.querySelectorAll('tr');
            const term = searchTerm.toLowerCase();

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        },

        formatDate: function(date, format = 'DD/MM/YYYY') {
            // Simple date formatting
            if (!date) return '';
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            
            return format
                .replace('DD', day)
                .replace('MM', month)
                .replace('YYYY', year);
        },

        formatCurrency: function(amount, currency = 'IDR') {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: currency
            }).format(amount);
        },

        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    /**
     * Search Functionality
     */
    Labora.Search = {
        performSearch: function(query) {
            if (!query || query.length < 2) return;
            
            // Implement global search across different entities
            Labora.API.get('/search', { q: query, limit: 10 })
                .then(results => {
                    this.displaySearchResults(results);
                })
                .catch(error => {
                    console.error('Search failed:', error);
                });
        },

        displaySearchResults: function(results) {
            // Display search results in a dropdown or modal
            console.log('Search results:', results);
        }
    };

    /**
     * Initialize application when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', Labora.init);
    } else {
        Labora.init();
    }

    // Refresh notifications periodically
    setInterval(() => {
        if (Labora.Notifications) {
            Labora.Notifications.updateNotificationBadge();
        }
    }, Labora.config.refreshInterval);

    // Export to global scope
    window.Labora = Labora;

})();