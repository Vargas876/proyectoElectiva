// middlewares/auth.mjs
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token.',
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token inválido o expirado.',
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Alias para mantener compatibilidad
export const verifyToken = authenticateToken;

export default authenticateToken;
