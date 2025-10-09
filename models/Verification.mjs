import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      unique: true,
      index: true
    },
    documents: {
      id_card: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending'
        },
        file_url: String,
        uploaded_at: Date,
        verified_at: Date,
        rejection_reason: String
      },
      driver_license: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending'
        },
        file_url: String,
        license_number: String,
        expiry_date: Date,
        uploaded_at: Date,
        verified_at: Date,
        rejection_reason: String
      },
      vehicle_registration: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending'
        },
        file_url: String,
        plate_number: String,
        uploaded_at: Date,
        verified_at: Date,
        rejection_reason: String
      },
      background_check: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending'
        },
        file_url: String,
        checked_at: Date,
        verified_at: Date,
        rejection_reason: String
      }
    },
    phone_verification: {
      verified: {
        type: Boolean,
        default: false
      },
      code: String,
      code_expires_at: Date,
      verified_at: Date
    },
    email_verification: {
      verified: {
        type: Boolean,
        default: false
      },
      token: String,
      token_expires_at: Date,
      verified_at: Date
    },
    overall_status: {
      type: String,
      enum: ['unverified', 'pending', 'partially_verified', 'fully_verified', 'rejected'],
      default: 'unverified'
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

// Calcular estado general
verificationSchema.methods.calculateOverallStatus = function() {
  const docs = this.documents;
  const statuses = [
    docs.id_card.status,
    docs.driver_license.status,
    docs.vehicle_registration.status,
    docs.background_check.status
  ];
  
  const approvedCount = statuses.filter(s => s === 'approved').length;
  const rejectedCount = statuses.filter(s => s === 'rejected').length;
  
  if (rejectedCount > 0) {
    this.overall_status = 'rejected';
  } else if (approvedCount === 4 && this.phone_verification.verified && this.email_verification.verified) {
    this.overall_status = 'fully_verified';
  } else if (approvedCount > 0) {
    this.overall_status = 'partially_verified';
  } else if (statuses.some(s => s === 'pending')) {
    this.overall_status = 'pending';
  } else {
    this.overall_status = 'unverified';
  }
  
  return this.overall_status;
};

export default mongoose.model('Verification', verificationSchema);
