// middlewares/errorHandler.mjs

// Middleware para manejar rutas no encontradas (404)
export const notFound = (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  };
  
  // Middleware para manejar errores generales
  export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    const statusCode = err.status || err.statusCode || 500;
    
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        error: err.message,
        stack: err.stack
      })
    });
  };
  