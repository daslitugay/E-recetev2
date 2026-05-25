const asyncHandler = require('express-async-handler');

const { User, USER_ROLES } = require('../models/User');
const generateToken = require('../utils/generateToken');
const generatePatientCode = require('../utils/generatePatientCode');

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  patientCode: user.patientCode,
  doctorStatus: user.doctorStatus,
  specialization: user.specialization,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  token: generateToken(user._id),
});

const createUniquePatientCode = async () => {
  let patientCode;
  let exists = true;

  while (exists) {
    patientCode = generatePatientCode();
    exists = await User.findOne({ patientCode });
  }

  return patientCode;
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, specialization } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const normalizedRole = role || USER_ROLES.PATIENT;

  if (![USER_ROLES.PATIENT, USER_ROLES.DOCTOR].includes(normalizedRole)) {
    res.status(400);
    throw new Error('Invalid role for registration');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const userData = {
    name,
    email,
    password,
    role: normalizedRole,
  };

  if (normalizedRole === USER_ROLES.PATIENT) {
    userData.patientCode = await createUniquePatientCode();
    userData.doctorStatus = 'NONE';
  }

  if (normalizedRole === USER_ROLES.DOCTOR) {
    userData.doctorStatus = 'PENDING';
    userData.specialization = specialization || '';
  }

  const user = await User.create(userData);

  res.status(201).json({
    success: true,
    message:
      user.role === USER_ROLES.DOCTOR
        ? 'Doctor account created. Waiting for admin approval.'
        : 'Patient account created successfully.',
    user: buildAuthResponse(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account is inactive');
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: buildAuthResponse(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      patientCode: req.user.patientCode,
      doctorStatus: req.user.doctorStatus,
      specialization: req.user.specialization,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
};