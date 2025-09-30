import express from 'express';
import { login, verifyToken as verifyTokenController } from '../controllers/controller-auth.mjs';
import { verifyToken } from '../middleware/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Autenticación JWT
 */

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
 *                 example: "juan@example.com"
 *               license_number:
 *                 type: string
 *                 example: "COL123456"
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
 *                 token:
 *                   type: string
 *                 driver:
 *                   $ref: '#/components/schemas/Driver'
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token JWT
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 driver:
 *                   $ref: '#/components/schemas/Driver'
 *       401:
 *         description: Token inválido o expirado
 */
router.get('/verify', verifyToken, verifyTokenController);

export default router;