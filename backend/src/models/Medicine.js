const mongoose = require('mongoose');

const MEDICINE_FORMS = {
  TABLET: 'TABLET',
  CAPSULE: 'CAPSULE',
  SYRUP: 'SYRUP',
  CREAM: 'CREAM',
  DROPS: 'DROPS',
  INJECTION: 'INJECTION',
  SPRAY: 'SPRAY',
  POWDER: 'POWDER',
  OTHER: 'OTHER',
};

const medicineSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
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
      enum: Object.values(MEDICINE_FORMS),
      default: MEDICINE_FORMS.TABLET,
    },
    boxCount: {
      type: Number,
      required: [true, 'Box count is required'],
      min: [0, 'Box count cannot be negative'],
      default: 1,
    },
    unitsPerBox: {
      type: Number,
      required: [true, 'Units per box is required'],
      min: [1, 'Units per box must be at least 1'],
      default: 1,
    },
    totalUnits: {
      type: Number,
      min: [0, 'Total units cannot be negative'],
      default: 0,
    },
    remainingUnits: {
      type: Number,
      min: [0, 'Remaining units cannot be negative'],
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

medicineSchema.virtual('stockStatus').get(function () {
  if (this.remainingUnits <= 0) {
    return 'OUT_OF_STOCK';
  }

  if (this.remainingUnits <= 5) {
    return 'LOW_STOCK';
  }

  return 'IN_STOCK';
});

medicineSchema.virtual('expiryStatus').get(function () {
  const now = new Date();
  const expiry = new Date(this.expiryDate);

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'EXPIRED';
  }

  if (diffDays <= 30) {
    return 'EXPIRING_SOON';
  }

  return 'VALID';
});

medicineSchema.virtual('daysUntilExpiry').get(function () {
  const now = new Date();
  const expiry = new Date(this.expiryDate);

  const diffTime = expiry.getTime() - now.getTime();

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

medicineSchema.pre('save', function () {
  this.totalUnits = this.boxCount * this.unitsPerBox;

  if (this.isNew && (!this.remainingUnits || this.remainingUnits === 0)) {
    this.remainingUnits = this.totalUnits;
  }

  if (this.remainingUnits > this.totalUnits) {
    this.remainingUnits = this.totalUnits;
  }
});

module.exports = {
  Medicine: mongoose.model('Medicine', medicineSchema),
  MEDICINE_FORMS,
};