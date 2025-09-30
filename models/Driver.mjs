import mongoose from "mongoose";
const { Schema, model } = mongoose;

const driverSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone is required'],
    trim: true
  },
  license_number: { 
    type: String, 
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  rating: { 
    type: Number, 
    default: function() {
      // Rating inicial aleatorio entre 4.2 y 5.0
      return Math.round((Math.random() * 0.8 + 4.2) * 10) / 10;
    },
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  // NUEVOS CAMPOS AGREGADOS
  total_trips: {
    type: Number,
    default: 0
  },
  total_rating_points: {
    type: Number,
    default: function() {
      return this.rating * 1; // Empezamos con 1 viaje "virtual"
    }
  },
  status: { 
    type: String, 
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Driver = model('Driver', driverSchema);
export default Driver;