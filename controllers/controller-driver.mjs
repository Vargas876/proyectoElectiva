import Driver from '../models/Driver.mjs';
import Rewards from '../models/Rewards.mjs';

// Obtener todos los conductores
async function findAll(req, res) {
    try {
        const drivers = await Driver.find();
        res.status(200).json({
            success: true,
            data: drivers,
            total: drivers.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving drivers",
            error: error.message
        });
    }
}
// ✅ OBTENER CONDUCTOR POR ID (CON REWARDS)
async function findById(req, res) {
    try {
        const { id } = req.params;

        const driver = await Driver.findById(id);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        // ✅ OBTENER REWARDS DEL CONDUCTOR
        console.log('📊 Buscando rewards para driver:', id);
        const rewards = await Rewards.findOne({ driver_id: id });
        console.log('🎁 Rewards encontrados:', rewards);

        // Combinar datos
        const driverWithRewards = {
            ...driver.toObject(),
            rewards: rewards ? {
                points: rewards.points || 0,
                level: rewards.level || 1,
                badges: rewards.badges || [],
                achievements: rewards.achievements || [],
                streaks: rewards.streaks || {
                    current_streak: 0,
                    longest_streak: 0
                }
            } : {
                points: 0,
                level: 1,
                badges: [],
                achievements: [],
                streaks: {
                    current_streak: 0,
                    longest_streak: 0
                }
            }
        };

        console.log('✅ Driver con rewards combinado:', driverWithRewards);
        
        res.status(200).json({
            success: true,
            data: driverWithRewards
        });
    } catch (error) {
        console.error('❌ Error en findById:', error);
        res.status(500).json({
            success: false,
            message: "Error retrieving driver",
            error: error.message
        });
    }
}


// Crear conductor con validación y campos completos
async function save(req, res) {
    try {
        const { 
            name, 
            email, 
            phone, 
            license_number,
            vehicle_type,
            vehicle_plate,
            vehicle_capacity 
        } = req.body;
        
        // Validación de campos requeridos
        if (!name || !email || !phone || !license_number) {
            return res.status(400).json({
                success: false,
                message: "Name, email, phone and license_number are required"
            });
        }

        // Verificar si ya existe
        const existingDriver = await Driver.findOne({
            $or: [{ email }, { license_number: license_number.toUpperCase() }]
        });

        if (existingDriver) {
            return res.status(400).json({
                success: false,
                message: "Driver with this email or license number already exists"
            });
        }
        
        // Crear nuevo conductor con TODOS los campos
        const newDriver = new Driver({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            license_number: license_number.toUpperCase().trim(),
            vehicle_type: vehicle_type || 'sedan',
            vehicle_plate: vehicle_plate ? vehicle_plate.toUpperCase().trim() : undefined,
            vehicle_capacity: vehicle_capacity || 4
        });
        
        const savedDriver = await newDriver.save();

        // ✅ CREAR REWARDS PARA EL NUEVO CONDUCTOR
        await Rewards.create({
            driver_id: savedDriver._id,
            points: 0,
            level: 1,
            badges: [],
            achievements: [],
            streaks: {
                current_streak: 0,
                longest_streak: 0
            }
        });
        
        res.status(201).json({
            success: true,
            message: "Driver created successfully",
            data: savedDriver
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Driver with this email or license number already exists"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error creating driver",
            error: error.message
        });
    }
}
async function update(req, res) {
    try {
        const { 
            name, 
            email, 
            phone, 
            license_number, 
            rating, 
            status,
            vehicle_type,
            vehicle_plate,
            vehicle_capacity,
            vehicle_model,    // ← IMPORTANTE
            vehicle_year,     // ← IMPORTANTE
            vehicle_color,    // ← IMPORTANTE
            bio
        } = req.body;
        
        console.log('📝 ===== ACTUALIZANDO DRIVER =====');
        console.log('📝 ID:', req.params.id);
        console.log('📝 Body completo:', req.body);
        console.log('📝 vehicle_model recibido:', vehicle_model);
        console.log('📝 vehicle_year recibido:', vehicle_year);
        console.log('📝 vehicle_color recibido:', vehicle_color);
        
        // Preparar objeto de actualización
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.toLowerCase().trim();
        if (phone) updateData.phone = phone.trim();
        if (license_number) updateData.license_number = license_number.toUpperCase().trim();
        if (rating !== undefined) updateData.rating = rating;
        if (status) updateData.status = status;
        if (vehicle_type) updateData.vehicle_type = vehicle_type;
        if (vehicle_plate) updateData.vehicle_plate = vehicle_plate.toUpperCase().trim();
        if (vehicle_capacity) updateData.vehicle_capacity = vehicle_capacity;
        
        // ✅ ESTOS SON LOS IMPORTANTES
        if (vehicle_model) updateData.vehicle_model = vehicle_model.trim();
        if (vehicle_year) updateData.vehicle_year = vehicle_year;
        if (vehicle_color) updateData.vehicle_color = vehicle_color.trim();
        if (bio) updateData.bio = bio.trim();
        
        console.log('📝 Datos a actualizar:', updateData);
        console.log('📝 vehicle_model en updateData:', updateData.vehicle_model);
        console.log('📝 vehicle_year en updateData:', updateData.vehicle_year);
        
        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedDriver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }
        
        console.log('✅ Driver actualizado:', updatedDriver);
        console.log('✅ vehicle_model después:', updatedDriver.vehicle_model);
        console.log('✅ vehicle_year después:', updatedDriver.vehicle_year);
        
        res.status(200).json({
            success: true,
            message: "Driver updated successfully",
            data: updatedDriver
        });
    } catch (error) {
        console.error('❌ Error al actualizar:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email or license number already exists"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error updating driver",
            error: error.message
        });
    }
}


// Eliminar conductor
async function remove(req, res) {
    try {
        const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
        
        if (!deletedDriver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        // ✅ ELIMINAR TAMBIÉN SUS REWARDS
        await Rewards.findOneAndDelete({ driver_id: req.params.id });
        
        res.status(200).json({
            success: true,
            message: "Driver deleted successfully",
            data: deletedDriver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting driver",
            error: error.message
        });
    }
}

export {
    findAll,
    findById, remove, save,
    update
};

