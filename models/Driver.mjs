import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  license_number: {
    type: String,
    required: [true, 'El número de licencia es obligatorio'],
    unique: true,
    trim: true,
    uppercase: true
  },
  vehicle_type: {
    type: String,
    enum: ['sedan', 'suv', 'van', 'minibus'],
    default: 'sedan'
  },
  vehicle_plate: {
    type: String,
    trim: true,
    uppercase: true
  },
  vehicle_capacity: {
    type: Number,
    default: 4,
    min: 1,
    max: 20
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  total_trips: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

driverSchema.index({ email: 1 });
driverSchema.index({ license_number: 1 });

export default mongoose.model('Driver', driverSchema);
