import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        trim: true
    },
    role: {
        type: String,
        enum: {
            values: ['passenger', 'driver'],
            message: '{VALUE} no es un rol válido'
        },
        required: [true, 'El rol es obligatorio']
    },
    // Solo para conductores
    license_number: {
        type: String,
        sparse: true, // Permite null para pasajeros
        uppercase: true,
        trim: true
    },
    rating: {
        type: Number,
        default: 5.0,
        min: [0, 'El rating no puede ser menor a 0'],
        max: [5, 'El rating no puede ser mayor a 5']
    },
    status: {
        type: String,
        enum: {
            values: ['available', 'busy', 'offline'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'available'
    },
    total_trips: {
        type: Number,
        default: 0,
        min: [0, 'El número de viajes no puede ser negativo']
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ license_number: 1 });
userSchema.index({ role: 1 });

// Validación: conductores deben tener license_number
userSchema.pre('save', function(next) {
    if (this.role === 'driver' && !this.license_number) {
        next(new Error('Los conductores deben tener un número de licencia'));
    }
    next();
});

// Método para incrementar viajes
userSchema.methods.incrementTrips = async function() {
    this.total_trips += 1;
    return await this.save();
};

export default mongoose.model('User', userSchema);