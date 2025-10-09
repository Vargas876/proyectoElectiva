import mongoose from 'mongoose';
import TripRequest from './models/TripRequest.mjs';
import User from './models/User.mjs';

const URL = "mongodb+srv://admin:123@clustertest.zzdjvmf.mongodb.net/driver_trip_db";

async function seedDatabase() {
    try {
        await mongoose.connect(URL);
        console.log('✅ Conectado a MongoDB\n');

        // Limpiar colecciones (CUIDADO: Esto borra todo)
        await User.deleteMany({});
        await TripRequest.deleteMany({});
        console.log('🗑️  Colecciones limpiadas\n');

        // ========== CREAR CONDUCTORES ==========
        console.log('👨‍✈️ Creando conductores...');
        const drivers = await User.insertMany([
            {
                name: "Carlos Rodríguez",
                email: "carlos.driver@test.com",
                phone: "+57 310 5551234",
                role: "driver",
                license_number: "CD12345678",
                rating: 4.8,
                status: "available",
                total_trips: 45
            },
            {
                name: "María González",
                email: "maria.driver@test.com",
                phone: "+57 311 5552345",
                role: "driver",
                license_number: "CD87654321",
                rating: 4.9,
                status: "available",
                total_trips: 68
            },
            {
                name: "Juan Pérez",
                email: "juan.driver@test.com",
                phone: "+57 312 5553456",
                role: "driver",
                license_number: "CD11223344",
                rating: 4.5,
                status: "busy",
                total_trips: 32
            },
            {
                name: "Ana Martínez",
                email: "ana.driver@test.com",
                phone: "+57 313 5554567",
                role: "driver",
                license_number: "CD55667788",
                rating: 4.7,
                status: "available",
                total_trips: 51
            },
            {
                name: "Pedro López",
                email: "pedro.driver@test.com",
                phone: "+57 314 5555678",
                role: "driver",
                license_number: "CD99887766",
                rating: 4.6,
                status: "offline",
                total_trips: 28
            }
        ]);
        console.log(`✅ ${drivers.length} conductores creados\n`);

        // ========== CREAR PASAJEROS ==========
        console.log('👥 Creando pasajeros...');
        const passengers = await User.insertMany([
            {
                name: "Laura Sánchez",
                email: "laura.passenger@test.com",
                phone: "+57 320 6661234",
                role: "passenger",
                rating: 4.9,
                status: "available",
                total_trips: 15
            },
            {
                name: "Diego Torres",
                email: "diego.passenger@test.com",
                phone: "+57 321 6662345",
                role: "passenger",
                rating: 4.7,
                status: "available",
                total_trips: 22
            },
            {
                name: "Camila Ramírez",
                email: "camila.passenger@test.com",
                phone: "+57 322 6663456",
                role: "passenger",
                rating: 4.8,
                status: "available",
                total_trips: 18
            },
            {
                name: "Andrés Silva",
                email: "andres.passenger@test.com",
                phone: "+57 323 6664567",
                role: "passenger",
                rating: 4.6,
                status: "available",
                total_trips: 12
            },
            {
                name: "Valentina Moreno",
                email: "valentina.passenger@test.com",
                phone: "+57 324 6665678",
                role: "passenger",
                rating: 5.0,
                status: "available",
                total_trips: 8
            }
        ]);
        console.log(`✅ ${passengers.length} pasajeros creados\n`);

        // ========== CREAR SOLICITUDES DE VIAJE ==========
        console.log('🚗 Creando solicitudes de viaje...');
        
        // Solicitud 1: Pendiente con 2 ofertas
        await TripRequest.create({
            passenger_id: passengers[0]._id, // Laura
            origin: {
                address: "Calle 10 #5-20, Fusagasugá, Cundinamarca",
                coordinates: { lat: 4.3369, lng: -74.3639 }
            },
            destination: {
                address: "Carrera 7 #32-16, Bogotá",
                coordinates: { lat: 4.6097, lng: -74.0817 }
            },
            passenger_offer_price: 25000,
            seats_needed: 1,
            status: "pending",
            driver_offers: [
                {
                    driver_id: drivers[0]._id, // Carlos
                    offered_price: 25000,
                    message: "Salgo puntual a las 8:00 AM, tengo un Mazda 3 cómodo",
                    status: "pending",
                    created_at: new Date()
                },
                {
                    driver_id: drivers[1]._id, // María
                    offered_price: 28000,
                    message: "Tengo aire acondicionado y música. Vehículo nuevo.",
                    status: "pending",
                    created_at: new Date()
                }
            ],
            departure_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
            estimated_distance_km: 65,
            estimated_duration_minutes: 90
        });

        // Solicitud 2: Pendiente sin ofertas
        await TripRequest.create({
            passenger_id: passengers[1]._id, // Diego
            origin: {
                address: "Terminal de Fusagasugá",
                coordinates: { lat: 4.3400, lng: -74.3670 }
            },
            destination: {
                address: "Universidad Nacional, Bogotá",
                coordinates: { lat: 4.6386, lng: -74.0837 }
            },
            passenger_offer_price: 30000,
            seats_needed: 2,
            status: "pending",
            driver_offers: [],
            departure_time: new Date(Date.now() + 26 * 60 * 60 * 1000),
            estimated_distance_km: 68,
            estimated_duration_minutes: 95
        });

        // Solicitud 3: Pendiente con 1 oferta
        await TripRequest.create({
            passenger_id: passengers[2]._id, // Camila
            origin: {
                address: "Centro Comercial Sabana Center, Fusagasugá",
                coordinates: { lat: 4.3350, lng: -74.3620 }
            },
            destination: {
                address: "Aeropuerto El Dorado, Bogotá",
                coordinates: { lat: 4.7016, lng: -74.1469 }
            },
            passenger_offer_price: 40000,
            seats_needed: 1,
            status: "pending",
            driver_offers: [
                {
                    driver_id: drivers[3]._id, // Ana
                    offered_price: 42000,
                    message: "Te llevo directo, sin paradas. Vehículo amplio para maletas.",
                    status: "pending",
                    created_at: new Date()
                }
            ],
            departure_time: new Date(Date.now() + 48 * 60 * 60 * 1000), // En 2 días
            estimated_distance_km: 85,
            estimated_duration_minutes: 110
        });

        // Solicitud 4: Aceptada
        await TripRequest.create({
            passenger_id: passengers[3]._id, // Andrés
            origin: {
                address: "Hospital de Fusagasugá",
                coordinates: { lat: 4.3380, lng: -74.3650 }
            },
            destination: {
                address: "Clínica Shaio, Bogotá",
                coordinates: { lat: 4.6310, lng: -74.0640 }
            },
            passenger_offer_price: 35000,
            seats_needed: 1,
            status: "accepted",
            driver_offers: [
                {
                    driver_id: drivers[0]._id, // Carlos
                    offered_price: 35000,
                    message: "Puedo salir ahora mismo, viaje rápido",
                    status: "accepted",
                    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
                },
                {
                    driver_id: drivers[1]._id, // María
                    offered_price: 33000,
                    message: "Tengo experiencia en viajes médicos",
                    status: "rejected",
                    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000)
                }
            ],
            accepted_driver_id: drivers[0]._id, // Carlos
            final_price: 35000,
            departure_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
            estimated_distance_km: 70,
            estimated_duration_minutes: 85
        });

        // Solicitud 5: Completada
        await TripRequest.create({
            passenger_id: passengers[4]._id, // Valentina
            origin: {
                address: "Parque Principal, Fusagasugá",
                coordinates: { lat: 4.3374, lng: -74.3644 }
            },
            destination: {
                address: "Centro Comercial Andino, Bogotá",
                coordinates: { lat: 4.6718, lng: -74.0545 }
            },
            passenger_offer_price: 28000,
            seats_needed: 1,
            status: "completed",
            driver_offers: [
                {
                    driver_id: drivers[2]._id, // Juan
                    offered_price: 28000,
                    message: "Viaje cómodo y seguro",
                    status: "accepted",
                    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            ],
            accepted_driver_id: drivers[2]._id, // Juan
            final_price: 28000,
            departure_time: new Date(Date.now() - 22 * 60 * 60 * 1000), // Ayer
            estimated_distance_km: 72,
            estimated_duration_minutes: 92
        });

        console.log('✅ 5 solicitudes de viaje creadas\n');

        // ========== RESUMEN ==========
        console.log('📊 RESUMEN:');
        console.log(`   👨‍✈️ Conductores: ${drivers.length}`);
        console.log(`   👥 Pasajeros: ${passengers.length}`);
        console.log(`   🚗 Solicitudes: 5`);
        console.log('');
        console.log('🔐 CREDENCIALES DE PRUEBA:');
        console.log('');
        console.log('   CONDUCTOR:');
        console.log('   Email: carlos.driver@test.com');
        console.log('   Phone: +57 310 5551234');
        console.log('');
        console.log('   PASAJERO:');
        console.log('   Email: laura.passenger@test.com');
        console.log('   Phone: +57 320 6661234');
        console.log('');
        console.log('✅ Base de datos poblada exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Desconectado de MongoDB');
    }
}

seedDatabase();