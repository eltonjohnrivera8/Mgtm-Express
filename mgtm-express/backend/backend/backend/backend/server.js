// ═══════════════════════════════════════════════════════════════════
// MGTM EXPRESS — MAIN SERVER
// Personal Delivery Partner sa Mangatarem, Pangasinan
// ═══════════════════════════════════════════════════════════════════
// Entry point ng backend application.
//
// Architecture:
//   Express HTTP Server
//     ├── Socket.io    (real-time order updates)
//     ├── CORS         (frontend access control)
//     ├── Helmet       (security headers)
//     ├── Compression  (gzip para mas mabilis)
//     ├── Rate Limiter (anti-spam/DDoS protection)
//     └── API Routes   (lahat ng endpoints)
// ═══════════════════════════════════════════════════════════════════

'use strict';

const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cors         = require('cors');
const helmet       = require('helmet');
const compression  = require('compression');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
require('dotenv').config();

// ── Import All Route Handlers ──────────────────────────────────────
const authRoutes         = require('./routes/auth');
const menuRoutes         = require('./routes/menu');
const orderRoutes        = require('./routes/orders');
const paymentRoutes      = require('./routes/payments');
const verificationRoutes = require('./routes/verification');
const settingsRoutes     = require('./routes/settings');
const adminRoutes        = require('./routes/admin');
const analyticsRoutes    = require('./routes/analytics');
const subscriptionRoutes = require('./routes/subscriptions');

// ── Import Socket Handler ──────────────────────────────────────────
const { initSocket } = require('./socket/socketHandler');

// ── Create Express App ─────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ── CORS Configuration ─────────────────────────────────────────────
// Tinutukoy kung aling frontend URLs ang pinapayagang mag-access ng API
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.APP_URL,
  'http://localhost:5173',   // Vite dev server
  'http://localhost:4173',   // Vite preview
  'http://localhost:3000',   // Alternative dev port
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
].filter(Boolean); // Tanggalin ang undefined/null values

// ── Socket.io Setup ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:  ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
  // Sumusuporta sa dalawang transport:
  transports:        ['websocket', 'polling'],
  pingTimeout:       60000,   // 60 seconds bago mag-timeout
  pingInterval:      25000,   // Nagpapadala ng ping tuwing 25 seconds
  upgradeTimeout:    30000,
  allowUpgrades:     true,
  maxHttpBufferSize: 1e6,     // 1MB max message size
});

// ══════════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// Ang pagkakasunod ng middleware ay mahalaga!
// ══════════════════════════════════════════════════════════════════

// 1. WEBHOOK RAW BODY — KAILANGANG UNA BAGO ANG express.json()!
//    Kailangan ng PayMongo ang raw body para ma-verify ang signature
app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' })
);

// 2. Security Headers (Helmet)
//    Nagdaragdag ng mga HTTP security headers para protektahan ang app
app.use(helmet({
  // Pinapayagan ang mga resources mula sa ating CDN at fonts
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:      ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc:   ["'self'"],
      connectSrc:  ["'self'", 'https://api.paymongo.com', 'https://api.semaphore.co'],
    },
  },
  // Hindi natin kailangan ang cross-origin embedder policy
  crossOriginEmbedderPolicy: false,
}));

// 3. GZIP Compression
//    Nagco-compress ng responses para mas mabilis ang loading
app.use(compression({
  // Mag-compress ng responses na mas malaki sa 1KB
  threshold: 1024,
  // I-compress ang JSON, text, HTML, CSS, JS
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// 4. CORS
app.use(cors({
  origin: (origin, callback) => {
    // Payagan ang requests na walang origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Sa development, mas bukas ang CORS para sa testing
    if (process.env.NODE_ENV === 'development') return callback(null, true);
    callback(new Error(`CORS: Hindi pinapayagan ang origin: ${origin}`));
  },
  credentials: true,             // Para sa cookies at Authorization headers
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-API-Version',
  ],
}));

// 5. Rate Limiting
//    Nagpoprotekta laban sa spam at DDoS attacks
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max:      parseInt(process.env.RATE_LIMIT_MAX) || 100,  // Max requests per window
  message: {
    error: 'Napakaraming requests. Pakihintay ng ilang minuto bago subukang muli.',
  },
  standardHeaders: true,  // Ipadala ang rate limit info sa headers
  legacyHeaders:   false,
  // Hindi natin rate-limit ang health checks
  skip: (req) => req.path === '/health' || req.path === '/',
});

// Mas mahigpit na rate limit para sa auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      20,              // 20 OTP requests per 15 minutes per IP
  message: {
    error: 'Napakaraming authentication attempts. Pakihintay ng 15 minuto.',
  },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);

// 6. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. Static Files
//    Para ma-serve ang mga uploaded files (ID photos, logos, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  // Cache static files para 1 araw
  maxAge: '1d',
  etag:   true,
}));

// 8. Make Socket.io Accessible sa Routes
//    Para makapag-emit ng real-time events mula sa route handlers
app.set('io', io);

// ══════════════════════════════════════════════════════════════════
// REQUEST LOGGER (Development Only)
// ══════════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const color = res.statusCode < 400 ? '\x1b[32m' : '\x1b[31m'; // Green o Red
      console.log(
        `${color}${req.method}\x1b[0m ${req.path} — ${res.statusCode} (${duration}ms)`
      );
    });
    next();
  });
}

// ══════════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════════
app.use('/api/auth',          authRoutes);          // Login, OTP, JWT
app.use('/api/menu',          menuRoutes);           // Menu items management
app.use('/api/orders',        orderRoutes);          // Order lifecycle
app.use('/api/payments',      paymentRoutes);        // GCash, Maya, COD
app.use('/api/verification',  verificationRoutes);   // ID + Face verification
app.use('/api/settings',      settingsRoutes);       // Business settings (theme, pricing, hours)
app.use('/api/admin',         adminRoutes);          // Admin panel controls
app.use('/api/analytics',     analyticsRoutes);      // Analytics data
app.use('/api/subscriptions', subscriptionRoutes);   // Merchant subscriptions

// ══════════════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINTS
// ══════════════════════════════════════════════════════════════════
// Ginagamit ng Railway/hosting para malaman kung buhay ang server
app.get('/', (req, res) => {
  res.json({
    status:      '🛵 MGTM Express API — Running',
    business:    process.env.BUSINESS_NAME || 'MGTM Express',
    tagline:     process.env.BUSINESS_TAGLINE || 'Personal Delivery Partner sa Mangatarem, Pangasinan',
    version:     '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString(),
    endpoints: {
      health:   '/health',
      api:      '/api',
      menu:     '/api/menu',
      orders:   '/api/orders',
      settings: '/api/settings/public',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    ok:          true,
    service:     'MGTM Express API',
    uptime:      `${Math.floor(process.uptime())}s`,
    memory:      `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    timestamp:   new Date().toISOString(),
  });
});

// ══════════════════════════════════════════════════════════════════
// ERROR HANDLERS
// ══════════════════════════════════════════════════════════════════

// 404 — Route Hindi Nahanap
app.use((req, res) => {
  res.status(404).json({
    error:   'Route hindi nahanap',
    path:    `${req.method} ${req.path}`,
    message: 'Siguraduhing tama ang URL at HTTP method.',
  });
});

// 500 — Global Error Handler
// Humahandle ng lahat ng uncaught errors mula sa mga route handlers
app.use((err, req, res, next) => {
  // Log ang error sa server console para sa debugging
  console.error(`\n❌ ERROR [${req.method} ${req.path}]:`);
  console.error(`   Message: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(`   Stack:   ${err.stack}`);
  }

  // CORS Error — ibang message para malinaw sa developer
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      error:   'CORS Error',
      message: err.message,
    });
  }

  // Multer Error (file upload) — nagbibigay ng friendly message
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: `Ang file ay masyadong malaki. Maximum na ${process.env.MAX_FILE_SIZE_MB || 5}MB lang.`,
    });
  }

  // Prisma Errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Ang data na ito ay mayroon na sa database. (Duplicate)',
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Hindi nahanap ang hinahanap sa database.',
    });
  }

  // Default 500 Error
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'May nangyaring error sa server. Subukan muli o makipag-ugnayan sa admin.'
      : err.message,
  });
});

// ══════════════════════════════════════════════════════════════════
// INITIALIZE SOCKET.IO
// ══════════════════════════════════════════════════════════════════
initSocket(io);

// ══════════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🛵 ═══════════════════════════════════════════════');
  console.log('🛵  MGTM EXPRESS — BACKEND SERVER');
  console.log('🛵  Personal Delivery Partner sa Mangatarem');
  console.log('🛵 ═══════════════════════════════════════════════');
  console.log(`   Port        : ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Frontend    : ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`   Database    : ${process.env.DATABASE_URL ? '✅ Configured' : '❌ MISSING!'}`);
  console.log(`   PayMongo    : ${process.env.PAYMONGO_SECRET_KEY?.startsWith('sk_') ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log(`   SMS (Semaphore): ${process.env.SEMAPHORE_API_KEY !== 'your_semaphore_api_key_here' ? '✅ Configured' : '⚠️  Dev mode (console OTP)'}`);
  console.log(`   Email       : ${process.env.RESEND_API_KEY !== 're_your_resend_api_key_here' ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log('');
  console.log('   Endpoints:');
  console.log(`   → http://localhost:${PORT}/`);
  console.log(`   → http://localhost:${PORT}/health`);
  console.log(`   → http://localhost:${PORT}/api/menu`);
  console.log(`   → http://localhost:${PORT}/api/settings/public`);
  console.log('');
  if (process.env.NODE_ENV !== 'production') {
    console.log('   ⚠️  Running in DEVELOPMENT mode');
    console.log('   ⚠️  OTP codes will appear in this console');
    console.log('');
  }
});

// ══════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// Para maayos na masara ang server kapag nag-restart o nag-stop
// ══════════════════════════════════════════════════════════════════
const shutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down MGTM Express gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed.');
    io.close(() => {
      console.log('✅ Socket.io closed.');
      process.exit(0);
    });
  });
  // Force close pagkatapos ng 10 seconds kung hindi pa nagsasara
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after 10s timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('   Reason:', reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});
