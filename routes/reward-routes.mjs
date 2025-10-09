// routes/reward-routes.mjs
import express from 'express';
import {
    getBadges,
    getLeaderboard,
    getRewards
} from '../controllers/controller-reward.mjs';
import { authenticateToken } from '../middlewares/auth.mjs'; // ✅ CORREGIDO

const router = express.Router();
/**
 * @swagger
 * /api/rewards:
 *   get:
 *     summary: Obtener recompensas del conductor
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de recompensas
 */
router.get('/', authenticateToken, getRewards);

/**
 * @swagger
 * /api/rewards/badges:
 *   get:
 *     summary: Obtener badges del conductor
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de badges
 */
router.get('/badges', authenticateToken, getBadges);

/**
 * @swagger
 * /api/rewards/leaderboard:
 *   get:
 *     summary: Obtener tabla de clasificación
 *     tags: [Rewards]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [points, level]
 *     responses:
 *       200:
 *         description: Top conductores
 */
router.get('/leaderboard', getLeaderboard);

export default router;
