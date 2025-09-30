import Driver from "../models/Driver.mjs";

// Obtener todos los conductores
async function findAll(req, res) {
    try {
        const result = await Driver.find();
        return res.status(200).json({
            success: true,
            data: result,
            total: result.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los conductores",
            error: error.message
        });
    }
}

// Buscar un conductor por ID
async function findById(req, res) {
    try {
        const { id } = req.params;
        const result = await Driver.findById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Conductor no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el conductor",
            error: error.message
        });
    }
}

// Crear un nuevo conductor
async function save(req, res) {
    try {
        const { name, email, phone, license_number } = req.body;

        // Validación básica
        if (!name || !email || !phone || !license_number) {
            return res.status(400).json({
                success: false,
                message: "Faltan campos obligatorios: name, email, phone, license_number"
            });
        }

        const record = {
            name,
            email,
            phone,
            license_number,
            rating: Math.round((Math.random() * 0.8 + 4.2) * 10) / 10, // Rating inicial 4.2-5.0
            status: "available",
            total_trips: 0,
            total_rating_points: 0,
            createdAt: new Date()
        };

        const result = await Driver.create(record);

        res.status(201).json({
            success: true,
            message: "Conductor creado exitosamente",
            data: result
        });
    } catch (error) {
        if (error.code === 11000) {
            // Detecta qué campo(s) está(n) duplicado(s)
            const duplicatedFields = Object.keys(error.keyPattern || {});
            const fieldNames = duplicatedFields.join(", ");

            return res.status(400).json({
                success: false,
                message: `Los siguientes campo(s) ya existen: ${fieldNames}`
            });
        }

        res.status(500).json({
            success: false,
            message: "Error al crear el conductor",
            error: error.message
        });
    }
}

// Actualizar un conductor
async function update(req, res) {
    try {
        const { id } = req.params;
        const { name, email, phone, license_number, rating, status } = req.body;
        
        // Preparar datos de actualización
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (license_number) updateData.license_number = license_number;
        if (rating) updateData.rating = parseFloat(rating);
        if (status) updateData.status = status;
        
        // Actualizar timestamp
        updateData.updated_at = new Date();
        
        const result = await Driver.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Conductor no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Conductor actualizado exitosamente",
            data: result
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicatedFields = Object.keys(error.keyPattern || {});
            const fieldNames = duplicatedFields.join(", ");

            return res.status(400).json({
                success: false,
                message: `Los siguientes campo(s) ya existen: ${fieldNames}`
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error al actualizar el conductor",
            error: error.message
        });
    }
}

// Eliminar un conductor
async function deleteDriver(req, res) {
    try {
        const { id } = req.params;
        const result = await Driver.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Conductor no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Conductor eliminado exitosamente",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el conductor",
            error: error.message
        });
    }
}

export {
    deleteDriver,
    findAll,
    findById,
    save,
    update
};
