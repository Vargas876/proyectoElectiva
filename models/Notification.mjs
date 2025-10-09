// models/Notification.mjs
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'trip_request',
        'trip_cancelled',
        'trip_started',
        'trip_completed',
        'payment_received',
        'new_message',
        'new_review',
        'badge_earned',
        'level_up',
        'sos_alert',
        'system'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Índice compuesto para consultas frecuentes
notificationSchema.index({ user_id: 1, read: 1, createdAt: -1 });

// Auto-eliminar notificaciones antiguas (30 días)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('Notification', notificationSchema);
