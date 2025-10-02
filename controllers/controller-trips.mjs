import Driver from '../models/Driver.mjs';
import Trip from '../models/Trip.mjs';
import { calculateAverageRating, validateRating } from '../utils/ratingCalculator.mjs';

// Obtener todos los viajes
async function findAll(req, res) {
    try {
        const { status, driver_id } = req.query;
        
        // Filtros opcionales
        const filter = {};
        if (status) filter.status = status;
        if (driver_id) filter.driver_id = driver_id;
        
        const trips = await Trip.find(filter)
            .populate('driver_id', 'name email phone rating license_number')
            .sort({ departure_time: -1 }); // Ordenar por fecha más reciente
        
        res.status(200).json({
            success: true,
            data: trips,
            total: trips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los viajes",
            error: error.message
        });
    }
}

// Obtener un viaje por ID
async function findById(req, res) {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('driver_id', 'name email phone rating license_number status');
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Viaje no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            data: trip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el viaje",
            error: error.message
        });
    }
}

// Crear un nuevo viaje
async function save(req, res) {
    try {
        const { 
            driver_id, 
            origin, 
            destination, 
            departure_time, 
            price, 
            available_seats,
            distance_km,
            duration_minutes
        } = req.body;
        
        // Verificar que el conductor existe
        const driver = await Driver.findById(driver_id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Conductor no encontrado"
            });
        }
        
        // Verificar que el conductor esté disponible
        if (driver.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: `El conductor no está disponible. Estado actual: ${driver.status}`
            });
        }
        
        // Crear el nuevo viaje
        const newTrip = new Trip({
            driver_id,
            origin,
            destination,
            departure_time,
            price,
            available_seats: available_seats || 4,
            distance_km,
            duration_minutes
        });
        
        const savedTrip = await newTrip.save();
        
        // Actualizar el estado del conductor a 'busy'
        driver.status = 'busy';
        await driver.save();
        
        // Incrementar el contador de viajes del conductor
        await driver.incrementTrips();
        
        const populatedTrip = await Trip.findById(savedTrip._id)
            .populate('driver_id', 'name email phone rating');
        
        res.status(201).json({
            success: true,
            message: "Viaje creado exitosamente",
            data: populatedTrip
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error al crear el viaje",
            error: error.message
        });
    }
}

// Actualizar un viaje
async function update(req, res) {
    try {
        const { 
            driver_id, 
            origin, 
            destination, 
            departure_time, 
            arrival_time, 
            price, 
            available_seats, 
            status,
            distance_km,
            duration_minutes
        } = req.body;
        
        // Buscar el viaje actual
        const currentTrip = await Trip.findById(req.params.id);
        if (!currentTrip) {
            return res.status(404).json({
                success: false,
                message: "Viaje no encontrado"
            });
        }
        
        // Si se cambia el conductor, verificar que existe
        if (driver_id && driver_id !== currentTrip.driver_id.toString()) {
            const newDriver = await Driver.findById(driver_id);
            if (!newDriver) {
                return res.status(404).json({
                    success: false,
                    message: "Nuevo conductor no encontrado"
                });
            }
        }
        
        // Actualizar el viaje
        const updatedTrip = await Trip.findByIdAndUpdate(
            req.params.id,
            { 
                driver_id, 
                origin, 
                destination, 
                departure_time, 
                arrival_time, 
                price, 
                available_seats, 
                status,
                distance_km,
                duration_minutes
            },
            { new: true, runValidators: true }
        ).populate('driver_id', 'name email phone rating');
        
        // Si el viaje se completó, actualizar el estado del conductor a 'available'
        if (status === 'completed') {
            const driver = await Driver.findById(updatedTrip.driver_id);
            if (driver) {
                driver.status = 'available';
                await driver.save();
            }
        }
        
        res.status(200).json({
            success: true,
            message: "Viaje actualizado exitosamente",
            data: updatedTrip
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error al actualizar el viaje",
            error: error.message
        });
    }
}

// Eliminar un viaje
async function remove(req, res) {
    try {
        const deletedTrip = await Trip.findByIdAndDelete(req.params.id);
        
        if (!deletedTrip) {
            return res.status(404).json({
                success: false,
                message: "Viaje no encontrado"
            });
        }
        
        // Si el viaje estaba en progreso, liberar al conductor
        if (deletedTrip.status === 'in_progress' || deletedTrip.status === 'scheduled') {
            const driver = await Driver.findById(deletedTrip.driver_id);
            if (driver && driver.status === 'busy') {
                driver.status = 'available';
                await driver.save();
            }
        }
        
        res.status(200).json({
            success: true,
            message: "Viaje eliminado exitosamente",
            data: deletedTrip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el viaje",
            error: error.message
        });
    }
}

// Agregar un pasajero a un viaje
async function addPassenger(req, res) {
    try {
        const { name, phone, seats_reserved } = req.body;
        
        if (!name || !phone || !seats_reserved) {
            return res.status(400).json({
                success: false,
                message: "Nombre, teléfono y número de asientos son obligatorios"
            });
        }
        
        const trip = await Trip.findById(req.params.id);
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Viaje no encontrado"
            });
        }
        
        if (trip.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: "Solo se pueden agregar pasajeros a viajes programados"
            });
        }
        
        // Usar el método del modelo para agregar pasajero
        await trip.addPassenger({ name, phone, seats_reserved });
        
        const updatedTrip = await Trip.findById(trip._id)
            .populate('driver_id', 'name email phone');
        
        res.status(200).json({
            success: true,
            message: "Pasajero agregado exitosamente",
            data: updatedTrip
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

// Calificar un viaje (actualiza el rating del conductor)
async function rateTrip(req, res) {
    try {
        const { rating } = req.body;
        
        // Validar el rating
        const validatedRating = validateRating(rating);
        
        const trip = await Trip.findById(req.params.id);
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Viaje no encontrado"
            });
        }
        
        if (trip.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: "Solo se pueden calificar viajes completados"
            });
        }
        
        // Obtener el conductor
        const driver = await Driver.findById(trip.driver_id);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Conductor no encontrado"
            });
        }
        
        // Calcular nuevo rating del conductor
        // Fórmula: (rating_actual * total_viajes + nuevo_rating) / (total_viajes + 1)
        const currentTotal = driver.rating * Math.max(driver.total_trips - 1, 1);
        const newRating = calculateAverageRating([currentTotal, validatedRating]);
        
        driver.rating = newRating;
        await driver.save();
        
        res.status(200).json({
            success: true,
            message: "Viaje calificado exitosamente",
            data: {
                trip_id: trip._id,
                driver_id: driver._id,
                driver_name: driver.name,
                new_rating: newRating,
                rating_given: validatedRating
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

// Obtener estadísticas de viajes
async function getStatistics(req, res) {
    try {
        const { driver_id } = req.query;
        
        const filter = driver_id ? { driver_id } : {};
        
        const totalTrips = await Trip.countDocuments(filter);
        const completedTrips = await Trip.countDocuments({ ...filter, status: 'completed' });
        const scheduledTrips = await Trip.countDocuments({ ...filter, status: 'scheduled' });
        const inProgressTrips = await Trip.countDocuments({ ...filter, status: 'in_progress' });
        const cancelledTrips = await Trip.countDocuments({ ...filter, status: 'cancelled' });
        
        // Calcular ingresos totales de viajes completados
        const revenueData = await Trip.aggregate([
            { $match: { ...filter, status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
        ]);
        
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
        
        res.status(200).json({
            success: true,
            data: {
                total_trips: totalTrips,
                completed: completedTrips,
                scheduled: scheduledTrips,
                in_progress: inProgressTrips,
                cancelled: cancelledTrips,
                total_revenue: totalRevenue,
                completion_rate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) + '%' : '0%'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas",
            error: error.message
        });
    }
}

export {
    addPassenger, findAll,
    findById, getStatistics, rateTrip, remove, save,
    update
};
