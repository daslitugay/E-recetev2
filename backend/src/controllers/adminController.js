const asyncHandler = require('express-async-handler');

const { User, USER_ROLES } = require('../models/User');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

const getPendingDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({
    role: USER_ROLES.DOCTOR,
    doctorStatus: 'PENDING',
  })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors,
  });
});

const approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor || doctor.role !== USER_ROLES.DOCTOR) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  doctor.doctorStatus = 'APPROVED';
  doctor.isActive = true;

  await doctor.save();

  res.status(200).json({
    success: true,
    message: 'Doctor approved successfully',
    doctor: {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      doctorStatus: doctor.doctorStatus,
      specialization: doctor.specialization,
      isActive: doctor.isActive,
    },
  });
});

const rejectDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor || doctor.role !== USER_ROLES.DOCTOR) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  doctor.doctorStatus = 'REJECTED';
  doctor.isActive = false;

  await doctor.save();

  res.status(200).json({
    success: true,
    message: 'Doctor rejected successfully',
    doctor: {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      doctorStatus: doctor.doctorStatus,
      specialization: doctor.specialization,
      isActive: doctor.isActive,
    },
  });
});

module.exports = {
  getUsers,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
};