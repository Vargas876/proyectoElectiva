import jwt from "jsonwebtoken";
import Driver from "../models/Driver.mjs";

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      license_number,
      vehicle_type,
      vehicle_plate,
      vehicle_capacity,
      vehicle_model,
      vehicle_year,
      vehicle_color,
    } = req.body;

    if (!name || !email || !phone || !license_number || !vehicle_type) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos obligatorios deben ser completados",
      });
    }

    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    const existingLicense = await Driver.findOne({ license_number });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: "El número de licencia ya está registrado",
      });
    }

    const driver = await Driver.create({
      name,
      email,
      phone,
      license_number,
      vehicle_type,
      vehicle_plate,
      vehicle_capacity: vehicle_capacity || 4,
      vehicle_model,
      vehicle_year,
      vehicle_color,
      status: "available",
      rating: 5.0,
      total_trips: 0,
      completed_trips: 0,
      level: 1,
      points: 0,
    });

    const token = jwt.sign(
      { id: driver._id, email: driver.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Conductor registrado exitosamente",
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicle_type: driver.vehicle_type,
        rating: driver.rating,
        level: driver.level,
      },
    });
  } catch (error) {
    console.error("Error en register:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, license_number } = req.body;

    if (!email || !license_number) {
      return res.status(400).json({
        success: false,
        message: "Email y número de licencia son obligatorios",
      });
    }

    const driver = await Driver.findOne({ email, license_number });

    if (!driver) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const token = jwt.sign(
      { id: driver._id, email: driver.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        vehicle_capacity: driver.vehicle_capacity,
        rating: driver.rating,
        total_trips: driver.total_trips,
        level: driver.level,
        points: driver.points,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout exitoso",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    // El token ya fue verificado por el middleware authenticateToken
    // req.user contiene la información del token decodificado
    
    // Buscar el conductor actualizado en la DB
    const driver = await Driver.findById(req.user.id).select('-__v');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Conductor no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token válido",
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        vehicle_capacity: driver.vehicle_capacity,
        rating: driver.rating,
        total_trips: driver.total_trips,
        level: driver.level,
        points: driver.points,
        status: driver.status,
      },
    });
  } catch (error) {
    console.error("Error en verifyToken:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// FUNCIÓN getCurrentUser 
export const getCurrentUser = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id).select('-__v');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Conductor no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        license_number: driver.license_number,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        vehicle_capacity: driver.vehicle_capacity,
        vehicle_model: driver.vehicle_model,
        vehicle_year: driver.vehicle_year,
        vehicle_color: driver.vehicle_color,
        rating: driver.rating,
        total_trips: driver.total_trips,
        completed_trips: driver.completed_trips,
        cancelled_trips: driver.cancelled_trips,
        level: driver.level,
        points: driver.points,
        status: driver.status,
        bio: driver.bio,
        badges: driver.badges,
        is_trusted: driver.is_trusted,
      },
    });
  } catch (error) {
    console.error("Error en getCurrentUser:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
