// controllers/controller-notifications.mjs
import Notification from '../models/Notification.mjs';

export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user_id: userId });

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error en getAllNotifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones'
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error en markAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al marcar como leída'
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user_id: userId, read: false },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('Error en markAllAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al marcar todas como leídas'
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user_id: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    console.error('Error en deleteNotification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar notificación'
    });
  }
};

export default {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
