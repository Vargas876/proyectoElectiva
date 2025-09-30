import express from 'express';
import connectDB from './config/connect-db.mjs';
import { specs, swaggerUi } from './config/swagger.mjs';
import authRouter from './routes/auth.mjs';
import driverRouter from './routes/driver.mjs';
import tripRouter from './routes/trip.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Driver & Trip API Documentation"
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/trips', tripRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Driver & Trip Management API Server Ready at port ' + PORT,
        documentation: `http://localhost:${PORT}/api-docs`,
        endpoints: {
            auth: '/api/auth/login',
            drivers: '/api/drivers',
            trips: '/api/trips'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server ready at port ${PORT}`);
    console.log(` API Documentation: http://localhost:${PORT}/api-docs`);
});