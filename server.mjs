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

// Hacer io accesible en toda la app
app.set('io', io);

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        documentation: '/api-docs',
        features: [
            'Sistema de ofertas conductor-pasajero',
            'Autenticación con roles (conductor/pasajero)',
            'Notificaciones en tiempo real con Socket.io',
            'Mapbox integration ready'
        ],
        endpoints: {
            authentication: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                verify: 'GET /api/auth/verify'
            },
            tripRequests: {
                create: 'POST /api/trip-requests (Pasajero)',
                available: 'GET /api/trip-requests/available (Conductor)',
                myRequests: 'GET /api/trip-requests/my-requests (Pasajero)',
                myOffers: 'GET /api/trip-requests/my-offers (Conductor)',
                getById: 'GET /api/trip-requests/:id',
                makeOffer: 'POST /api/trip-requests/:id/offer (Conductor)',
                acceptOffer: 'POST /api/trip-requests/:id/accept-offer (Pasajero)'
            },
            legacy: {
                drivers: 'GET /api/drivers (Sistema antiguo)',
                trips: 'GET /api/trips (Sistema antiguo)'
            }
        },
        socketEvents: {
            driver: [
                'new_trip_request - Nueva solicitud disponible',
                'offer_accepted - Tu oferta fue aceptada',
                'offer_rejected - Tu oferta fue rechazada'
            ],
            passenger: [
                'new_offer - Nueva oferta recibida',
                'offer_accepted - Viaje confirmado'
            ]
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trip-requests', tripRequestRoutes);  // 🔥 Nueva ruta principal
app.use('/api/drivers', driverRoutes);  // Legacy (opcional)
app.use('/api/trips', tripRoutes);  // Legacy (opcional)

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
    console.log(`${'='.repeat(60)}\n`);
});

export default app;