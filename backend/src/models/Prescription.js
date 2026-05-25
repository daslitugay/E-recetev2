const mongoose = require('mongoose');

const PRESCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const PRESCRIPTION_ITEM_STOCK_STATUS = {
  ENOUGH: 'ENOUGH',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  NOT_FOUND: 'NOT_FOUND',
  EXPIRED: 'EXPIRED',
};

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: [120, 'Medicine name cannot exceed 120 characters'],
    },
    dosage: {
      type: String,
      trim: true,
      maxlength: [50, 'Dosage cannot exceed 50 characters'],
    },
    form: {
      type: String,
      required: [true, 'Medicine form is required'],
      trim: true,
    },
    frequencyPerDay: {
      type: Number,
      required: [true, 'Frequency per day is required'],
      min: [1, 'Frequency per day must be at least 1'],
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration days is required'],
      min: [1, 'Duration days must be at least 1'],
    },
    unitsPerDose: {
      type: Number,
      required: [true, 'Units per dose is required'],
      min: [1, 'Units per dose must be at least 1'],
      default: 1,
    },
    requiredUnits: {
      type: Number,
      min: [1, 'Required units must be at least 1'],
    },
    usageInstruction: {
      type: String,
      trim: true,
      maxlength: [500, 'Usage instruction cannot exceed 500 characters'],
    },
    matchedMedicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      default: null,
    },
    stockStatus: {
      type: String,
      enum: Object.values(PRESCRIPTION_ITEM_STOCK_STATUS),
      default: PRESCRIPTION_ITEM_STOCK_STATUS.NOT_FOUND,
    },
    availableUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    missingUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryStatus: {
      type: String,
      enum: ['VALID', 'EXPIRING_SOON', 'EXPIRED', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
  },
  {
    _id: true,
  }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [prescriptionItemSchema],
      validate: [
        {
          validator(value) {
            return value.length > 0;
          },
          message: 'Prescription must have at least one medicine',
        },
      ],
    },
    diagnosisNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Diagnosis note cannot exceed 500 characters'],
    },
    generalNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'General note cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(PRESCRIPTION_STATUS),
      default: PRESCRIPTION_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Prescription: mongoose.model('Prescription', prescriptionSchema),
  PRESCRIPTION_STATUS,
  PRESCRIPTION_ITEM_STOCK_STATUS,
};