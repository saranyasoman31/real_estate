const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { pool } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const propertyRoutes = require('./modules/properties/properties.routes');
const agentRoutes = require('./modules/agents/agents.routes');
const enquiryRoutes = require('./modules/enquiries/enquiries.routes');
const masterDataRoutes = require('./modules/masterData/masterData.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const feedbackRoutes = require('./modules/feedback/feedback.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// 1. SECURITY & PERFORMANCE HEADERS
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());

// 2. CORS CONFIGURATION
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or matching origins
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback permissive for local testing
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. LOGGING
app.use(morgan(isProduction ? 'combined' : 'dev'));

// 4. RATE LIMITING
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' }
});

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many inquiries submitted from this IP. Please try again shortly.' }
});

app.use('/api/', apiLimiter);

// 5. BODY PARSERS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. STATIC UPLOADED ASSETS
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir, {
  maxAge: '7d',
  immutable: true
}));

// 7. SWAGGER DOCUMENTATION
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Apex Realty Marketplace API',
    version: '1.0.0',
    description: 'Production-ready REST API for Real Estate Marketplace Platform with Node.js & PostgreSQL.'
  },
  servers: [
    { url: `http://localhost:${PORT}/api/v1`, description: 'Current Server' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Server & Database Liveness / Readiness Check',
        tags: ['System'],
        responses: { 200: { description: 'System healthy' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Agent or Customer Login',
        tags: ['Authentication'],
        responses: { 200: { description: 'JWT Token' } }
      }
    },
    '/properties': {
      get: {
        summary: 'Public Property Search & Filter',
        tags: ['Properties'],
        responses: { 200: { description: 'Property Listings' } }
      }
    }
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 8. PRODUCTION HEALTH & READINESS PROBE
app.get('/api/v1/health', async (req, res) => {
  const startTime = Date.now();
  try {
    const dbRes = await pool.query('SELECT 1 AS ok');
    const latency = Date.now() - startTime;
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Apex Realty API',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbRes.rows[0]?.ok === 1 ? 'connected' : 'error',
        latencyMs: latency
      }
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
      database: { status: 'disconnected' }
    });
  }
});

// 9. API ROUTES MOUNTING
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/enquiries/submit', enquiryLimiter);
app.use('/api/v1/enquiries', enquiryRoutes);
app.use('/api/v1/master-data', masterDataRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

// 10. SERVE PRODUCTION FRONTEND DIST (Unified Single-Deployment Mode)
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/api-docs')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 11. ERROR HANDLING
app.use(errorHandler);

// 12. SERVER INITIALIZATION & GRACEFUL SHUTDOWN
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Production Server running on port: ${PORT}`);
    console.log(`🌐 Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
    console.log(`💡 Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log(`=======================================================`);
  });

  const handleShutdown = async (signal) => {
    console.log(`\n${signal} received. Initiating graceful shutdown...`);
    if (server) {
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await pool.end();
          console.log('PostgreSQL pool drained cleanly.');
          process.exit(0);
        } catch (e) {
          console.error('Error closing database pool:', e);
          process.exit(1);
        }
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

module.exports = app;
