// controllers/controller-auth.mjs (actualizado)
import { generateToken } from '../middlewares/auth.mjs';
import User from '../models/User.mjs';

export async function register(req, res) {
    try {
        const { name, email, phone, role, license_number } = req.body;

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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        const newUser = new User({
            name,
            email,
            phone,
            role,
            license_number: role === 'driver' ? license_number : undefined
        });

        const savedUser = await newUser.save();

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
                role: savedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
}

export async function login(req, res) {
    try {
        const { email, phone } = req.body;

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
                rating: user.rating
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