// middlewares/errorHandler.mjs - MEJORAR:
export const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);
    
    // Errores de Mongoose
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }
    
    // Error por defecto
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };