import Driver from "../models/Driver.mjs";
import Trip from "../models/Trip.mjs";
import { calculateTripRating, simulateActualDuration } from "../utils/ratingCalculator.mjs";

// Obtener todos los viajes
async function findAll(req, res) {
    try {
        const result = await Trip.find().populate('driver_id', 'name rating');
        res.status(200).json({
            success: true,
            data: result,
            total: result.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los viajes",
            error: error.message
        });
    }
}

// Buscar un viaje por ID
async function findById(req, res) {
    try {
        const { id } = req.params;
        const result = await Trip.findById(id).populate('driver_id', 'name rating phone');
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Viaje no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            data: result
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
        const { driver_id, origin, destination, departure_time, price, available_seats } = req.body;
        
        // Validación básica
        if (!driver_id || !origin || !destination || !departure_time || !price) {
            return res.status(400).json({
                success: false,
                message: "Faltan campos obligatorios: driver_id, origin, destination, departure_time, price"
            });
        }

        // Verificar que el conductor existe
        const driver = await Driver.findById(driver_id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Conductor no encontrado"
            });
        }
        
        const record = {
            driver_id,
            origin,
            destination,
            departure_time: new Date(departure_time),
            arrival_time: null,
            price: parseFloat(price),
            available_seats: available_seats || 4,
            status: "scheduled",
            createdAt: new Date()
        };
        
        const result = await Trip.create(record);
        const populatedResult = await Trip.findById(result._id).populate('driver_id', 'name rating');
        
        res.status(201).json({
            success: true,
            message: "Viaje creado exitosamente",
            data: populatedResult
        });
    } catch (error) {
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
        const { id } = req.params;
        const { driver_id, origin, destination, departure_time, arrival_time, price, available_seats, status } = req.body;
        
        const updateData = {};
        if (driver_id) updateData.driver_id = driver_id;
        if (origin) updateData.origin = origin;
        if (destination) updateData.destination = destination;
        if (departure_time) updateData.departure_time = new Date(departure_time);
        if (arrival_time) updateData.arrival_time = new Date(arrival_time);
        if (price) updateData.price = parseFloat(price);
        if (available_seats) updateData.available_seats = parseInt(available_seats);
        if (status) updateData.status = status;
        
        updateData.updatedAt = new Date();
        
        const trip = await Trip.findById(id);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Viaje no encontrado"
            });
        }

        // Si el viaje se está completando manualmente, actualizar rating automáticamente
        if (status === 'completed' && trip.status !== 'completed') {
            const driver = await Driver.findById(trip.driver_id);
            if (driver) {
                // Simular duración real del viaje
                const actual_duration = simulateActualDuration(
                    trip.estimated_duration_minutes,
                    trip.weather_condition,
                    trip.time_of_day
                );

                // Calcular rating inteligente
                const ratingResult = calculateTripRating({
                    estimated_duration_minutes: trip.estimated_duration_minutes,
                    actual_duration_minutes: actual_duration,
                    weather_condition: trip.weather_condition,
                    time_of_day: trip.time_of_day,
                    distance_km: trip.distance_km,
                    driver_current_rating: driver.rating
                });

                updateData.actual_duration_minutes = actual_duration;
                updateData.trip_rating = ratingResult.final_rating;
                updateData.rating_factors = ratingResult.factors;
                updateData.arrival_time = updateData.arrival_time || new Date();
                
                // Actualizar rating del conductor
                driver.total_trips += 1;
                driver.total_rating_points += ratingResult.final_rating;
                driver.rating = Math.round((driver.total_rating_points / (driver.total_trips + 1)) * 10) / 10;
                await driver.save();
                
                console.log(`Viaje completado! Rating del viaje: ${ratingResult.final_rating}. Nuevo rating del conductor: ${driver.rating}`);
            }
        }
        
        const result = await Trip.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
                                   .populate('driver_id', 'name rating total_trips');
        
        res.status(200).json({
            success: true,
            message: status === 'completed' ? 
                    `Viaje completado exitosamente! Rating actualizado automáticamente: ${result.trip_rating}` : 
                    "Viaje actualizado exitosamente",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el viaje",
            error: error.message
        });
    }
}

// Eliminar un viaje
async function deleteTrip(req, res) {
    try {
        const { id } = req.params;
        const result = await Trip.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Viaje no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Viaje eliminado exitosamente",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el viaje",
            error: error.message
        });
    }
}

// Completar viaje con rating inteligente (endpoint específico)
async function completeTrip(req, res) {
    try {
        const { id } = req.params;
        
        const trip = await Trip.findById(id);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Viaje no encontrado"
            });
        }

        if (trip.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: "El viaje ya está completado"
            });
        }

        const driver = await Driver.findById(trip.driver_id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Conductor no encontrado"
            });
        }

        // Simular duración real del viaje
        const actual_duration = simulateActualDuration(
            trip.estimated_duration_minutes,
            trip.weather_condition,
            trip.time_of_day
        );

        // Calcular rating inteligente
        const ratingResult = calculateTripRating({
            estimated_duration_minutes: trip.estimated_duration_minutes,
            actual_duration_minutes: actual_duration,
            weather_condition: trip.weather_condition,
            time_of_day: trip.time_of_day,
            distance_km: trip.distance_km,
            driver_current_rating: driver.rating
        });

        // Actualizar el viaje
        trip.status = 'completed';
        trip.arrival_time = new Date();
        trip.actual_duration_minutes = actual_duration;
        trip.trip_rating = ratingResult.final_rating;
        trip.rating_factors = ratingResult.factors;
        await trip.save();

        // Actualizar rating del conductor
        driver.total_trips += 1;
        driver.total_rating_points += ratingResult.final_rating;
        driver.rating = Math.round((driver.total_rating_points / (driver.total_trips + 1)) * 10) / 10;
        await driver.save();

        const result = await Trip.findById(id).populate('driver_id', 'name rating total_trips');

        res.status(200).json({
            success: true,
            message: `Viaje completado con rating inteligente!`,
            data: result,
            rating_analysis: {
                trip_rating: ratingResult.final_rating,
                factors: ratingResult.factors,
                analysis: {
                    delay_minutes: ratingResult.analysis.delay_minutes,
                    weather_impact: ratingResult.analysis.weather_impact,
                    time_impact: ratingResult.analysis.time_impact,
                    driver_bonus: ratingResult.analysis.driver_bonus,
                    estimated_duration: trip.estimated_duration_minutes,
                    actual_duration: actual_duration,
                    distance: trip.distance_km,
                    weather: trip.weather_condition,
                    time_of_day: trip.time_of_day
                },
                driver_stats: {
                    previous_rating: ratingResult.analysis.driver_bonus + 4.0,
                    new_rating: driver.rating,
                    total_trips: driver.total_trips
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al completar el viaje",
            error: error.message
        });
    }
}

export {
    completeTrip, deleteTrip,
    findAll,
    findById,
    save,
    update
};
