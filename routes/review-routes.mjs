// routes/review-routes.mjs
import express from 'express';
import {
    createReview,
    getAllReviews,
    getReviewsByDriver
} from '../controllers/controller-reviews.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

// Rutas públicas
router.get('/', getAllReviews);
router.get('/driver/:driverId', getReviewsByDriver);

// Rutas protegidas
router.post('/', authenticateToken, createReview);

export default router;
