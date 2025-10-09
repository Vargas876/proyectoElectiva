// models/Rewards.mjs
import mongoose from 'mongoose';

const rewardsSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      unique: true,
      index: true
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    badges: [{
      name: {
        type: String,
        required: true
      },
      icon: String,
      description: String,
      earned_at: {
        type: Date,
        default: Date.now
      },
      rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
      }
    }],
    achievements: [{
      title: String,
      description: String,
      progress: {
        type: Number,
        default: 0
      },
      target: Number,
      completed: {
        type: Boolean,
        default: false
      },
      completed_at: Date
    }],
    streaks: {
      current_streak: {
        type: Number,
        default: 0
      },
      longest_streak: {
        type: Number,
        default: 0
      },
      last_trip_date: Date
    }
  },
  {
    timestamps: true
  }
);

// Método para agregar puntos
rewardsSchema.methods.addPoints = async function(points, reason) {
  this.points += points;
  
  // Verificar si sube de nivel
  const pointsNeeded = this.level * 100;
  if (this.points >= pointsNeeded) {
    this.level += 1;
    this.points -= pointsNeeded;
    
    // Crear notificación de subida de nivel
    const Notification = mongoose.model('Notification');
    await Notification.create({
      user_id: this.driver_id,
      type: 'level_up',
      title: '¡Subiste de nivel!',
      message: `Felicitaciones, ahora eres nivel ${this.level}`,
      data: { new_level: this.level, reason }
    });
  }
  
  return await this.save();
};

// Método para otorgar badge
rewardsSchema.methods.awardBadge = async function(badgeData) {
  const exists = this.badges.some(b => b.name === badgeData.name);
  if (!exists) {
    this.badges.push(badgeData);
    this.points += 50;
    
    // Crear notificación
    const Notification = mongoose.model('Notification');
    await Notification.create({
      user_id: this.driver_id,
      type: 'badge_earned',
      title: '¡Nuevo logro desbloqueado!',
      message: `Has ganado el badge: ${badgeData.name}`,
      data: { badge: badgeData }
    });
    
    return await this.save();
  }
  return this;
};

export default mongoose.model('Rewards', rewardsSchema);
