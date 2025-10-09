// server.mjs
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/connect-db.mjs";

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
// CONFIGURACIÓN DE CORS (ACTUALIZADA)
// ============================================
const allowedOrigins = [
  'http://localhost:5173',                                    // ✅ Frontend local
  'http://localhost:3000',                                    // ✅ Backend local
  'https://proyectoelectiva-frontend.onrender.com',          // ✅ Frontend producción
  'https://proyectoelectiva-pyl0.onrender.com'               // ✅ Backend producción
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
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

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/recurring-trips", recurringTripRoutes);
app.use("/api/verification", verificationRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API Driver Trip funcionando correctamente" });
});

// Socket.IO eventos
io.on('connection', (socket) => {
  console.log('✅ Usuario conectado:', socket.id);

  socket.on('join_trip', (tripId) => {
    socket.join(`trip_${tripId}`);
    console.log(`👤 Usuario ${socket.id} se unió al viaje ${tripId}`);
  });

  socket.on('send_message', (data) => {
    io.to(`trip_${data.tripId}`).emit('new_message', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Usuario desconectado:', socket.id);
  });
});

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

export { io };
