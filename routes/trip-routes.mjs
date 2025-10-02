import express from 'express';
import { findAll, findById, remove, save, update } from '../controllers/controller-trips.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
 */
router.get('/', authenticateToken, findAll);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get trip by ID
 *     tags: [Trips]
 */
router.get('/:id', authenticateToken, findById);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 */
router.post('/', authenticateToken, save);

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update trip
 *     tags: [Trips]
 */
router.put('/:id', authenticateToken, update);

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete trip
 *     tags: [Trips]
 */
router.delete('/:id', authenticateToken, remove);

export default router;