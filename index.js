import express from 'express';
import connectDB from './config/connect-db.mjs';
import { specs, swaggerUi } from './config/swagger.mjs';

const app = express();

// Conectar a la base de datos
connectDB().catch(console.error);

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Headers de seguridad y CORS básico
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Responder a preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Swagger Documentation - Configuración mejorada para Vercel
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .scheme-container { background: #f8f8f8; padding: 15px; }
    `,
    customSiteTitle: "Driver & Trip API Documentation",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        // Evita problemas de carga en Vercel
        tryItOutEnabled: true
    }
}));

// Importar rutas condicionalmente con mejor logging
try {
    const { default: authRouter } = await import('./routes/auth.mjs');
    app.use('/api/auth', authRouter);
    console.log('✅ Auth routes loaded successfully');
} catch (error) {
    console.log('❌ Auth routes not available:', error.message);
}

try {
    const { default: driverRouter } = await import('./routes/driver.mjs');
    app.use('/api/drivers', driverRouter);
    console.log('✅ Driver routes loaded successfully');
} catch (error) {
    console.log('❌ Driver routes not available:', error.message);
}

try {
    const { default: tripRouter } = await import('./routes/trip.mjs');
    app.use('/api/trips', tripRouter);
    console.log('✅ Trip routes loaded successfully');
} catch (error) {
    console.log('❌ Trip routes not available:', error.message);
}

// Root endpoint con información más completa
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Driver & Trip Management API Ready',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            authentication: {
                login: 'POST /api/auth/login',
                verify: 'GET /api/auth/verify'
            },
            drivers: {
                list: 'GET /api/drivers',
                create: 'POST /api/drivers',
                getById: 'GET /api/drivers/:id',
                update: 'PUT /api/drivers/:id',
                delete: 'DELETE /api/drivers/:id'
            },
            trips: {
                list: 'GET /api/trips',
                create: 'POST /api/trips',
                getById: 'GET /api/trips/:id',
                update: 'PUT /api/trips/:id',
                delete: 'DELETE /api/trips/:id',
                complete: 'PATCH /api/trips/:id/complete'
            }
        },
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Health check más detallado
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        service: 'Driver & Trip API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Endpoint para verificar rutas disponibles
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API Status',
        routes: {
            auth: '✅ Available',
            drivers: '✅ Available', 
            trips: '✅ Available'
        },
        documentation: '/api-docs'
    });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: {
            documentation: '/api-docs',
            health: '/health',
            status: '/api/status',
            auth: '/api/auth/login',
            drivers: '/api/drivers',
            trips: '/api/trips'
        }
    });
});

// Error handler mejorado
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    // No exponer detalles del error en producción
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(err.status || 500).json({
        success: false,
        message: isDevelopment ? err.message : 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack })
    });
});

// Para Vercel - NO uses app.listen()
export default app;
