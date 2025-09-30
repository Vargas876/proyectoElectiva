import express from 'express';
import connectDB from './config/connect-db.mjs';
import { specs, swaggerUi } from './config/swagger.mjs';
import authRouter from './routes/auth.mjs';
import driverRouter from './routes/driver.mjs';
import tripRouter from './routes/trip.mjs';

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

// Routes - imports directos
app.use('/api/auth', authRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/trips', tripRouter);

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

// Para Vercel
export default app;