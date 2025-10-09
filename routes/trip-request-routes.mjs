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
 * IMPORTANTE: El orden de las rutas importa
 * Las rutas más específicas deben ir ANTES de las rutas con parámetros
 */

// ========== RUTAS ESPECÍFICAS (sin parámetros) ==========
router.get('/available', authenticateToken, getAvailableRequests);
router.get('/my-requests', authenticateToken, getMyRequests);
router.get('/my-offers', authenticateToken, getMyOffers);

// ========== CREAR ==========
router.post('/', authenticateToken, createTripRequest);

// ========== RUTAS CON PARÁMETRO :id ==========
router.get('/:id', authenticateToken, getTripRequestById);

// ========== OFERTAS ==========
router.post('/:id/offer', authenticateToken, makeOffer);
router.post('/:id/accept-offer', authenticateToken, acceptOffer);

// Log para debug
console.log('✅ Trip Request Routes cargadas:');
console.log('   GET  /api/trip-requests/available');
console.log('   GET  /api/trip-requests/my-requests');
console.log('   GET  /api/trip-requests/my-offers');
console.log('   POST /api/trip-requests/');
console.log('   GET  /api/trip-requests/:id');
console.log('   POST /api/trip-requests/:id/offer');
console.log('   POST /api/trip-requests/:id/accept-offer');

export default router;