/**
 * HormoCare AI - Local Server & Storage Backend
 * 
 * Zero external dependencies required - runs with native Node.js.
 * Provides static web serving and REST API with persistent disk storage in /data.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'hormocare_db.json');

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Default initial database schema
const defaultDB = {
    appData: {
        profile: {},
        symptoms: [],
        dietEntries: [],
        riskAssessment: null,
        lastUpdated: null
    },
    checklist: {},
    bookings: [],
    orders: [],
    reports: [],
    reviews: [],
    stats: {
        totalUsers: 12458,
        dailyActiveUsers: 342,
        totalSessions: 1,
        firstVisit: new Date().toISOString().split('T')[0],
        lastVisit: new Date().toISOString().split('T')[0]
    }
};

// Database helper functions
function readDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            writeDB(defaultDB);
            return JSON.parse(JSON.stringify(defaultDB));
        }
        const content = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error('Error reading database file:', err.message);
        return JSON.parse(JSON.stringify(defaultDB));
    }
}

function writeDB(data) {
    try {
        data.lastUpdated = Date.now();
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing to database file:', err.message);
        return false;
    }
}

// MIME types lookup
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
};

// Parse incoming JSON body
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 50 * 1024 * 1024) { // 50MB limit
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            try {
                const parsed = body ? JSON.parse(body) : {};
                resolve(parsed);
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

// Helper to send JSON responses with CORS
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(data));
}

// Sample PCOS data generator
function generateSampleData() {
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
            acanthosisNigricans: 'moderate',
            sugarCravings: 'moderate',
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
                        type: 'Snacks',
                        items: [
                            { name: 'Makhana / Fox nuts (1 cup)', calories: 105, protein: 4, carbs: 18, fats: 1 },
                            { name: 'Walnuts (5 halves)', calories: 65, protein: 1.5, carbs: 1.4, fats: 6.5 }
                        ]
                    },
                    {
                        type: 'Dinner',
                        items: [
                            { name: 'Roti / Chapati (2 pieces)', calories: 240, protein: 7, carbs: 40, fats: 7 },
                            { name: 'Paneer (100g)', calories: 265, protein: 18, carbs: 1.2, fats: 21 },
                            { name: 'Palak / Spinach sabzi (1 cup)', calories: 90, protein: 5, carbs: 8, fats: 5 }
                        ]
                    }
                ],
                timestamp: Date.now() - i * 86400000
            });
        }
    }

    const sampleProfile = {
        name: 'Ananya Sharma',
        age: 26,
        weight: 68.0,
        height: 162,
        familyHistory: 'mother',
        exercise: 'light',
        diet: 'moderate'
    };

    const sampleAssessment = {
        score: 65,
        level: { level: 'moderate', cssClass: 'moderate-risk', label: 'Moderate Risk', color: '#F39C12' },
        factors: [
            { type: 'high', icon: 'fas fa-exclamation-triangle', text: 'Irregular cycles (>35 days)', impact: 'Major PCOS indicator' },
            { type: 'high', icon: 'fas fa-times-circle', text: 'Frequent missed periods', impact: 'Oligomenorrhea - key PCOS symptom' },
            { type: 'medium', icon: 'fas fa-weight', text: 'Overweight (BMI 25.9)', impact: 'Increased PCOS risk' },
            { type: 'high', icon: 'fas fa-user-injured', text: 'Moderate-severe persistent acne', impact: 'Indicates high androgen levels' },
            { type: 'high', icon: 'fas fa-user-alt', text: 'Excessive hair fall/thinning', impact: 'Androgenic alopecia - PCOS sign' },
            { type: 'medium', icon: 'fas fa-venus', text: 'Increased body hair growth', impact: 'Possible PCOS symptom' },
            { type: 'medium', icon: 'fas fa-dna', text: 'Strong family history of PCOS', impact: 'Genetic predisposition (35-40% heritability)' }
        ],
        recommendations: {
            immediate: [
                { priority: 'high', icon: 'fas fa-user-md', text: 'Consult gynecologist within 2-4 weeks', detail: 'Moderate risk warrants professional evaluation. Discuss your symptoms and family history.' },
                { priority: 'high', icon: 'fas fa-vial', text: 'Get blood tests: hormone panel + fasting insulin', detail: 'Fasting glucose, insulin, lipid profile, LH/FSH ratio.' }
            ],
            diet: [
                { text: 'Follow low glycemic index (GI) diet', detail: 'Choose whole grains over refined carbs. Brown rice, oats, quinoa.' },
                { text: 'Increase fiber intake to 25-30g daily', detail: 'Vegetables, fruits, legumes, whole grains.' },
                { text: 'Reduce refined sugars and processed foods', detail: 'Avoid sugary drinks and packaged snacks.' },
                { text: 'Include anti-inflammatory foods', detail: 'Turmeric, berries, leafy greens, walnuts.' }
            ],
            exercise: [
                { text: 'Moderate cardio: 150 minutes/week', detail: 'Brisk walking, cycling, swimming 30 mins 5 days/week.' },
                { text: 'Strength training: 2-3 times/week', detail: 'Bodyweight squats, pushups, resistance bands.' },
                { text: 'Yoga for stress relief: 2-3 times/week', detail: 'Surya Namaskar and deep breathing.' }
            ],
            supplements: [
                { name: 'Myo-inositol', dosage: '2-4g daily', benefit: 'Improves insulin sensitivity and ovulation', note: 'Proven for PCOS' },
                { name: 'Vitamin D3', dosage: '2000 IU daily', benefit: 'Supports hormonal balance and mood', note: 'Essential for endocrine function' },
                { name: 'Spearmint Tea', dosage: '2 cups daily', benefit: 'Naturally reduces free testosterone', note: 'Helps with acne & hirsutism' }
            ],
            monitoring: [
                'Track menstrual cycles daily',
                'Monitor weight weekly (same morning conditions)',
                'Log mood and energy levels',
                'Track sleep quality and duration',
                'Photo-document skin and hair changes monthly'
            ]
        }
    };

    const sampleBookings = [
        {
            id: 'BK-' + Date.now().toString(36).toUpperCase(),
            doctor: 'Dr. Priya Sharma',
            type: 'video',
            date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            time: '04:00 PM',
            concerns: 'Irregular cycles for 6 months, persistent acne and hair thinning. Want a comprehensive hormone evaluation.',
            status: 'Confirmed',
            reports: [],
            bookingDate: new Date().toISOString()
        }
    ];

    const sampleOrders = [
        {
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
        }
    ];

    return {
        appData: {
            profile: sampleProfile,
            symptoms,
            dietEntries,
            riskAssessment: sampleAssessment,
            lastUpdated: Date.now()
        },
        checklist: {
            [today.toISOString().split('T')[0]]: { "0": true, "1": true, "2": false, "3": true }
        },
        bookings: sampleBookings,
        orders: sampleOrders,
        reports: [],
        reviews: [],
        stats: {
            totalUsers: 12498,
            dailyActiveUsers: 345,
            totalSessions: 14,
            firstVisit: symptoms[0].date,
            lastVisit: today.toISOString().split('T')[0]
        }
    };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        });
        res.end();
        return;
    }

    // ==================== REST API ROUTING ====================
    if (pathname.startsWith('/api/')) {
        try {
            // Health & Status
            if (pathname === '/api/status' && method === 'GET') {
                const db = readDB();
                const reportFiles = fs.readdirSync(UPLOADS_DIR);
                return sendJSON(res, 200, {
                    status: 'ok',
                    mode: 'local-server',
                    serverTime: new Date().toISOString(),
                    dbFile: DB_FILE,
                    dataSize: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
                    uploadsCount: reportFiles.length,
                    lastUpdated: db.lastUpdated || null,
                    summary: {
                        hasProfile: !!(db.appData && db.appData.profile && db.appData.profile.age),
                        symptomCount: (db.appData && db.appData.symptoms) ? db.appData.symptoms.length : 0,
                        dietCount: (db.appData && db.appData.dietEntries) ? db.appData.dietEntries.length : 0,
                        bookingsCount: (db.bookings || []).length,
                        ordersCount: (db.orders || []).length,
                        reportsCount: (db.reports || []).length
                    }
                });
            }

            // Entire DB GET & POST
            if (pathname === '/api/all' && method === 'GET') {
                const db = readDB();
                return sendJSON(res, 200, db);
            }

            if (pathname === '/api/all' && method === 'POST') {
                const body = await parseJsonBody(req);
                writeDB(body);
                return sendJSON(res, 200, { success: true, message: 'All data synchronized successfully.' });
            }

            // Core App Data (Profile, Symptoms, Diet, Risk Assessment)
            if (pathname === '/api/data') {
                const db = readDB();
                if (method === 'GET') {
                    return sendJSON(res, 200, db.appData || defaultDB.appData);
                }
                if (method === 'POST') {
                    const body = await parseJsonBody(req);
                    db.appData = { ...db.appData, ...body, lastUpdated: Date.now() };
                    writeDB(db);
                    return sendJSON(res, 200, { success: true, appData: db.appData });
                }
            }

            // Checklist
            if (pathname === '/api/checklist') {
                const db = readDB();
                if (method === 'GET') {
                    return sendJSON(res, 200, db.checklist || {});
                }
                if (method === 'POST') {
                    const body = await parseJsonBody(req);
                    db.checklist = body;
                    writeDB(db);
                    return sendJSON(res, 200, { success: true });
                }
            }

            // Doctor Consultation Bookings
            if (pathname === '/api/bookings') {
                const db = readDB();
                if (method === 'GET') {
                    return sendJSON(res, 200, db.bookings || []);
                }
                if (method === 'POST') {
                    const body = await parseJsonBody(req);
                    if (!body.id) {
                        body.id = 'BK-' + Date.now().toString(36).toUpperCase();
                    }
                    if (!body.status) {
                        body.status = 'Confirmed';
                    }
                    if (!body.bookingDate) {
                        body.bookingDate = new Date().toISOString();
                    }
                    if (!db.bookings) db.bookings = [];
                    db.bookings.unshift(body);
                    writeDB(db);
                    return sendJSON(res, 201, { success: true, booking: body });
                }
            }

            // Delete Booking
            if (pathname.startsWith('/api/bookings/') && method === 'DELETE') {
                const id = pathname.replace('/api/bookings/', '');
                const db = readDB();
                db.bookings = (db.bookings || []).filter(b => b.id !== id);
                writeDB(db);
                return sendJSON(res, 200, { success: true, message: 'Booking cancelled.' });
            }

            // Medicine Store Orders
            if (pathname === '/api/orders') {
                const db = readDB();
                if (method === 'GET') {
                    return sendJSON(res, 200, db.orders || []);
                }
                if (method === 'POST') {
                    const body = await parseJsonBody(req);
                    if (!body.id) {
                        body.id = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
                    }
                    if (!body.date) {
                        body.date = new Date().toISOString();
                    }
                    if (!body.status) {
                        body.status = 'Order Confirmed';
                    }
                    if (!db.orders) db.orders = [];
                    db.orders.unshift(body);
                    writeDB(db);
                    return sendJSON(res, 201, { success: true, order: body });
                }
            }

            // Medical Reports
            if (pathname === '/api/reports' && method === 'GET') {
                const db = readDB();
                return sendJSON(res, 200, db.reports || []);
            }

            if (pathname === '/api/reports' && method === 'POST') {
                const body = await parseJsonBody(req);
                const { name, type, size, base64Data } = body;
                if (!name || !base64Data) {
                    return sendJSON(res, 400, { error: 'Filename and base64Data are required' });
                }

                const safeName = Date.now() + '_' + name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const filePath = path.join(UPLOADS_DIR, safeName);

                // Strip base64 prefix if present
                const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
                fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));

                const reportRecord = {
                    id: 'REP-' + Date.now().toString(36),
                    name,
                    storedFilename: safeName,
                    size: size || (Buffer.byteLength(cleanBase64, 'base64') / 1024).toFixed(1) + ' KB',
                    type: type || 'application/octet-stream',
                    uploadDate: new Date().toISOString(),
                    downloadUrl: `/api/reports/download/${safeName}`
                };

                const db = readDB();
                if (!db.reports) db.reports = [];
                db.reports.unshift(reportRecord);
                writeDB(db);

                return sendJSON(res, 201, { success: true, report: reportRecord });
            }

            // Download Report
            if (pathname.startsWith('/api/reports/download/') && method === 'GET') {
                const filename = path.basename(pathname.replace('/api/reports/download/', ''));
                const filePath = path.join(UPLOADS_DIR, filename);

                if (!fs.existsSync(filePath)) {
                    return sendJSON(res, 404, { error: 'File not found' });
                }

                const ext = path.extname(filename).toLowerCase();
                const mime = MIME_TYPES[ext] || 'application/octet-stream';
                res.writeHead(200, {
                    'Content-Type': mime,
                    'Content-Disposition': `inline; filename="${filename}"`
                });
                return fs.createReadStream(filePath).pipe(res);
            }

            // Delete Report
            if (pathname.startsWith('/api/reports/') && method === 'DELETE') {
                const id = pathname.replace('/api/reports/', '');
                const db = readDB();
                const report = (db.reports || []).find(r => r.id === id || r.storedFilename === id);
                if (report) {
                    const filePath = path.join(UPLOADS_DIR, report.storedFilename);
                    if (fs.existsSync(filePath)) {
                        try { fs.unlinkSync(filePath); } catch (e) {}
                    }
                    db.reports = db.reports.filter(r => r.id !== report.id);
                    writeDB(db);
                }
                return sendJSON(res, 200, { success: true });
            }

            // Reviews
            if (pathname === '/api/reviews') {
                const db = readDB();
                if (method === 'GET') {
                    return sendJSON(res, 200, db.reviews || []);
                }
                if (method === 'POST') {
                    const body = await parseJsonBody(req);
                    if (!body.id) body.id = 'REV-' + Date.now().toString(36);
                    if (!body.date) body.date = new Date().toISOString().split('T')[0];
                    if (!db.reviews) db.reviews = [];
                    db.reviews.unshift(body);
                    writeDB(db);
                    return sendJSON(res, 201, { success: true, review: body });
                }
            }

            if (pathname === '/api/reviews/helpful' && method === 'POST') {
                const body = await parseJsonBody(req);
                const db = readDB();
                const review = (db.reviews || []).find(r => r.id === body.id);
                if (review) {
                    review.helpful = (review.helpful || 0) + 1;
                    writeDB(db);
                }
                return sendJSON(res, 200, { success: true });
            }

            // Backup Export (downloads entire DB JSON file)
            if (pathname === '/api/export' && method === 'GET') {
                const db = readDB();
                const exportStr = JSON.stringify(db, null, 2);
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Disposition': `attachment; filename="hormocare_backup_${new Date().toISOString().split('T')[0]}.json"`,
                    'Access-Control-Allow-Origin': '*'
                });
                return res.end(exportStr);
            }

            // Backup Import
            if (pathname === '/api/import' && method === 'POST') {
                const body = await parseJsonBody(req);
                if (!body || typeof body !== 'object') {
                    return sendJSON(res, 400, { error: 'Invalid backup file payload' });
                }
                writeDB(body);
                return sendJSON(res, 200, { success: true, message: 'Backup restored successfully.' });
            }

            // Load Sample PCOS Data
            if (pathname === '/api/sample-data' && method === 'POST') {
                const sample = generateSampleData();
                writeDB(sample);
                return sendJSON(res, 200, { success: true, message: 'Sample PCOS patient data loaded successfully.', data: sample });
            }

            // Reset / Clear Data
            if (pathname === '/api/reset' && method === 'POST') {
                const clean = JSON.parse(JSON.stringify(defaultDB));
                clean.lastUpdated = Date.now();
                writeDB(clean);
                return sendJSON(res, 200, { success: true, message: 'All user data has been cleared.' });
            }

            // Fallback for unmatched API
            return sendJSON(res, 404, { error: 'API endpoint not found' });
        } catch (err) {
            console.error('API Error:', err);
            return sendJSON(res, 500, { error: err.message });
        }
    }

    // ==================== STATIC FILE SERVING ====================
    let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access Denied');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Check if adding .html helps (e.g. /reviews -> /reviews.html)
            if (fs.existsSync(filePath + '.html')) {
                filePath = filePath + '.html';
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>404 Not Found - HormoCare AI</title></head>
                    <body style="font-family:sans-serif; text-align:center; padding:50px;">
                        <h2>404 - Page Not Found</h2>
                        <p>The requested file <code>${pathname}</code> does not exist.</p>
                        <p><a href="/" style="color:#FF6B9D;">Return to HormoCare AI Home</a></p>
                    </body>
                    </html>
                `);
                return;
            }
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log('========================================================');
    console.log('🌸 HormoCare AI Server is running!');
    console.log(`🌐 Local Application URL: http://localhost:${PORT}`);
    console.log(`💾 Local Database File:  ${DB_FILE}`);
    console.log(`📁 Uploads Directory:    ${UPLOADS_DIR}`);
    console.log('========================================================');
});
