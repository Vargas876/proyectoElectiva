import { generateToken } from '../middlewares/auth.mjs';
import User from '../models/User.mjs';

// Login
export async function login(req, res) {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email y teléfono son obligatorios'
            });
        }

        const user = await User.findOne({ email, phone });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const token = generateToken({ 
            id: user._id.toString(), 
            email: user.email,
            name: user.name,
            role: user.role
        });

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                rating: user.rating,
                status: user.status,
                license_number: user.license_number
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

// Registro
export async function register(req, res) {
    try {
        const { name, email, phone, role, license_number } = req.body;

        // Validación
        if (!name || !email || !phone || !role) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Si es conductor, validar licencia
        if (role === 'driver' && !license_number) {
            return res.status(400).json({
                success: false,
                message: 'El número de licencia es obligatorio para conductores'
            });
        }

        // Verificar si ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Crear nuevo usuario
        const newUser = new User({
            name,
            email,
            phone,
            role,
            license_number: role === 'driver' ? license_number : undefined
        });

        const savedUser = await newUser.save();

        // Generar token
        const token = generateToken({ 
            id: savedUser._id.toString(),
            email: savedUser.email,
            name: savedUser.name,
            role: savedUser.role
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                phone: savedUser.phone,
                role: savedUser.role,
                rating: savedUser.rating
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
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
}

// Verificar token
export async function verifyToken(req, res) {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token válido',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                rating: user.rating,
                status: user.status,
                license_number: user.license_number
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