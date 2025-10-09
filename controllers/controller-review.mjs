// controllers/controller-review.mjs
import Driver from '../models/Driver.mjs';
import Notification from '../models/Notification.mjs';
import Review from '../models/Review.mjs';
import Trip from '../models/Trip.mjs';

// Crear review
export async function createReview(req, res) {
  try {
    const { trip_id, reviewed_driver_id, rating, comment, tags } = req.body;
    const reviewer_id = req.user.id;
    
    // Verificar que el viaje existe y está completado
    const trip = await Trip.findById(trip_id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Viaje no encontrado' });
    }
    
    if (trip.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Solo se pueden calificar viajes completados' });
    }
    
    // Crear review
    const review = new Review({
      trip_id,
      reviewer_id,
      reviewed_driver_id,
      rating,
      comment,
      tags: tags || []
    });
    
    await review.save();
    
    // Actualizar rating del conductor
    const driver = await Driver.findById(reviewed_driver_id);
    if (driver) {
      await driver.updateRating(rating);
    }
    
    // Crear notificación
    await Notification.create({
      user_id: reviewed_driver_id,
      type: 'new_review',
      title: 'Nueva calificación recibida',
      message: `Has recibido una calificación de ${rating} estrellas`,
      data: { review_id: review._id, rating },
      link: `/reviews/${review._id}`
    });
    
    const populatedReview = await Review.findById(review._id)
      .populate('reviewer_id', 'name email')
      .populate('reviewed_driver_id', 'name rating');
    
    res.status(201).json({
      success: true,
      message: 'Review creado exitosamente',
      data: populatedReview
    });
  } catch (error) {
    if (error.message === 'Este viaje ya ha sido calificado') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error al crear review', error: error.message });
  }
}

// Obtener reviews de un conductor
export async function getReviewsByDriver(req, res) {
  try {
    const { driverId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ reviewed_driver_id: driverId })
      .populate('reviewer_id', 'name profile_picture')
      .populate('trip_id', 'origin destination departure_time')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments({ reviewed_driver_id: driverId });
    
    // Calcular estadísticas
    const stats = await Review.aggregate([
      { $match: { reviewed_driver_id: mongoose.Types.ObjectId(driverId) } },
      {
        $group: {
          _id: null,
          avg_rating: { $avg: '$rating' },
          total_reviews: { $sum: 1 },
          rating_distribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener reviews', error: error.message });
  }
}

// Obtener review de un viaje
export async function getReviewByTrip(req, res) {
  try {
    const { tripId } = req.params;
    
    const review = await Review.findOne({ trip_id: tripId })
      .populate('reviewer_id', 'name profile_picture')
      .populate('reviewed_driver_id', 'name rating');
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review no encontrado' });
    }
    
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener review', error: error.message });
  }
}
