import express from 'express';
import {
    acceptOffer,
    createTripRequest,
    getAvailableRequests,
    getMyOffers,
    getMyRequests,
    getTripRequestById,
    makeOffer
} from '../controllers/controller-trip-requests.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TripRequest:
 *       type: object
 *       required:
 *         - passenger_id
 *         - origin
 *         - destination
 *         - passenger_offer_price
 *         - departure_time
 *       properties:
 *         _id:
 *           type: string
 *         passenger_id:
 *           type: string
 *         origin:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         destination:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         passenger_offer_price:
 *           type: number
 *         seats_needed:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, accepted, completed, cancelled]
 *         driver_offers:
 *           type: array
 *           items:
 *             type: object
 *         departure_time:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/trip-requests:
 *   post:
 *     summary: Crear solicitud de viaje (Pasajero)
 *     tags: [TripRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - passenger_offer_price
 *               - departure_time
 *             properties:
 *               origin:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "Calle 10 #5-20, Fusagasugá"
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                         example: 4.3369
 *                       lng:
 *                         type: number
 *                         example: -74.3639
 *               destination:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "Carrera 7 #32-16, Bogotá"
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                         example: 4.6097
 *                       lng:
 *                         type: number
 *                         example: -74.0817
 *               passenger_offer_price:
 *                 type: number
 *                 example: 25000
 *               seats_needed:
 *                 type: number
 *                 example: 1
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-15T08:00:00Z"
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *       403:
 *         description: Solo pasajeros pueden crear solicitudes
 */
router.post('/', authenticateToken, createTripRequest);

/**
 * @swagger
 * /api/trip-requests/available:
 *   get:
 *     summary: Obtener solicitudes disponibles (Conductor)
 *     tags: [TripRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes disponibles
 */
router.get('/available', authenticateToken, getAvailableRequests);

/**
 * @swagger
 * /api/trip-requests/my-requests:
 *   get:
 *     summary: Obtener mis solicitudes (Pasajero)
 *     tags: [TripRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mis solicitudes
 */
router.get('/my-requests', authenticateToken, getMyRequests);

/**
 * @swagger
 * /api/trip-requests/my-offers:
 *   get:
 *     summary: Obtener mis ofertas (Conductor)
 *     tags: [TripRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mis ofertas realizadas
 */
router.get('/my-offers', authenticateToken, getMyOffers);

/**
 * @swagger
 * /api/trip-requests/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     tags: [TripRequests]
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
 *         description: Solicitud encontrada
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/:id', authenticateToken, getTripRequestById);

/**
 * @swagger
 * /api/trip-requests/{id}/offer:
 *   post:
 *     summary: Hacer oferta para un viaje (Conductor)
 *     tags: [TripRequests]
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
 *               - offered_price
 *             properties:
 *               offered_price:
 *                 type: number
 *                 example: 30000
 *               message:
 *                 type: string
 *                 example: "Tengo un auto cómodo, puedo salir a la hora exacta"
 *     responses:
 *       200:
 *         description: Oferta enviada exitosamente
 *       400:
 *         description: Ya has hecho una oferta o solicitud no disponible
 */
router.post('/:id/offer', authenticateToken, makeOffer);

/**
 * @swagger
 * /api/trip-requests/{id}/accept-offer:
 *   post:
 *     summary: Aceptar oferta de conductor (Pasajero)
 *     tags: [TripRequests]
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
 *               - offerId
 *             properties:
 *               offerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Oferta aceptada exitosamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Oferta no encontrada
 */
router.post('/:id/accept-offer', authenticateToken, acceptOffer);

export default router;