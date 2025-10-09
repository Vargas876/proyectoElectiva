import mongoose from 'mongoose';

const recurringTripSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true
    },
    origin: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      required: true,
      trim: true
    },
    days_of_week: [{
      type: Number,
      min: 0,
      max: 6 // 0=Domingo, 6=Sábado
    }],
    departure_time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    available_seats: {
      type: Number,
      default: 4,
      min: 1,
      max: 8
    },
    active: {
      type: Boolean,
      default: true
    },
    preferences: {
      auto_publish: {
        type: Boolean,
        default: true
      },
      advance_days: {
        type: Number,
        default: 1,
        min: 0,
        max: 7
      }
    },
    generated_trips: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip'
    }]
  },
  {
    timestamps: true
  }
);

recurringTripSchema.index({ driver_id: 1, active: 1 });
recurringTripSchema.index({ days_of_week: 1, departure_time: 1 });

export default mongoose.model('RecurringTrip', recurringTripSchema);
