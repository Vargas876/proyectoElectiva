import express from 'express';
import { findAll, findById, remove, save, update } from '../controllers/controller-driver.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     summary: Get all drivers
 *     tags: [Drivers]
 *     responses:
 *       200:
 *         description: List of all drivers
 */
router.get('/', authenticateToken, findAll);

/**
 * @swagger
 * /api/drivers/{id}:
 *   get:
 *     summary: Get driver by ID
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', authenticateToken, findById);

/**
 * @swagger
 * /api/drivers:
 *   post:
 *     summary: Create a new driver
 *     tags: [Drivers]
 */
router.post('/', authenticateToken, save);

/**
 * @swagger
 * /api/drivers/{id}:
 *   put:
 *     summary: Update driver
 *     tags: [Drivers]
 */
router.put('/:id', authenticateToken, update);

/**
 * @swagger
 * /api/drivers/{id}:
 *   delete:
 *     summary: Delete driver
 *     tags: [Drivers]
 */
router.delete('/:id', authenticateToken, remove);

export default router;