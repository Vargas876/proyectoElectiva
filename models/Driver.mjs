import Driver from '../models/Driver.mjs';
import Trip from '../models/Trip.mjs';

async function findAll(req, res) {
    try {
        const trips = await Trip.find().populate('driver_id', 'name email phone');
        res.status(200).json({
            success: true,
            data: trips,
            total: trips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving trips",
            error: error.message
        });
    }
}

async function findById(req, res) {
    try {
        const trip = await Trip.findById(req.params.id).populate('driver_id', 'name email phone rating');
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: trip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving trip",
            error: error.message
        });
    }
}

async function save(req, res) {
    try {
        const { driver_id, origin, destination, departure_time, price, available_seats } = req.body;
        
        // Verificar que el conductor existe
        const driverExists = await Driver.findById(driver_id);
        if (!driverExists) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }
        
        const newTrip = new Trip({
            driver_id,
            origin,
            destination,
            departure_time,
            price,
            available_seats
        });
        
        const savedTrip = await newTrip.save();
        const populatedTrip = await Trip.findById(savedTrip._id).populate('driver_id', 'name email');
        
        res.status(201).json({
            success: true,
            message: "Trip created successfully",
            data: populatedTrip
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
            message: "Error creating trip",
            error: error.message
        });
    }
}

async function update(req, res) {
    try {
        const { driver_id, origin, destination, departure_time, arrival_time, price, available_seats, status } = req.body;
        
        if (driver_id) {
            const driverExists = await Driver.findById(driver_id);
            if (!driverExists) {
                return res.status(404).json({
                    success: false,
                    message: "Driver not found"
                });
            }
        }
        
        const updatedTrip = await Trip.findByIdAndUpdate(
            req.params.id,
            { driver_id, origin, destination, departure_time, arrival_time, price, available_seats, status },
            { new: true, runValidators: true }
        ).populate('driver_id', 'name email');
        
        if (!updatedTrip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Trip updated successfully",
            data: updatedTrip
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
            message: "Error updating trip",
            error: error.message
        });
    }
}

async function remove(req, res) {
    try {
        const deletedTrip = await Trip.findByIdAndDelete(req.params.id);
        
        if (!deletedTrip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Trip deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting trip",
            error: error.message
        });
    }
}

export {
  findAll,
  findById, remove, save,
  update
};
