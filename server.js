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

// Resend email client
const resend = new Resend(process.env.RESEND_API_KEY);
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
        const result = await db.query('SELECT * FROM site_settings');
        const settings = {};
        result.rows.forEach(row => { settings[row.key] = row.value; });
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

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
        res.status(503).json({ status: 'error', database: 'disconnected', error: err.message });
    }
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
