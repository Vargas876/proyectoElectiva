import mongoose from 'mongoose';

const tripRequestSchema = new mongoose.Schema({
    passenger_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del pasajero es obligatorio']
    },
    origin: {
        address: {
            type: String,
            required: true
        },
        coordinates: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        }
    },
    destination: {
        address: {
            type: String,
            required: true
        },
        coordinates: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        }
    },
    passenger_offer_price: {
        type: Number,
        required: [true, 'El precio ofertado es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    seats_needed: {
        type: Number,
        default: 1,
        min: [1, 'Debe necesitar al menos 1 asiento'],
        max: [8, 'Máximo 8 asientos']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'pending'
    },
    // Ofertas de conductores
    driver_offers: [{
        driver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        offered_price: {
            type: Number,
            required: true,
            min: 0
        },
        message: {
            type: String,
            default: ''
        },
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
        ref: 'User',
        default: null
    },
    final_price: {
        type: Number,
        default: null
    },
    departure_time: {
        type: Date,
        required: [true, 'La hora de salida es obligatoria']
    },
    estimated_duration_minutes: {
        type: Number,
        min: 0
    },
    estimated_distance_km: {
        type: Number,
        min: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices
tripRequestSchema.index({ passenger_id: 1 });
tripRequestSchema.index({ status: 1 });
tripRequestSchema.index({ departure_time: 1 });
tripRequestSchema.index({ 'driver_offers.driver_id': 1 });

// Virtual para contar ofertas
tripRequestSchema.virtual('offers_count').get(function() {
    return this.driver_offers ? this.driver_offers.length : 0;
});

// Método para agregar oferta de conductor
tripRequestSchema.methods.addDriverOffer = async function(driverOffer) {
    // Verificar que el conductor no haya ofertado antes
    const existingOffer = this.driver_offers.find(
        offer => offer.driver_id.toString() === driverOffer.driver_id.toString()
    );

    if (existingOffer) {
        throw new Error('Ya has hecho una oferta para este viaje');
    }

    this.driver_offers.push(driverOffer);
    return await this.save();
};

// Método para aceptar oferta
tripRequestSchema.methods.acceptOffer = async function(offerId) {
    const offer = this.driver_offers.id(offerId);
    
    if (!offer) {
        throw new Error('Oferta no encontrada');
    }

    // Actualizar estados
    this.status = 'accepted';
    this.accepted_driver_id = offer.driver_id;
    this.final_price = offer.offered_price;
    offer.status = 'accepted';

    // Rechazar todas las demás ofertas
    this.driver_offers.forEach(o => {
        if (o._id.toString() !== offerId.toString()) {
            o.status = 'rejected';
        }
    });

    return await this.save();
};

export default mongoose.model('TripRequest', tripRequestSchema);