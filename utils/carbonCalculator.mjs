export const calculateCarbonSaved = (distance_km, passengers) => {
    const CO2_PER_KM_CAR = 0.192; // kg CO2 por km para auto promedio
    const single_trips_emissions = distance_km * CO2_PER_KM_CAR * passengers;
    const carpool_emissions = distance_km * CO2_PER_KM_CAR;
    
    return {
      saved_kg: single_trips_emissions - carpool_emissions,
      trees_equivalent: (single_trips_emissions - carpool_emissions) / 21
    };
  };