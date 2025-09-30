import express from 'express';
import { deleteDriver, findAll, findById, save, update } from '../controllers/controller-drivers.mjs';
import { verifyToken } from '../middleware/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Drivers
 *   description: Gestión de conductores
 */

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
 *                 total:
 *                   type: number
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *                 format: email
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
 *         description: Datos inválidos o conductor duplicado
 *       500:
 *         description: Error del servidor
 */

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
 *         description: ID único del conductor
 *     responses:
 *       200:
 *         description: Conductor encontrado
 *       404:
 *         description: Conductor no encontrado
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar conductor
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, busy, offline]
 *     responses:
 *       200:
 *         description: Conductor actualizado
 *       404:
 *         description: Conductor no encontrado
 *   delete:
 *     summary: Eliminar conductor
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
 *         description: Conductor eliminado
 *       404:
 *         description: Conductor no encontrado
 */

router.get('/', verifyToken, findAll);
router.get('/:id', verifyToken, findById);
router.post('/', save);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, deleteDriver);

export default router;