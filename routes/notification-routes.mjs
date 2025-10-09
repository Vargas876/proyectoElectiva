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

// Todas las rutas requieren autenticación
router.get('/', authenticateToken, getAllNotifications);
router.patch('/:id/read', authenticateToken, markAsRead); // ✅ CORREGIR: /:id/read
router.patch('/read-all', authenticateToken, markAllAsRead);
router.delete('/:id', authenticateToken, deleteNotification);

export default router;
