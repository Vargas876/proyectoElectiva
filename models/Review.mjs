import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'El ID del viaje es obligatorio']
    },
    reviewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'El ID del revisor es obligatorio']
    },
    reviewed_driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'El ID del conductor revisado es obligatorio'],
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'El rating es obligatorio'],
      min: [1, 'El rating mínimo es 1'],
      max: [5, 'El rating máximo es 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'El comentario no puede exceder 500 caracteres']
    },
    tags: [{
      type: String,
      enum: [
        'punctual',
        'friendly',
        'safe_driver',
        'clean_vehicle',
        'good_conversation',
        'professional',
        'music',
        'comfortable',
        'reckless',
        'late',
        'rude'
      ]
    }],
    helpful_count: {
      type: Number,
      default: 0,
      min: 0
    },
    response: {
      text: String,
      date: Date
    }
  },
  {
    timestamps: true
  }
);

// Índices compuestos
reviewSchema.index({ reviewed_driver_id: 1, createdAt: -1 });
reviewSchema.index({ trip_id: 1 }, { unique: true }); // Un review por viaje

// Prevenir múltiples reviews del mismo viaje
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existing = await this.constructor.findOne({ trip_id: this.trip_id });
    if (existing) {
      throw new Error('Este viaje ya ha sido calificado');
    }
  }
  next();
});

export default mongoose.model('Review', reviewSchema);
