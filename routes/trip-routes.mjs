import express from 'express';
import {
    addPassenger,
    findAll,
    findById,
    getStatistics,
    rateTrip,
    remove,
    save,
    update
} from '../controllers/controller-trips.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       required:
 *         - driver_id
 *         - origin
 *         - destination
 *         - departure_time
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *         driver_id:
 *           type: string
 *           description: ID del conductor
 *         origin:
 *           type: string
 *           example: Bogotá
 *         destination:
 *           type: string
 *           example: Fusagasugá
 *         departure_time:
 *           type: string
 *           format: date-time
 *           example: 2025-10-15T08:00:00Z
 *         arrival_time:
 *           type: string
 *           format: date-time
 *         price:
 *           type: number
 *           example: 25000
 *         available_seats:
 *           type: number
 *           example: 4
 *         status:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled]
 *           example: scheduled
 *         distance_km:
 *           type: number
 *           example: 65
 *         duration_minutes:
 *           type: number
 *           example: 90
 *         passengers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               seats_reserved:
 *                 type: number
 */

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Obtener todos los viajes
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled]
 *         description: Filtrar por estado
 *       - in: query
 *         name: driver_id
 *         schema:
 *           type: string
 *         description: Filtrar por conductor
 *     responses:
 *       200:
 *         description: Lista de viajes
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticateToken, findAll);

/**
 * @swagger
 * /api/trips/statistics:
 *   get:
 *     summary: Obtener estadísticas de viajes
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: driver_id
 *         schema:
 *           type: string
 *         description: Filtrar estadísticas por conductor
 *     responses:
 *       200:
 *         description: Estadísticas de viajes
 *       401:
 *         description: No autorizado
 */
router.get('/statistics', authenticateToken, getStatistics);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Obtener viaje por ID
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Viaje encontrado
 *       404:
 *         description: Viaje no encontrado
 */
router.get('/:id', authenticateToken, findById);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Crear un nuevo viaje
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driver_id
 *               - origin
 *               - destination
 *               - departure_time
 *               - price
 *             properties:
 *               driver_id:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               origin:
 *                 type: string
 *                 example: Bogotá
 *               destination:
 *                 type: string
 *                 example: Fusagasugá
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-10-15T08:00:00Z
 *               price:
 *                 type: number
 *                 example: 25000
 *               available_seats:
 *                 type: number
 *                 example: 4
 *               distance_km:
 *                 type: number
 *                 example: 65
 *               duration_minutes:
 *                 type: number
 *                 example: 90
 *     responses:
 *       201:
 *         description: Viaje creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', authenticateToken, save);

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Actualizar viaje
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, in_progress, completed, cancelled]
 *               arrival_time:
 *                 type: string
 *                 format: date-time
 *             example:
 *               status: completed
 *               arrival_time: 2025-10-15T09:30:00Z
 *     responses:
 *       200:
 *         description: Viaje actualizado
 *       404:
 *         description: Viaje no encontrado
 */
router.put('/:id', authenticateToken, update);

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Eliminar viaje
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Viaje eliminado
 *       404:
 *         description: Viaje no encontrado
 */
router.delete('/:id', authenticateToken, remove);

/**
 * @swagger
 * /api/trips/{id}/passengers:
 *   post:
 *     summary: Agregar pasajero al viaje
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - seats_reserved
 *             properties:
 *               name:
 *                 type: string
 *                 example: María González
 *               phone:
 *                 type: string
 *                 example: +57 310 9876543
 *               seats_reserved:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Pasajero agregado
 *       400:
 *         description: No hay asientos disponibles
 */
router.post('/:id/passengers', authenticateToken, addPassenger);

/**
 * @swagger
 * /api/trips/{id}/rate:
 *   post:
 *     summary: Calificar viaje
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *     responses:
 *       200:
 *         description: Viaje calificado exitosamente
 *       400:
 *         description: Solo se pueden calificar viajes completados
 */
router.post('/:id/rate', authenticateToken, rateTrip);

export default router;