// routes/auth-routes.mjs
import express from 'express';
import { getCurrentUser, login, logout, register, verifyToken } from '../controllers/controller-auth.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Driver:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del conductor
 *         name:
 *           type: string
 *           description: Nombre completo del conductor
 *         email:
 *           type: string
 *           format: email
 *           description: Email del conductor
 *         phone:
 *           type: string
 *           description: Teléfono del conductor
 *         license_number:
 *           type: string
 *           description: Número de licencia de conducir
 *         vehicle_type:
 *           type: string
 *           enum: [sedan, suv, van, minibus, hatchback, coupe]
 *           description: Tipo de vehículo
 *         vehicle_plate:
 *           type: string
 *           description: Placa del vehículo
 *         vehicle_capacity:
 *           type: integer
 *           description: Capacidad de pasajeros
 *         rating:
 *           type: number
 *           format: float
 *           description: Calificación promedio del conductor
 *         total_trips:
 *           type: integer
 *           description: Total de viajes realizados
 *         level:
 *           type: integer
 *           description: Nivel del conductor en el sistema de gamificación
 *         points:
 *           type: integer
 *           description: Puntos acumulados
 *         status:
 *           type: string
 *           enum: [available, busy, offline]
 *           description: Estado actual del conductor
 * 
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *         - license_number
 *         - vehicle_type
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre completo del conductor
 *           example: Juan Pérez
 *         email:
 *           type: string
 *           format: email
 *           description: Email del conductor
 *           example: juan.perez@email.com
 *         phone:
 *           type: string
 *           description: Teléfono del conductor
 *           example: +57 300 123 4567
 *         license_number:
 *           type: string
 *           description: Número de licencia de conducir
 *           example: COL12345
 *         vehicle_type:
 *           type: string
 *           enum: [sedan, suv, van, minibus, hatchback, coupe]
 *           description: Tipo de vehículo
 *           example: sedan
 *         vehicle_plate:
 *           type: string
 *           description: Placa del vehículo
 *           example: ABC123
 *         vehicle_capacity:
 *           type: integer
 *           description: Capacidad de pasajeros
 *           example: 4
 *         vehicle_model:
 *           type: string
 *           description: Modelo del vehículo
 *           example: Toyota Corolla
 *         vehicle_year:
 *           type: integer
 *           description: Año del vehículo
 *           example: 2022
 *         vehicle_color:
 *           type: string
 *           description: Color del vehículo
 *           example: Blanco
 * 
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - license_number
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del conductor
 *           example: carlos.rodriguez@email.com
 *         license_number:
 *           type: string
 *           description: Número de licencia de conducir
 *           example: COL12345
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *         message:
 *           type: string
 *           description: Mensaje de respuesta
 *         token:
 *           type: string
 *           description: Token JWT para autenticación
 *         driver:
 *           $ref: '#/components/schemas/Driver'
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Descripción del error
 * 
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT obtenido al hacer login
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints de autenticación y gestión de sesiones
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo conductor
 *     tags: [Authentication]
 *     description: Crea una nueva cuenta de conductor en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Conductor registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Conductor registrado exitosamente
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               driver:
 *                 id: 507f1f77bcf86cd799439011
 *                 name: Juan Pérez
 *                 email: juan.perez@email.com
 *                 phone: +57 300 123 4567
 *                 vehicle_type: sedan
 *                 rating: 5.0
 *                 level: 1
 *       400:
 *         description: Datos inválidos o email/licencia ya registrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: El email ya está registrado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
 *     description: Autentica a un conductor usando email y número de licencia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Login exitoso
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               driver:
 *                 id: 507f1f77bcf86cd799439011
 *                 name: Carlos Rodríguez
 *                 email: carlos.rodriguez@email.com
 *                 phone: +57 300 123 4567
 *                 vehicle_type: sedan
 *                 rating: 4.8
 *                 total_trips: 150
 *                 level: 5
 *                 points: 520
 *       400:
 *         description: Faltan campos obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Email y número de licencia son obligatorios
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Credenciales incorrectas
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Authentication]
 *     description: Cierra la sesión del conductor autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout exitoso
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authenticateToken, logout);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token JWT
 *     tags: [Authentication]
 *     description: Verifica si el token JWT es válido y devuelve la información actualizada del conductor
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token válido
 *                 driver:
 *                   $ref: '#/components/schemas/Driver'
 *       401:
 *         description: Token no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Acceso denegado. No se proporcionó token.
 *       403:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Token inválido o expirado.
 *       404:
 *         description: Conductor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/verify', authenticateToken, verifyToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Authentication]
 *     description: Obtiene toda la información detallada del conductor autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Información del conductor obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 driver:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     name:
 *                       type: string
 *                       example: Carlos Rodríguez
 *                     email:
 *                       type: string
 *                       example: carlos.rodriguez@email.com
 *                     phone:
 *                       type: string
 *                       example: +57 300 123 4567
 *                     license_number:
 *                       type: string
 *                       example: COL12345
 *                     vehicle_type:
 *                       type: string
 *                       example: sedan
 *                     vehicle_plate:
 *                       type: string
 *                       example: ABC123
 *                     vehicle_capacity:
 *                       type: integer
 *                       example: 4
 *                     vehicle_model:
 *                       type: string
 *                       example: Toyota Corolla
 *                     vehicle_year:
 *                       type: integer
 *                       example: 2022
 *                     vehicle_color:
 *                       type: string
 *                       example: Blanco
 *                     rating:
 *                       type: number
 *                       example: 4.8
 *                     total_trips:
 *                       type: integer
 *                       example: 150
 *                     completed_trips:
 *                       type: integer
 *                       example: 145
 *                     cancelled_trips:
 *                       type: integer
 *                       example: 5
 *                     level:
 *                       type: integer
 *                       example: 5
 *                     points:
 *                       type: integer
 *                       example: 520
 *                     status:
 *                       type: string
 *                       example: available
 *                     bio:
 *                       type: string
 *                       example: Conductor profesional con 3 años de experiencia
 *                     badges:
 *                       type: array
 *                       items:
 *                         type: object
 *                     is_trusted:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Conductor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authenticateToken, getCurrentUser);

export default router;
