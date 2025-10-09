import mongoose from 'mongoose';

const URL = "mongodb+srv://admin:123@clustertest.zzdjvmf.mongodb.net/driver_trip_db";

async function organizeCollections() {
    try {
        await mongoose.connect(URL);
        console.log('✅ Conectado a MongoDB\n');

        const db = mongoose.connection.db;
        
        // Renombrar trips a trips_old (backup)
        try {
            const tripsExists = await db.listCollections({ name: 'trips' }).toArray();
            if (tripsExists.length > 0) {
                await db.collection('trips').rename('trips_old');
                console.log('✅ "trips" → "trips_old" (backup creado)');
            }
        } catch (error) {
            console.log('ℹ️  "trips" ya fue renombrado o no existe');
        }

        // Renombrar drivers a drivers_old (backup opcional)
        try {
            const driversExists = await db.listCollections({ name: 'drivers' }).toArray();
            if (driversExists.length > 0) {
                await db.collection('drivers').rename('drivers_old');
                console.log('✅ "drivers" → "drivers_old" (backup creado)');
            }
        } catch (error) {
            console.log('ℹ️  "drivers" ya fue renombrado o no existe');
        }

        console.log('\n📊 Estado final de colecciones:\n');
        
        const collections = await db.listCollections().toArray();
        
        console.log('🟢 COLECCIONES ACTIVAS:');
        const activeCollections = collections.filter(c => 
            c.name === 'users' || c.name === 'triprequests'
        );
        activeCollections.forEach(col => {
            console.log(`   ✓ ${col.name}`);
        });

        console.log('\n📦 COLECCIONES DE BACKUP:');
        const backupCollections = collections.filter(c => 
            c.name.includes('_old') || c.name === 'trips' || c.name === 'drivers'
        );
        backupCollections.forEach(col => {
            console.log(`   • ${col.name}`);
        });

        console.log('\n💡 Tip: Puedes eliminar los backups cuando estés seguro:');
        console.log('   db.trips_old.drop()');
        console.log('   db.drivers_old.drop()');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Desconectado de MongoDB');
    }
}

organizeCollections();