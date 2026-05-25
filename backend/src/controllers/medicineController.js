const asyncHandler = require('express-async-handler');

const { Medicine } = require('../models/Medicine');
const { USER_ROLES } = require('../models/User');

const createMedicine = asyncHandler(async (req, res) => {
  const {
    name,
    dosage,
    form,
    boxCount,
    unitsPerBox,
    remainingUnits,
    expiryDate,
    notes,
  } = req.body;

  if (!name || !expiryDate) {
    res.status(400);
    throw new Error('Medicine name and expiry date are required');
  }

  const medicine = await Medicine.create({
    patient: req.user._id,
    name,
    dosage,
    form,
    boxCount,
    unitsPerBox,
    remainingUnits,
    expiryDate,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Medicine created successfully',
    medicine,
  });
});

const getMyMedicines = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ patient: req.user._id }).sort({
    expiryDate: 1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: medicines.length,
    medicines,
  });
});

const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  if (
    medicine.patient.toString() !== req.user._id.toString() &&
    req.user.role !== USER_ROLES.ADMIN
  ) {
    res.status(403);
    throw new Error('You are not allowed to view this medicine');
  }

  res.status(200).json({
    success: true,
    medicine,
  });
});

const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  if (medicine.patient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not allowed to update this medicine');
  }

  const allowedFields = [
    'name',
    'dosage',
    'form',
    'boxCount',
    'unitsPerBox',
    'remainingUnits',
    'expiryDate',
    'notes',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      medicine[field] = req.body[field];
    }
  });

  await medicine.save();

  res.status(200).json({
    success: true,
    message: 'Medicine updated successfully',
    medicine,
  });
});

const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  if (medicine.patient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not allowed to delete this medicine');
  }

  await medicine.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Medicine deleted successfully',
  });
});

const getMedicineStats = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ patient: req.user._id });

  const stats = {
    totalMedicines: medicines.length,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    valid: 0,
    expiringSoon: 0,
    expired: 0,
  };

  medicines.forEach((medicine) => {
    if (medicine.stockStatus === 'IN_STOCK') {
      stats.inStock += 1;
    }

    if (medicine.stockStatus === 'LOW_STOCK') {
      stats.lowStock += 1;
    }

    if (medicine.stockStatus === 'OUT_OF_STOCK') {
      stats.outOfStock += 1;
    }

    if (medicine.expiryStatus === 'VALID') {
      stats.valid += 1;
    }

    if (medicine.expiryStatus === 'EXPIRING_SOON') {
      stats.expiringSoon += 1;
    }

    if (medicine.expiryStatus === 'EXPIRED') {
      stats.expired += 1;
    }
  });

  res.status(200).json({
    success: true,
    stats,
  });
});

module.exports = {
  createMedicine,
  getMyMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getMedicineStats,
};