import express from 'express';
import { deleteDriver, findAll, findById, save, update } from '../controllers/controller-drivers.mjs';
import { verifyToken } from '../middleware/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     summary: Obtener todos los conductores
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conductores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Driver'
 */
router.get('/', verifyToken, findAll);

/**
 * @swagger
 * /api/drivers/{id}:
 *   get:
 *     summary: Obtener conductor por ID
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conductor encontrado
 *       404:
 *         description: Conductor no encontrado
 */
router.get('/:id', verifyToken, findById);

/**
 * @swagger
 * /api/drivers:
 *   post:
 *     summary: Crear nuevo conductor
 *     tags: [Drivers]
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
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 example: "juan@example.com"
 *               phone:
 *                 type: string
 *                 example: "+57 300 1234567"
 *               license_number:
 *                 type: string
 *                 example: "COL123456"
 *     responses:
 *       201:
 *         description: Conductor creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', save);

router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, deleteDriver);

export default router;