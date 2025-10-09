import Driver from '../models/Driver.mjs';
import Review from '../models/Review.mjs';
import Trip from '../models/Trip.mjs';

// Obtener reviews de un conductor
export const getReviewsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ reviewed_driver_id: driverId })
      .populate('reviewer_id', 'name email')
      .populate('trip_id', 'origin destination departure_time')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ reviewed_driver_id: driverId });

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error en getReviewsByDriver:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener reviews'
    });
  }
};

// Obtener todos los reviews
export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate('reviewer_id', 'name email')
      .populate('reviewed_driver_id', 'name email')
      .populate('trip_id', 'origin destination')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments();

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error en getAllReviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener reviews'
    });
  }
};

// Crear review
export const createReview = async (req, res) => {
  try {
    const { trip_id, reviewed_driver_id, rating, comment, tags } = req.body;
    const reviewer_id = req.user.id;

    // Validaciones
    if (!trip_id || !reviewed_driver_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    // Verificar que el viaje existe y está completado
    const trip = await Trip.findById(trip_id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    if (trip.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes calificar viajes completados'
      });
    }

    // Crear review
    const review = await Review.create({
      trip_id,
      reviewer_id,
      reviewed_driver_id,
      rating,
      comment,
      tags: tags || []
    });

    // Actualizar rating del conductor
    await updateDriverRating(reviewed_driver_id);

    return res.status(201).json({
      success: true,
      message: 'Review creado exitosamente',
      data: review
    });
  } catch (error) {
    console.error('Error en createReview:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear review'
    });
  }
};

// Función auxiliar para actualizar rating del conductor
async function updateDriverRating(driverId) {
  try {
    const reviews = await Review.find({ reviewed_driver_id: driverId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      await Driver.findByIdAndUpdate(driverId, {
        rating: Math.round(avgRating * 10) / 10
      });
    }
  } catch (error) {
    console.error('Error al actualizar rating:', error);
  }
}

export default {
  getAllReviews,
  getReviewsByDriver,
  createReview
};
