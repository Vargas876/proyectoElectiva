import express from 'express';
import { login, register, verifyToken } from '../controllers/controller-auth.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - license_number
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: juan.vargas40@uptc.edu.co
 *         license_number:
 *           type: string
 *           example: CD25442652
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *         - license_number
 *       properties:
 *         name:
 *           type: string
 *           example: Juan Pérez
 *         email:
 *           type: string
 *           format: email
 *           example: juan@example.com
 *         phone:
 *           type: string
 *           example: +57 300 1234567
 *         license_number:
 *           type: string
 *           example: ABC123456
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
 *             $ref: '#/components/schemas/LoginRequest'
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Conductor registrado exitosamente
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
 *       400:
 *         description: Error de validación o conductor ya existe
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token JWT
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
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
 *                 message:
 *                   type: string
 *                 driver:
 *                   type: object
 *       401:
 *         description: Token inválido o faltante
 *       404:
 *         description: Conductor no encontrado
 */
router.get('/verify', authenticateToken, verifyToken);

export default router;