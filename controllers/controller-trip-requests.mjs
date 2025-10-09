import {
    notifyDriversNewRequest
} from '../config/socket.mjs';
import TripRequest from '../models/TripRequest.mjs';
import User from '../models/User.mjs';
// Pasajero crea solicitud
export async function createTripRequest(req, res) {
    try {
        const { origin, destination, passenger_offer_price, seats_needed, departure_time } = req.body;
        
        // Validar que el usuario sea pasajero
        const user = await User.findById(req.user.id);
        if (user.role !== 'passenger') {
            return res.status(403).json({
                success: false,
                message: 'Solo los pasajeros pueden crear solicitudes'
            });
        }

        const newRequest = new TripRequest({
            passenger_id: req.user.id,
            origin,
            destination,
            passenger_offer_price,
            seats_needed: seats_needed || 1,
            departure_time
        });

        const savedRequest = await newRequest.save();
        
        // 🔥 Notificar a todos los conductores
            notifyDriversNewRequest(savedRequest);

            res.status(201).json({
                success: true,
                message: 'Solicitud creada exitosamente',
                data: savedRequest
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear solicitud',
            error: error.message
        });
    }
}

// Conductor ve solicitudes disponibles
export async function getAvailableRequests(req, res) {
    try {
        const requests = await TripRequest.find({ 
            status: 'pending' 
        })
        .populate('passenger_id', 'name phone rating total_trips')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
            total: requests.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener solicitudes',
            error: error.message
        });
    }
}

// Obtener solicitud por ID
export async function getTripRequestById(req, res) {
    try {
        const request = await TripRequest.findById(req.params.id)
            .populate('passenger_id', 'name email phone rating total_trips')
            .populate('driver_offers.driver_id', 'name email phone rating total_trips license_number');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener solicitud',
            error: error.message
        });
    }
}

// Conductor hace oferta
export async function makeOffer(req, res) {
    try {
        const { offered_price, message } = req.body;
        const requestId = req.params.id;

        // Validar que el usuario sea conductor
        const user = await User.findById(req.user.id);
        if (user.role !== 'driver') {
            return res.status(403).json({
                success: false,
                message: 'Solo los conductores pueden hacer ofertas'
            });
        }

        const tripRequest = await TripRequest.findById(requestId);

        if (!tripRequest) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }

        if (tripRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Esta solicitud ya no está disponible'
            });
        }

        await tripRequest.addDriverOffer({
            driver_id: req.user.id,
            offered_price,
            message: message || ''
        });
        
        const updatedRequest = await TripRequest.findById(requestId)
            .populate('driver_offers.driver_id', 'name rating')
            .populate('passenger_id', 'name');
        
        // 🔥 Notificar al pasajero
        const newOffer = updatedRequest.driver_offers[updatedRequest.driver_offers.length - 1];
        notifyPassengerNewOffer(updatedRequest.passenger_id._id, newOffer, updatedRequest);
        
        res.status(200).json({
            success: true,
            message: 'Oferta enviada exitosamente',
            data: updatedRequest
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

// Pasajero acepta oferta
export async function acceptOffer(req, res) {
    try {
        const { offerId } = req.body;
        const requestId = req.params.id;

        const tripRequest = await TripRequest.findById(requestId);

        if (!tripRequest) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }

        // Verificar que sea el pasajero dueño
        if (tripRequest.passenger_id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado'
            });
        }

        await tripRequest.acceptOffer(offerId);

            const updatedRequest = await TripRequest.findById(requestId)
                .populate('accepted_driver_id', 'name email phone')
                .populate('driver_offers.driver_id', 'name');

            // 🔥 Notificar al conductor aceptado
            notifyDriverOfferAccepted(updatedRequest.accepted_driver_id._id, updatedRequest);

            // 🔥 Notificar a los conductores rechazados
            updatedRequest.driver_offers.forEach(offer => {
                if (offer.status === 'rejected') {
                    notifyDriverOfferRejected(offer.driver_id._id, updatedRequest);
                }
            });

            res.status(200).json({
                success: true,
                message: 'Oferta aceptada',
                data: updatedRequest
            });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

// Obtener mis solicitudes (pasajero)
export async function getMyRequests(req, res) {
    try {
        const requests = await TripRequest.find({ 
            passenger_id: req.user.id 
        })
        .populate('driver_offers.driver_id', 'name rating phone')
        .populate('accepted_driver_id', 'name rating phone email')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
            total: requests.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener solicitudes',
            error: error.message
        });
    }
}

// Obtener mis ofertas (conductor)
export async function getMyOffers(req, res) {
    try {
        const requests = await TripRequest.find({
            'driver_offers.driver_id': req.user.id
        })
        .populate('passenger_id', 'name rating phone')
        .sort({ createdAt: -1 });

        // Filtrar para devolver solo info relevante
        const myOffers = requests.map(request => {
            const myOffer = request.driver_offers.find(
                offer => offer.driver_id.toString() === req.user.id
            );

            return {
                _id: request._id,
                passenger_id: request.passenger_id,
                origin: request.origin,
                destination: request.destination,
                passenger_offer_price: request.passenger_offer_price,
                departure_time: request.departure_time,
                status: request.status,
                my_offer_price: myOffer.offered_price,
                my_offer_message: myOffer.message,
                offer_status: myOffer.status,
                createdAt: request.createdAt
            };
        });

        res.status(200).json({
            success: true,
            data: myOffers,
            total: myOffers.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener ofertas',
            error: error.message
        });
    }
}

export {
    acceptOffer, createTripRequest,
    getAvailableRequests, getMyOffers, getMyRequests, getTripRequestById,
    makeOffer
};
