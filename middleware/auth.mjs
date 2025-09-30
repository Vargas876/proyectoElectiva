import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_segura_2025';

// Middleware para verificar JWT
export const verifyToken = (req, res, next) => {
    try {
        // 1. Extraer token del header
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }
         // 2. Verificar token con la MISMA clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);
        // 3. Si es válido, agregar datos del usuario al request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
};

// Generar token
export const generateToken = (driverId) => {
    return jwt.sign(
        { id: driverId, type: 'driver' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};