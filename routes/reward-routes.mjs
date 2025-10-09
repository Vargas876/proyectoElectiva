// routes/reward-routes.mjs
import express from 'express';
import {
    claimBadge,
    getLeaderboard,
    getMyRewards,
    getRewardsByDriver
} from '../controllers/controller-rewards.mjs';
import { authenticateToken } from '../middlewares/auth.mjs';

const router = express.Router();

// Rutas protegidas
router.get('/my-rewards', authenticateToken, getMyRewards);
router.get('/driver/:driverId', authenticateToken, getRewardsByDriver);
router.get('/leaderboard', getLeaderboard);
router.post('/claim-badge/:badgeId', authenticateToken, claimBadge);

export default router;
