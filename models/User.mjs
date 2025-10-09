// models/User.mjs
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es obligatorio']
    },
    role: {
        type: String,
        enum: ['passenger', 'driver'],
        required: true
    },
    // Solo para conductores
    license_number: {
        type: String,
        sparse: true, // Permite null para pasajeros
        uppercase: true
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5
    },
    total_trips: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);