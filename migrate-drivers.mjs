import mongoose from 'mongoose';
import Driver from './models/Driver.mjs'; // Modelo antiguo
import User from './models/User.mjs'; // Modelo nuevo

const URL = "mongodb+srv://admin:123@clustertest.zzdjvmf.mongodb.net/driver_trip_db";

async function migrateDriversToUsers() {
    try {
        await mongoose.connect(URL);
        console.log('Conectado a MongoDB');

        // Obtener todos los conductores
        const drivers = await Driver.find();
        console.log(`Encontrados ${drivers.length} conductores`);

        // Migrar cada conductor a User
        for (const driver of drivers) {
            const existingUser = await User.findOne({ email: driver.email });
            
            if (!existingUser) {
                const newUser = new User({
                    name: driver.name,
                    email: driver.email,
                    phone: driver.phone,
                    role: 'driver',
                    license_number: driver.license_number,
                    rating: driver.rating,
                    status: driver.status,
                    total_trips: driver.total_trips
                });

                await newUser.save();
                console.log(`✅ Migrado: ${driver.name}`);
            } else {
                console.log(`⚠️  Ya existe: ${driver.name}`);
            }
        }

        console.log('✅ Migración completada');
        
        // OPCIONAL: Eliminar colección antigua
        // await Driver.collection.drop();
        // console.log('🗑️  Colección drivers eliminada');

    } catch (error) {
        console.error('Error en migración:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrateDriversToUsers();