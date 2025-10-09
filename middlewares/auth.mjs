// middlewares/auth.mjs
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token inválido'
        });
      }

      // ✅ AGREGAR EL USUARIO A req.user
      req.user = user;
      next(); // ← IMPORTANTE: Llamar next() para continuar
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en autenticación'
    });
  }
};

export default authenticateToken;
