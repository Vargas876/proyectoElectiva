import cors from 'cors';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/connect-db.mjs';
import { errorHandler, notFound } from './middlewares/errorHandler.mjs';
import authRoutes from './routes/auth-routes.mjs';
import driverRoutes from './routes/driver-routes.mjs';
import tripRoutes from './routes/trip-routes.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middlewares
// 3. Configurar CORS apropiadamente en server.mjs
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// En server.mjs - Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Driver Trip API',
            version: '1.0.0',
            description: 'API RESTful para gestión de conductores y viajes',
        },
        servers: [
            // Servidor de producción
            {
                url: 'https://proyectoelectiva-pyl0.onrender.com',
                description: 'Production server (Render)'
            },
            // Servidor local (desarrollo)
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

// Personalizar Swagger UI
const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Driver Trip API Documentation',
    swaggerOptions: {
        persistAuthorization: true,  // Mantener el token entre recargas
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bienvenido a Driver Trip API',
        version: '1.0.0',
        documentation: '/api-docs',
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
            }
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;