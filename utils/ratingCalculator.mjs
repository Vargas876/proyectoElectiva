/**
 * Calcula el rating promedio de un conductor basado en sus calificaciones
 * @param {Array<number>} ratings - Array de calificaciones
 * @returns {number} - Promedio redondeado a 1 decimal
 */
export const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) {
        return 5.0; // Rating por defecto para conductores nuevos
    }
    
    // Filtrar valores inválidos
    const validRatings = ratings.filter(r => !isNaN(r) && r >= 0 && r <= 5);
    
    if (validRatings.length === 0) {
        return 5.0;
    }
    
    const sum = validRatings.reduce((acc, rating) => acc + parseFloat(rating), 0);
    const average = sum / validRatings.length;
    
    // Redondear a 1 decimal
    return Math.round(average * 10) / 10;
};

/**
 * Actualiza el rating de un conductor con una nueva calificación
 * @param {number} currentRating - Rating actual del conductor
 * @param {number} totalTrips - Total de viajes realizados
 * @param {number} newRating - Nueva calificación recibida
 * @returns {number} - Nuevo rating calculado
 */
export const updateDriverRating = (currentRating, totalTrips, newRating) => {
    try {
        // Validar entradas
        const validatedNewRating = validateRating(newRating);
        
        if (totalTrips <= 0) {
            return validatedNewRating;
        }
        
        // Calcular el rating acumulado previo
        const previousTotal = currentRating * totalTrips;
        
        // Agregar la nueva calificación
        const newTotal = previousTotal + validatedNewRating;
        
        // Calcular nuevo promedio
        const newAverage = newTotal / (totalTrips + 1);
        
        // Redondear a 1 decimal
        return Math.round(newAverage * 10) / 10;
    } catch (error) {
        console.error('Error updating driver rating:', error);
        throw error;
    }
};

/**
 * Valida que el rating esté en el rango correcto (0-5)
 * @param {number|string} rating - Rating a validar
 * @returns {number} - Rating validado
 * @throws {Error} - Si el rating es inválido
 */
export const validateRating = (rating) => {
    const numRating = parseFloat(rating);
    
    if (isNaN(numRating)) {
        throw new Error('El rating debe ser un número');
    }
    
    if (numRating < 0 || numRating > 5) {
        throw new Error('El rating debe estar entre 0 y 5');
    }
    
    // Redondear a 1 decimal
    return Math.round(numRating * 10) / 10;
};

/**
 * Obtiene una descripción textual del rating
 * @param {number} rating - Rating numérico
 * @returns {string} - Descripción del rating
 */
export const getRatingDescription = (rating) => {
    if (rating >= 4.5) return 'Excelente';
    if (rating >= 4.0) return 'Muy Bueno';
    if (rating >= 3.5) return 'Bueno';
    if (rating >= 3.0) return 'Regular';
    if (rating >= 2.0) return 'Malo';
    return 'Muy Malo';
};

/**
 * Calcula estadísticas de ratings
 * @param {Array<number>} ratings - Array de todas las calificaciones
 * @returns {Object} - Objeto con estadísticas
 */
export const getRatingStatistics = (ratings) => {
    if (!ratings || ratings.length === 0) {
        return {
            average: 5.0,
            total: 0,
            min: 0,
            max: 0,
            description: 'Sin calificaciones'
        };
    }
    
    const validRatings = ratings.filter(r => !isNaN(r) && r >= 0 && r <= 5);
    
    if (validRatings.length === 0) {
        return {
            average: 5.0,
            total: 0,
            min: 0,
            max: 0,
            description: 'Sin calificaciones válidas'
        };
    }
    
    const average = calculateAverageRating(validRatings);
    const min = Math.min(...validRatings);
    const max = Math.max(...validRatings);
    
    return {
        average,
        total: validRatings.length,
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        description: getRatingDescription(average)
    };
};

// Exportación por defecto
export default {
    calculateAverageRating,
    updateDriverRating,
    validateRating,
    getRatingDescription,
    getRatingStatistics
};