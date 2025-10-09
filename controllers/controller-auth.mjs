import { generateToken } from '../middlewares/auth.mjs';
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

        
        const token = generateToken({ 
            id: driver._id.toString(), 
            email: driver.email,
            name: driver.name
        });

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            token,
            driver: {
                id: driver._id,
                name: driver.name,
                email: driver.email,
                phone: driver.phone,
                license_number: driver.license_number,
                rating: driver.rating,
                status: driver.status
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

// Verificar token 
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

//  OPCIONAL: Función de registro si quieres permitir auto-registro de conductores
export async function register(req, res) {
    try {
        const { name, email, phone, license_number } = req.body;

        // Validación
        if (!name || !email || !phone || !license_number) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Verificar si ya existe
        const existingDriver = await Driver.findOne({ 
            $or: [{ email }, { license_number }] 
        });

        if (existingDriver) {
            return res.status(400).json({
                success: false,
                message: 'El email o número de licencia ya están registrados'
            });
        }

        // Crear nuevo conductor
        const newDriver = new Driver({
            name,
            email,
            phone,
            license_number
        });

        const savedDriver = await newDriver.save();

        // Generar token
        const token = generateToken({ 
            id: savedDriver._id.toString(),
            email: savedDriver.email,
            name: savedDriver.name
        });

        res.status(201).json({
            success: true,
            message: 'Conductor registrado exitosamente',
            token,
            driver: {
                id: savedDriver._id,
                name: savedDriver.name,
                email: savedDriver.email,
                phone: savedDriver.phone,
                license_number: savedDriver.license_number
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al registrar conductor',
            error: error.message
        });
    }
}