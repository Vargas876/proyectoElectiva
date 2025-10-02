import cors from 'cors';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/connect-db.mjs';
import { generateToken } from './middlewares/auth.mjs';
import { errorHandler, notFound } from './middlewares/errorHandler.mjs';
import driverRoutes from './routes/driver-routes.mjs';
import tripRoutes from './routes/trip-routes.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Driver Trip API',
            version: '1.0.0',
            description: 'RESTful API for managing drivers and trips with JWT authentication',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Driver Trip API',
        documentation: '/api-docs',
        endpoints: {
            drivers: '/api/drivers',
            trips: '/api/trips',
            auth: '/api/auth/login'
        }
    });
});

// Ruta de autenticación (genera token)
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // En producción, validar contra base de datos
    if (username === 'admin' && password === 'admin123') {
        const token = generateToken({ username, role: 'admin' });
        return res.json({
            success: true,
            message: 'Login successful',
            token
        });
    }
    
    res.status(401).json({
        success: false,
        message: 'Invalid credentials'
    });
});

app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;