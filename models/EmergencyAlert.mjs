import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema(
  {
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true
    },
    location: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      },
      address: String
    },
    reason: {
      type: String,
      enum: ['accident', 'medical', 'security', 'vehicle_problem', 'other'],
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'false_alarm'],
      default: 'active'
    },
    resolved_at: Date,
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    authorities_notified: {
      type: Boolean,
      default: false
    },
    emergency_contacts_notified: [{
      contact_id: String,
      notified_at: Date,
      method: {
        type: String,
        enum: ['sms', 'call', 'push', 'email']
      }
    }]
  },
  {
    timestamps: true
  }
);

emergencyAlertSchema.index({ status: 1, createdAt: -1 });
emergencyAlertSchema.index({ driver_id: 1, status: 1 });

export default mongoose.model('EmergencyAlert', emergencyAlertSchema);
