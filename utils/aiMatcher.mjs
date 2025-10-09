export const findBestMatches = async (userId, preferences) => {
    const drivers = await Driver.find({ status: 'available' });
    
    // Calcular score basado en:
    // - Proximidad de rutas
    // - Rating del conductor
    // - Preferencias de usuario (música, mascotas, conversación)
    // - Historial de viajes compartidos
    
    return drivers
      .map(driver => ({
        driver,
        score: calculateCompatibilityScore(driver, preferences)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  };
  