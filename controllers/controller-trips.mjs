import Driver from "../models/Driver.mjs";
import Trip from "../models/Trip.mjs";
import { calculateTripRating, simulateActualDuration } from "../utils/ratingCalculator.mjs";

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

        //  SIMULAR DURACIÓN REAL DEL VIAJE
        const actual_duration = simulateActualDuration(
            trip.estimated_duration_minutes,
            trip.weather_condition,
            trip.time_of_day
        );

        //  CALCULAR RATING INTELIGENTE
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
            message: `🎉 Viaje completado!`,
            data: result,
            rating_analysis: {
                trip_rating: ratingResult.final_rating,
                factors: ratingResult.factors,
                analysis: ratingResult.analysis,
                driver_new_rating: driver.rating
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