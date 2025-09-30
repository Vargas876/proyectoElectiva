import { generateToken } from '../middleware/auth.mjs';
import Driver from '../models/Driver.mjs';

// Login de conductor
export async function login(req, res) {
    try {
        const { email, license_number } = req.body;

        if (!email || !license_number) {
            return res.status(400).json({
                success: false,
                message: 'Email y número de licencia son obligatorios'
            });
        }

        const driver = await Driver.findOne({ email, license_number });

        if (!driver) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const token = generateToken(driver._id);

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            token,
            driver: {
                id: driver._id,
                name: driver.name,
                email: driver.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en login',
            error: error.message
        });
    }

}
export async function verifyToken(req, res) {
    try {
        // El middleware ya verificó el token y agregó req.user
        const driver = await Driver.findById(req.user.id);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Conductor no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token válido',
            driver: {
                id: driver._id,
                name: driver.name,
                email: driver.email,
                phone: driver.phone,
                license_number: driver.license_number,
                rating: driver.rating,
                total_trips: driver.total_trips,
                status: driver.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al verificar token',
            error: error.message
        });
    }
}