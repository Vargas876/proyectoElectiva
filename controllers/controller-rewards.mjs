import Rewards from '../models/Rewards.mjs';
// Obtener recompensas del usuario actual
export const getMyRewards = async (req, res) => {
  try {
    const driverId = req.user.id;

    let rewards = await Rewards.findOne({ driver_id: driverId });

    // Si no existe, crear uno nuevo
    if (!rewards) {
      rewards = await Rewards.create({
        driver_id: driverId,
        points: 0,
        level: 1,
        badges: [],
        achievements: [],
        streaks: {
          current_streak: 0,
          longest_streak: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: rewards
    });
  } catch (error) {
    console.error('Error en getMyRewards:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener recompensas'
    });
  }
};

// Obtener recompensas de un conductor específico
export const getRewardsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    const rewards = await Rewards.findOne({ driver_id: driverId });

    if (!rewards) {
      return res.status(404).json({
        success: false,
        message: 'Recompensas no encontradas'
      });
    }

    return res.status(200).json({
      success: true,
      data: rewards
    });
  } catch (error) {
    console.error('Error en getRewardsByDriver:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener recompensas'
    });
  }
};
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'points' } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = -1;

    const leaderboard = await Rewards.find()
      .sort(sortOptions)
      .limit(parseInt(limit))
      .populate({
        path: 'driver_id',
        select: 'name email rating total_trips completed_trips badges profile_image'
      });

    // ✅ MAPEAR CORRECTAMENTE
    const enrichedLeaderboard = leaderboard.map((reward, index) => {
      const driver = reward.driver_id;
      
      return {
        rank: index + 1,
        driver: {
          id: driver._id,
          name: driver.name,
          email: driver.email,
          rating: driver.rating || 0,
          total_trips: driver.total_trips || 0,
          completed_trips: driver.completed_trips || 0,
          profile_image: driver.profile_image
        },
        rewards: {
          points: reward.points,
          level: reward.level,
          badges: driver.badges || [],
          achievements: reward.achievements || []
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedLeaderboard
    });
  } catch (error) {
    console.error('Error en getLeaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener leaderboard'
    });
  }
};



// Reclamar badge
export const claimBadge = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { badgeId } = req.params;

    const rewards = await Rewards.findOne({ driver_id: driverId });

    if (!rewards) {
      return res.status(404).json({
        success: false,
        message: 'Recompensas no encontradas'
      });
    }

    // Verificar si ya tiene el badge
    const hasBadge = rewards.badges.some(b => b.name === badgeId);
    if (hasBadge) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes este badge'
      });
    }

    // Agregar badge (ejemplo simple)
    rewards.badges.push({
      name: badgeId,
      icon: '🏆',
      description: 'Badge desbloqueado',
      rarity: 'common',
      earned_at: new Date()
    });

    await rewards.save();

    return res.status(200).json({
      success: true,
      message: 'Badge reclamado exitosamente',
      data: rewards
    });
  } catch (error) {
    console.error('Error en claimBadge:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al reclamar badge'
    });
  }
};

export default {
  getMyRewards,
  getRewardsByDriver,
  getLeaderboard,
  claimBadge
};