import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    driver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: [true, 'El ID del conductor es obligatorio']
    },
    origin: {
        type: String,
        required: [true, 'El origen es obligatorio'],
        trim: true
    },
    destination: {
        type: String,
        required: [true, 'El destino es obligatorio'],
        trim: true
    },
    departure_time: {
        type: Date,
        required: [true, 'La hora de salida es obligatoria']
    },
    arrival_time: {
        type: Date,
        default: null
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    available_seats: {
        type: Number,
        default: 4,
        min: [0, 'Los asientos disponibles no pueden ser negativos'],
        max: [8, 'El número máximo de asientos es 8']
    },
    status: {
        type: String,
        enum: {
            values: ['scheduled', 'in_progress', 'completed', 'cancelled'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'scheduled'
    },
    passengers: [{
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        seats_reserved: {
            type: Number,
            default: 1,
            min: 1
        }
    }],
    distance_km: {
        type: Number,
        min: [0, 'La distancia no puede ser negativa']
    },
    duration_minutes: {
        type: Number,
        min: [0, 'La duración no puede ser negativa']
    }
}, {
    timestamps: true,  // Agrega createdAt y updatedAt automáticamente
    versionKey: false  // Elimina el campo __v
});

// Índices para mejorar búsquedas
tripSchema.index({ driver_id: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ departure_time: 1 });

// Método virtual para calcular asientos ocupados
tripSchema.virtual('occupied_seats').get(function() {
    if (!this.passengers || this.passengers.length === 0) {
        return 0;
    }
    return this.passengers.reduce((total, passenger) => total + passenger.seats_reserved, 0);
});

// Método virtual para verificar disponibilidad
tripSchema.virtual('is_available').get(function() {
    return this.available_seats > 0 && this.status === 'scheduled';
});

// Método para agregar un pasajero
tripSchema.methods.addPassenger = async function(passengerData) {
    if (this.available_seats < passengerData.seats_reserved) {
        throw new Error('No hay suficientes asientos disponibles');
    }
    
    this.passengers.push(passengerData);
    this.available_seats -= passengerData.seats_reserved;
    
    return await this.save();
};

// Middleware pre-save para validaciones adicionales
tripSchema.pre('save', function(next) {
    // Validar que la fecha de salida no sea en el pasado (solo para nuevos documentos)
    if (this.isNew && this.departure_time < new Date()) {
        next(new Error('La hora de salida no puede ser en el pasado'));
    }
    
    // Validar que arrival_time sea después de departure_time
    if (this.arrival_time && this.arrival_time < this.departure_time) {
        next(new Error('La hora de llegada debe ser después de la hora de salida'));
    }
    
    next();
});

export default mongoose.model('Trip', tripSchema);