import express from 'express';
import connectDB from './config/connect-db.mjs';
import { specs, swaggerUi } from './config/swagger.mjs';

const app = express();

// Conectar a la base de datos
connectDB().catch(console.error);

// Middlewares
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Driver & Trip API Documentation"
}));

// Importar rutas condicionalmente
try {
  const { default: authRouter } = await import('./routes/auth.mjs');
  app.use('/api/auth', authRouter);
} catch (error) {
  console.log('Auth routes not available');
}

try {
  const { default: driverRouter } = await import('./routes/driver.mjs');
  app.use('/api/drivers', driverRouter);
} catch (error) {
  console.log('Driver routes not available');
}

try {
  const { default: tripRouter } = await import('./routes/trip.mjs');
  app.use('/api/trips', tripRouter);
} catch (error) {
  console.log('Trip routes not available');
}

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Driver & Trip Management API Ready',
        documentation: '/api-docs',
        endpoints: {
            auth: '/api/auth/login',
            drivers: '/api/drivers',
            trips: '/api/trips'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// Para Vercel - NO uses app.listen()
export default app;