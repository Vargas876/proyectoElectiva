export function calculateTripRating(tripData) {
    const {
        estimated_duration_minutes,
        actual_duration_minutes,
        weather_condition,
        time_of_day,
        distance_km,
        driver_current_rating
    } = tripData;

    // 1. FACTOR PUNTUALIDAD (30% del rating)
    const delay_minutes = actual_duration_minutes - estimated_duration_minutes;
    let punctuality_score;
    
    if (delay_minutes <= 0) punctuality_score = 5.0; // Llegó antes o a tiempo
    else if (delay_minutes <= 5) punctuality_score = 4.5; // 5 min tarde
    else if (delay_minutes <= 10) punctuality_score = 4.0; // 10 min tarde
    else if (delay_minutes <= 15) punctuality_score = 3.5; // 15 min tarde
    else punctuality_score = 2.5; // Muy tarde

    // 2. FACTOR EFICIENCIA DE RUTA (25% del rating)
    const expected_speed = distance_km / (estimated_duration_minutes / 60);
    const actual_speed = distance_km / (actual_duration_minutes / 60);
    const efficiency_ratio = actual_speed / expected_speed;
    
    let route_efficiency_score;
    if (efficiency_ratio >= 0.9) route_efficiency_score = 5.0;
    else if (efficiency_ratio >= 0.8) route_efficiency_score = 4.5;
    else if (efficiency_ratio >= 0.7) route_efficiency_score = 4.0;
    else if (efficiency_ratio >= 0.6) route_efficiency_score = 3.5;
    else route_efficiency_score = 3.0;

    // 3. FACTOR CONDICIONES CLIMÁTICAS/TRÁFICO (15% del rating)
    const weather_multiplier = {
        'excellent': 1.0,
        'good': 0.95,
        'rainy': 0.85,
        'heavy_traffic': 0.8
    };

    // 4. FACTOR HORA DEL DÍA (10% del rating) 
    const time_multiplier = {
        'morning': 1.0,   // Mejor servicio en la mañana
        'afternoon': 0.95, // Algo de tráfico
        'evening': 0.9,   // Hora pico
        'night': 0.85     // Noche puede ser más riesgoso
    };

    // 5. FACTOR EXPERIENCIA DEL CONDUCTOR (20% del rating)
    const driver_experience_bonus = Math.min(0.5, driver_current_rating - 4.0); // Max 0.5 bonus

    // 🎲 SIMULACIÓN DE FACTORES ALEATORIOS (comportamiento del conductor)
    const driver_behavior = 3.5 + Math.random() * 1.5; // 3.5 - 5.0
    const vehicle_condition = 3.8 + Math.random() * 1.2; // 3.8 - 5.0
    
    // 📊 CÁLCULO FINAL PONDERADO
    const base_rating = (
        punctuality_score * 0.30 +
        route_efficiency_score * 0.25 +
        driver_behavior * 0.20 +
        vehicle_condition * 0.15 +
        4.5 * 0.10 // Factor base
    );

    // Aplicar multiplicadores
    const final_rating = Math.min(5.0, Math.max(1.0, 
        base_rating * 
        weather_multiplier[weather_condition] * 
        time_multiplier[time_of_day] + 
        driver_experience_bonus
    ));

    // Redondear a 1 decimal
    const rounded_rating = Math.round(final_rating * 10) / 10;

    return {
        final_rating: rounded_rating,
        factors: {
            punctuality: Math.round(punctuality_score * 10) / 10,
            route_efficiency: Math.round(route_efficiency_score * 10) / 10,
            driver_behavior: Math.round(driver_behavior * 10) / 10,
            vehicle_condition: Math.round(vehicle_condition * 10) / 10,
            overall_experience: rounded_rating
        },
        analysis: {
            delay_minutes,
            weather_impact: weather_multiplier[weather_condition],
            time_impact: time_multiplier[time_of_day],
            driver_bonus: driver_experience_bonus
        }
    };
}

// 🎯 Función para simular duración real del viaje
export function simulateActualDuration(estimated_minutes, weather, time_of_day) {
    let variation_factor = 1.0;
    
    // Factores que afectan la duración
    const weather_impact = {
        'excellent': 0.95, // Puede ser más rápido
        'good': 1.0,
        'rainy': 1.25,     // 25% más lento
        'heavy_traffic': 1.4 // 40% más lento
    };
    
    const time_impact = {
        'morning': 1.0,
        'afternoon': 1.1,  // 10% más lento
        'evening': 1.3,    // 30% más lento (hora pico)
        'night': 0.9       // 10% más rápido (menos tráfico)
    };
    
    variation_factor = weather_impact[weather] * time_impact[time_of_day];
    
    // Agregar variación aleatoria (-10% a +20%)
    const random_variation = 0.9 + Math.random() * 0.3;
    
    return Math.round(estimated_minutes * variation_factor * random_variation);
}