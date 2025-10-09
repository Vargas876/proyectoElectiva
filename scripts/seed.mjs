// scripts/seed.mjs
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Importar modelos
import Driver from '../models/Driver.mjs';
import EmergencyAlert from '../models/EmergencyAlert.mjs';
import Notification from '../models/Notification.mjs';
import RecurringTrip from '../models/RecurringTrip.mjs';
import Review from '../models/Review.mjs';
import Rewards from '../models/Rewards.mjs';
import Trip from '../models/Trip.mjs';
import Verification from '../models/Verification.mjs';

dotenv.config();

const MONGODB_URI = "mongodb+srv://admin:123@clustertest.zzdjvmf.mongodb.net/driver_trip_db";

// ============================================
// DATOS DE SEED
// ============================================

const seedDrivers = [
  {
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+57 300 123 4567',
    license_number: 'COL12345',
    vehicle_type: 'sedan',
    vehicle_plate: 'ABC123',
    vehicle_capacity: 4,
    vehicle_model: 'Toyota Corolla',
    vehicle_year: 2022,
    vehicle_color: 'Blanco',
    rating: 4.8,
    total_trips: 150,
    completed_trips: 145,
    cancelled_trips: 5,
    status: 'available',
    level: 5,
    points: 520,
    bio: 'Conductor profesional con 3 años de experiencia. Puntual y amable.'
  },
  {
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+57 310 234 5678',
    license_number: 'COL23456',
    vehicle_type: 'suv',
    vehicle_plate: 'DEF456',
    vehicle_capacity: 6,
    vehicle_model: 'Chevrolet Captiva',
    vehicle_year: 2021,
    vehicle_color: 'Negro',
    rating: 4.9,
    total_trips: 200,
    completed_trips: 198,
    cancelled_trips: 2,
    status: 'available',
    level: 7,
    points: 740,
    bio: 'Conductora confiable, especializada en rutas largas.'
  },
  {
    name: 'Juan Martínez',
    email: 'juan.martinez@email.com',
    phone: '+57 320 345 6789',
    license_number: 'COL34567',
    vehicle_type: 'van',
    vehicle_plate: 'GHI789',
    vehicle_capacity: 8,
    vehicle_model: 'Hyundai H1',
    vehicle_year: 2020,
    vehicle_color: 'Gris',
    rating: 4.7,
    total_trips: 120,
    completed_trips: 115,
    cancelled_trips: 5,
    status: 'busy',
    level: 4,
    points: 420,
    bio: 'Perfecto para grupos grandes. Vehículo espacioso y cómodo.'
  },
  {
    name: 'Laura Sánchez',
    email: 'laura.sanchez@email.com',
    phone: '+57 315 456 7890',
    license_number: 'COL45678',
    vehicle_type: 'hatchback',
    vehicle_plate: 'JKL012',
    vehicle_capacity: 4,
    vehicle_model: 'Mazda 3',
    vehicle_year: 2023,
    vehicle_color: 'Rojo',
    rating: 5.0,
    total_trips: 80,
    completed_trips: 80,
    cancelled_trips: 0,
    status: 'available',
    level: 3,
    points: 280,
    bio: 'Nueva en la plataforma pero con excelente servicio.'
  },
  {
    name: 'Pedro Ramírez',
    email: 'pedro.ramirez@email.com',
    phone: '+57 301 567 8901',
    license_number: 'COL56789',
    vehicle_type: 'sedan',
    vehicle_plate: 'MNO345',
    vehicle_capacity: 4,
    vehicle_model: 'Renault Logan',
    vehicle_year: 2019,
    vehicle_color: 'Azul',
    rating: 4.6,
    total_trips: 95,
    completed_trips: 90,
    cancelled_trips: 5,
    status: 'offline',
    level: 3,
    points: 320,
    bio: 'Conductor económico y confiable.'
  }
];

// ============================================
// FUNCIÓN PRINCIPAL DE SEED
// ============================================

const seedDatabase = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas\n');

    // Limpiar base de datos
    console.log('🗑️  Limpiando base de datos...');
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await Rewards.deleteMany({});
    await EmergencyAlert.deleteMany({});
    await RecurringTrip.deleteMany({});
    await Verification.deleteMany({});
    console.log('✅ Base de datos limpiada\n');

    // ==========================================
    // 1. CREAR CONDUCTORES
    // ==========================================
    console.log('👤 Creando conductores...');
    const drivers = await Driver.insertMany(seedDrivers);
    console.log(`✅ ${drivers.length} conductores creados\n`);

    // ==========================================
    // 2. CREAR VIAJES
    // ==========================================
    console.log('🚗 Creando viajes...');
    const now = new Date();
    const trips = await Trip.insertMany([
      {
        driver_id: drivers[0]._id,
        origin: 'Bogotá',
        destination: 'Medellín',
        departure_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // En 2 días
        price: 80000,
        available_seats: 3,
        distance_km: 415,
        duration_minutes: 540,
        status: 'scheduled',
        passengers: []
      },
      {
        driver_id: drivers[1]._id,
        origin: 'Cali',
        destination: 'Cartagena',
        departure_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // En 5 días
        price: 150000,
        available_seats: 5,
        distance_km: 820,
        duration_minutes: 780,
        status: 'scheduled',
        passengers: []
      },
      {
        driver_id: drivers[2]._id,
        origin: 'Barranquilla',
        destination: 'Santa Marta',
        departure_time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        arrival_time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        price: 35000,
        available_seats: 0,
        distance_km: 93,
        duration_minutes: 120,
        status: 'completed',
        passengers: [
          { name: 'Ana López', phone: '+57 300 111 2222', seats_reserved: 2 },
          { name: 'Roberto Díaz', phone: '+57 310 222 3333', seats_reserved: 1 }
        ]
      },
      {
        driver_id: drivers[3]._id,
        origin: 'Bucaramanga',
        destination: 'Cúcuta',
        departure_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Mañana
        price: 45000,
        available_seats: 3,
        distance_km: 195,
        duration_minutes: 240,
        status: 'scheduled',
        passengers: [
          { name: 'Sofía Reyes', phone: '+57 315 333 4444', seats_reserved: 1 }
        ]
      },
      {
        driver_id: drivers[0]._id,
        origin: 'Pereira',
        destination: 'Manizales',
        departure_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
        arrival_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        price: 25000,
        available_seats: 0,
        distance_km: 55,
        duration_minutes: 60,
        status: 'completed',
        passengers: [
          { name: 'Luis Herrera', phone: '+57 301 444 5555', seats_reserved: 1 }
        ]
      }
    ]);
    console.log(`✅ ${trips.length} viajes creados\n`);

   // ==========================================
// 3. CREAR REVIEWS (CORREGIDO)
// ==========================================
console.log('⭐ Creando reviews...');
const reviews = await Review.insertMany([
  {
    trip_id: trips[2]._id, // Viaje completado Barranquilla-Santa Marta
    reviewer_id: drivers[0]._id,
    reviewed_driver_id: drivers[2]._id,
    rating: 5,
    comment: 'Excelente conductor, muy puntual y amable. El vehículo estaba impecable.',
    tags: ['punctual', 'friendly', 'clean_vehicle']
  },
  {
    trip_id: trips[4]._id, // Viaje completado Pereira-Manizales
    reviewer_id: drivers[1]._id,
    reviewed_driver_id: drivers[0]._id,
    rating: 4,
    comment: 'Buen viaje, aunque hubo un pequeño retraso en la salida.',
    tags: ['friendly', 'safe_driver']
  },
  // ✅ CAMBIO: Ahora este review es del primer viaje en lugar del tercero
  {
    trip_id: trips[0]._id, // Viaje programado Bogotá-Medellín (cambiar a otro viaje)
    reviewer_id: drivers[3]._id,
    reviewed_driver_id: drivers[0]._id,
    rating: 5,
    comment: 'Perfecto! Muy profesional y respetuoso.',
    tags: ['professional', 'safe_driver', 'comfortable']
  }
]);
console.log(`✅ ${reviews.length} reviews creados\n`);

    // ==========================================
    // 4. CREAR NOTIFICACIONES
    // ==========================================
    console.log('🔔 Creando notificaciones...');
    const notifications = await Notification.insertMany([
      {
        user_id: drivers[0]._id,
        type: 'trip_completed',
        title: 'Viaje Completado',
        message: 'Tu viaje a Manizales ha sido completado exitosamente',
        read: false
      },
      {
        user_id: drivers[1]._id,
        type: 'new_review',
        title: 'Nueva Reseña',
        message: 'Has recibido una nueva calificación de 5 estrellas',
        read: false
      },
      {
        user_id: drivers[2]._id,
        type: 'badge_earned',
        title: '¡Nuevo Badge Desbloqueado!',
        message: 'Has ganado el badge "Conductor Profesional"',
        read: false
      },
      {
        user_id: drivers[0]._id,
        type: 'level_up',
        title: '¡Subiste de Nivel!',
        message: 'Felicitaciones, ahora eres nivel 5',
        read: true
      }
    ]);
    console.log(`✅ ${notifications.length} notificaciones creadas\n`);

    // ==========================================
    // 5. CREAR REWARDS
    // ==========================================
    console.log('🏆 Creando rewards...');
    const rewards = await Rewards.insertMany([
      {
        driver_id: drivers[0]._id,
        points: 520,
        level: 5,
        badges: [
          { name: 'Primera Victoria', icon: '🎉', description: 'Completa tu primer viaje', rarity: 'common', earned_at: new Date() },
          { name: 'Conductor Confiable', icon: '🛡️', description: 'Completa 50 viajes', rarity: 'rare', earned_at: new Date() }
        ],
        achievements: [
          { title: 'Completar 100 viajes', description: 'Completa 100 viajes exitosos', progress: 85, target: 100, completed: false }
        ],
        streaks: { current_streak: 5, longest_streak: 12 }
      },
      {
        driver_id: drivers[1]._id,
        points: 740,
        level: 7,
        badges: [
          { name: 'Primera Victoria', icon: '🎉', description: 'Completa tu primer viaje', rarity: 'common', earned_at: new Date() },
          { name: 'Estrella de Oro', icon: '⭐', description: 'Mantén rating de 4.9+', rarity: 'epic', earned_at: new Date() },
          { name: 'Maratonista', icon: '🏃', description: 'Completa 200 viajes', rarity: 'legendary', earned_at: new Date() }
        ],
        achievements: [
          { title: 'Completar 250 viajes', description: 'Completa 250 viajes exitosos', progress: 200, target: 250, completed: false }
        ],
        streaks: { current_streak: 15, longest_streak: 25 }
      },
      {
        driver_id: drivers[2]._id,
        points: 420,
        level: 4,
        badges: [
          { name: 'Primera Victoria', icon: '🎉', description: 'Completa tu primer viaje', rarity: 'common', earned_at: new Date() },
          { name: 'Transportista', icon: '🚐', description: 'Especialista en grupos grandes', rarity: 'rare', earned_at: new Date() }
        ],
        achievements: [],
        streaks: { current_streak: 3, longest_streak: 8 }
      }
    ]);
    console.log(`✅ ${rewards.length} rewards creados\n`);

    // ==========================================
    // 6. CREAR ALERTAS DE EMERGENCIA
    // ==========================================
    console.log('🚨 Creando alertas de emergencia...');
    const emergencyAlerts = await EmergencyAlert.insertMany([
      {
        trip_id: trips[2]._id,
        driver_id: drivers[2]._id,
        location: {
          latitude: 10.9878,
          longitude: -74.7889,
          address: 'Vía Barranquilla - Santa Marta Km 50'
        },
        reason: 'vehicle_problem',
        description: 'Problema mecánico menor, ya resuelto',
        status: 'resolved',
        resolved_at: new Date()
      }
    ]);
    console.log(`✅ ${emergencyAlerts.length} alertas de emergencia creadas\n`);

    // ==========================================
    // 7. CREAR VIAJES RECURRENTES
    // ==========================================
    console.log('🔄 Creando viajes recurrentes...');
    const recurringTrips = await RecurringTrip.insertMany([
      {
        driver_id: drivers[0]._id,
        origin: 'Bogotá',
        destination: 'Chía',
        days_of_week: [1, 3, 5], // Lunes, Miércoles, Viernes
        departure_time: '07:00',
        price: 15000,
        available_seats: 3,
        active: true,
        preferences: { pets_allowed: false, music_allowed: true, smoking_allowed: false }
      },
      {
        driver_id: drivers[1]._id,
        origin: 'Medellín',
        destination: 'Envigado',
        days_of_week: [1, 2, 3, 4, 5], // Lunes a Viernes
        departure_time: '06:30',
        price: 10000,
        available_seats: 4,
        active: true,
        preferences: { pets_allowed: true, music_allowed: true, smoking_allowed: false }
      }
    ]);
    console.log(`✅ ${recurringTrips.length} viajes recurrentes creados\n`);

   // RESUMEN FINAL
console.log('\n' + '='.repeat(50));
console.log('✅ SEED COMPLETADO EXITOSAMENTE');
console.log('='.repeat(50));
console.log(`📊 Resumen de datos creados:\n`);
console.log(`   👤 Conductores: ${drivers.length}`);
console.log(`   🚗 Viajes: ${trips.length}`);
console.log(`   ⭐ Reviews: ${reviews.length}`);
console.log(`   🔔 Notificaciones: ${notifications.length}`);
console.log(`   🏆 Rewards: ${rewards.length}`);
console.log(`   🚨 Alertas: ${emergencyAlerts.length}`);
console.log(`   🔄 Viajes Recurrentes: ${recurringTrips.length}`);
// console.log(`   📄 Verificaciones: ${verifications.length}`); // ← Comentar esto
console.log('='.repeat(50));


    // Verificar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Colecciones creadas:');
    collections.forEach(c => console.log(`   - ${c.name}`));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
};

// Ejecutar seed
seedDatabase();
