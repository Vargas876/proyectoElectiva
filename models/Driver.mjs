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
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
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
    timestamps: true,  // Agrega createdAt y updatedAt automáticamente
    versionKey: false  // Elimina el campo __v
});

// Índices para mejorar búsquedas
driverSchema.index({ email: 1 });
driverSchema.index({ license_number: 1 });

// Método virtual para obtener el nombre completo 
driverSchema.virtual('display_name').get(function() {
    return `${this.name} (${this.license_number})`;
});

// Método para incrementar el contador de viajes
driverSchema.methods.incrementTrips = async function() {
    this.total_trips += 1;
    return await this.save();
};

export default mongoose.model('Driver', driverSchema);