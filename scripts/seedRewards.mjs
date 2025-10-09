// utils/seedRewards.mjs
import connectDB from '../config/connect-db.mjs';
import Driver from '../models/Driver.mjs';
import Rewards from '../models/Rewards.mjs';

const seedRewards = async () => {
  try {
    await connectDB();

    console.log('🌱 Poblando colección Rewards...');

    // Obtener todos los conductores
    const drivers = await Driver.find();

    if (drivers.length === 0) {
      console.log('❌ No hay conductores en la base de datos');
      return;
    }

    console.log(`📊 Encontrados ${drivers.length} conductores`);

    for (const driver of drivers) {
      // Verificar si ya tiene rewards
      const existingRewards = await Rewards.findOne({ driver_id: driver._id });

      if (existingRewards) {
        console.log(`⏭️  ${driver.name} ya tiene rewards`);
        continue;
      }

      // Calcular datos basados en el driver
      const totalTrips = driver.total_trips || 0;
      const points = totalTrips * 10; // 10 puntos por viaje
      const level = Math.floor(points / 100) + 1; // Cada 100 puntos = 1 nivel

      // Crear badges basados en viajes
      const badges = [];
      
      if (totalTrips >= 1) {
        badges.push({
          name: 'Primera Victoria',
          icon: '🎉',
          description: 'Completa tu primer viaje',
          rarity: 'common',
          earned_at: new Date()
        });
      }

      if (totalTrips >= 10) {
        badges.push({
          name: 'Conductor Activo',
          icon: '🚗',
          description: 'Completa 10 viajes',
          rarity: 'common',
          earned_at: new Date()
        });
      }

      if (totalTrips >= 50) {
        badges.push({
          name: 'Conductor Confiable',
          icon: '🛡️',
          description: 'Completa 50 viajes',
          rarity: 'rare',
          earned_at: new Date()
        });
      }

      if (totalTrips >= 100) {
        badges.push({
          name: 'Conductor Experto',
          icon: '⭐',
          description: 'Completa 100 viajes',
          rarity: 'epic',
          earned_at: new Date()
        });
      }

      if (driver.rating >= 4.8 && totalTrips >= 20) {
        badges.push({
          name: 'Estrella de Oro',
          icon: '🏆',
          description: 'Calificación 4.8+ con 20 viajes',
          rarity: 'epic',
          earned_at: new Date()
        });
      }

      if (totalTrips >= 200) {
        badges.push({
          name: 'Leyenda',
          icon: '👑',
          description: 'Completa 200 viajes',
          rarity: 'legendary',
          earned_at: new Date()
        });
      }

      // Crear documento de rewards
      const reward = await Rewards.create({
        driver_id: driver._id,
        points,
        level,
        badges,
        achievements: [
          {
            title: 'Completar 100 viajes',
            description: 'Completa 100 viajes exitosos',
            progress: totalTrips,
            target: 100,
            completed: totalTrips >= 100,
            reward_points: 500
          },
          {
            title: 'Mantener calificación alta',
            description: 'Mantén un rating de 4.5 o superior',
            progress: Math.round(driver.rating * 10),
            target: 45,
            completed: driver.rating >= 4.5,
            reward_points: 300
          }
        ],
        streaks: {
          current_streak: Math.floor(Math.random() * 15) + 1,
          longest_streak: Math.floor(Math.random() * 30) + 1,
          last_activity: new Date()
        }
      });

      console.log(`✅ Rewards creado para ${driver.name}: ${points} puntos, nivel ${level}, ${badges.length} badges`);
    }

    console.log('🎉 Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedRewards();
