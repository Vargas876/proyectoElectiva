import mongoose from 'mongoose';
import Driver from './models/Driver.mjs';
import Trip from './models/Trip.mjs';

// ⚠️ CAMBIA ESTA URL POR LA TUYA
const MONGODB_URI ="mongodb+srv://admin:123@clustertest.zzdjvmf.mongodb.net/driver_trip_db";
// O para MongoDB local:
// const MONGODB_URI = 'mongodb://localhost:27017/tripdriver';

// Datos de conductores de prueba
const driversData = [
    {
        name: 'Juan Pérez García',
        email: 'juan.perez@email.com',
        phone: '3001234567',
        license_number: 'COL123456',
        vehicle_type: 'sedan',
        vehicle_plate: 'ABC123',
        vehicle_capacity: 4,
        rating: 4.8,
        status: 'available'
    },
    {
        name: 'María González López',
        email: 'maria.gonzalez@email.com',
        phone: '3009876543',
        license_number: 'COL789012',
        vehicle_type: 'suv',
        vehicle_plate: 'DEF456',
        vehicle_capacity: 6,
        rating: 4.9,
        status: 'available'
    },
    {
        name: 'Carlos Rodríguez Martínez',
        email: 'carlos.rodriguez@email.com',
        phone: '3005551234',
        license_number: 'COL345678',
        vehicle_type: 'van',
        vehicle_plate: 'GHI789',
        vehicle_capacity: 8,
        rating: 4.7,
        status: 'busy'
    },
    {
        name: 'Ana María Torres',
        email: 'ana.torres@email.com',
        phone: '3007778888',
        license_number: 'COL901234',
        vehicle_type: 'minibus',
        vehicle_plate: 'JKL012',
        vehicle_capacity: 12,
        rating: 4.6,
        status: 'available'
    },
    {
        name: 'Luis Fernando Sánchez',
        email: 'luis.sanchez@email.com',
        phone: '3002223333',
        license_number: 'COL567890',
        vehicle_type: 'sedan',
        vehicle_plate: 'MNO345',
        vehicle_capacity: 4,
        rating: 5.0,
        status: 'available'
    }
];

// Función para crear viajes de prueba
function createTripsData(driverIds) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
        {
            driver_id: driverIds[0],
            origin: 'Bogotá',
            destination: 'Medellín',
            departure_time: tomorrow,
            price: 80000,
            available_seats: 3,
            status: 'scheduled'
        },
        {
            driver_id: driverIds[0],
            origin: 'Medellín',
            destination: 'Bogotá',
            departure_time: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
            price: 85000,
            available_seats: 4,
            status: 'scheduled'
        },
        {
            driver_id: driverIds[1],
            origin: 'Cali',
            destination: 'Cartagena',
            departure_time: nextWeek,
            price: 150000,
            available_seats: 5,
            status: 'scheduled'
        },
        {
            driver_id: driverIds[1],
            origin: 'Bogotá',
            destination: 'Villa de Leyva',
            departure_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            price: 45000,
            available_seats: 0,
            status: 'completed'
        },
        {
            driver_id: driverIds[2],
            origin: 'Barranquilla',
            destination: 'Santa Marta',
            departure_time: now,
            price: 50000,
            available_seats: 6,
            status: 'in_progress'
        },
        {
            driver_id: driverIds[2],
            origin: 'Pereira',
            destination: 'Armenia',
            departure_time: new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000),
            price: 25000,
            available_seats: 7,
            status: 'scheduled'
        },
        {
            driver_id: driverIds[3],
            origin: 'Bucaramanga',
            destination: 'Cúcuta',
            departure_time: nextWeek,
            price: 60000,
            available_seats: 8,  // ✅ CAMBIADO: de 10 a 8
            status: 'scheduled'
        },
        {
            driver_id: driverIds[3],
            origin: 'Manizales',
            destination: 'Bogotá',
            departure_time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            price: 70000,
            available_seats: 0,
            status: 'completed'
        },
        {
            driver_id: driverIds[4],
            origin: 'Pasto',
            destination: 'Cali',
            departure_time: tomorrow,
            price: 90000,
            available_seats: 4,
            status: 'scheduled'
        },
        {
            driver_id: driverIds[4],
            origin: 'Tunja',
            destination: 'Bogotá',
            departure_time: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            price: 30000,
            available_seats: 0,
            status: 'completed'
        }
    ];
}


async function seedDatabase() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Limpiar base de datos
        console.log('🗑️  Limpiando base de datos...');
        await Driver.deleteMany({});
        await Trip.deleteMany({});
        console.log('✅ Base de datos limpiada');

        // Insertar conductores
        console.log('👥 Insertando conductores...');
        const drivers = await Driver.insertMany(driversData);
        console.log(`✅ ${drivers.length} conductores insertados`);

        // Extraer IDs de conductores
        const driverIds = drivers.map(driver => driver._id);

        // Insertar viajes
        console.log('🚗 Insertando viajes...');
        const tripsData = createTripsData(driverIds);
        const trips = await Trip.insertMany(tripsData);
        console.log(`✅ ${trips.length} viajes insertados`);

        // Actualizar total_trips de conductores
        console.log('📊 Actualizando estadísticas de conductores...');
        for (const driver of drivers) {
            const tripCount = trips.filter(trip => 
                trip.driver_id.toString() === driver._id.toString()
            ).length;
            await Driver.findByIdAndUpdate(driver._id, { total_trips: tripCount });
        }
        console.log('✅ Estadísticas actualizadas');

        // Mostrar resumen
        console.log('\n📋 RESUMEN:');
        console.log('═══════════════════════════════════════');
        console.log(`Total Conductores: ${drivers.length}`);
        console.log(`Total Viajes: ${trips.length}`);
        console.log('\n👤 CONDUCTORES CREADOS:');
        drivers.forEach(driver => {
            console.log(`  • ${driver.name} (${driver.email})`);
            console.log(`    Licencia: ${driver.license_number}`);
            console.log(`    Vehículo: ${driver.vehicle_type} - ${driver.vehicle_plate}`);
            console.log(`    Rating: ${driver.rating} ⭐\n`);
        });

        console.log('\n🎉 ¡Base de datos poblada exitosamente!');
        console.log('\n🔑 CREDENCIALES PARA LOGIN:');
        console.log('═══════════════════════════════════════');
        console.log('Email: juan.perez@email.com');
        console.log('Licencia: COL123456\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error poblando base de datos:', error);
        process.exit(1);
    }
}

// Ejecutar el script
seedDatabase();
