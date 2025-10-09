// routes/auth-routes.mjs
import express from 'express';
import { getCurrentUser, login, logout, register, verifyToken } from '../controllers/controller-auth.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren autenticación)
router.post('/logout', authenticateToken, logout);
router.get('/verify', authenticateToken, verifyToken);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
