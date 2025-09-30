import express from 'express';
import { completeTrip, deleteTrip, findAll, findById, save, update } from '../controllers/controller-trips.mjs';
import { verifyToken } from '../middleware/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Gestión de viajes
 */

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Obtener todos los viajes
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: Lista de viajes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *                 total:
 *                   type: number
 *   post:
 *     summary: Crear nuevo viaje
 *     tags: [Trips]
 *     security:
 *       - BearerAuth: []
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
 *                 example: "6456789abcdef123456789ab"
 *               origin:
 *                 type: string
 *                 example: "Bogotá Centro"
 *               destination:
 *                 type: string
 *                 example: "Aeropuerto El Dorado"
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-01T15:30:00Z"
 *               price:
 *                 type: number
 *                 example: 25000
 *               available_seats:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 3
 *     responses:
 *       201:
 *         description: Viaje creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Conductor no encontrado
 */

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Obtener viaje por ID
 *     tags: [Trips]
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
 *   put:
 *     summary: Actualizar viaje
 *     tags: [Trips]
 *     security:
 *       - BearerAuth: []
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
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [scheduled, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Viaje actualizado
 *       404:
 *         description: Viaje no encontrado
 *   delete:
 *     summary: Eliminar viaje
 *     tags: [Trips]
 *     security:
 *       - BearerAuth: []
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

/**
 * @swagger
 * /api/trips/{id}/complete:
 *   patch:
 *     summary: Completar viaje con rating automático
 *     tags: [Trips]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Viaje completado con rating calculado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Trip'
 *                 rating_analysis:
 *                   type: object
 *                   properties:
 *                     trip_rating:
 *                       type: number
 *                     factors:
 *                       type: object
 *       400:
 *         description: Viaje ya completado
 *       404:
 *         description: Viaje no encontrado
 */

router.get('/', findAll);
router.get('/:id', findById);
router.post('/', verifyToken, save);
router.put('/:id', verifyToken, update);
router.patch('/:id/complete', verifyToken, completeTrip);
router.delete('/:id', verifyToken, deleteTrip);

export default router;