import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Driver & Trip Management API',
      version: '1.0.0',
      description: 'API tipo Uber para gestión de conductores y viajes',
      contact: {
        name: 'API Support',
        email: 'support@drivertrip.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://tu-proyecto.vercel.app'  // Cambia esto por tu URL real de Vercel
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Servidor de producción' 
          : 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Driver: {
          type: 'object',
          required: ['name', 'email', 'phone', 'license_number'],
          properties: {
            _id: { type: 'string', description: 'ID único del conductor' },
            name: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan@example.com' },
            phone: { type: 'string', example: '+57 300 1234567' },
            license_number: { type: 'string', example: 'COL123456' },
            rating: { type: 'number', minimum: 0, maximum: 5, example: 4.7 },
            total_trips: { type: 'number', example: 25 },
            status: { type: 'string', enum: ['available', 'busy', 'offline'] }
          }
        },
        Trip: {
          type: 'object',
          required: ['driver_id', 'origin', 'destination', 'departure_time', 'price'],
          properties: {
            _id: { type: 'string', description: 'ID único del viaje' },
            driver_id: { type: 'string', description: 'ID del conductor' },
            origin: { type: 'string', example: 'Bogotá Centro' },
            destination: { type: 'string', example: 'Aeropuerto' },
            departure_time: { type: 'string', format: 'date-time' },
            arrival_time: { type: 'string', format: 'date-time' },
            price: { type: 'number', example: 25000 },
            available_seats: { type: 'number', minimum: 1, maximum: 8 },
            status: { type: 'string', enum: ['scheduled', 'in_progress', 'completed', 'cancelled'] },
            trip_rating: { type: 'number', minimum: 1, maximum: 5 },
            distance_km: { type: 'number', example: 15.5 },
            weather_condition: { type: 'string', enum: ['excellent', 'good', 'rainy', 'heavy_traffic'] }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.mjs', './controllers/*.mjs']
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };