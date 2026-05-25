const asyncHandler = require('express-async-handler');

const { User, USER_ROLES } = require('../models/User');
const { Medicine } = require('../models/Medicine');
const {
  DoctorPatient,
  CONNECTION_STATUS,
} = require('../models/DoctorPatient');

const searchPatientByCode = asyncHandler(async (req, res) => {
  const { patientCode } = req.query;

  if (!patientCode) {
    res.status(400);
    throw new Error('Patient code is required');
  }

  const patient = await User.findOne({
    patientCode: patientCode.trim().toUpperCase(),
    role: USER_ROLES.PATIENT,
    isActive: true,
  }).select('name email patientCode');

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const connection = await DoctorPatient.findOne({
    doctor: req.user._id,
    patient: patient._id,
  });

  res.status(200).json({
    success: true,
    patient,
    connectionStatus: connection ? connection.status : 'NONE',
  });
});

const sendConnectionRequest = asyncHandler(async (req, res) => {
  const { patientCode } = req.body;

  if (!patientCode) {
    res.status(400);
    throw new Error('Patient code is required');
  }

  const patient = await User.findOne({
    patientCode: patientCode.trim().toUpperCase(),
    role: USER_ROLES.PATIENT,
    isActive: true,
  });

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const existingConnection = await DoctorPatient.findOne({
    doctor: req.user._id,
    patient: patient._id,
  });

  if (existingConnection) {
    if (existingConnection.status === CONNECTION_STATUS.ACCEPTED) {
      res.status(400);
      throw new Error('You are already connected with this patient');
    }

    if (existingConnection.status === CONNECTION_STATUS.PENDING) {
      res.status(400);
      throw new Error('Connection request is already pending');
    }

    existingConnection.status = CONNECTION_STATUS.PENDING;
    existingConnection.requestedAt = new Date();
    existingConnection.respondedAt = undefined;

    await existingConnection.save();

    res.status(200).json({
      success: true,
      message: 'Connection request sent again',
      connection: existingConnection,
    });

    return;
  }

  const connection = await DoctorPatient.create({
    doctor: req.user._id,
    patient: patient._id,
    status: CONNECTION_STATUS.PENDING,
  });

  res.status(201).json({
    success: true,
    message: 'Connection request sent successfully',
    connection,
  });
});

const getMyConnectionRequests = asyncHandler(async (req, res) => {
  const requests = await DoctorPatient.find({
    patient: req.user._id,
    status: CONNECTION_STATUS.PENDING,
  })
    .populate('doctor', 'name email specialization doctorStatus')
    .sort({ requestedAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

const respondConnectionRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (![CONNECTION_STATUS.ACCEPTED, CONNECTION_STATUS.REJECTED].includes(status)) {
    res.status(400);
    throw new Error('Status must be ACCEPTED or REJECTED');
  }

  const connection = await DoctorPatient.findById(req.params.id);

  if (!connection) {
    res.status(404);
    throw new Error('Connection request not found');
  }

  if (connection.patient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not allowed to respond to this request');
  }

  if (connection.status !== CONNECTION_STATUS.PENDING) {
    res.status(400);
    throw new Error('This request has already been responded to');
  }

  connection.status = status;
  connection.respondedAt = new Date();

  await connection.save();

  res.status(200).json({
    success: true,
    message:
      status === CONNECTION_STATUS.ACCEPTED
        ? 'Connection request accepted'
        : 'Connection request rejected',
    connection,
  });
});

const getMyPatients = asyncHandler(async (req, res) => {
  const connections = await DoctorPatient.find({
    doctor: req.user._id,
    status: CONNECTION_STATUS.ACCEPTED,
  })
    .populate('patient', 'name email patientCode')
    .sort({ updatedAt: -1 });

  const patients = connections.map((connection) => connection.patient);

  res.status(200).json({
    success: true,
    count: patients.length,
    patients,
  });
});

const getMyDoctors = asyncHandler(async (req, res) => {
  const connections = await DoctorPatient.find({
    patient: req.user._id,
    status: CONNECTION_STATUS.ACCEPTED,
  })
    .populate('doctor', 'name email specialization')
    .sort({ updatedAt: -1 });

  const doctors = connections.map((connection) => connection.doctor);

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors,
  });
});

const getPatientMedicinesForDoctor = asyncHandler(async (req, res) => {
  const patientId = req.params.patientId;

  const connection = await DoctorPatient.findOne({
    doctor: req.user._id,
    patient: patientId,
    status: CONNECTION_STATUS.ACCEPTED,
  });

  if (!connection) {
    res.status(403);
    throw new Error('You are not connected with this patient');
  }

  const medicines = await Medicine.find({ patient: patientId }).sort({
    expiryDate: 1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: medicines.length,
    medicines,
  });
});

module.exports = {
  searchPatientByCode,
  sendConnectionRequest,
  getMyConnectionRequests,
  respondConnectionRequest,
  getMyPatients,
  getMyDoctors,
  getPatientMedicinesForDoctor,
};