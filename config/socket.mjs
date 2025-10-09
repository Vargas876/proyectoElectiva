import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Middleware de autenticación para Socket.io
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            socket.userName = decoded.name;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ Usuario conectado: ${socket.userName} (${socket.userRole}) - Socket ID: ${socket.id}`);

        // Unirse a una sala basada en el userId
        socket.join(socket.userId);
        console.log(`👤 ${socket.userName} unido a sala: ${socket.userId}`);

        // Unirse a sala según rol
        if (socket.userRole === 'driver') {
            socket.join('drivers');
            console.log(`🚗 Conductor ${socket.userName} unido a sala de conductores`);
        } else if (socket.userRole === 'passenger') {
            socket.join('passengers');
            console.log(`👤 Pasajero ${socket.userName} unido a sala de pasajeros`);
        }

        // Evento: Usuario está escribiendo (opcional)
        socket.on('typing', (data) => {
            socket.broadcast.emit('user_typing', {
                userId: socket.userId,
                userName: socket.userName
            });
        });

        // Desconexión
        socket.on('disconnect', () => {
            console.log(`❌ Usuario desconectado: ${socket.userName} - Socket ID: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado');
    }
    return io;
};

// Funciones auxiliares para emitir eventos

// Notificar a todos los conductores sobre nueva solicitud
export const notifyDriversNewRequest = (tripRequest) => {
    if (io) {
        io.to('drivers').emit('new_trip_request', {
            message: 'Nueva solicitud de viaje disponible',
            tripRequest
        });
        console.log(`📢 Notificado a conductores: Nueva solicitud ${tripRequest._id}`);
    }
};

// Notificar a un pasajero sobre nueva oferta
export const notifyPassengerNewOffer = (passengerId, offer, tripRequest) => {
    if (io) {
        io.to(passengerId.toString()).emit('new_offer', {
            message: `Nueva oferta de $${offer.offered_price}`,
            offer,
            tripRequestId: tripRequest._id
        });
        console.log(`📢 Notificado a pasajero ${passengerId}: Nueva oferta`);
    }
};

// Notificar a un conductor que su oferta fue aceptada
export const notifyDriverOfferAccepted = (driverId, tripRequest) => {
    if (io) {
        io.to(driverId.toString()).emit('offer_accepted', {
            message: '¡Tu oferta fue aceptada!',
            tripRequest
        });
        console.log(`📢 Notificado a conductor ${driverId}: Oferta aceptada`);
    }
};

// Notificar a conductores que su oferta fue rechazada
export const notifyDriverOfferRejected = (driverId, tripRequest) => {
    if (io) {
        io.to(driverId.toString()).emit('offer_rejected', {
            message: 'El pasajero eligió otra oferta',
            tripRequestId: tripRequest._id
        });
        console.log(`📢 Notificado a conductor ${driverId}: Oferta rechazada`);
    }
};

export default {
    initializeSocket,
    getIO,
    notifyDriversNewRequest,
    notifyPassengerNewOffer,
    notifyDriverOfferAccepted,
    notifyDriverOfferRejected
};