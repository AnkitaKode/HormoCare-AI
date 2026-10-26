/**
 * HormoCare AI - Client Storage Layer
 * 
 * Provides unified local data persistence:
 * 1. Automatically communicates with the local Node.js server REST API when available.
 * 2. Persists data directly to the local disk database (data/hormocare_db.json) and uploads folder.
 * 3. Gracefully falls back to browser localStorage when running in standalone mode (file://).
 * 4. Provides a universal "Data Management Hub" UI modal across all pages.
 */

class HormoCareStorageManager {
    constructor() {
        this.isServerConnected = false;
        this.serverStatus = null;
        this.apiUrl = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:3000';
        this.init();
    }

    async init() {
        await this.checkServerConnection();
        this.injectUI();
        this.attachGlobalEvents();
    }

    async checkServerConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${this.apiUrl}/api/status`, {
                signal: controller.signal,
                cache: 'no-cache'
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                this.serverStatus = await res.json();
                this.isServerConnected = true;
                this.updateIndicator();
                return true;
            }
        } catch (e) {
            // Server not reachable or opened via file:// without local server running
        }
        this.isServerConnected = false;
        this.updateIndicator();
        return false;
    }

    // ==================== Core App Data ====================
    async getAppData() {
        if (this.isServerConnected) {
            try {
                const res = await fetch(`${this.apiUrl}/api/data`);
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('hormocare_data', JSON.stringify(data));
                    return data;
                }
            } catch (e) {
                console.warn('Falling back to localStorage for getAppData');
            }
        }
        try {
            return JSON.parse(localStorage.getItem('hormocare_data') || '{}');
        } catch {
            return {};
        }
    }

    async saveAppData(appData) {
        localStorage.setItem('hormocare_data', JSON.stringify(appData));
        if (this.isServerConnected) {
            try {
                await fetch(`${this.apiUrl}/api/data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(appData)
                });
            } catch (e) {
                console.warn('Could not sync appData to local server:', e);
            }
        }
    }

    // ==================== Checklist ====================
    async getChecklist() {
        if (this.isServerConnected) {
            try {
                const res = await fetch(`${this.apiUrl}/api/checklist`);
                if (res.ok) {
                    const checks = await res.json();
                    localStorage.setItem('hormocare_checklist', JSON.stringify(checks));
                    return checks;
                }
            } catch (e) {}
        }
        try {
            return JSON.parse(localStorage.getItem('hormocare_checklist') || '{}');
        } catch {
            return {};
        }
    }

    async saveChecklist(checklist) {
        localStorage.setItem('hormocare_checklist', JSON.stringify(checklist));
        if (this.isServerConnected) {
            try {
                await fetch(`${this.apiUrl}/api/checklist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(checklist)
                });
            } catch (e) {}
        }
    }

    // ==================== Doctor Consultations ====================
    async getBookings() {
        if (this.isServerConnected) {
            try {
                const res = await fetch(`${this.apiUrl}/api/bookings`);
                if (res.ok) {
                    const bookings = await res.json();
                    localStorage.setItem('hormocare_bookings', JSON.stringify(bookings));
                    return bookings;
                }
            } catch (e) {}
        }
        try {
            return JSON.parse(localStorage.getItem('hormocare_bookings') || '[]');
        } catch {
            return [];
        }
    }

    async saveBooking(booking) {
        let bookings = await this.getBookings();
        if (!booking.id) {
            booking.id = 'BK-' + Date.now().toString(36).toUpperCase();
        }
        if (!booking.status) {
            booking.status = 'Confirmed';
        }
        if (!booking.bookingDate) {
            booking.bookingDate = new Date().toISOString();
        }

        bookings.unshift(booking);
        localStorage.setItem('hormocare_bookings', JSON.stringify(bookings));

        if (this.isServerConnected) {
            try {
                await fetch(`${this.apiUrl}/api/bookings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(booking)
                });
            } catch (e) {}
        }
        return booking;
    }

    async cancelBooking(id) {
        let bookings = await this.getBookings();
        bookings = bookings.filter(b => b.id !== id);
        localStorage.setItem('hormocare_bookings', JSON.stringify(bookings));

        if (this.isServerConnected) {
            try {
                await fetch(`${this.apiUrl}/api/bookings/${id}`, { method: 'DELETE' });
            } catch (e) {}
        }
        return true;
    }

    // ==================== Medicine Orders ====================
    async getOrders() {
        if (this.isServerConnected) {
            try {
                const res = await fetch(`${this.apiUrl}/api/orders`);
                if (res.ok) {
                    const orders = await res.json();
                    localStorage.setItem('hormocare_orders', JSON.stringify(orders));
                    return orders;
                }
            } catch (e) {}
        }
        try {
            return JSON.parse(localStorage.getItem('hormocare_orders') || '[]');
        } catch {
            return [];
        }
    }

    async saveOrder(order) {
        let orders = await this.getOrders();
        if (!order.id) {
            order.id = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        }
        if (!order.date) {
            order.date = new Date().toISOString();
        }
        if (!order.status) {
            order.status = 'Order Confirmed';
        }

        orders.unshift(order);
        localStorage.setItem('hormocare_orders', JSON.stringify(orders));

        if (this.isServerConnected) {
            try {
                await fetch(`${this.apiUrl}/api/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order)
                });
            } catch (e) {}
        }
        return order;
    }

    // ==================== Medical Reports ====================
    async getReports() {
        if (this.isServerConnected) {
            try {
                const res = await fetch(`${this.apiUrl}/api/reports`);
                if (res.ok) {
                    const reports = await res.json();
                    localStorage.setItem('hormocare_reports', JSON.stringify(reports));
                    return reports;
                }
            } catch (e) {}
        }
        try {
            return JSON.parse(localStorage.getItem('hormocare_reports') || '[]');
        } catch {
            return [];
        }
    }

    async uploadReport(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Data = reader.result;
                const reportRecord = {
                    id: 'REP-' + Date.now().toString(36),
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    type: file.type || 'application/octet-stream',
                    uploadDate: new Date().toISOString(),
                    dataUrl: base64Data
                };

                if (this.isServerConnected) {
                    try {
                        const res = await fetch(`${this.apiUrl}/api/reports`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: file.name,
                                size: reportRecord.size,
                                type: reportRecord.type,
                                base64Data
                            })
                        });
                        if (res.ok) {
                            const result = await res.json();
                            resolve(result.report);
                            return;
                        }
                    } catch (e) {
                        console.warn('Error uploading to server, storing in localStorage', e);
                    }
                }

                // Fallback to localStorage
                let reports = await this.getReports();
                reports.unshift(reportRecord);
                localStorage.setItem('hormocare_reports', JSON.stringify(reports));
                resolve(reportRecord);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async deleteReport(id) {
        let reports = await this.getReports();
        reports = reports.filter(r => r.id !== id);
        localStorage.setItem('hormocare_reports', JSON.stringify(reports));

        if (this.isServerConnected) {
            try {
                await fetch(`${this.apiUrl}/api/reports/${id}`, { method: 'DELETE' });
            } catch (e) {}
        }
        return true;
    }

    // ==================== User Reviews ====================
    async getReviews() {
        if (this.isServerConnected) {
            try {
                const res = await fetch(`${this.apiUrl}/api/reviews`);
                if (res.ok) {
                    const reviews = await res.json();
                    localStorage.setItem('hormocare_reviews', JSON.stringify(reviews));
                    return reviews;
                }
            } catch (e) {}
        }
        try {
            return JSON.parse(localStorage.getItem('hormocare_reviews') || '[]');
        } catch {
            return [];
        }
    }

    async saveReview(review) {
        let reviews = await this.getReviews();
        if (!review.id) review.id = 'REV-' + Date.now().toString(36);
        if (!review.date) review.date = new Date().toISOString().split('T')[0];

        reviews.unshift(review);
        localStorage.setItem('hormocare_reviews', JSON.stringify(reviews));

        if (this.isServerConnected) {
            try {
                await fetch(`${this.apiUrl}/api/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(review)
                });
            } catch (e) {}
        }
        return review;
    }

    async markReviewHelpful(reviewId) {
        let reviews = await this.getReviews();
        const rev = reviews.find(r => r.id === reviewId);
        if (rev) {
            rev.helpful = (rev.helpful || 0) + 1;
            localStorage.setItem('hormocare_reviews', JSON.stringify(reviews));
        }

        if (this.isServerConnected) {
            try {
                await fetch(`${this.apiUrl}/api/reviews/helpful`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: reviewId })
                });
            } catch (e) {}
        }
    }

    // ==================== Backup, Sample Data & Reset ====================
    async exportBackup() {
        if (this.isServerConnected) {
            window.location.href = `${this.apiUrl}/api/export`;
            return;
        }

        // Offline export from localStorage
        const backup = {
            appData: JSON.parse(localStorage.getItem('hormocare_data') || '{}'),
            checklist: JSON.parse(localStorage.getItem('hormocare_checklist') || '{}'),
            bookings: JSON.parse(localStorage.getItem('hormocare_bookings') || '[]'),
            orders: JSON.parse(localStorage.getItem('hormocare_orders') || '[]'),
            reports: JSON.parse(localStorage.getItem('hormocare_reports') || '[]'),
            reviews: JSON.parse(localStorage.getItem('hormocare_reviews') || '[]'),
            stats: JSON.parse(localStorage.getItem('hormocare_stats') || '{}'),
            exportedAt: new Date().toISOString(),
            source: 'HormoCare AI Local Storage'
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hormocare_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const data = JSON.parse(reader.result);
                    if (this.isServerConnected) {
                        const res = await fetch(`${this.apiUrl}/api/import`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        if (!res.ok) throw new Error('Server import failed');
                    }

                    // Also sync to localStorage
                    if (data.appData) localStorage.setItem('hormocare_data', JSON.stringify(data.appData));
                    if (data.checklist) localStorage.setItem('hormocare_checklist', JSON.stringify(data.checklist));
                    if (data.bookings) localStorage.setItem('hormocare_bookings', JSON.stringify(data.bookings));
                    if (data.orders) localStorage.setItem('hormocare_orders', JSON.stringify(data.orders));
                    if (data.reports) localStorage.setItem('hormocare_reports', JSON.stringify(data.reports));
                    if (data.reviews) localStorage.setItem('hormocare_reviews', JSON.stringify(data.reviews));
                    if (data.stats) localStorage.setItem('hormocare_stats', JSON.stringify(data.stats));

                    resolve(true);
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async loadSampleData() {
        if (this.isServerConnected) {
            try {
                const res = await fetch(`${this.apiUrl}/api/sample-data`, { method: 'POST' });
                if (res.ok) {
                    const result = await res.json();
                    if (result.data) {
                        localStorage.setItem('hormocare_data', JSON.stringify(result.data.appData));
                        localStorage.setItem('hormocare_checklist', JSON.stringify(result.data.checklist));
                        localStorage.setItem('hormocare_bookings', JSON.stringify(result.data.bookings));
                        localStorage.setItem('hormocare_orders', JSON.stringify(result.data.orders));
                    }
                    return true;
                }
            } catch (e) {}
        }

        // Generate locally if server is not connected
        const sampleProfile = {
            name: 'Ananya Sharma',
            age: 26,
            weight: 68.0,
            height: 162,
            familyHistory: 'mother',
            exercise: 'light',
            diet: 'moderate'
        };

        const today = new Date();
        const symptoms = [];
        const dietEntries = [];

        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            symptoms.push({
                date: dateStr,
                cycleLength: 38 + (i % 3 === 0 ? 3 : 0),
                lastPeriodDate: '2026-03-12',
                missedPeriod: i < 5,
                weight: 66.5 + (13 - i) * 0.12,
                acne: 3 + (i % 2),
                hairFall: i % 2 === 0 ? 'high' : 'medium',
                hirsutism: 'medium',
                moodSwings: i % 3 === 0 ? 'severe' : 'moderate',
                sleepQuality: i % 2 === 0 ? 'poor' : 'fair',
                notes: i === 0 ? 'Feeling fatigued today, noticeable skin breakouts.' : (i === 7 ? 'Mild abdominal cramps, missed period continues.' : ''),
                timestamp: Date.now() - i * 86400000
            });

            if (i < 7) {
                dietEntries.push({
                    date: dateStr,
                    waterIntake: 6 + (i % 3),
                    totalCalories: 1720 + (i * 20),
                    totalProtein: 58 + (i % 4),
                    totalCarbs: 210 - (i % 5),
                    totalFats: 48 + (i % 3),
                    meals: [
                        {
                            type: 'Breakfast',
                            items: [
                                { name: 'Oats porridge with almonds & berries', calories: 320, protein: 9, carbs: 45, fats: 8 },
                                { name: 'Spearmint Tea', calories: 2, protein: 0, carbs: 0, fats: 0 }
                            ]
                        },
                        {
                            type: 'Lunch',
                            items: [
                                { name: 'Brown rice (1 cup)', calories: 216, protein: 5, carbs: 45, fats: 1.8 },
                                { name: 'Dal (Toor/Moong, 1 cup)', calories: 198, protein: 14, carbs: 34, fats: 1 },
                                { name: 'Mixed vegetable sabzi (1 cup)', calories: 120, protein: 4, carbs: 16, fats: 5 }
                            ]
                        },
                        {
                            type: 'Dinner',
                            items: [
                                { name: 'Roti / Chapati (2 pieces)', calories: 240, protein: 7, carbs: 40, fats: 7 },
                                { name: 'Paneer (100g)', calories: 265, protein: 18, carbs: 1.2, fats: 21 },
                                { name: 'Palak sabzi (1 cup)', calories: 90, protein: 5, carbs: 8, fats: 5 }
                            ]
                        }
                    ],
                    timestamp: Date.now() - i * 86400000
                });
            }
        }

        const appData = {
            profile: sampleProfile,
            symptoms,
            dietEntries,
            riskAssessment: null,
            lastUpdated: Date.now()
        };

        const sampleBookings = [{
            id: 'BK-' + Date.now().toString(36).toUpperCase(),
            doctor: 'Dr. Priya Sharma',
            type: 'video',
            date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            time: '04:00 PM',
            concerns: 'Irregular cycles for 6 months, persistent acne and hair thinning. Want a comprehensive hormone evaluation.',
            status: 'Confirmed',
            reports: [],
            bookingDate: new Date().toISOString()
        }];

        const sampleOrders = [{
            id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
            items: [
                { id: 1, name: 'Myo-Inositol Powder', price: 899, qty: 1, icon: '🌸' },
                { id: 4, name: 'Spearmint Tea (Organic)', price: 349, qty: 1, icon: '🍵' }
            ],
            subtotal: 1248,
            delivery: 0,
            total: 1248,
            status: 'Preparing for Dispatch',
            customer: {
                name: 'Ananya Sharma',
                phone: '+91 98765 43210',
                address: 'Flat 402, Green Meadows, Bengaluru, Karnataka - 560034',
                paymentMethod: 'UPI'
            },
            date: new Date(Date.now() - 86400000).toISOString()
        }];

        localStorage.setItem('hormocare_data', JSON.stringify(appData));
        localStorage.setItem('hormocare_bookings', JSON.stringify(sampleBookings));
        localStorage.setItem('hormocare_orders', JSON.stringify(sampleOrders));
        return true;
    }

    async resetAllData() {
        if (this.isServerConnected) {
            try {
                await fetch(`${this.apiUrl}/api/reset`, { method: 'POST' });
            } catch (e) {}
        }
        localStorage.removeItem('hormocare_data');
        localStorage.removeItem('hormocare_checklist');
        localStorage.removeItem('hormocare_bookings');
        localStorage.removeItem('hormocare_orders');
        localStorage.removeItem('hormocare_reports');
        localStorage.removeItem('hormocare_reviews');
        return true;
    }

    // ==================== UI Injection & Modals ====================
    injectUI() {
        if (document.getElementById('hormocare-storage-pill')) return;

        // Add custom styles for Storage Pill & Data Hub Modal
        const style = document.createElement('style');
        style.textContent = `
            .storage-indicator-pill {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.35rem 0.8rem;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #E2E8F0;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
                color: #2D3748;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.06);
                transition: all 0.2s ease;
                user-select: none;
                margin-left: 0.8rem;
            }
            .storage-indicator-pill:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(255, 107, 157, 0.25);
                border-color: #FF6B9D;
            }
            .storage-dot {
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: #F6AD55;
                box-shadow: 0 0 0 2px rgba(246, 173, 85, 0.3);
            }
            .storage-dot.connected {
                background: #48BB78;
                box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.3);
            }

            /* Storage Modal */
            .data-hub-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .data-hub-modal.active {
                display: flex;
            }
            .data-hub-card {
                background: white;
                width: 92%;
                max-width: 540px;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                overflow: hidden;
                animation: popIn 0.25s ease-out;
            }
            @keyframes popIn {
                from { transform: scale(0.92); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .data-hub-header {
                background: linear-gradient(135deg, #FF6B9D, #C44569);
                color: white;
                padding: 1.2rem 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .data-hub-header h3 {
                margin: 0;
                font-size: 1.25rem;
                display: flex;
                align-items: center;
                gap: 0.6rem;
            }
            .data-hub-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.3rem;
                cursor: pointer;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .data-hub-close:hover { opacity: 1; }
            .data-hub-body {
                padding: 1.5rem;
                max-height: 80vh;
                overflow-y: auto;
            }
            .status-banner {
                display: flex;
                align-items: center;
                gap: 0.8rem;
                padding: 0.9rem 1rem;
                border-radius: 10px;
                background: #EDF2F7;
                margin-bottom: 1.2rem;
                font-size: 0.9rem;
            }
            .status-banner.server-ok {
                background: #F0FFF4;
                border: 1px solid #C6F6D5;
                color: #22543D;
            }
            .status-banner.local-only {
                background: #FFFAF0;
                border: 1px solid #FEEBC8;
                color: #7B341E;
            }
            .stats-grid-hub {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.8rem;
                margin-bottom: 1.4rem;
            }
            .stat-box {
                background: #F8FAFC;
                border: 1px solid #E2E8F0;
                border-radius: 10px;
                padding: 0.8rem 0.5rem;
                text-align: center;
            }
            .stat-box-num {
                font-size: 1.3rem;
                font-weight: 700;
                color: #FF6B9D;
            }
            .stat-box-lbl {
                font-size: 0.75rem;
                color: #718096;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 0.2rem;
            }
            .hub-actions-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.8rem;
            }
            .hub-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .hub-btn-primary {
                background: #FF6B9D;
                color: white;
            }
            .hub-btn-primary:hover {
                background: #E8437D;
            }
            .hub-btn-outline {
                background: white;
                border-color: #CBD5E0;
                color: #4A5568;
            }
            .hub-btn-outline:hover {
                background: #F7FAFC;
                border-color: #A0AEC0;
            }
            .hub-btn-sample {
                background: #319795;
                color: white;
                grid-column: 1 / -1;
            }
            .hub-btn-sample:hover {
                background: #285E61;
            }
            .hub-btn-danger {
                background: #FFF5F5;
                color: #E53E3E;
                border-color: #FEB2B2;
                grid-column: 1 / -1;
            }
            .hub-btn-danger:hover {
                background: #FED7D7;
            }
            .hub-file-input { display: none; }
        `;
        document.head.appendChild(style);

        // Create pill in navbar
        const navContainer = document.querySelector('.nav-container') || document.querySelector('.navbar');
        if (navContainer) {
            const pill = document.createElement('div');
            pill.id = 'hormocare-storage-pill';
            pill.className = 'storage-indicator-pill';
            pill.title = 'Click to open Local Data Management Hub';
            pill.innerHTML = `
                <span class="storage-dot" id="storage-dot"></span>
                <span id="storage-text">Local Storage</span>
                <i class="fas fa-database" style="font-size:0.75rem; color:#718096;"></i>
            `;
            pill.addEventListener('click', () => this.openDataHub());
            navContainer.appendChild(pill);
        }

        // Create Modal
        const modal = document.createElement('div');
        modal.id = 'hormocare-data-hub-modal';
        modal.className = 'data-hub-modal';
        modal.innerHTML = `
            <div class="data-hub-card">
                <div class="data-hub-header">
                    <h3><i class="fas fa-database"></i> Local Data Management Hub</h3>
                    <button class="data-hub-close" id="dataHubCloseBtn">&times;</button>
                </div>
                <div class="data-hub-body">
                    <div id="dataHubBanner" class="status-banner"></div>
                    <div class="stats-grid-hub" id="dataHubStats"></div>
                    
                    <h5 style="margin-bottom:0.8rem; color:#2D3748;"><i class="fas fa-sliders-h"></i> Storage Actions</h5>
                    <div class="hub-actions-grid">
                        <button class="hub-btn hub-btn-primary" id="hubExportBtn">
                            <i class="fas fa-download"></i> Export Backup (JSON)
                        </button>
                        <button class="hub-btn hub-btn-outline" id="hubImportBtn">
                            <i class="fas fa-upload"></i> Import Backup
                        </button>
                        <input type="file" id="hubBackupFileInput" class="hub-file-input" accept=".json">

                        <button class="hub-btn hub-btn-sample" id="hubSampleBtn">
                            <i class="fas fa-magic"></i> Load Sample PCOS Patient Data
                        </button>
                        
                        <button class="hub-btn hub-btn-danger" id="hubResetBtn">
                            <i class="fas fa-trash-alt"></i> Reset All Stored Data
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Modal event handlers
        document.getElementById('dataHubCloseBtn')?.addEventListener('click', () => this.closeDataHub());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeDataHub();
        });

        document.getElementById('hubExportBtn')?.addEventListener('click', () => this.exportBackup());
        document.getElementById('hubImportBtn')?.addEventListener('click', () => {
            document.getElementById('hubBackupFileInput')?.click();
        });

        document.getElementById('hubBackupFileInput')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await this.importBackup(file);
                alert('Backup restored successfully! The page will now reload.');
                window.location.reload();
            } catch (err) {
                alert('Error importing backup: ' + err.message);
            }
        });

        document.getElementById('hubSampleBtn')?.addEventListener('click', async () => {
            if (confirm('Load sample 14-day PCOS patient data? This allows you to immediately test the AI risk analysis, trends, diet logs, and care plans.')) {
                await this.loadSampleData();
                alert('Sample PCOS patient data loaded! Reloading page to display...');
                window.location.reload();
            }
        });

        document.getElementById('hubResetBtn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete all stored data? This cannot be undone.')) {
                await this.resetAllData();
                alert('All local data has been reset.');
                window.location.reload();
            }
        });

        this.updateIndicator();
    }

    updateIndicator() {
        const dot = document.getElementById('storage-dot');
        const text = document.getElementById('storage-text');
        if (!dot || !text) return;

        if (this.isServerConnected) {
            dot.className = 'storage-dot connected';
            text.textContent = 'Local Disk DB Active';
            text.title = 'Connected to local Node.js server (data/hormocare_db.json)';
        } else {
            dot.className = 'storage-dot';
            text.textContent = 'Browser Storage';
            text.title = 'Running in standalone browser mode using localStorage';
        }
    }

    async openDataHub() {
        await this.checkServerConnection();
        const banner = document.getElementById('dataHubBanner');
        const stats = document.getElementById('dataHubStats');

        const appData = await this.getAppData();
        const symptoms = appData.symptoms || [];
        const diet = appData.dietEntries || [];
        const bookings = await this.getBookings();
        const orders = await this.getOrders();
        const reports = await this.getReports();

        if (this.isServerConnected) {
            banner.className = 'status-banner server-ok';
            banner.innerHTML = `
                <i class="fas fa-check-circle" style="font-size:1.4rem;"></i>
                <div>
                    <strong>Local Server Connected (HTTP Port 3000)</strong><br>
                    <span style="font-size:0.8rem; color:#2F855A;">Data stored persistently in <code>data/hormocare_db.json</code> & <code>data/uploads/</code></span>
                </div>
            `;
        } else {
            banner.className = 'status-banner local-only';
            banner.innerHTML = `
                <i class="fas fa-info-circle" style="font-size:1.4rem;"></i>
                <div>
                    <strong>Standalone LocalStorage Mode</strong><br>
                    <span style="font-size:0.8rem; color:#9C4221;">Data stored in browser cache. Run <code>npm start</code> to persist data directly to disk files.</span>
                </div>
            `;
        }

        stats.innerHTML = `
            <div class="stat-box">
                <div class="stat-box-num">${symptoms.length}</div>
                <div class="stat-box-lbl">Days Logged</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-num">${diet.length}</div>
                <div class="stat-box-lbl">Diet Records</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-num">${bookings.length}</div>
                <div class="stat-box-lbl">Bookings</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-num">${orders.length}</div>
                <div class="stat-box-lbl">Orders</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-num">${reports.length}</div>
                <div class="stat-box-lbl">Reports</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-num">${appData.profile?.age ? 'Set' : 'None'}</div>
                <div class="stat-box-lbl">Profile</div>
            </div>
        `;

        document.getElementById('hormocare-data-hub-modal')?.classList.add('active');
    }

    closeDataHub() {
        document.getElementById('hormocare-data-hub-modal')?.classList.remove('active');
    }

    attachGlobalEvents() {
        // ESC key to close modal
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeDataHub();
        });
    }
}

// Global instance
window.HormoCareStorage = new HormoCareStorageManager();
