import express from 'express';
import { login, register, verifyToken } from '../controllers/controller-auth.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de conductor
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - license_number
 *             properties:
 *               email:
 *                 type: string
 *                 example: "juan.perez@example.com"
 *               license_number:
 *                 type: string
 *                 example: "ABC123456"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 driver:
 *                   type: object
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo conductor
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - license_number
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               license_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conductor registrado exitosamente
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token y obtener info del conductor
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 */
router.get('/verify', authenticateToken, verifyToken);

export default router;