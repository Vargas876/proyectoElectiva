// routes/review-routes.mjs
import express from 'express';
import {
    createReview,
    getAllReviews,
    getReviewsByDriver
} from '../controllers/controller-reviews.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la reseña
 *           example: 507f1f77bcf86cd799439011
 *         trip_id:
 *           type: string
 *           description: ID del viaje calificado
 *           example: 507f1f77bcf86cd799439012
 *         reviewer_id:
 *           type: string
 *           description: ID del usuario que hace la reseña
 *           example: 507f1f77bcf86cd799439013
 *         reviewed_driver_id:
 *           type: string
 *           description: ID del conductor calificado
 *           example: 507f1f77bcf86cd799439014
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *           description: Calificación de 1 a 5 estrellas
 *           example: 4.5
 *         comment:
 *           type: string
 *           maxLength: 500
 *           description: Comentario sobre la experiencia
 *           example: Excelente conductor, muy puntual y amable
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             enum: [punctual, friendly, safe_driver, clean_vehicle, good_conversation, professional, comfortable, late, rude, reckless]
 *           description: Etiquetas descriptivas de la experiencia
 *           example: [punctual, friendly, safe_driver]
 *         helpful_count:
 *           type: integer
 *           description: Número de usuarios que encontraron útil esta reseña
 *           example: 5
 *         response:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *               description: Respuesta del conductor a la reseña
 *             date:
 *               type: string
 *               format: date-time
 *               description: Fecha de la respuesta
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     ReviewInput:
 *       type: object
 *       required:
 *         - trip_id
 *         - reviewed_driver_id
 *         - rating
 *       properties:
 *         trip_id:
 *           type: string
 *           description: ID del viaje completado
 *           example: 507f1f77bcf86cd799439012
 *         reviewed_driver_id:
 *           type: string
 *           description: ID del conductor a calificar
 *           example: 507f1f77bcf86cd799439014
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *           description: Calificación de 1 a 5 estrellas
 *           example: 4.5
 *         comment:
 *           type: string
 *           maxLength: 500
 *           description: Comentario sobre la experiencia (opcional)
 *           example: Muy buen conductor, puntual y amable. El vehículo estaba limpio.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             enum: [punctual, friendly, safe_driver, clean_vehicle, good_conversation, professional, comfortable, late, rude, reckless]
 *           description: Etiquetas que describen la experiencia
 *           example: [punctual, friendly, clean_vehicle]
 */

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Sistema de reseñas y calificaciones de conductores
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Obtener todas las reseñas
 *     tags: [Reviews]
 *     description: Obtiene todas las reseñas del sistema con paginación (ruta pública)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por página
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de reseñas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     pages:
 *                       type: integer
 *                       example: 15
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error al obtener reviews
 */
router.get('/', getAllReviews);

/**
 * @swagger
 * /api/reviews/driver/{driverId}:
 *   get:
 *     summary: Obtener reseñas de un conductor específico
 *     tags: [Reviews]
 *     description: Obtiene todas las reseñas de un conductor específico con paginación (ruta pública)
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conductor
 *         example: 507f1f77bcf86cd799439014
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por página
 *         example: 10
 *     responses:
 *       200:
 *         description: Reseñas del conductor obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Review'
 *                       - type: object
 *                         properties:
 *                           reviewer_id:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           trip_id:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               origin:
 *                                 type: string
 *                               destination:
 *                                 type: string
 *                               departure_time:
 *                                 type: string
 *                                 format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *             example:
 *               success: true
 *               data:
 *                 - _id: 507f1f77bcf86cd799439011
 *                   trip_id:
 *                     _id: 507f1f77bcf86cd799439012
 *                     origin: Bogotá
 *                     destination: Medellín
 *                     departure_time: 2025-10-05T07:00:00.000Z
 *                   reviewer_id:
 *                     _id: 507f1f77bcf86cd799439013
 *                     name: Juan Pérez
 *                     email: juan@email.com
 *                   reviewed_driver_id: 507f1f77bcf86cd799439014
 *                   rating: 5
 *                   comment: Excelente conductor, muy puntual y amable
 *                   tags: [punctual, friendly, safe_driver]
 *                   helpful_count: 3
 *                   createdAt: 2025-10-05T12:00:00.000Z
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 25
 *                 pages: 3
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error al obtener reviews
 */
router.get('/driver/:driverId', getReviewsByDriver);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Crear una nueva reseña
 *     tags: [Reviews]
 *     description: Crea una nueva reseña para un viaje completado (requiere autenticación)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *           example:
 *             trip_id: 507f1f77bcf86cd799439012
 *             reviewed_driver_id: 507f1f77bcf86cd799439014
 *             rating: 4.5
 *             comment: Muy buen conductor, puntual y amable. El vehículo estaba limpio y cómodo.
 *             tags: [punctual, friendly, clean_vehicle, comfortable]
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
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
 *                   example: Review creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *             example:
 *               success: true
 *               message: Review creado exitosamente
 *               data:
 *                 _id: 507f1f77bcf86cd799439011
 *                 trip_id: 507f1f77bcf86cd799439012
 *                 reviewer_id: 507f1f77bcf86cd799439013
 *                 reviewed_driver_id: 507f1f77bcf86cd799439014
 *                 rating: 4.5
 *                 comment: Muy buen conductor, puntual y amable
 *                 tags: [punctual, friendly, clean_vehicle]
 *                 helpful_count: 0
 *                 createdAt: 2025-10-09T18:00:00.000Z
 *       400:
 *         description: Datos inválidos o viaje no completado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *             examples:
 *               missing_fields:
 *                 value:
 *                   success: false
 *                   message: Faltan campos obligatorios
 *               trip_not_completed:
 *                 value:
 *                   success: false
 *                   message: Solo puedes calificar viajes completados
 *       404:
 *         description: Viaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Viaje no encontrado
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error al crear review
 */
router.post('/', authenticateToken, createReview);

export default router;
