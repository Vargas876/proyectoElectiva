// Backend: controllers/controller-emergency.mjs
export const triggerSOS = async (req, res) => {
    const { trip_id, location, reason } = req.body;
    
    // Notificar autoridades
    // Enviar SMS a contactos de emergencia
    // Registrar en base de datos
    // Compartir ubicación en tiempo real
    
    await EmergencyAlert.create({
      trip_id,
      driver_id: req.user.id,
      location,
      reason,
      timestamp: new Date()
    });
    
    // Enviar notificación push
    await sendPushNotification(driver.emergency_contacts, {
      title: 'Alerta SOS',
      body: `${driver.name} ha activado una alerta de emergencia`
    });
    
    res.json({ success: true, message: 'Alerta enviada' });
  };
  