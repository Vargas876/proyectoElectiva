// routes/verification-routes.mjs
// routes/verification-routes.mjs
import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middlewares/auth.mjs'; // ✅ CORREGIDO
import Verification from '../models/Verification.mjs';

const router = express.Router();

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/verification/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG) o PDF'));
    }
  }
});

// Solicitar verificación (crear registro inicial)
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const driver_id = req.user.id;
    
    let verification = await Verification.findOne({ driver_id });
    
    if (verification) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una solicitud de verificación'
      });
    }
    
    verification = new Verification({ driver_id });
    await verification.save();
    
    res.status(201).json({
      success: true,
      message: 'Solicitud de verificación creada',
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al solicitar verificación',
      error: error.message
    });
  }
});

// Subir documento
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    const driver_id = req.user.id;
    const { document_type } = req.body; // 'id_card', 'driver_license', 'vehicle_registration', 'background_check'
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }
    
    let verification = await Verification.findOne({ driver_id });
    
    if (!verification) {
      verification = new Verification({ driver_id });
    }
    
    // Actualizar el documento correspondiente
    const file_url = `/uploads/verification/${req.file.filename}`;
    
    if (document_type === 'id_card') {
      verification.documents.id_card.file_url = file_url;
      verification.documents.id_card.uploaded_at = new Date();
      verification.documents.id_card.status = 'pending';
    } else if (document_type === 'driver_license') {
      verification.documents.driver_license.file_url = file_url;
      verification.documents.driver_license.uploaded_at = new Date();
      verification.documents.driver_license.status = 'pending';
      verification.documents.driver_license.license_number = req.body.license_number;
    } else if (document_type === 'vehicle_registration') {
      verification.documents.vehicle_registration.file_url = file_url;
      verification.documents.vehicle_registration.uploaded_at = new Date();
      verification.documents.vehicle_registration.status = 'pending';
      verification.documents.vehicle_registration.plate_number = req.body.plate_number;
    } else if (document_type === 'background_check') {
      verification.documents.background_check.file_url = file_url;
      verification.documents.background_check.uploaded_at = new Date();
      verification.documents.background_check.status = 'pending';
    }
    
    verification.calculateOverallStatus();
    await verification.save();
    
    res.json({
      success: true,
      message: 'Documento subido exitosamente',
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al subir documento',
      error: error.message
    });
  }
});

// Obtener estado de verificación
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const driver_id = req.user.id;
    
    const verification = await Verification.findOne({ driver_id });
    
    if (!verification) {
      return res.json({
        success: true,
        data: {
          overall_status: 'unverified',
          documents: {}
        }
      });
    }
    
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de verificación',
      error: error.message
    });
  }
});

export default router;
