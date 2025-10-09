// routes/reward-routes.mjs
import express from 'express';
import {
    claimBadge,
    getLeaderboard,
    getMyRewards,
    getRewardsByDriver
} from '../controllers/controller-rewards.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Badge:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del badge
 *           example: Primera Victoria
 *         icon:
 *           type: string
 *           description: Emoji o icono del badge
 *           example: 🎉
 *         description:
 *           type: string
 *           description: Descripción de cómo obtener el badge
 *           example: Completa tu primer viaje
 *         rarity:
 *           type: string
 *           enum: [common, rare, epic, legendary]
 *           description: Rareza del badge
 *           example: common
 *         earned_at:
 *           type: string
 *           format: date-time
 *           description: Fecha en que se obtuvo el badge
 * 
 *     Achievement:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Título del logro
 *           example: Completar 100 viajes
 *         description:
 *           type: string
 *           description: Descripción del logro
 *           example: Completa 100 viajes exitosos
 *         progress:
 *           type: integer
 *           description: Progreso actual
 *           example: 75
 *         target:
 *           type: integer
 *           description: Meta a alcanzar
 *           example: 100
 *         completed:
 *           type: boolean
 *           description: Si el logro ha sido completado
 *           example: false
 *         reward_points:
 *           type: integer
 *           description: Puntos otorgados al completar
 *           example: 500
 * 
 *     Streaks:
 *       type: object
 *       properties:
 *         current_streak:
 *           type: integer
 *           description: Racha actual de días consecutivos
 *           example: 5
 *         longest_streak:
 *           type: integer
 *           description: Racha más larga alcanzada
 *           example: 15
 *         last_activity:
 *           type: string
 *           format: date-time
 *           description: Última actividad registrada
 * 
 *     Rewards:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del registro de recompensas
 *           example: 507f1f77bcf86cd799439011
 *         driver_id:
 *           type: string
 *           description: ID del conductor
 *           example: 507f1f77bcf86cd799439012
 *         points:
 *           type: integer
 *           description: Puntos acumulados totales
 *           example: 520
 *         level:
 *           type: integer
 *           description: Nivel actual del conductor
 *           example: 5
 *         badges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Badge'
 *         achievements:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Achievement'
 *         streaks:
 *           $ref: '#/components/schemas/Streaks'
 *         rank:
 *           type: integer
 *           description: Posición en el leaderboard
 *           example: 12
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     LeaderboardEntry:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         driver_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             rating:
 *               type: number
 *             total_trips:
 *               type: integer
 *         points:
 *           type: integer
 *         level:
 *           type: integer
 *         badges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Badge'
 *         rank:
 *           type: integer
 */

/**
 * @swagger
 * tags:
 *   name: Rewards
 *   description: Sistema de gamificación, puntos, niveles y badges
 */

/**
 * @swagger
 * /api/rewards/my-rewards:
 *   get:
 *     summary: Obtener mis recompensas
 *     tags: [Rewards]
 *     description: Obtiene todas las recompensas, puntos, badges y logros del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recompensas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Rewards'
 *             example:
 *               success: true
 *               data:
 *                 _id: 507f1f77bcf86cd799439011
 *                 driver_id: 507f1f77bcf86cd799439012
 *                 points: 520
 *                 level: 5
 *                 badges:
 *                   - name: Primera Victoria
 *                     icon: 🎉
 *                     description: Completa tu primer viaje
 *                     rarity: common
 *                     earned_at: 2025-09-01T10:00:00.000Z
 *                   - name: Conductor Confiable
 *                     icon: 🛡️
 *                     description: Completa 50 viajes
 *                     rarity: rare
 *                     earned_at: 2025-10-01T15:30:00.000Z
 *                 achievements:
 *                   - title: Completar 100 viajes
 *                     description: Completa 100 viajes exitosos
 *                     progress: 85
 *                     target: 100
 *                     completed: false
 *                     reward_points: 500
 *                 streaks:
 *                   current_streak: 5
 *                   longest_streak: 12
 *                 rank: 12
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
 *                   example: Error al obtener recompensas
 */
router.get('/my-rewards', authenticateToken, getMyRewards);

/**
 * @swagger
 * /api/rewards/driver/{driverId}:
 *   get:
 *     summary: Obtener recompensas de un conductor específico
 *     tags: [Rewards]
 *     description: Obtiene las recompensas públicas de otro conductor
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conductor
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Recompensas del conductor obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Rewards'
 *       404:
 *         description: Recompensas no encontradas
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
 *                   example: Recompensas no encontradas
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
 */
router.get('/driver/:driverId', authenticateToken, getRewardsByDriver);

/**
 * @swagger
 * /api/rewards/leaderboard:
 *   get:
 *     summary: Obtener tabla de clasificación (leaderboard)
 *     tags: [Rewards]
 *     description: Obtiene el ranking de los mejores conductores por puntos o nivel (ruta pública)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados a mostrar
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [points, level]
 *           default: points
 *         description: Campo por el cual ordenar
 *         example: points
 *     responses:
 *       200:
 *         description: Leaderboard obtenido exitosamente
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
 *                     $ref: '#/components/schemas/LeaderboardEntry'
 *             example:
 *               success: true
 *               data:
 *                 - _id: 507f1f77bcf86cd799439011
 *                   driver_id:
 *                     _id: 507f1f77bcf86cd799439012
 *                     name: María González
 *                     email: maria@email.com
 *                     rating: 4.9
 *                     total_trips: 200
 *                   points: 740
 *                   level: 7
 *                   badges:
 *                     - name: Estrella de Oro
 *                       icon: ⭐
 *                       rarity: epic
 *                   rank: 1
 *                 - _id: 507f1f77bcf86cd799439013
 *                   driver_id:
 *                     _id: 507f1f77bcf86cd799439014
 *                     name: Carlos Rodríguez
 *                     email: carlos@email.com
 *                     rating: 4.8
 *                     total_trips: 150
 *                   points: 520
 *                   level: 5
 *                   rank: 2
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
 *                   example: Error al obtener leaderboard
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @swagger
 * /api/rewards/claim-badge/{badgeId}:
 *   post:
 *     summary: Reclamar un badge
 *     tags: [Rewards]
 *     description: Reclama un badge desbloqueado por el conductor
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID o nombre del badge a reclamar
 *         example: conductor_confiable
 *     responses:
 *       200:
 *         description: Badge reclamado exitosamente
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
 *                   example: Badge reclamado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Rewards'
 *             example:
 *               success: true
 *               message: Badge reclamado exitosamente
 *               data:
 *                 _id: 507f1f77bcf86cd799439011
 *                 points: 520
 *                 level: 5
 *                 badges:
 *                   - name: conductor_confiable
 *                     icon: 🏆
 *                     description: Badge desbloqueado
 *                     rarity: common
 *                     earned_at: 2025-10-09T18:00:00.000Z
 *       400:
 *         description: Badge ya reclamado o no disponible
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
 *                   example: Ya tienes este badge
 *       404:
 *         description: Recompensas no encontradas
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
 *                   example: Recompensas no encontradas
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
 *                   example: Error al reclamar badge
 */
router.post('/claim-badge/:badgeId', authenticateToken, claimBadge);

export default router;
