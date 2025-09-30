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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
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
 *         description: ID único del conductor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Carlos Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juancarlos@example.com"
 *               phone:
 *                 type: string
 *                 example: "+57 310 9876543"
 *               license_number:
 *                 type: string
 *                 example: "COL789456"
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.8
 *               status:
 *                 type: string
 *                 enum: [available, busy, offline]
 *                 example: "available"
 *     responses:
 *       200:
 *         description: Conductor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Datos inválidos o duplicados
 *       404:
 *         description: Conductor no encontrado
 *       500:
 *         description: Error del servidor
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
 *         description: ID único del conductor
 *     responses:
 *       200:
 *         description: Conductor eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *       404:
 *         description: Conductor no encontrado
 *       500:
 *         description: Error del servidor
 */

router.get('/', verifyToken, findAll);
router.get('/:id', verifyToken, findById);
router.post('/', save);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, deleteDriver);

export default router;