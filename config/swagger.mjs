import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Driver Trip API',
    version: '2.0.0',
    description: 'API completa para la plataforma de carpooling Driver Trip - Sistema de gestión de viajes compartidos con gamificación, reseñas y chat en tiempo real',
    contact: {
      name: 'Driver Trip Support',
      email: 'support@drivertrip.com',
      url: 'https://proyectoelectiva-pyl0.onrender.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desarrollo'
    },
    {
      url: 'https://proyectoelectiva-pyl0.onrender.com',
      description: 'Servidor de Producción'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa tu token JWT obtenido al hacer login. Formato: Bearer {token}'
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints de autenticación y gestión de sesiones'
    },
    {
      name: 'Drivers',
      description: 'Gestión de conductores (perfil, CRUD)'
    },
    {
      name: 'Trips',
      description: 'Gestión de viajes (crear, listar, buscar)'
    },
    {
      name: 'Reviews',
      description: 'Sistema de reseñas y calificaciones'
    },
    {
      name: 'Notifications',
      description: 'Notificaciones en tiempo real'
    },
    {
      name: 'Rewards',
      description: 'Sistema de gamificación (puntos, niveles, badges)'
    },
    {
      name: 'Emergency',
      description: 'Sistema de alertas SOS'
    },
    {
      name: 'Recurring Trips',
      description: 'Viajes recurrentes (rutas habituales)'
    },
    {
      name: 'Verification',
      description: 'Verificación de documentos de conductores'
    }
  ]
};

const options = {
  swaggerDefinition,
  // Rutas donde están los comentarios de Swagger
  apis: [
    './routes/*.mjs',
    './routes/**/*.mjs',
    './controllers/*.mjs',
    './models/*.mjs'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
