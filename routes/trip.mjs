import express from 'express';
import { deleteTrip, findAll, save, update } from '../controllers/controller-trips.mjs';
import { verifyToken } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/', findAll); // Público para ver viajes disponibles
router.get('/:id', findAll);
router.post('/', verifyToken, save); // Solo conductores autenticados
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, deleteTrip);

export default router;