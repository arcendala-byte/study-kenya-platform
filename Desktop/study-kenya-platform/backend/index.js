const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const errorHandler = require('./middleware/errorHandler');
const requireAuth = require('./middleware/auth');
require('dotenv').config();

const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';
const START_WITHOUT_DB = process.env.START_WITHOUT_DB === 'true';

// --- CONTACT INFORMATION ---
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'studykenyahub@gmail.com';
const CONTACT_PHONE = process.env.CONTACT_PHONE || '+254 713 622 907';
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '254713622907';

// --- CREATE HTTP SERVER & WEBSOCKET SERVER ---
const server = createServer(app);
const wss = new WebSocketServer({ 
  server,
  path: '/ws/admin'
});

// Store connected admin clients
const adminClients = new Set();

// --- WEBSOCKET CONNECTION HANDLER ---
wss.on('connection', (ws, req) => {
  console.log('🔌 New admin client connected');
  adminClients.add(ws);
  
  ws.send(JSON.stringify({ 
    type: 'CONNECTION_ESTABLISHED', 
    message: 'Connected to real-time admin dashboard' 
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received from client:', data);
      
      if (data.type === 'AUTH') {
        try {
          const decoded = jwt.verify(data.token, JWT_SECRET);
          ws.isAuthenticated = true;
          ws.adminId = decoded.adminId;
          ws.send(JSON.stringify({ 
            type: 'AUTH_SUCCESS', 
            message: 'Authenticated successfully' 
          }));
        } catch (err) {
          ws.send(JSON.stringify({ 
            type: 'AUTH_ERROR', 
            message: 'Invalid token' 
          }));
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Admin client disconnected');
    adminClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    adminClients.delete(ws);
  });
});

// --- BROADCAST FUNCTION ---
function broadcastUpdate(event, table, payload) {
  const message = JSON.stringify({
    type: 'DATABASE_CHANGE',
    event: event,
    table: table,
    payload: payload,
    timestamp: new Date().toISOString()
  });

  adminClients.forEach(client => {
    if (client.readyState === 1) {
      try {
        client.send(message);
      } catch (error) {
        console.error('Failed to send to client:', error);
        adminClients.delete(client);
      }
    }
  });
}

// --- SETUP SUPABASE REALTIME SUBSCRIPTIONS ---
function setupRealtimeSubscriptions() {
  console.log('🔄 Setting up Supabase real-time subscriptions...');

  const universitiesChannel = supabase
    .channel('admin-dashboard-universities')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'universities' 
      },
      (payload) => {
        console.log('🔄 Universities change detected:', payload.eventType);
        broadcastUpdate(payload.eventType, 'universities', payload);
      }
    )
    .subscribe((status) => {
      console.log('📡 Universities subscription status:', status);
    });

  const inquiriesChannel = supabase
    .channel('admin-dashboard-inquiries')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'inquiries' 
      },
      (payload) => {
        console.log('🔄 Inquiries change detected:', payload.eventType);
        broadcastUpdate(payload.eventType, 'inquiries', payload);
      }
    )
    .subscribe();

  const blogChannel = supabase
    .channel('admin-dashboard-blog')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'blog_posts' 
      },
      (payload) => {
        console.log('🔄 Blog posts change detected:', payload.eventType);
        broadcastUpdate(payload.eventType, 'blog_posts', payload);
      }
    )
    .subscribe();

  const applicationsChannel = supabase
    .channel('admin-dashboard-applications')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'applications' 
      },
      (payload) => {
        console.log('🔄 Applications change detected:', payload.eventType);
        broadcastUpdate(payload.eventType, 'applications', payload);
      }
    )
    .subscribe();

  console.log('✅ Real-time subscriptions setup complete');
}

// --- EMAIL CONFIGURATION ---
let transporter = null;

async function initializeEmail() {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ Email credentials not configured. Email notifications are disabled.');
      return;
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log('✅ Email service configured successfully');
    console.log(`📧 Sending emails from: ${process.env.SMTP_USER}`);
    console.log(`📬 Emails will be sent to: ${CONTACT_EMAIL}`);
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    console.warn('Email notifications will be disabled');
  }
}

async function sendEmailNotifications(name, email, message) {
  if (!transporter) {
    console.log('Email service not available, skipping notification');
    return false;
  }

  try {
    // Email to admin
    await transporter.sendMail({
      from: `"Study Kenya Platform" <${process.env.SMTP_USER}>`,
      to: CONTACT_EMAIL,
      subject: `📬 New Contact Form Submission from ${name}`,
      html: `<!DOCTYPE html><html><head><style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a5f7a 0%, #0d3b4f 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #1a5f7a; font-size: 14px; margin-bottom: 5px; display: block; }
        .value { margin-top: 5px; padding: 12px; background: white; border-radius: 5px; border-left: 3px solid #1a5f7a; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; padding-top: 20px; border-top: 1px solid #ddd; }
      </style></head><body>
        <div class="container">
          <div class="header"><h2>✨ New Contact Form Submission</h2></div>
          <div class="content">
            <div class="field">
              <span class="label">👤 Name:</span>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <span class="label">📧 Email:</span>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
              <span class="label">📱 Phone:</span>
              <div class="value">${CONTACT_PHONE}</div>
            </div>
            <div class="field">
              <span class="label">💬 Message:</span>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>Reply directly to this email to respond to ${name}</p>
            <p style="margin-top: 10px;"><small>Study Kenya Platform - Connecting students to Kenyan education</small></p>
          </div>
        </div>
      </body></html>`,
    });

    // Auto-reply to user
    await transporter.sendMail({
      from: `"Study Kenya Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Thank you for contacting Study Kenya Platform 🇰🇪",
      html: `<!DOCTYPE html><html><head><style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a5f7a 0%, #0d3b4f 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 30px; background: white; }
        .message-box { background: #f0f7fa; padding: 20px; border-left: 4px solid #1a5f7a; margin: 20px 0; border-radius: 5px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; padding-top: 20px; border-top: 1px solid #eee; }
        .whatsapp-btn { display: inline-block; padding: 10px 20px; background: #25D366; color: white; text-decoration: none; border-radius: 5px; }
      </style></head><body>
        <div class="container">
          <div class="header"><h2>🇰🇪 Thank You for Contacting Us!</h2></div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to <strong>Study Kenya Platform</strong>. We're excited to help you with your educational journey in Kenya!</p>
            <p>We have received your message and our team will get back to you within <strong>24 hours</strong>.</p>
            <div class="message-box">
              <strong>Your message:</strong><br><br>"${message}"
            </div>
            <p>In the meantime, here are some helpful resources:</p>
            <ul>
              <li>📚 <a href="http://localhost:3000/universities">Browse Kenyan Universities</a></li>
              <li>📝 <a href="http://localhost:3000/blog">Read our Study Guides</a></li>
              <li>❓ <a href="http://localhost:3000/faq">Frequently Asked Questions</a></li>
            </ul>
            <p>Need immediate assistance? Chat with us on WhatsApp:</p>
            <p><a href="https://wa.me/${WHATSAPP_NUMBER}" class="whatsapp-btn">💬 Chat on WhatsApp</a></p>
            <p>Have a wonderful day!</p>
            <p>Best regards,<br>
            <strong>Study Kenya Team</strong><br>
            <small>Your Gateway to Quality Education in Kenya</small></p>
            <p style="font-size: 11px; color: #999; margin-top: 20px;">
              📧 ${CONTACT_EMAIL} • 📱 ${CONTACT_PHONE}
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Study Kenya Platform. All rights reserved.</p>
          </div>
        </div>
      </body></html>`,
    });

    console.log(`✅ Email notifications sent for inquiry from ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return false;
  }
}

// --- MIDDLEWARE ---
app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: "Too many requests, please try again later." } });
app.use('/api/', apiLimiter);

// --- SIMPLE VALIDATION MIDDLEWARE (No zod required) ---
const validateContact = (req, res, next) => {
  const { name, email, message } = req.body;
  const errors = [];

  console.log('📨 Contact form data received:', req.body);

  if (!name || name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }
  
  if (!email || !email.includes('@') || !email.includes('.')) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }
  
  if (!message || message.length < 5) {
    errors.push({ field: 'message', message: 'Message must be at least 5 characters' });
  }

  if (errors.length > 0) {
    console.error('❌ Validation errors:', errors);
    return res.status(400).json({ 
      error: "Validation Error", 
      details: errors 
    });
  }

  next();
};

app.use((req, res, next) => { console.log(`📡 ${req.method} ${req.url}`); next(); });

// ============================================
// ✅ ROOT ROUTES - ADDED HERE
// ============================================

// Root route
app.get('/', (req, res) => {
  console.log('✅ Root route accessed');
  res.json({
    message: '🚀 Study Kenya Platform API is running!',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      test: 'GET /api/test',
      ping: 'GET /api/ping',
      universities: 'GET /api/universities',
      contact: 'POST /api/contact',
      admin: 'POST /api/admin/login'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health route accessed');
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'Supabase connected',
    websocket: 'Active',
    email: transporter ? 'Configured' : 'Disabled',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API test
app.get('/api/test', (req, res) => {
  console.log('✅ Test route accessed');
  res.json({
    success: true,
    message: 'API test endpoint is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ping
app.get('/api/ping', (req, res) => {
  console.log('✅ Ping route accessed');
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// END OF ROOT ROUTES
// ============================================

// --- INIT SUPABASE & SEED ---
async function initSupabaseAndSeed() {
  try {
    const { error: pingErr } = await supabase.from('admins').select('id').limit(1);
    if (pingErr) console.warn('Supabase ping warning (tables may not exist):', pingErr.message);

    const { data: admins, error: adminErr } = await supabase.from('admins').select('*').limit(1);
    if (adminErr) {
      console.warn('Could not check admins table:', adminErr.message);
    } else if (!admins || admins.length === 0) {
      const hashed = await bcrypt.hash('password123', 10);
      const { error: insertErr } = await supabase.from('admins').insert([{ email: 'admin@studykenya.com', password: hashed }]);
      if (insertErr) console.warn('Failed to insert default admin:', insertErr.message);
      else console.log('👤 Default admin created: admin@studykenya.com / password123');
    }

    setupRealtimeSubscriptions();
    startHttpServer();
  } catch (err) {
    console.error('Supabase initialization error:', err.message || err);
    if (!START_WITHOUT_DB) process.exit(1);
    console.warn('START_WITHOUT_DB=true — starting server without DB connectivity.');
    startHttpServer();
  }
}

// --- INITIALIZE ---
async function initialize() {
  await initializeEmail();
  await initSupabaseAndSeed();
}

initialize();

// ========================================
// ROUTES
// ========================================

// --- 1. Universities Routes ---

// GET all universities
app.get('/api/universities', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('id, name, slug, location, type, description, programs, courses, requirements, fees, tuition, categories, image, website, featured, created_at');
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: 'Error fetching universities' });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des universités' });
  }
});

// GET university by ID or slug
app.get('/api/universities/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    
    let { data: byId, error: idErr } = await supabase
      .from('universities')
      .select('id, name, slug, location, type, description, programs, courses, requirements, fees, tuition, categories, image, website, featured, created_at')
      .eq('id', identifier)
      .limit(1);
    
    if (idErr) console.warn('Supabase id lookup warning:', idErr.message);
    
    let university = (byId && byId[0]) || null;
    
    if (!university) {
      const { data: bySlug, error: slugErr } = await supabase
        .from('universities')
        .select('id, name, slug, location, type, description, programs, courses, requirements, fees, tuition, categories, image, website, featured, created_at')
        .eq('slug', identifier)
        .limit(1);
      
      if (slugErr) console.warn('Supabase slug lookup warning:', slugErr.message);
      university = (bySlug && bySlug[0]) || null;
    }
    
    if (!university) {
      return res.status(404).json({ message: 'Université introuvable.' });
    }
    
    res.json(university);
  } catch (err) { 
    next(err); 
  }
});

// POST create university
app.post('/api/universities', requireAuth, async (req, res, next) => {
  try {
    const payload = req.body;
    
    delete payload.status;
    delete payload.ranking;
    delete payload.students;
    delete payload.established;
    delete payload.phone;
    delete payload.email;
    
    const { data, error } = await supabase
      .from('universities')
      .insert([payload])
      .select();
    
    if (error) {
      console.error('❌ Insert error:', error);
      return res.status(500).json({ error: 'Error creating university' });
    }
    
    res.status(201).json(data && data[0]);
  } catch (err) {
    next(err);
  }
});

// PUT update university
app.put('/api/universities/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    delete updates.status;
    delete updates.ranking;
    delete updates.students;
    delete updates.established;
    delete updates.phone;
    delete updates.email;
    
    const { data, error } = await supabase
      .from('universities')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to update university' });
    }
    
    res.json({ success: true, data: data && data[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE university
app.delete('/api/universities/:identifier', requireAuth, async (req, res, next) => {
  try {
    const { identifier } = req.params;
    
    const { error: delIdErr } = await supabase
      .from('universities')
      .delete()
      .eq('id', identifier);
    
    if (delIdErr) console.warn('Supabase delete by id error:', delIdErr.message);
    
    const { error: delSlugErr } = await supabase
      .from('universities')
      .delete()
      .eq('slug', identifier);
    
    if (delSlugErr) console.warn('Supabase delete by slug error:', delSlugErr.message);
    
    res.json({ success: true, message: 'Université supprimée.' });
  } catch (err) { 
    next(err); 
  }
});

// --- 2. Applications Routes ---

// GET all applications
app.get('/api/applications', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️ Applications table not found, returning empty array');
        return res.json([]);
      }
      console.error('❌ Applications fetch error:', error);
      return res.status(500).json({ error: 'Error fetching applications' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Error fetching applications' });
  }
});

// PATCH update application status
app.patch('/api/applications/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update application error:', error);
      return res.status(500).json({ error: 'Failed to update application' });
    }

    res.json({ success: true, data: data && data[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE application
app.delete('/api/applications/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete application error:', error);
      return res.status(500).json({ error: 'Failed to delete application' });
    }

    res.json({ success: true, message: 'Application deleted' });
  } catch (err) {
    next(err);
  }
});

// --- 3. Inquiries Routes ---

// GET all inquiries
app.get('/api/inquiries', requireAuth, async (req, res) => {
  try {
    console.log('📡 Fetching inquiries...');
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Inquiry fetch error:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
    }
    
    console.log(`✅ Found ${data?.length || 0} inquiries`);
    res.json(data || []);
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
});

// PATCH update inquiry status
app.patch('/api/inquiries/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update inquiry error:', error);
      return res.status(500).json({ error: 'Failed to update inquiry' });
    }
    
    res.json({ success: true, data: data && data[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE inquiry
app.delete('/api/inquiries/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Delete inquiry error:', error);
      return res.status(500).json({ error: 'Failed to delete inquiry' });
    }
    
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err) {
    next(err);
  }
});

// --- 4. Admin Routes ---

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .limit(1);
    
    if (error) {
      console.error('❌ Login error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
    
    const admin = data && data[0];
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ 
      token,
      wsUrl: `ws://localhost:${PORT}/ws/admin`
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard Stats
app.get('/api/admin/stats', requireAuth, async (req, res) => {
  try {
    const [universities, inquiries, blogPosts, applications] = await Promise.all([
      supabase.from('universities').select('*', { count: 'exact', head: true }),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase.from('applications').select('*', { count: 'exact', head: true })
    ]);

    res.json({
      universities: universities.count || 0,
      inquiries: inquiries.count || 0,
      blogPosts: blogPosts.count || 0,
      applications: applications.count || 0
    });
  } catch (err) {
    console.error('❌ Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- 5. Blog Routes ---

// GET all blog posts
app.get('/api/blog', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Blog fetch error:', error);
      return res.status(500).json({ error: 'Error fetching blog posts' });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Error fetching blog posts' });
  }
});

// GET blog post by slug
app.get('/api/blog/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', req.params.slug)
      .limit(1);
    
    if (error) {
      console.error('❌ Blog fetch error:', error);
      return res.status(500).json({ error: 'Error fetching post' });
    }
    
    const post = data && data[0];
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Error fetching post' });
  }
});

// POST create blog post
app.post('/api/blog', requireAuth, async (req, res, next) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([payload])
      .select();
    
    if (error) {
      console.error('❌ Create blog error:', error);
      return res.status(500).json({ error: 'Error creating post' });
    }
    
    res.status(201).json(data && data[0]);
  } catch (err) {
    next(err);
  }
});

// PUT update blog post
app.put('/api/blog/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update blog error:', error);
      return res.status(500).json({ error: 'Failed to update blog post' });
    }
    
    res.json({ success: true, data: data && data[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE blog post
app.delete('/api/blog/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Delete blog error:', error);
      return res.status(500).json({ error: 'Failed to delete blog post' });
    }
    
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (err) {
    next(err);
  }
});

// --- 6. Contact Routes ---

// POST contact form with validation
app.post('/api/contact', validateContact, async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    console.log(`📝 Saving inquiry from ${name} (${email})`);

    // Attempt to save to Supabase
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{ name, email, message, status: 'new' }]);

    if (error) {
      console.error('❌ Database error (contact):', error);
      // Still try to send email
    } else {
      console.log('✅ Inquiry saved to database successfully');
      console.log('📊 Inquiry data:', data);
    }

    // Always send email notifications, regardless of DB outcome
    sendEmailNotifications(name, email, message).catch(err => {
      console.error('❌ Background email sending failed:', err);
    });

    // Respond to the client with success
    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will respond within 24 hours.',
      inquiry: data && data[0]
    });

  } catch (err) {
    console.error('❌ Unexpected error in contact route:', err);
    next(err);
  }
});

// --- Error Handler ---
app.use((req, res, next) => { 
  const error = new Error(`Route Not Found - ${req.originalUrl}`); 
  error.statusCode = 404; 
  next(error); 
});
app.use(errorHandler);

// --- Start Server ---
function startHttpServer() {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BACKEND ACTIVE ON: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server active on: ws://localhost:${PORT}/ws/admin`);
    console.log(`📊 Database: Supabase connected`);
    console.log(`📧 Email: ${transporter ? 'Configured' : 'Disabled'}`);
    console.log(`📬 Contact Email: ${CONTACT_EMAIL}`);
    console.log(`📱 Contact Phone: ${CONTACT_PHONE}`);
    console.log(`💬 WhatsApp: wa.me/${WHATSAPP_NUMBER}`);
  });
}