// models/TripRequest.mjs
import mongoose from 'mongoose';

const tripRequestSchema = new mongoose.Schema({
    passenger_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    origin: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    destination: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    passenger_offer_price: {
        type: Number,
        required: true,
        min: 0
    },
    seats_needed: {
        type: Number,
        default: 1,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    // Ofertas de conductores
    driver_offers: [{
        driver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        offered_price: Number,
        message: String,
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        created_at: {
            type: Date,
            default: Date.now
        }
    }],
    accepted_driver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    final_price: Number,
    departure_time: Date,
    estimated_duration_minutes: Number,
    estimated_distance_km: Number
}, { timestamps: true });

export default mongoose.model('TripRequest', tripRequestSchema);