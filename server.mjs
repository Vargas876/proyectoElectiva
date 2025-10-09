import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/connect-db.mjs';
import { initializeSocket } from './config/socket.mjs';
import { errorHandler, notFound } from './middlewares/errorHandler.mjs';
import authRoutes from './routes/auth-routes.mjs';
import driverRoutes from './routes/driver-routes.mjs';
import tripRequestRoutes from './routes/trip-request-routes.mjs';
import tripRoutes from './routes/trip-routes.mjs';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Inicializar Socket.io
const io = initializeSocket(server);
app.set('io', io);

// 🔥 CONFIGURACIÓN DE CORS MEJORADA
const isDevelopment = process.env.NODE_ENV !== 'production';

const allowedOrigins = isDevelopment 
    ? ['http://localhost:5173', 'http://localhost:3000'] // Desarrollo
    : [
        'https://proyectoelectiva-frontend.onrender.com',
        process.env.FRONTEND_URL
      ].filter(Boolean); // Producción

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (Postman, mobile apps)
        if (!origin) return callback(null, true);
        
        // Verificar si el origin está en la lista permitida
        if (allowedOrigins.some(allowed => origin.includes(allowed))) {
            callback(null, true);
        } else {
            console.log(`❌ CORS bloqueado - Origen: ${origin}`);
            console.log(`✅ Orígenes permitidos:`, allowedOrigins);
            callback(null, true); // Temporalmente permitir todo para debug
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requests (útil para debug)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
});

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Driver Trip API - InDriver Style',
            version: '2.0.0',
            description: 'API RESTful para sistema de viajes compartidos con ofertas',
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
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./routes/*.mjs']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Driver Trip API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bienvenido a Driver Trip API v2.0 - InDriver Style',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        allowedOrigins: allowedOrigins,
        documentation: '/api-docs'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trip-requests', tripRequestRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Socket.io: Initialized and ready`);
    console.log(`✅ CORS: Permitiendo orígenes:`, allowedOrigins);
    console.log(`${'='.repeat(60)}\n`);
});

export default app;