import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import swaggerUi from 'swagger-ui-express';
import connectDB from "./config/connect-db.mjs";
import swaggerSpec from './config/swagger.mjs';

// Importar rutas
import authRoutes from "./routes/auth-routes.mjs";
import driverRoutes from "./routes/driver-routes.mjs";
import emergencyRoutes from "./routes/emergency-routes.mjs";
import notificationRoutes from "./routes/notification-routes.mjs";
import recurringTripRoutes from "./routes/recurring-trip-routes.mjs";
import reviewRoutes from "./routes/review-routes.mjs";
import rewardRoutes from "./routes/reward-routes.mjs";
import tripRoutes from "./routes/trip-routes.mjs";
import verificationRoutes from "./routes/verification-routes.mjs";

// Middlewares
import { errorHandler, notFound } from "./middlewares/errorHandler.mjs";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ============================================
// CONFIGURACIÓN DE CORS
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://proyectoelectiva-frontend.onrender.com',
  'https://proyectoelectiva-pyl0.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloqueado para origen:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// SOCKET.IO con CORS
// ============================================
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
connectDB();

// ============================================
// SWAGGER DOCUMENTATION
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Driver Trip API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    syntaxHighlight: {
      theme: 'monokai'
    }
  }
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// RUTAS DE LA API
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/recurring-trips", recurringTripRoutes);
app.use("/api/verification", verificationRoutes);

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({ 
    message: "API Driver Trip funcionando correctamente",
    version: "2.0.0",
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      auth: "/api/auth",
      drivers: "/api/drivers",
      trips: "/api/trips",
      reviews: "/api/reviews",
      notifications: "/api/notifications",
      rewards: "/api/rewards",
      emergency: "/api/emergency",
      recurringTrips: "/api/recurring-trips",
      verification: "/api/verification"
    }
  });
});

// ============================================
// SOCKET.IO EVENTOS (✅ CORREGIDO)
// ============================================
io.on('connection', (socket) => {
  console.log('✅ Usuario conectado:', socket.id);

  // Unirse a sala de viaje
  socket.on('join_trip', (tripId) => {
    socket.join(`trip_${tripId}`);
    console.log(`👤 Usuario ${socket.id} se unió al viaje ${tripId}`);
    
    // Notificar a otros en la sala
    socket.to(`trip_${tripId}`).emit('user_joined', {
      message: 'Un nuevo usuario se unió al chat',
      socketId: socket.id
    });
  });

  // ✅ RECIBIR Y REENVIAR MENSAJE
  socket.on('send_message', (data) => {
    console.log('📨 Mensaje recibido en servidor:', data);
    
    const { tripId, message, sender } = data;
    
    // Crear objeto de mensaje completo
    const fullMessage = {
      tripId,
      message,
      sender: sender || {
        id: 'unknown',
        name: 'Usuario'
      },
      timestamp: new Date().toISOString(),
      socketId: socket.id
    };
    
    console.log('📤 Reenviando mensaje a sala:', `trip_${tripId}`);
    
    // Enviar a TODA la sala (incluyendo al remitente)
    io.to(`trip_${tripId}`).emit('new_message', fullMessage);
  });

  // Salir de sala de viaje
  socket.on('leave_trip', (tripId) => {
    socket.leave(`trip_${tripId}`);
    console.log(`👋 Usuario ${socket.id} salió del viaje ${tripId}`);
    
    socket.to(`trip_${tripId}`).emit('user_left', {
      message: 'Un usuario salió del chat',
      socketId: socket.id
    });
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('❌ Usuario desconectado:', socket.id);
  });
});

// Hacer io accesible en las rutas
app.set('io', io);

// ============================================
// MANEJO DE ERRORES
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json`);
});

export { io };
