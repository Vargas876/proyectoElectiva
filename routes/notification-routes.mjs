// routes/notification-routes.mjs
import express from 'express';
import {
    deleteNotification,
    getAllNotifications,
    markAllAsRead,
    markAsRead
} from '../controllers/controller-notifications.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la notificación
 *           example: 507f1f77bcf86cd799439011
 *         user_id:
 *           type: string
 *           description: ID del usuario destinatario
 *           example: 507f1f77bcf86cd799439012
 *         type:
 *           type: string
 *           enum: [trip_update, new_passenger, trip_completed, review_received, badge_earned, level_up, payment_received, system_alert]
 *           description: Tipo de notificación
 *           example: trip_completed
 *         title:
 *           type: string
 *           description: Título de la notificación
 *           example: Viaje Completado
 *         message:
 *           type: string
 *           description: Mensaje detallado de la notificación
 *           example: Tu viaje a Medellín ha sido completado exitosamente
 *         read:
 *           type: boolean
 *           description: Indica si la notificación ha sido leída
 *           example: false
 *         data:
 *           type: object
 *           description: Datos adicionales relacionados con la notificación
 *           properties:
 *             trip_id:
 *               type: string
 *             driver_id:
 *               type: string
 *             amount:
 *               type: number
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           description: Prioridad de la notificación
 *           example: normal
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       example:
 *         _id: 507f1f77bcf86cd799439011
 *         user_id: 507f1f77bcf86cd799439012
 *         type: trip_completed
 *         title: Viaje Completado
 *         message: Tu viaje a Medellín ha sido completado exitosamente
 *         read: false
 *         priority: normal
 *         createdAt: 2025-10-09T18:00:00.000Z
 *         updatedAt: 2025-10-09T18:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Sistema de notificaciones en tiempo real
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener todas las notificaciones del usuario
 *     tags: [Notifications]
 *     description: Obtiene todas las notificaciones del usuario autenticado con paginación
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de notificaciones por página
 *         example: 20
 *     responses:
 *       200:
 *         description: Lista de notificaciones obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: No autorizado - Token no válido o no proporcionado
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
 *                   example: Error al obtener notificaciones
 */
router.get('/', authenticateToken, getAllNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 *     description: Marca una notificación específica como leída
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Notificación marcada como leída exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *             example:
 *               success: true
 *               data:
 *                 _id: 507f1f77bcf86cd799439011
 *                 user_id: 507f1f77bcf86cd799439012
 *                 type: trip_completed
 *                 title: Viaje Completado
 *                 message: Tu viaje a Medellín ha sido completado exitosamente
 *                 read: true
 *                 createdAt: 2025-10-09T18:00:00.000Z
 *                 updatedAt: 2025-10-09T18:05:00.000Z
 *       404:
 *         description: Notificación no encontrada
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
 *                   example: Notificación no encontrada
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
 *                   example: Error al marcar como leída
 */
router.patch('/:id/read', authenticateToken, markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     description: Marca todas las notificaciones no leídas del usuario como leídas
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
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
 *                   example: Todas las notificaciones marcadas como leídas
 *             example:
 *               success: true
 *               message: Todas las notificaciones marcadas como leídas
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
 *                   example: Error al marcar todas como leídas
 */
router.patch('/read-all', authenticateToken, markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Eliminar una notificación
 *     tags: [Notifications]
 *     description: Elimina permanentemente una notificación del usuario
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación a eliminar
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Notificación eliminada exitosamente
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
 *                   example: Notificación eliminada
 *       404:
 *         description: Notificación no encontrada
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
 *                   example: Notificación no encontrada
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
 *                   example: Error al eliminar notificación
 */
router.delete('/:id', authenticateToken, deleteNotification);

export default router;
