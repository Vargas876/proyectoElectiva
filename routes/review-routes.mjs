// routes/review-routes.mjs
import express from 'express';
import {
    createReview,
    getReviewByTrip,
    getReviewsByDriver
} from '../controllers/controller-review.mjs';
import { authenticateToken } from '../middlewares/auth.mjs'; // ✅ CORREGIDO

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Crear una nueva review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trip_id
 *               - reviewed_driver_id
 *               - rating
 *             properties:
 *               trip_id:
 *                 type: string
 *               reviewed_driver_id:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Review creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', authenticateToken, createReview);

/**
 * @swagger
 * /api/reviews/driver/{driverId}:
 *   get:
 *     summary: Obtener reviews de un conductor
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de reviews
 */
router.get('/driver/:driverId', getReviewsByDriver);

/**
 * @swagger
 * /api/reviews/trip/{tripId}:
 *   get:
 *     summary: Obtener review de un viaje
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review encontrado
 *       404:
 *         description: Review no encontrado
 */
router.get('/trip/:tripId', getReviewByTrip);

export default router;
