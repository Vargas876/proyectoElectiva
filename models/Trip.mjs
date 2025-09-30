import mongoose from "mongoose";
const { Schema, model } = mongoose;

const tripSchema = new Schema({
  driver_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Driver', 
    required: [true, 'Driver ID is required']
  },
  origin: { 
    type: String, 
    required: [true, 'Origin is required'],
    trim: true
  },
  destination: { 
    type: String, 
    required: [true, 'Destination is required'],
    trim: true
  },
  departure_time: { 
    type: Date, 
    required: [true, 'Departure time is required']
  },
  arrival_time: { 
    type: Date 
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  available_seats: { 
    type: Number, 
    default: 4,
    min: [1, 'Must have at least 1 seat'],
    max: [8, 'Cannot exceed 8 seats']
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  // NUEVOS CAMPOS PARA CALCULAR RATING
  distance_km: {
    type: Number,
    default: function() {
      return Math.round((Math.random() * 45 + 5) * 10) / 10; // 5-50 km
    }
  },
  estimated_duration_minutes: {
    type: Number,
    default: function() {
      return Math.round(this.distance_km * 2 + (Math.random() * 20)); // ~2 min/km + tráfico
    }
  },
  actual_duration_minutes: {
    type: Number
  },
  weather_condition: {
    type: String,
    enum: ['excellent', 'good', 'rainy', 'heavy_traffic'],
    default: function() {
      const conditions = ['excellent', 'good', 'good', 'good', 'rainy', 'heavy_traffic'];
      return conditions[Math.floor(Math.random() * conditions.length)];
    }
  },
  time_of_day: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    default: function() {
      const hour = new Date(this.departure_time).getHours();
      if (hour >= 6 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 18) return 'afternoon';
      if (hour >= 18 && hour < 22) return 'evening';
      return 'night';
    }
  },
  trip_rating: {
    type: Number,
    min: [1, 'Rating cannot be less than 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  rating_factors: {
    punctuality: { type: Number, min: 1, max: 5 },
    route_efficiency: { type: Number, min: 1, max: 5 },
    vehicle_condition: { type: Number, min: 1, max: 5 },
    driver_behavior: { type: Number, min: 1, max: 5 },
    overall_experience: { type: Number, min: 1, max: 5 }
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

const Trip = model('Trip', tripSchema);
export default Trip;