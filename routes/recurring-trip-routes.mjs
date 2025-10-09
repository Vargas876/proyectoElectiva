// routes/recurring-trip-routes.mjs
import express from 'express';
import { authenticateToken } from '../middlewares/auth.mjs';
import RecurringTrip from '../models/RecurringTrip.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TripPreferences:
 *       type: object
 *       properties:
 *         pets_allowed:
 *           type: boolean
 *           description: Permite mascotas en el viaje
 *           example: false
 *         music_allowed:
 *           type: boolean
 *           description: Permite música durante el viaje
 *           example: true
 *         smoking_allowed:
 *           type: boolean
 *           description: Permite fumar
 *           example: false
 *         chat_allowed:
 *           type: boolean
 *           description: Permite conversación
 *           example: true
 * 
 *     RecurringTrip:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del viaje recurrente
 *           example: 507f1f77bcf86cd799439011
 *         driver_id:
 *           type: string
 *           description: ID del conductor
 *           example: 507f1f77bcf86cd799439012
 *         origin:
 *           type: string
 *           description: Ciudad o punto de origen
 *           example: Bogotá
 *         destination:
 *           type: string
 *           description: Ciudad o punto de destino
 *           example: Chía
 *         days_of_week:
 *           type: array
 *           items:
 *             type: integer
 *             minimum: 0
 *             maximum: 6
 *           description: Días de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
 *           example: [1, 3, 5]
 *         departure_time:
 *           type: string
 *           format: time
 *           description: Hora de salida (formato HH:MM)
 *           example: "07:00"
 *         price:
 *           type: number
 *           format: float
 *           description: Precio por persona
 *           example: 15000
 *         available_seats:
 *           type: integer
 *           description: Asientos disponibles
 *           example: 3
 *         active:
 *           type: boolean
 *           description: Indica si el viaje recurrente está activo
 *           example: true
 *         preferences:
 *           $ref: '#/components/schemas/TripPreferences'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     RecurringTripInput:
 *       type: object
 *       required:
 *         - origin
 *         - destination
 *         - days_of_week
 *         - departure_time
 *         - price
 *         - available_seats
 *       properties:
 *         origin:
 *           type: string
 *           description: Ciudad o punto de origen
 *           example: Bogotá
 *         destination:
 *           type: string
 *           description: Ciudad o punto de destino
 *           example: Chía
 *         days_of_week:
 *           type: array
 *           items:
 *             type: integer
 *             minimum: 0
 *             maximum: 6
 *           description: Días de la semana (0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado)
 *           example: [1, 3, 5]
 *         departure_time:
 *           type: string
 *           format: time
 *           description: Hora de salida en formato HH:MM (24 horas)
 *           example: "07:00"
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Precio por persona en pesos colombianos
 *           example: 15000
 *         available_seats:
 *           type: integer
 *           minimum: 1
 *           description: Número de asientos disponibles
 *           example: 3
 *         preferences:
 *           $ref: '#/components/schemas/TripPreferences'
 */

/**
 * @swagger
 * tags:
 *   name: Recurring Trips
 *   description: Gestión de viajes recurrentes (rutas habituales)
 */

/**
 * @swagger
 * /api/recurring-trips:
 *   post:
 *     summary: Crear un viaje recurrente
 *     tags: [Recurring Trips]
 *     description: Crea un nuevo viaje recurrente que se repetirá en los días especificados
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecurringTripInput'
 *           example:
 *             origin: Bogotá
 *             destination: Chía
 *             days_of_week: [1, 3, 5]
 *             departure_time: "07:00"
 *             price: 15000
 *             available_seats: 3
 *             preferences:
 *               pets_allowed: false
 *               music_allowed: true
 *               smoking_allowed: false
 *               chat_allowed: true
 *     responses:
 *       201:
 *         description: Viaje recurrente creado exitosamente
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
 *                   example: Viaje recurrente creado
 *                 data:
 *                   $ref: '#/components/schemas/RecurringTrip'
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

/**
 * @swagger
 * /api/recurring-trips:
 *   get:
 *     summary: Obtener viajes recurrentes del conductor
 *     tags: [Recurring Trips]
 *     description: Obtiene todos los viajes recurrentes del conductor autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de viajes recurrentes obtenida exitosamente
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
 *                     $ref: '#/components/schemas/RecurringTrip'
 *             example:
 *               success: true
 *               data:
 *                 - _id: 507f1f77bcf86cd799439011
 *                   driver_id:
 *                     _id: 507f1f77bcf86cd799439012
 *                     name: Carlos Rodríguez
 *                     email: carlos@email.com
 *                     phone: +57 300 123 4567
 *                   origin: Bogotá
 *                   destination: Chía
 *                   days_of_week: [1, 3, 5]
 *                   departure_time: "07:00"
 *                   price: 15000
 *                   available_seats: 3
 *                   active: true
 *                   preferences:
 *                     pets_allowed: false
 *                     music_allowed: true
 *                     smoking_allowed: false
 *                   createdAt: 2025-10-09T18:00:00.000Z
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

/**
 * @swagger
 * /api/recurring-trips/{id}:
 *   put:
 *     summary: Actualizar un viaje recurrente
 *     tags: [Recurring Trips]
 *     description: Actualiza la información de un viaje recurrente existente
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del viaje recurrente
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               days_of_week:
 *                 type: array
 *                 items:
 *                   type: integer
 *               departure_time:
 *                 type: string
 *               price:
 *                 type: number
 *               available_seats:
 *                 type: integer
 *               active:
 *                 type: boolean
 *               preferences:
 *                 $ref: '#/components/schemas/TripPreferences'
 *           example:
 *             departure_time: "07:30"
 *             price: 17000
 *             available_seats: 4
 *             active: true
 *     responses:
 *       200:
 *         description: Viaje recurrente actualizado exitosamente
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
 *                   example: Viaje recurrente actualizado
 *                 data:
 *                   $ref: '#/components/schemas/RecurringTrip'
 *       404:
 *         description: Viaje recurrente no encontrado
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
 *                   example: Viaje recurrente no encontrado
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

/**
 * @swagger
 * /api/recurring-trips/{id}:
 *   delete:
 *     summary: Eliminar un viaje recurrente
 *     tags: [Recurring Trips]
 *     description: Elimina permanentemente un viaje recurrente
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del viaje recurrente a eliminar
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Viaje recurrente eliminado exitosamente
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
 *                   example: Viaje recurrente eliminado
 *       404:
 *         description: Viaje recurrente no encontrado
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
 *                   example: Viaje recurrente no encontrado
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
