const express = require('express');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - serve from project root
app.use(express.static(path.join(__dirname), {
    extensions: ['html'],
    index: 'index.html'
}));

// Resend email client (graceful if key missing)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (!resend) console.warn('WARNING: RESEND_API_KEY not set — email sending disabled');
const EMAIL_CONFIG = {
    from: process.env.FROM_EMAIL || 'noreply@zyntrotest.com',
    to: process.env.TO_EMAIL || 'info@zyntrotest.com',
    bcc: process.env.BCC_EMAIL || 'james@ekaty.com'
};

// Admin auth middleware (simple token check)
function adminAuth(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (token && token === process.env.ADMIN_TOKEN) {
        return next();
    }
    // Allow if no ADMIN_TOKEN is configured (development mode)
    if (!process.env.ADMIN_TOKEN) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

// ===========================
// PUBLIC API ROUTES
// ===========================

// --- Contact Submissions ---
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, company, service_type, sample_type, message } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        const result = await db.query(
            `INSERT INTO contact_submissions (name, email, phone, company, service_type, sample_type, message, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'unread', now(), now()) RETURNING id`,
            [name, email, phone || null, company || null, service_type || null, sample_type || null, message || null]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error('POST /api/contact error:', err);
        if (err.code === '23505') {
            return res.json({ success: true, already_exists: true });
        }
        res.status(500).json({ error: err.message });
    }
});

// --- Sample Submissions ---
app.post('/api/sample', async (req, res) => {
    try {
        const { client_name, email, phone, company, sample_type, sample_count, analysis_requested, rush_service, shipping_method, message } = req.body;
        if (!client_name || !email) {
            return res.status(400).json({ error: 'Client name and email are required' });
        }
        const result = await db.query(
            `INSERT INTO sample_submissions (client_name, email, phone, company, sample_type, sample_count, analysis_requested, rush_service, shipping_method, message, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'unread', now(), now()) RETURNING id`,
            [client_name, email, phone || null, company || null, sample_type || null, parseInt(sample_count) || 0, analysis_requested || null, Boolean(rush_service), shipping_method || null, message || null]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error('POST /api/sample error:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- Newsletter Subscriptions ---
app.post('/api/newsletter', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const result = await db.query(
            `INSERT INTO newsletter_subscriptions (email, status, subscribed_at, source)
             VALUES ($1, 'active', now(), 'website') RETURNING id`,
            [email.toLowerCase()]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        if (err.code === '23505') {
            return res.json({ success: true, already_subscribed: true });
        }
        console.error('POST /api/newsletter error:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- COAs (public read) ---
app.get('/api/coas', async (req, res) => {
    try {
        const { q, type, status } = req.query;
        let sql = 'SELECT * FROM coas';
        const params = [];
        const conditions = [];

        if (q) {
            params.push(`%${q.toLowerCase()}%`);
            const idx = params.length;
            conditions.push(`(LOWER(id) LIKE $${idx} OR LOWER(client) LIKE $${idx} OR LOWER(compound) LIKE $${idx} OR LOWER(analysis_type) LIKE $${idx})`);
        }
        if (type) {
            params.push(type);
            conditions.push(`analysis_type = $${params.length}`);
        }
        if (status) {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY created_at DESC';

        const result = await db.query(sql, params);
        res.json({ data: result.rows });
    } catch (err) {
        console.error('GET /api/coas error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/coas/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM coas WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'COA not found' });
        }
        res.json({ data: result.rows[0] });
    } catch (err) {
        console.error('GET /api/coas/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- CMS Content (public read) ---
app.get('/api/cms/settings', async (req, res) => {
    try {
        const SENSITIVE_KEYS = ['authnet_transaction_key', 'authnet_api_login_id', 'authnet_client_key', 'authnet_environment'];
        const result = await db.query('SELECT * FROM site_settings');
        const settings = {};
        result.rows.forEach(row => {
            if (!SENSITIVE_KEYS.includes(row.key)) {
                settings[row.key] = row.value;
            }
        });
        res.json({ data: settings });
    } catch (err) {
        console.error('GET /api/cms/settings error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cms/page/:page', async (req, res) => {
    try {
        const [contentResult, heroResult] = await Promise.all([
            db.query('SELECT * FROM page_content WHERE page = $1', [req.params.page]),
            db.query('SELECT * FROM hero_sections WHERE page = $1 LIMIT 1', [req.params.page])
        ]);
        const content = {};
        contentResult.rows.forEach(row => { content[row.section_key] = row.content_value; });
        res.json({ data: { content, hero: heroResult.rows[0] || null } });
    } catch (err) {
        console.error('GET /api/cms/page error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cms/services', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM services WHERE status = 'active' ORDER BY display_order");
        res.json({ data: result.rows });
    } catch (err) {
        console.error('GET /api/cms/services error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cms/testimonials', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM testimonials WHERE active = true ORDER BY display_order');
        res.json({ data: result.rows });
    } catch (err) {
        console.error('GET /api/cms/testimonials error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cms/blog', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_date DESC");
        res.json({ data: result.rows });
    } catch (err) {
        console.error('GET /api/cms/blog error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cms/media', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM cms_media ORDER BY created_at DESC');
        res.json({ data: result.rows });
    } catch (err) {
        console.error('GET /api/cms/media error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cms/media/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM cms_media WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Media not found' });
        res.json({ data: result.rows[0] });
    } catch (err) {
        console.error('GET /api/cms/media/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- Email sending ---
app.post('/api/send-email', async (req, res) => {
    try {
        const { type, data } = req.body;
        let emailOpts;

        switch (type) {
            case 'contact':
                emailOpts = {
                    from: EMAIL_CONFIG.from,
                    to: EMAIL_CONFIG.to,
                    bcc: EMAIL_CONFIG.bcc,
                    subject: `[ZyntroTest Contact] ${data.name} - ${data.sampleType || 'General Inquiry'}`,
                    html: `<h2>New Contact Form Submission</h2>
                        <p><strong>From:</strong> ${data.name}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
                        <p><strong>Company:</strong> ${data.company || 'Not provided'}</p>
                        <p><strong>Service Type:</strong> ${data.serviceType || 'Not specified'}</p>
                        <p><strong>Sample Type:</strong> ${data.sampleType || 'Not specified'}</p>
                        <p><strong>Message:</strong></p><p>${data.message || 'No additional message'}</p>
                        <hr><p><small>Timestamp: ${new Date().toISOString()}</small></p>`,
                    replyTo: data.email
                };
                break;
            case 'newsletter':
                emailOpts = {
                    from: EMAIL_CONFIG.from,
                    to: EMAIL_CONFIG.to,
                    bcc: EMAIL_CONFIG.bcc,
                    subject: '[ZyntroTest Newsletter] New Subscription',
                    html: `<h2>New Newsletter Subscription</h2>
                        <p><strong>Subscriber Email:</strong> ${data.email}</p>
                        <hr><p><small>Timestamp: ${new Date().toISOString()}</small></p>`
                };
                break;
            case 'sample':
                emailOpts = {
                    from: EMAIL_CONFIG.from,
                    to: EMAIL_CONFIG.to,
                    bcc: EMAIL_CONFIG.bcc,
                    subject: `[ZyntroTest Sample] ${data.client_name} - ${data.sample_type}`,
                    html: `<h2>New Sample Submission Request</h2>
                        <p><strong>Client Name:</strong> ${data.client_name}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
                        <p><strong>Company:</strong> ${data.company || 'Not provided'}</p>
                        <p><strong>Sample Type:</strong> ${data.sample_type}</p>
                        <p><strong>Sample Count:</strong> ${data.sample_count}</p>
                        <p><strong>Rush Service:</strong> ${data.rush_service ? 'Yes' : 'No'}</p>
                        <hr><p><small>Timestamp: ${new Date().toISOString()}</small></p>`,
                    replyTo: data.email
                };
                break;
            default:
                return res.status(400).json({ error: 'Invalid email type' });
        }

        if (!resend) {
            console.warn('Email send skipped — RESEND_API_KEY not configured');
            return res.json({ success: true, data: { message: 'Email disabled (no API key)' } });
        }
        const result = await resend.emails.send(emailOpts);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('POST /api/send-email error:', err);
        res.status(500).json({ error: 'Failed to send email', message: err.message });
    }
});

// ===========================
// ADMIN API ROUTES
// ===========================

// --- Generic table operations (admin) ---
const ADMIN_TABLES = {
    'contact_submissions': { pk: 'id' },
    'sample_submissions': { pk: 'id' },
    'newsletter_subscriptions': { pk: 'id' },
    'coas': { pk: 'id' },
    'blog_posts': { pk: 'id' },
    'services': { pk: 'id' },
    'testimonials': { pk: 'id' },
    'page_content': { pk: 'id' },
    'hero_sections': { pk: 'id' },
    'site_settings': { pk: 'id' },
    'cms_media': { pk: 'id' },
    'consultation_bookings': { pk: 'id' },
    'pricing_items': { pk: 'id' }
};

// Admin: get payment settings (masks transaction key)
app.get('/api/admin/payment/settings', adminAuth, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT key, value FROM site_settings WHERE key IN ('authnet_api_login_id', 'authnet_transaction_key', 'authnet_client_key', 'authnet_environment')"
        );
        const settings = {};
        result.rows.forEach(row => {
            if (row.key === 'authnet_transaction_key' && row.value) {
                settings[row.key] = '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' + row.value.slice(-4);
            } else {
                settings[row.key] = row.value;
            }
        });

        const hasLoginId = !!settings.authnet_api_login_id;
        const hasTransactionKey = result.rows.some(r => r.key === 'authnet_transaction_key' && r.value);
        const hasClientKey = !!settings.authnet_client_key;
        const environment = settings.authnet_environment || 'sandbox';

        res.json({
            data: settings,
            status: {
                configured: hasLoginId && hasTransactionKey && hasClientKey,
                hasLoginId,
                hasTransactionKey,
                hasClientKey,
                environment
            }
        });
    } catch (err) {
        console.error('GET /api/admin/payment/settings error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: test Authorize.net credentials
app.post('/api/admin/payment/test', adminAuth, async (req, res) => {
    try {
        const credResult = await db.query(
            "SELECT key, value FROM site_settings WHERE key IN ('authnet_api_login_id', 'authnet_transaction_key', 'authnet_environment')"
        );
        const creds = {};
        credResult.rows.forEach(row => { creds[row.key] = row.value; });

        if (!creds.authnet_api_login_id || !creds.authnet_transaction_key) {
            return res.json({ success: false, error: 'API Login ID and Transaction Key must be saved before testing.' });
        }

        const isProduction = creds.authnet_environment === 'production';
        const apiHost = isProduction ? 'api.authorize.net' : 'apitest.authorize.net';

        const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
        <authenticateTestRequest xmlns="AnetApi/xml/v1/schema/AnetApiSchema.xsd">
            <merchantAuthentication>
                <name>${escapeXml(creds.authnet_api_login_id)}</name>
                <transactionKey>${escapeXml(creds.authnet_transaction_key)}</transactionKey>
            </merchantAuthentication>
        </authenticateTestRequest>`;

        const authNetResponse = await new Promise((resolve, reject) => {
            const options = {
                hostname: apiHost,
                port: 443,
                path: '/xml/v1/request.api',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': Buffer.byteLength(xmlRequest)
                }
            };

            const request = https.request(options, (response) => {
                let data = '';
                response.on('data', chunk => { data += chunk; });
                response.on('end', () => resolve(data));
            });

            request.on('error', reject);
            request.setTimeout(15000, () => { request.destroy(); reject(new Error('Request timeout')); });
            request.write(xmlRequest);
            request.end();
        });

        const resultCode = extractXml(authNetResponse, 'resultCode');
        const messageText = extractXml(authNetResponse, 'text');

        if (resultCode === 'Ok') {
            res.json({ success: true, message: 'Credentials verified successfully.', environment: isProduction ? 'production' : 'sandbox' });
        } else {
            res.json({ success: false, error: messageText || 'Authentication failed. Please check your credentials.' });
        }
    } catch (err) {
        console.error('POST /api/admin/payment/test error:', err);
        res.json({ success: false, error: 'Connection test failed: ' + err.message });
    }
});

// Admin: List all records
app.get('/api/admin/:table', adminAuth, async (req, res) => {
    const table = req.params.table;
    if (!ADMIN_TABLES[table]) return res.status(400).json({ error: 'Invalid table' });
    try {
        const orderCol = ['coas', 'contact_submissions', 'sample_submissions', 'newsletter_subscriptions', 'blog_posts', 'cms_media'].includes(table) ? 'created_at' : 'updated_at';
        const result = await db.query(`SELECT * FROM ${table} ORDER BY ${orderCol} DESC`);
        res.json({ data: result.rows, count: result.rowCount });
    } catch (err) {
        console.error(`GET /api/admin/${table} error:`, err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get single record
app.get('/api/admin/:table/:id', adminAuth, async (req, res) => {
    const table = req.params.table;
    if (!ADMIN_TABLES[table]) return res.status(400).json({ error: 'Invalid table' });
    try {
        const result = await db.query(`SELECT * FROM ${table} WHERE ${ADMIN_TABLES[table].pk} = $1`, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ data: result.rows[0] });
    } catch (err) {
        console.error(`GET /api/admin/${table}/${req.params.id} error:`, err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Insert record
app.post('/api/admin/:table', adminAuth, async (req, res) => {
    const table = req.params.table;
    if (!ADMIN_TABLES[table]) return res.status(400).json({ error: 'Invalid table' });
    try {
        const data = req.body;
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const result = await db.query(
            `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
            values
        );
        res.json({ data: result.rows[0] });
    } catch (err) {
        console.error(`POST /api/admin/${table} error:`, err);
        if (err.code === '23505') return res.status(409).json({ error: 'Record already exists', code: '23505' });
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update record
app.patch('/api/admin/:table/:id', adminAuth, async (req, res) => {
    const table = req.params.table;
    if (!ADMIN_TABLES[table]) return res.status(400).json({ error: 'Invalid table' });
    try {
        const data = req.body;
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        values.push(req.params.id);
        const result = await db.query(
            `UPDATE ${table} SET ${setClauses} WHERE ${ADMIN_TABLES[table].pk} = $${values.length} RETURNING *`,
            values
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ data: result.rows[0] });
    } catch (err) {
        console.error(`PATCH /api/admin/${table}/${req.params.id} error:`, err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete record
app.delete('/api/admin/:table/:id', adminAuth, async (req, res) => {
    const table = req.params.table;
    if (!ADMIN_TABLES[table]) return res.status(400).json({ error: 'Invalid table' });
    try {
        const result = await db.query(`DELETE FROM ${table} WHERE ${ADMIN_TABLES[table].pk} = $1 RETURNING *`, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        console.error(`DELETE /api/admin/${table}/${req.params.id} error:`, err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Upsert (for page_content, hero_sections, site_settings)
app.put('/api/admin/:table/upsert', adminAuth, async (req, res) => {
    const table = req.params.table;
    if (!ADMIN_TABLES[table]) return res.status(400).json({ error: 'Invalid table' });
    try {
        const rows = Array.isArray(req.body) ? req.body : [req.body];
        const results = [];

        for (const row of rows) {
            let conflictCol;
            if (table === 'page_content') conflictCol = 'page, section_key';
            else if (table === 'hero_sections') conflictCol = 'page';
            else if (table === 'site_settings') conflictCol = 'key';
            else conflictCol = ADMIN_TABLES[table].pk;

            const keys = Object.keys(row);
            const values = Object.values(row);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const updateClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

            const result = await db.query(
                `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})
                 ON CONFLICT (${conflictCol}) DO UPDATE SET ${updateClauses}
                 RETURNING *`,
                values
            );
            results.push(result.rows[0]);
        }

        res.json({ data: results });
    } catch (err) {
        console.error(`PUT /api/admin/${table}/upsert error:`, err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Count records (for stats)
app.get('/api/admin/:table/count', adminAuth, async (req, res) => {
    const table = req.params.table;
    if (!ADMIN_TABLES[table]) return res.status(400).json({ error: 'Invalid table' });
    try {
        const result = await db.query(`SELECT COUNT(*) FROM ${table}`);
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        console.error(`GET /api/admin/${table}/count error:`, err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: COA file upload
const multer = require('multer');
const upload = multer({
    dest: path.join(__dirname, 'COAs'),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'));
    }
});

app.post('/api/admin/upload/coa', adminAuth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const originalName = req.file.originalname;
        const finalPath = path.join(__dirname, 'COAs', originalName);
        fs.renameSync(req.file.path, finalPath);
        res.json({
            success: true,
            fileName: originalName,
            fileUrl: `/COAs/${originalName}`,
            fileSize: req.file.size
        });
    } catch (err) {
        console.error('POST /api/admin/upload/coa error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Media file upload
const mediaUpload = multer({
    dest: path.join(__dirname, 'admin', 'uploads'),
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/api/admin/upload/media', adminAuth, mediaUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const timestamp = Date.now();
        const finalName = `${timestamp}-${req.file.originalname}`;
        const finalPath = path.join(__dirname, 'admin', 'uploads', finalName);
        fs.renameSync(req.file.path, finalPath);

        const fileUrl = `/admin/uploads/${finalName}`;
        const result = await db.query(
            `INSERT INTO cms_media (filename, original_name, file_path, file_url, file_size, mime_type, title, alt_text)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [finalName, req.file.originalname, `admin/uploads/${finalName}`, fileUrl, req.file.size, req.file.mimetype, req.body.title || req.file.originalname, req.body.alt_text || '']
        );
        res.json({ data: result.rows[0] });
    } catch (err) {
        console.error('POST /api/admin/upload/media error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ===========================
// PAYMENT PROCESSING
// ===========================
const https = require('https');

// Public endpoint: get payment config (only safe-to-expose values)
app.get('/api/payment/config', async (req, res) => {
    try {
        const result = await db.query(
            "SELECT key, value FROM site_settings WHERE key IN ('authnet_api_login_id', 'authnet_client_key', 'authnet_environment')"
        );
        const config = {};
        result.rows.forEach(row => { config[row.key] = row.value; });
        if (!config.authnet_api_login_id || !config.authnet_client_key) {
            return res.json({ configured: false });
        }
        res.json({
            configured: true,
            apiLoginId: config.authnet_api_login_id,
            clientKey: config.authnet_client_key,
            environment: config.authnet_environment || 'sandbox'
        });
    } catch (err) {
        console.error('GET /api/payment/config error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Charge endpoint: receives Accept.js nonce, charges via Authorize.net
app.post('/api/payment/charge', async (req, res) => {
    try {
        const { opaqueData, amount, orderDetails } = req.body;

        if (!opaqueData || !opaqueData.dataDescriptor || !opaqueData.dataValue) {
            return res.status(400).json({ success: false, error: 'Missing payment token' });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid amount' });
        }

        // Load credentials from DB
        const credResult = await db.query(
            "SELECT key, value FROM site_settings WHERE key IN ('authnet_api_login_id', 'authnet_transaction_key', 'authnet_environment')"
        );
        const creds = {};
        credResult.rows.forEach(row => { creds[row.key] = row.value; });

        if (!creds.authnet_api_login_id || !creds.authnet_transaction_key) {
            return res.status(500).json({ success: false, error: 'Payment gateway not configured' });
        }

        const isProduction = creds.authnet_environment === 'production';
        const apiHost = isProduction ? 'api.authorize.net' : 'apitest.authorize.net';

        // Build line items from order details
        let lineItemsXml = '';
        if (orderDetails && orderDetails.samples) {
            orderDetails.samples.forEach((sample, i) => {
                if (i < 30) { // Authorize.net max 30 line items
                    const name = (sample.sampleName || `Sample ${i+1}`).substring(0, 31);
                    const tests = (sample.tests || []).join(', ').substring(0, 255);
                    lineItemsXml += `<lineItem>
                        <itemId>${i+1}</itemId>
                        <name>${escapeXml(name)}</name>
                        <description>${escapeXml(tests)}</description>
                        <quantity>1</quantity>
                        <unitPrice>${sample.subtotal || 0}</unitPrice>
                    </lineItem>`;
                }
            });
        }

        // Build order description
        const orderNum = orderDetails?.orderNumber || ('ZT-' + Date.now());
        const orderDesc = `ZyntroTest Order - ${orderDetails?.sampleCount || 0} sample(s)`;

        // Build customer info
        let billToXml = '';
        if (orderDetails?.customer) {
            const c = orderDetails.customer;
            const nameParts = (c.name || '').split(' ');
            const firstName = escapeXml((nameParts[0] || '').substring(0, 50));
            const lastName = escapeXml((nameParts.slice(1).join(' ') || '').substring(0, 50));
            billToXml = `<billTo>
                <firstName>${firstName}</firstName>
                <lastName>${lastName}</lastName>
                ${c.company ? `<company>${escapeXml(c.company.substring(0, 50))}</company>` : ''}
                ${c.billing?.street ? `<address>${escapeXml(c.billing.street.substring(0, 60))}</address>` : ''}
                ${c.billing?.city ? `<city>${escapeXml(c.billing.city.substring(0, 40))}</city>` : ''}
                ${c.billing?.state ? `<state>${escapeXml(c.billing.state.substring(0, 40))}</state>` : ''}
                ${c.billing?.zip ? `<zip>${escapeXml(c.billing.zip.substring(0, 20))}</zip>` : ''}
                <country>US</country>
                ${c.phone ? `<phoneNumber>${escapeXml(c.phone.substring(0, 25))}</phoneNumber>` : ''}
                ${c.email ? `<email>${escapeXml(c.email.substring(0, 255))}</email>` : ''}
            </billTo>`;
        }

        // Authorize.net XML API request
        const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
        <createTransactionRequest xmlns="AnetApi/xml/v1/schema/AnetApiSchema.xsd">
            <merchantAuthentication>
                <name>${escapeXml(creds.authnet_api_login_id)}</name>
                <transactionKey>${escapeXml(creds.authnet_transaction_key)}</transactionKey>
            </merchantAuthentication>
            <transactionRequest>
                <transactionType>authCaptureTransaction</transactionType>
                <amount>${parseFloat(amount).toFixed(2)}</amount>
                <payment>
                    <opaqueData>
                        <dataDescriptor>${escapeXml(opaqueData.dataDescriptor)}</dataDescriptor>
                        <dataValue>${escapeXml(opaqueData.dataValue)}</dataValue>
                    </opaqueData>
                </payment>
                <order>
                    <invoiceNumber>${escapeXml(orderNum.substring(0, 20))}</invoiceNumber>
                    <description>${escapeXml(orderDesc.substring(0, 255))}</description>
                </order>
                ${lineItemsXml ? `<lineItems>${lineItemsXml}</lineItems>` : ''}
                ${billToXml}
            </transactionRequest>
        </createTransactionRequest>`;

        // Send to Authorize.net
        const authNetResponse = await new Promise((resolve, reject) => {
            const options = {
                hostname: apiHost,
                port: 443,
                path: '/xml/v1/request.api',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': Buffer.byteLength(xmlRequest)
                }
            };

            const request = https.request(options, (response) => {
                let data = '';
                response.on('data', chunk => { data += chunk; });
                response.on('end', () => resolve(data));
            });

            request.on('error', reject);
            request.setTimeout(30000, () => { request.destroy(); reject(new Error('Request timeout')); });
            request.write(xmlRequest);
            request.end();
        });

        // Parse XML response (simple regex for known fields)
        const resultCode = extractXml(authNetResponse, 'resultCode');
        const messageCode = extractXml(authNetResponse, 'code');
        const messageText = extractXml(authNetResponse, 'text') || extractXml(authNetResponse, 'description');
        const transId = extractXml(authNetResponse, 'transId');
        const authCode = extractXml(authNetResponse, 'authCode');
        const responseCode = extractXml(authNetResponse, 'responseCode');

        if (resultCode === 'Ok' && responseCode === '1') {
            console.log(`Payment success: ${orderNum} - $${amount} - transId: ${transId}`);

            // Send order confirmation email
            if (resend && orderDetails?.customer?.email) {
                try {
                    const sampleRows = (orderDetails.samples || []).map(s =>
                        `<tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${s.sampleName || 'N/A'}</td>` +
                        `<td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${s.batchNumber || '—'}</td>` +
                        `<td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${(s.tests || []).join(', ')}</td>` +
                        `<td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${(s.subtotal || 0).toFixed(2)}</td></tr>`
                    ).join('');

                    const emailHtml = `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                        <div style="background:#2563eb;color:white;padding:1.5rem;text-align:center;border-radius:8px 8px 0 0;">
                            <h1 style="margin:0;font-size:1.5rem;">Order Confirmation</h1>
                            <p style="margin:0.5rem 0 0;opacity:0.9;">ZyntroTest Laboratory</p>
                        </div>
                        <div style="padding:1.5rem;background:#fff;border:1px solid #e2e8f0;">
                            <p>Thank you for your order!</p>
                            <div style="background:#eff6ff;border:2px solid #2563eb;border-radius:8px;padding:1rem;text-align:center;margin:1rem 0;">
                                <strong>Order Number: ${orderNum}</strong><br>
                                <span style="font-size:0.9rem;color:#64748b;">Transaction ID: ${transId}</span>
                            </div>
                            <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
                                <thead><tr style="background:#f8fafc;">
                                    <th style="padding:8px 12px;text-align:left;font-size:0.85rem;">Sample</th>
                                    <th style="padding:8px 12px;text-align:left;font-size:0.85rem;">Batch #</th>
                                    <th style="padding:8px 12px;text-align:left;font-size:0.85rem;">Tests</th>
                                    <th style="padding:8px 12px;text-align:right;font-size:0.85rem;">Subtotal</th>
                                </tr></thead>
                                <tbody>${sampleRows}</tbody>
                            </table>
                            ${orderDetails.discountLabel ? `<p style="color:#16a34a;font-weight:600;">${orderDetails.discountLabel}: -$${(orderDetails.discountAmount || 0).toFixed(2)}</p>` : ''}
                            <p style="font-size:1.25rem;font-weight:700;">Total Charged: $${parseFloat(amount).toFixed(2)}</p>
                            <hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0;">
                            <h3 style="margin-bottom:0.5rem;">Next Step: Ship Your Samples</h3>
                            <ol style="color:#475569;font-size:0.9rem;">
                                <li>Package samples per our shipping guidelines</li>
                                <li>Label the box with Order #: <strong>${orderNum}</strong></li>
                                <li>Ship to: <strong>ZyntroTest Laboratory, 11134-A Hopes Creek Road, College Station, TX 77845</strong></li>
                                <li>Email tracking # to info@zyntrotest.com</li>
                            </ol>
                        </div>
                    </div>`;

                    await resend.emails.send({
                        from: EMAIL_CONFIG.from,
                        to: orderDetails.customer.email,
                        bcc: EMAIL_CONFIG.bcc,
                        subject: `ZyntroTest Order Confirmation - ${orderNum}`,
                        html: emailHtml
                    });

                    // Also send to lab
                    await resend.emails.send({
                        from: EMAIL_CONFIG.from,
                        to: EMAIL_CONFIG.to,
                        subject: `New Order Received - ${orderNum} - $${parseFloat(amount).toFixed(2)}`,
                        html: emailHtml
                    });
                } catch (emailErr) {
                    console.error('Order confirmation email failed:', emailErr);
                }
            }

            res.json({ success: true, transactionId: transId, authCode, orderNumber: orderNum });
        } else {
            const errorMsg = messageText || 'Transaction declined';
            console.error(`Payment failed: ${orderNum} - ${errorMsg}`);
            res.json({ success: false, error: errorMsg, errorCode: messageCode });
        }
    } catch (err) {
        console.error('POST /api/payment/charge error:', err);
        res.status(500).json({ success: false, error: 'Payment processing failed. Please try again.' });
    }
});

// XML helpers for Authorize.net
function escapeXml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function extractXml(xml, tag) {
    const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
    return match ? match[1] : null;
}

// Health check
app.get('/api/health', async (req, res) => {
    let dbStatus = 'unknown';
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            await db.query('SELECT 1');
            dbStatus = 'connected';
            break;
        } catch (err) {
            dbStatus = 'reconnecting';
            if (attempt === 0) await new Promise(r => setTimeout(r, 500));
        }
    }
    // Always return 200 so Fly doesn't kill the app over transient DB blips
    res.json({ status: 'ok', database: dbStatus });
});

// SPA fallback - serve index.html for unmatched routes
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZyntroTest server running on port ${PORT}`);
});
