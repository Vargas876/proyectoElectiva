import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    driver_id: {
        type: mongoose.Schema.Types.ObjectId,
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
        type: Date,
        default: null
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    available_seats: {
        type: Number,
        default: 4,
        min: [0, 'Available seats cannot be negative']
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('Trip', tripSchema);