import express from 'express';
import { findAll, findById, remove, save, update } from '../controllers/controller-driver.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Driver:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *         - license_number
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado del conductor
 *         name:
 *           type: string
 *           description: Nombre completo del conductor
 *           example: Juan Pérez
 *         email:
 *           type: string
 *           format: email
 *           description: Email del conductor
 *           example: juan@example.com
 *         phone:
 *           type: string
 *           description: Teléfono del conductor
 *           example: +57 300 1234567
 *         license_number:
 *           type: string
 *           description: Número de licencia de conducir
 *           example: ABC123456
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *           description: Calificación del conductor
 *           example: 4.5
 *         status:
 *           type: string
 *           enum: [available, busy, offline]
 *           description: Estado actual del conductor
 *           example: available
 *         total_trips:
 *           type: number
 *           description: Número total de viajes realizados
 *           example: 25
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     summary: Obtener todos los conductores
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: No autorizado - Token inválido o faltante
 */
router.get('/', authenticateToken, findAll);

/**
 * @swagger
 * /api/drivers/{id}:
 *   get:
 *     summary: Obtener conductor por ID
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conductor
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
 *       401:
 *         description: No autorizado
 */
router.get('/:id', authenticateToken, findById);

/**
 * @swagger
 * /api/drivers:
 *   post:
 *     summary: Crear un nuevo conductor
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
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
 *                 example: Carlos Rodríguez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: carlos@example.com
 *               phone:
 *                 type: string
 *                 example: +57 310 9876543
 *               license_number:
 *                 type: string
 *                 example: XYZ789012
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
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticateToken, save);

/**
 * @swagger
 * /api/drivers/{id}:
 *   put:
 *     summary: Actualizar conductor
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conductor
 *     requestBody:
 *       required: true
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
 *               license_number:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               status:
 *                 type: string
 *                 enum: [available, busy, offline]
 *             example:
 *               status: busy
 *               rating: 4.8
 *     responses:
 *       200:
 *         description: Conductor actualizado exitosamente
 *       404:
 *         description: Conductor no encontrado
 *       401:
 *         description: No autorizado
 */
router.put('/:id', authenticateToken, update);

/**
 * @swagger
 * /api/drivers/{id}:
 *   delete:
 *     summary: Eliminar conductor
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conductor
 *     responses:
 *       200:
 *         description: Conductor eliminado exitosamente
 *       404:
 *         description: Conductor no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/:id', authenticateToken, remove);

export default router;