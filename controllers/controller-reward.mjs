// controllers/controller-reward.mjs
import Rewards from '../models/Rewards.mjs';

// Obtener recompensas del conductor
export async function getRewards(req, res) {
  try {
    const driver_id = req.user.id;
    
    let rewards = await Rewards.findOne({ driver_id }).populate('driver_id', 'name email rating');
    
    // Si no existe, crear uno nuevo
    if (!rewards) {
      rewards = await Rewards.create({ driver_id });
      rewards = await Rewards.findById(rewards._id).populate('driver_id', 'name email rating');
    }
    
    res.json({ success: true, data: rewards });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener recompensas', error: error.message });
  }
}

// Obtener badges del conductor
export async function getBadges(req, res) {
  try {
    const driver_id = req.user.id;
    
    const rewards = await Rewards.findOne({ driver_id });
    
    if (!rewards) {
      return res.json({ success: true, data: [] });
    }
    
    res.json({ success: true, data: rewards.badges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener badges', error: error.message });
  }
}

// Obtener leaderboard
export async function getLeaderboard(req, res) {
  try {
    const { limit = 10, type = 'points' } = req.query;
    
    let sortField = {};
    if (type === 'points') {
      sortField = { points: -1 };
    } else if (type === 'level') {
      sortField = { level: -1, points: -1 };
    }
    
    const leaderboard = await Rewards.find()
      .populate('driver_id', 'name profile_picture rating completed_trips')
      .sort(sortField)
      .limit(parseInt(limit));
    
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener leaderboard', error: error.message });
  }
}
