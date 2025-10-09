// server.mjs
import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/connect-db.mjs';
import { errorHandler, notFound } from './middlewares/errorHandler.mjs';

// ============ RUTAS EXISTENTES ============
import authRoutes from './routes/auth-routes.mjs';
import driverRoutes from './routes/driver-routes.mjs';
import tripRoutes from './routes/trip-routes.mjs';

// ============ NUEVAS RUTAS ============
import emergencyRoutes from './routes/emergency-routes.mjs';
import notificationRoutes from './routes/notification-routes.mjs';
import recurringTripRoutes from './routes/recurring-trip-routes.mjs';
import reviewRoutes from './routes/review-routes.mjs';
import rewardRoutes from './routes/reward-routes.mjs';
import verificationRoutes from './routes/verification-routes.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

// Crear servidor HTTP para Socket.IO
const server = http.createServer(app);

// ============ CONFIGURACIÓN SOCKET.IO ============
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Hacer io accesible globalmente
app.set('io', io);

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log(`✅ Usuario conectado: ${socket.id}`);
  
  // Unirse a sala de viaje
  socket.on('join-trip', (tripId) => {
    socket.join(`trip-${tripId}`);
    console.log(`Usuario ${socket.id} se unió al viaje ${tripId}`);
  });
  
  // Enviar mensaje en chat de viaje
  socket.on('send-message', ({ tripId, message, sender }) => {
    const messageData = {
      ...message,
      sender,
      timestamp: new Date(),
      id: Date.now()
    };
    io.to(`trip-${tripId}`).emit('new-message', messageData);
  });
  
  // Actualización de ubicación en tiempo real
  socket.on('update-location', ({ tripId, location }) => {
    socket.to(`trip-${tripId}`).emit('location-updated', location);
  });
  
  // Alerta SOS
  socket.on('trigger-sos', ({ tripId, driverId, location }) => {
    io.emit('sos-alert', { tripId, driverId, location, timestamp: new Date() });
  });
  
  socket.on('disconnect', () => {
    console.log(`❌ Usuario desconectado: ${socket.id}`);
  });
});

// Conectar a MongoDB
connectDB();

// ============ CONFIGURACIÓN CORS MEJORADA ============
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ SWAGGER CONFIGURATION ============
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Driver Trip API',
      version: '2.0.0',
      description: 'API RESTful mejorada para gestión de conductores, viajes y funcionalidades innovadoras',
      contact: {
        name: 'API Support',
        email: 'support@drivertrip.com'
      }
    },
    servers: [
      {
        url: 'https://proyectoelectiva-pyl0.onrender.com',
        description: 'Production server (Render)'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.mjs']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Driver Trip API Documentation',
  swaggerOptions: {
    persistAuthorization: true
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

// ============ ROOT ENDPOINT ============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a Driver Trip API v2.0',
    version: '2.0.0',
    documentation: '/api-docs',
    features: {
      core: ['authentication', 'drivers', 'trips'],
      new: [
        'real-time chat',
        'reviews & ratings',
        'notifications',
        'gamification',
        'emergency alerts',
        'recurring trips',
        'driver verification'
      ]
    },
    endpoints: {
      authentication: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        verify: 'GET /api/auth/verify'
      },
      drivers: {
        list: 'GET /api/drivers',
        get: 'GET /api/drivers/:id',
        create: 'POST /api/drivers',
        update: 'PUT /api/drivers/:id',
        delete: 'DELETE /api/drivers/:id'
      },
      trips: {
        list: 'GET /api/trips',
        get: 'GET /api/trips/:id',
        create: 'POST /api/trips',
        update: 'PUT /api/trips/:id',
        delete: 'DELETE /api/trips/:id',
        addPassenger: 'POST /api/trips/:id/passengers',
        rate: 'POST /api/trips/:id/rate',
        statistics: 'GET /api/trips/statistics'
      },
      reviews: {
        create: 'POST /api/reviews',
        getByDriver: 'GET /api/reviews/driver/:driverId',
        getByTrip: 'GET /api/reviews/trip/:tripId'
      },
      notifications: {
        getAll: 'GET /api/notifications',
        markAsRead: 'PUT /api/notifications/:id/read',
        markAllAsRead: 'PUT /api/notifications/read-all'
      },
      rewards: {
        getRewards: 'GET /api/rewards',
        getBadges: 'GET /api/rewards/badges',
        getLeaderboard: 'GET /api/rewards/leaderboard'
      },
      emergency: {
        triggerSOS: 'POST /api/emergency/sos',
        getAlerts: 'GET /api/emergency/alerts'
      },
      recurringTrips: {
        create: 'POST /api/recurring-trips',
        getAll: 'GET /api/recurring-trips',
        update: 'PUT /api/recurring-trips/:id',
        delete: 'DELETE /api/recurring-trips/:id'
      },
      verification: {
        requestVerification: 'POST /api/verification/request',
        uploadDocument: 'POST /api/verification/upload',
        getStatus: 'GET /api/verification/status'
      }
    }
  });
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);

// Nuevas rutas
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/recurring-trips', recurringTripRoutes);
app.use('/api/verification', verificationRoutes);

// ============ ERROR HANDLERS ============
app.use(notFound);
app.use(errorHandler);

// ============ START SERVER ============
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💬 Socket.IO enabled for real-time features`);
  console.log('='.repeat(50));
});

export default app;
