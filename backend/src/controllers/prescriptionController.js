const asyncHandler = require('express-async-handler');

const { Medicine } = require('../models/Medicine');
const { Prescription, PRESCRIPTION_STATUS } = require('../models/Prescription');
const {
  DoctorPatient,
  CONNECTION_STATUS,
} = require('../models/DoctorPatient');
const { USER_ROLES } = require('../models/User');
const {
  enrichPrescriptionItemsWithStock,
} = require('../utils/prescriptionMatcher');

const ensureDoctorConnectedToPatient = async (doctorId, patientId) => {
  const connection = await DoctorPatient.findOne({
    doctor: doctorId,
    patient: patientId,
    status: CONNECTION_STATUS.ACCEPTED,
  });

  return Boolean(connection);
};

const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, items, diagnosisNote, generalNote } = req.body;

  if (!patientId) {
    res.status(400);
    throw new Error('Patient id is required');
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Prescription items are required');
  }

  const isConnected = await ensureDoctorConnectedToPatient(
    req.user._id,
    patientId
  );

  if (!isConnected) {
    res.status(403);
    throw new Error('You are not connected with this patient');
  }

  const medicines = await Medicine.find({ patient: patientId });

  const enrichedItems = enrichPrescriptionItemsWithStock(items, medicines);

  const prescription = await Prescription.create({
    patient: patientId,
    doctor: req.user._id,
    items: enrichedItems,
    diagnosisNote,
    generalNote,
  });

  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate('patient', 'name email patientCode')
    .populate('doctor', 'name email specialization')
    .populate('items.matchedMedicine', 'name dosage form remainingUnits expiryDate');

  res.status(201).json({
    success: true,
    message: 'Prescription created successfully',
    prescription: populatedPrescription,
  });
});

const getDoctorPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ doctor: req.user._id })
    .populate('patient', 'name email patientCode')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    prescriptions,
  });
});

const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.user._id })
    .populate('doctor', 'name email specialization')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    prescriptions,
  });
});

const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'name email patientCode')
    .populate('doctor', 'name email specialization')
    .populate('items.matchedMedicine', 'name dosage form remainingUnits expiryDate');

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  const isPatientOwner =
    prescription.patient._id.toString() === req.user._id.toString();

  const isDoctorOwner =
    prescription.doctor._id.toString() === req.user._id.toString();

  const isAdmin = req.user.role === USER_ROLES.ADMIN;

  if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
    res.status(403);
    throw new Error('You are not allowed to view this prescription');
  }

  res.status(200).json({
    success: true,
    prescription,
  });
});

const refreshPrescriptionStock = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  const isPatientOwner =
    prescription.patient.toString() === req.user._id.toString();

  const isDoctorOwner =
    prescription.doctor.toString() === req.user._id.toString();

  if (!isPatientOwner && !isDoctorOwner) {
    res.status(403);
    throw new Error('You are not allowed to refresh this prescription');
  }

  const medicines = await Medicine.find({ patient: prescription.patient });

  const plainItems = prescription.items.map((item) => ({
    medicineName: item.medicineName,
    dosage: item.dosage,
    form: item.form,
    frequencyPerDay: item.frequencyPerDay,
    durationDays: item.durationDays,
    unitsPerDose: item.unitsPerDose,
    requiredUnits: item.requiredUnits,
    usageInstruction: item.usageInstruction,
  }));

  prescription.items = enrichPrescriptionItemsWithStock(plainItems, medicines);

  await prescription.save();

  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate('patient', 'name email patientCode')
    .populate('doctor', 'name email specialization')
    .populate('items.matchedMedicine', 'name dosage form remainingUnits expiryDate');

  res.status(200).json({
    success: true,
    message: 'Prescription stock status refreshed',
    prescription: populatedPrescription,
  });
});

const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!Object.values(PRESCRIPTION_STATUS).includes(status)) {
    res.status(400);
    throw new Error('Invalid prescription status');
  }

  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  if (prescription.doctor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the doctor who created this prescription can update it');
  }

  prescription.status = status;

  await prescription.save();

  res.status(200).json({
    success: true,
    message: 'Prescription status updated successfully',
    prescription,
  });
});

module.exports = {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionById,
  refreshPrescriptionStock,
  updatePrescriptionStatus,
};