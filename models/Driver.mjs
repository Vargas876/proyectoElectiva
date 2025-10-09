import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    // ============ CAMPOS BÁSICOS ============
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido'],
      index: true
    },
    
    phone: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
      match: [/^[\d\s\+\-\(\)]+$/, 'Formato de teléfono inválido']
    },
    
    license_number: {
      type: String,
      required: [true, 'El número de licencia es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },

    // ============ INFORMACIÓN DEL VEHÍCULO ============
    vehicle_type: {
      type: String,
      enum: {
        values: ['sedan', 'suv', 'van', 'minibus', 'hatchback', 'coupe'],
        message: '{VALUE} no es un tipo de vehículo válido'
      },
      default: 'sedan'
    },
    
    vehicle_plate: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true, // Permite múltiples valores null sin violar uniqueness
      match: [/^[A-Z0-9]{6}$/, 'Formato de placa inválido (debe ser 6 caracteres alfanuméricos)']
    },
    
    vehicle_capacity: {
      type: Number,
      default: 4,
      min: [1, 'La capacidad mínima es 1'],
      max: [20, 'La capacidad máxima es 20']
    },

    vehicle_color: {
      type: String,
      trim: true,
      default: null
    },

    vehicle_model: {
      type: String,
      trim: true,
      default: null
    },

    vehicle_year: {
      type: Number,
      min: [1990, 'Año del vehículo debe ser posterior a 1990'],
      max: [new Date().getFullYear() + 1, 'Año del vehículo inválido'],
      default: null
    },

    // ============ RATING Y ESTADÍSTICAS ============
    rating: {
      type: Number,
      default: 5.0,
      min: [0, 'El rating mínimo es 0'],
      max: [5, 'El rating máximo es 5'],
      set: (val) => Math.round(val * 10) / 10 // Redondear a 1 decimal
    },
    
    status: {
      type: String,
      enum: {
        values: ['available', 'busy', 'offline'],
        message: '{VALUE} no es un estado válido'
      },
      default: 'available',
      index: true
    },
    
    total_trips: {
      type: Number,
      default: 0,
      min: [0, 'El total de viajes no puede ser negativo']
    },

    completed_trips: {
      type: Number,
      default: 0,
      min: [0, 'Los viajes completados no pueden ser negativos']
    },

    cancelled_trips: {
      type: Number,
      default: 0,
      min: [0, 'Los viajes cancelados no pueden ser negativos']
    },

    // ============ PREFERENCIAS DEL CONDUCTOR ============
    preferences: {
      music: {
        type: Boolean,
        default: false,
        description: 'Permite música durante el viaje'
      },
      smoking: {
        type: Boolean,
        default: false,
        description: 'Permite fumar'
      },
      pets: {
        type: Boolean,
        default: false,
        description: 'Permite mascotas'
      },
      conversation_level: {
        type: String,
        enum: ['quiet', 'moderate', 'chatty'],
        default: 'moderate',
        description: 'Nivel de conversación preferido'
      },
      ac_available: {
        type: Boolean,
        default: true,
        description: 'Aire acondicionado disponible'
      }
    },

    // ============ VERIFICACIÓN Y SEGURIDAD ============
    verification: {
      document_verified: {
        type: Boolean,
        default: false
      },
      license_verified: {
        type: Boolean,
        default: false
      },
      phone_verified: {
        type: Boolean,
        default: false
      },
      email_verified: {
        type: Boolean,
        default: false
      },
      background_check: {
        type: Boolean,
        default: false
      },
      trust_score: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
      }
    },

    // ============ INFORMACIÓN ADICIONAL ============
    bio: {
      type: String,
      maxlength: [500, 'La biografía no puede exceder 500 caracteres'],
      trim: true,
      default: null
    },

    profile_picture: {
      type: String,
      default: null,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL de imagen inválida'
      }
    },

    languages: [{
      type: String,
      trim: true
    }],

    emergency_contacts: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      relationship: {
        type: String,
        trim: true
      }
    }],

    // ============ GAMIFICACIÓN ============
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
      name: String,
      icon: String,
      earned_at: {
        type: Date,
        default: Date.now
      }
    }],

    // ============ MÉTRICAS AMBIENTALES ============
    carbon_saved_kg: {
      type: Number,
      default: 0,
      min: 0
    },

    total_distance_km: {
      type: Number,
      default: 0,
      min: 0
    },

    // ============ CONTROL DE CUENTA ============
    is_active: {
      type: Boolean,
      default: true
    },

    is_banned: {
      type: Boolean,
      default: false
    },

    last_login: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true, 
    versionKey: false // Elimina el campo __v
  }
);

// ============ ÍNDICES COMPUESTOS ============
driverSchema.index({ email: 1, is_active: 1 });
driverSchema.index({ status: 1, rating: -1 });
driverSchema.index({ 'verification.trust_score': -1 });

// ============ VIRTUALS ============
// Calcular tasa de completitud
driverSchema.virtual('completion_rate').get(function() {
  if (this.total_trips === 0) return 100;
  return Math.round((this.completed_trips / this.total_trips) * 100);
});

// Calcular tasa de cancelación
driverSchema.virtual('cancellation_rate').get(function() {
  if (this.total_trips === 0) return 0;
  return Math.round((this.cancelled_trips / this.total_trips) * 100);
});

// Verificar si es conductor confiable
driverSchema.virtual('is_trusted').get(function() {
  return this.verification.trust_score >= 80 && 
         this.rating >= 4.5 && 
         this.completed_trips >= 10;
});

// ============ MÉTODOS DE INSTANCIA ============

// Método que faltaba en tu código original
driverSchema.methods.incrementTrips = async function() {
  this.total_trips += 1;
  return await this.save();
};

// Incrementar viajes completados
driverSchema.methods.completeTrip = async function() {
  this.completed_trips += 1;
  this.total_trips += 1;
  this.points += 10; // Gamificación
  this.status = 'available';
  return await this.save();
};

// Incrementar viajes cancelados
driverSchema.methods.cancelTrip = async function() {
  this.cancelled_trips += 1;
  this.points = Math.max(0, this.points - 5); // Penalización
  this.status = 'available';
  return await this.save();
};

// Actualizar rating
driverSchema.methods.updateRating = async function(newRating) {
  if (newRating < 0 || newRating > 5) {
    throw new Error('Rating debe estar entre 0 y 5');
  }
  
  // Fórmula: (rating_actual * viajes_completados + nuevo_rating) / (viajes_completados + 1)
  const totalRatings = Math.max(this.completed_trips, 1);
  this.rating = ((this.rating * totalRatings) + newRating) / (totalRatings + 1);
  this.rating = Math.round(this.rating * 10) / 10; // Redondear a 1 decimal
  
  return await this.save();
};

// Otorgar badge
driverSchema.methods.awardBadge = async function(badgeName, badgeIcon) {
  const exists = this.badges.some(b => b.name === badgeName);
  if (!exists) {
    this.badges.push({
      name: badgeName,
      icon: badgeIcon,
      earned_at: new Date()
    });
    this.points += 50; // Bonus por badge
    return await this.save();
  }
  return this;
};

// Subir de nivel
driverSchema.methods.levelUp = async function() {
  const pointsNeeded = this.level * 100;
  if (this.points >= pointsNeeded) {
    this.level += 1;
    this.points -= pointsNeeded;
    return await this.save();
  }
  return this;
};

// Calcular score de confiabilidad
driverSchema.methods.calculateTrustScore = function() {
  let score = 50; // Base score
  
  // Rating (máximo +30 puntos)
  score += (this.rating / 5) * 30;
  
  // Verificaciones (máximo +20 puntos)
  const verifications = [
    this.verification.document_verified,
    this.verification.license_verified,
    this.verification.phone_verified,
    this.verification.email_verified,
    this.verification.background_check
  ];
  score += verifications.filter(v => v).length * 4;
  
  // Tasa de completitud (máximo +20 puntos)
  if (this.total_trips > 0) {
    score += (this.completed_trips / this.total_trips) * 20;
  }
  
  // Penalización por cancelaciones (máximo -30 puntos)
  if (this.total_trips > 0) {
    const cancelRate = this.cancelled_trips / this.total_trips;
    score -= cancelRate * 30;
  }
  
  this.verification.trust_score = Math.min(100, Math.max(0, Math.round(score)));
  return this.verification.trust_score;
};

// ============ MÉTODOS ESTÁTICOS ============

// Buscar conductores disponibles
driverSchema.statics.findAvailable = function() {
  return this.find({ 
    status: 'available', 
    is_active: true,
    is_banned: false 
  }).sort({ rating: -1 });
};

// Buscar top conductores
driverSchema.statics.findTopDrivers = function(limit = 10) {
  return this.find({ 
    is_active: true,
    is_banned: false,
    completed_trips: { $gte: 5 }
  })
  .sort({ rating: -1, completed_trips: -1 })
  .limit(limit);
};

// ============ MIDDLEWARE PRE-SAVE ============
driverSchema.pre('save', function(next) {
  // Calcular trust score antes de guardar
  if (this.isModified('rating') || this.isModified('completed_trips') || this.isModified('cancelled_trips')) {
    this.calculateTrustScore();
  }
  
  // Verificar nivel automáticamente
  if (this.isModified('points')) {
    const pointsNeeded = this.level * 100;
    if (this.points >= pointsNeeded) {
      this.level += 1;
      this.points -= pointsNeeded;
    }
  }
  
  // Normalizar campos
  if (this.isModified('license_number')) {
    this.license_number = this.license_number.toUpperCase().trim();
  }
  
  if (this.isModified('vehicle_plate') && this.vehicle_plate) {
    this.vehicle_plate = this.vehicle_plate.toUpperCase().trim();
  }
  
  next();
});

// ============ MIDDLEWARE POST-SAVE ============
driverSchema.post('save', function(doc, next) {
  console.log(`Driver ${doc.name} saved with trust score: ${doc.verification.trust_score}`);
  next();
});

// ============ CONFIGURACIÓN DE VIRTUALS EN JSON ============
driverSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

driverSchema.set('toObject', {
  virtuals: true
});

export default mongoose.model('Driver', driverSchema);
