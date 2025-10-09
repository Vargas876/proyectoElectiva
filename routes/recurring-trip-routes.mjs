// routes/recurring-trip-routes.mjs
import express from 'express';
import { authenticateToken } from '../middlewares/auth.mjs'; // ✅ CORREGIDO
import RecurringTrip from '../models/RecurringTrip.mjs';

const router = express.Router()

// Crear viaje recurrente
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { origin, destination, days_of_week, departure_time, price, available_seats, preferences } = req.body;
    const driver_id = req.user.id;
    
    const recurringTrip = new RecurringTrip({
      driver_id,
      origin,
      destination,
      days_of_week,
      departure_time,
      price,
      available_seats,
      preferences
    });
    
    await recurringTrip.save();
    
    res.status(201).json({
      success: true,
      message: 'Viaje recurrente creado',
      data: recurringTrip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear viaje recurrente',
      error: error.message
    });
  }
});

// Obtener viajes recurrentes del conductor
router.get('/', authenticateToken, async (req, res) => {
  try {
    const driver_id = req.user.id;
    
    const recurringTrips = await RecurringTrip.find({ driver_id })
      .populate('driver_id', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: recurringTrips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener viajes recurrentes',
      error: error.message
    });
  }
});

// Actualizar viaje recurrente
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const driver_id = req.user.id;
    const updates = req.body;
    
    const recurringTrip = await RecurringTrip.findOneAndUpdate(
      { _id: id, driver_id },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!recurringTrip) {
      return res.status(404).json({
        success: false,
        message: 'Viaje recurrente no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Viaje recurrente actualizado',
      data: recurringTrip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar viaje recurrente',
      error: error.message
    });
  }
});

// Eliminar viaje recurrente
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const driver_id = req.user.id;
    
    const recurringTrip = await RecurringTrip.findOneAndDelete({ _id: id, driver_id });
    
    if (!recurringTrip) {
      return res.status(404).json({
        success: false,
        message: 'Viaje recurrente no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Viaje recurrente eliminado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar viaje recurrente',
      error: error.message
    });
  }
});

export default router;
