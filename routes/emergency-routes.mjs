// routes/emergency-routes.mjs
import express from 'express';
import { authenticateToken } from '../middlewares/auth.mjs';
import Driver from '../models/Driver.mjs';
import EmergencyAlert from '../models/EmergencyAlert.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - latitude
 *         - longitude
 *       properties:
 *         latitude:
 *           type: number
 *           format: float
 *           description: Latitud de la ubicación
 *           example: 10.9878
 *         longitude:
 *           type: number
 *           format: float
 *           description: Longitud de la ubicación
 *           example: -74.7889
 *         address:
 *           type: string
 *           description: Dirección textual (opcional)
 *           example: Vía Barranquilla - Santa Marta Km 50
 * 
 *     EmergencyAlert:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la alerta
 *           example: 507f1f77bcf86cd799439011
 *         trip_id:
 *           type: string
 *           description: ID del viaje asociado
 *         driver_id:
 *           type: string
 *           description: ID del conductor que activó la alerta
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         reason:
 *           type: string
 *           enum: [accident, breakdown, medical, safety_concern, other]
 *           description: Razón de la emergencia
 *         description:
 *           type: string
 *           description: Descripción detallada de la emergencia
 *         status:
 *           type: string
 *           enum: [active, in_progress, resolved, cancelled]
 *           description: Estado actual de la alerta
 *         emergency_contacts_notified:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               contact_id:
 *                 type: string
 *               notified_at:
 *                 type: string
 *                 format: date-time
 *               method:
 *                 type: string
 *                 enum: [sms, call, email]
 *         resolved_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de resolución
 *         resolved_by:
 *           type: string
 *           description: ID de quien resolvió la alerta
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     SOSInput:
 *       type: object
 *       required:
 *         - location
 *         - reason
 *       properties:
 *         trip_id:
 *           type: string
 *           description: ID del viaje en curso (opcional)
 *           example: 507f1f77bcf86cd799439011
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         reason:
 *           type: string
 *           enum: [accident, breakdown, medical, safety_concern, other]
 *           description: Razón de la emergencia
 *           example: breakdown
 *         description:
 *           type: string
 *           description: Descripción detallada de la emergencia
 *           example: Problema mecánico en la vía, necesito asistencia
 */

/**
 * @swagger
 * tags:
 *   name: Emergency
 *   description: Sistema de alertas de emergencia (SOS)
 */

/**
 * @swagger
 * /api/emergency/sos:
 *   post:
 *     summary: Activar alerta SOS
 *     tags: [Emergency]
 *     description: Activa una alerta de emergencia y notifica a contactos de emergencia y autoridades
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SOSInput'
 *           example:
 *             trip_id: 507f1f77bcf86cd799439011
 *             location:
 *               latitude: 10.9878
 *               longitude: -74.7889
 *               address: Vía Barranquilla - Santa Marta Km 50
 *             reason: breakdown
 *             description: Problema mecánico en la vía, el vehículo no arranca
 *     responses:
 *       201:
 *         description: Alerta SOS activada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Alerta SOS activada
 *                 data:
 *                   $ref: '#/components/schemas/EmergencyAlert'
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Faltan campos obligatorios
 *       401:
 *         description: No autorizado - Token no válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /api/emergency/alerts:
 *   get:
 *     summary: Obtener todas las alertas de emergencia
 *     tags: [Emergency]
 *     description: Lista todas las alertas de emergencia con filtros opcionales
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, in_progress, resolved, cancelled]
 *         description: Filtrar por estado de la alerta
 *         example: active
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de alertas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EmergencyAlert'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /api/emergency/alerts/{id}/resolve:
 *   put:
 *     summary: Resolver una alerta de emergencia
 *     tags: [Emergency]
 *     description: Marca una alerta como resuelta y registra quién la resolvió
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la alerta de emergencia
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Alerta resuelta exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Alerta resuelta
 *                 data:
 *                   $ref: '#/components/schemas/EmergencyAlert'
 *             example:
 *               success: true
 *               message: Alerta resuelta
 *               data:
 *                 _id: 507f1f77bcf86cd799439011
 *                 status: resolved
 *                 resolved_at: 2025-10-09T18:00:00.000Z
 *                 resolved_by: 507f1f77bcf86cd799439012
 *       404:
 *         description: Alerta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Alerta no encontrada
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
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
