// routes/emergency-routes.mjs
import express from 'express';
import { authenticateToken } from '../middlewares/auth.mjs'; // ✅ CORREGIDO
import Driver from '../models/Driver.mjs';
import EmergencyAlert from '../models/EmergencyAlert.mjs';

const router = express.Router();

// Activar SOS
router.post('/sos', authenticateToken, async (req, res) => {
  try {
    const { trip_id, location, reason, description } = req.body;
    const driver_id = req.user.id;
    
    const alert = new EmergencyAlert({
      trip_id,
      driver_id,
      location,
      reason,
      description
    });
    
    await alert.save();
    
    // Obtener información del conductor
    const driver = await Driver.findById(driver_id);
    
    // Emitir evento de Socket.IO
    const io = req.app.get('io');
    io.emit('sos-alert', {
      alert_id: alert._id,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone
      },
      location,
      reason,
      timestamp: alert.createdAt
    });
    
    // Crear notificación para contactos de emergencia
    if (driver.emergency_contacts && driver.emergency_contacts.length > 0) {
      for (const contact of driver.emergency_contacts) {
        // Aquí integrarías servicio de SMS/llamadas
        console.log(`Notificando a ${contact.name}: ${contact.phone}`);
        
        alert.emergency_contacts_notified.push({
          contact_id: contact._id,
          notified_at: new Date(),
          method: 'sms'
        });
      }
      await alert.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Alerta SOS activada',
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al activar SOS',
      error: error.message
    });
  }
});

// Obtener alertas
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    const alerts = await EmergencyAlert.find(filter)
      .populate('driver_id', 'name phone email')
      .populate('trip_id', 'origin destination')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await EmergencyAlert.countDocuments(filter);
    
    res.json({
      success: true,
      data: alerts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
});

// Resolver alerta
router.put('/alerts/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const resolved_by = req.user.id;
    
    const alert = await EmergencyAlert.findByIdAndUpdate(
      id,
      {
        status: 'resolved',
        resolved_at: new Date(),
        resolved_by
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Alerta resuelta',
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al resolver alerta',
      error: error.message
    });
  }
});

export default router;
