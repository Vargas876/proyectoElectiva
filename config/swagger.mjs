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
          ? 'https://proyecto-electivaa.vercel.app' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production Server' 
          : 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT en el formato: Bearer <token>'
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
            total_rating_points: { type: 'number', example: 117.5 },
            status: { 
              type: 'string', 
              enum: ['available', 'busy', 'offline'],
              example: 'available'
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Trip: {
          type: 'object',
          required: ['driver_id', 'origin', 'destination', 'departure_time', 'price'],
          properties: {
            _id: { type: 'string', description: 'ID único del viaje' },
            driver_id: { 
              type: 'string', 
              description: 'ID del conductor',
              example: '507f1f77bcf86cd799439011'
            },
            origin: { type: 'string', example: 'Bogotá Centro' },
            destination: { type: 'string', example: 'Aeropuerto El Dorado' },
            departure_time: { 
              type: 'string', 
              format: 'date-time',
              example: '2025-09-30T18:00:00.000Z'
            },
            arrival_time: { 
              type: 'string', 
              format: 'date-time',
              nullable: true,
              example: '2025-09-30T19:30:00.000Z'
            },
            price: { type: 'number', example: 25000, minimum: 0 },
            available_seats: { 
              type: 'number', 
              minimum: 1, 
              maximum: 8,
              default: 4,
              example: 4
            },
            status: { 
              type: 'string', 
              enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
              example: 'scheduled'
            },
            trip_rating: { 
              type: 'number', 
              minimum: 1, 
              maximum: 5,
              nullable: true,
              example: 4.8
            },
            distance_km: { type: 'number', example: 15.5 },
            estimated_duration_minutes: { type: 'number', example: 45 },
            actual_duration_minutes: { type: 'number', nullable: true, example: 52 },
            weather_condition: { 
              type: 'string', 
              enum: ['excellent', 'good', 'rainy', 'heavy_traffic'],
              example: 'good'
            },
            time_of_day: {
              type: 'string',
              enum: ['morning', 'afternoon', 'evening', 'night'],
              example: 'afternoon'
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        AuthLogin: {
          type: 'object',
          required: ['email', 'license_number'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'juan@example.com',
              description: 'Email del conductor registrado'
            },
            license_number: { 
              type: 'string', 
              example: 'COL123456',
              description: 'Número de licencia del conductor'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login exitoso' },
            token: { 
              type: 'string', 
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
            },
            driver: { $ref: '#/components/schemas/Driver' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error information' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operación exitosa' },
            data: { type: 'object' },
            total: { type: 'number', example: 10 }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { 
                    type: 'string', 
                    example: 'Token de acceso requerido' 
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.mjs', './controllers/*.mjs']
};

const specs = swaggerJsdoc(options);

// Configuración especial para Vercel
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .scheme-container { background: #f8f8f8; padding: 15px; }
  `,
  customSiteTitle: "Driver & Trip API - Documentación",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    // Evita problemas en Vercel
    url: undefined,
    urls: undefined
  }
};

export { specs, swaggerOptions, swaggerUi };

