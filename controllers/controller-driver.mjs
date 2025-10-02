import Driver from '../models/Driver.mjs';

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

async function save(req, res) {
    try {
        const { name, email, phone, license_number } = req.body;
        
        const newDriver = new Driver({
            name,
            email,
            phone,
            license_number
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

async function update(req, res) {
    try {
        const { name, email, phone, license_number, rating, status } = req.body;
        
        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, license_number, rating, status },
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
        
        res.status(500).json({
            success: false,
            message: "Error updating driver",
            error: error.message
        });
    }
}

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
            message: "Driver deleted successfully"
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
