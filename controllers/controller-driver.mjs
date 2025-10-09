import Driver from '../models/Driver.mjs';

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

// Obtener conductor por ID
async function findById(req, res) {
    try {
        const driver = await Driver.findById(req.params.id);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (error) {
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

//  Actualizar con todos los campos
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
            vehicle_capacity 
        } = req.body;
        
        // Preparar objeto de actualización solo con campos proporcionados
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
        
        res.status(200).json({
            success: true,
            message: "Driver updated successfully",
            data: updatedDriver
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

