// controllers/controller-notification.mjs
import Notification from '../models/Notification.mjs';

// Obtener todas las notificaciones del usuario
export async function getNotifications(req, res) {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const user_id = req.user.id;
    
    const filter = { user_id };
    if (unread_only === 'true') {
      filter.read = false;
    }
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(filter);
    const unread_count = await Notification.countDocuments({ user_id, read: false });
    
    res.json({
      success: true,
      data: notifications,
      unread_count,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener notificaciones', error: error.message });
  }
}

// Marcar notificación como leída
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }
    
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al marcar notificación', error: error.message });
  }
}

// Marcar todas como leídas
export async function markAllAsRead(req, res) {
  try {
    const user_id = req.user.id;
    
    const result = await Notification.updateMany(
      { user_id, read: false },
      { read: true }
    );
    
    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      updated_count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al marcar notificaciones', error: error.message });
  }
}

// Eliminar notificación
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const notification = await Notification.findOneAndDelete({ _id: id, user_id });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }
    
    res.json({ success: true, message: 'Notificación eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar notificación', error: error.message });
  }
}
