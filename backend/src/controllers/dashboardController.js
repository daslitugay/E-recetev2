const asyncHandler = require('express-async-handler');

const { User, USER_ROLES } = require('../models/User');
const { Medicine } = require('../models/Medicine');
const { Prescription } = require('../models/Prescription');
const {
  DoctorPatient,
  CONNECTION_STATUS,
} = require('../models/DoctorPatient');

const buildMedicineStats = (medicines) => {
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

  return stats;
};

const getPatientDashboard = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ patient: req.user._id }).sort({
    expiryDate: 1,
  });

  const prescriptions = await Prescription.find({
    patient: req.user._id,
  })
    .populate('doctor', 'name email specialization')
    .sort({ createdAt: -1 })
    .limit(5);

  const pendingRequests = await DoctorPatient.countDocuments({
    patient: req.user._id,
    status: CONNECTION_STATUS.PENDING,
  });

  const connectedDoctors = await DoctorPatient.countDocuments({
    patient: req.user._id,
    status: CONNECTION_STATUS.ACCEPTED,
  });

  const medicineStats = buildMedicineStats(medicines);

  const upcomingExpiryMedicines = medicines
    .filter((medicine) => medicine.expiryStatus === 'EXPIRING_SOON')
    .slice(0, 5);

  const lowStockMedicines = medicines
    .filter(
      (medicine) =>
        medicine.stockStatus === 'LOW_STOCK' ||
        medicine.stockStatus === 'OUT_OF_STOCK'
    )
    .slice(0, 5);

  res.status(200).json({
    success: true,
    dashboard: {
      medicineStats,
      prescriptionStats: {
        totalPrescriptions: await Prescription.countDocuments({
          patient: req.user._id,
        }),
        activePrescriptions: await Prescription.countDocuments({
          patient: req.user._id,
          status: 'ACTIVE',
        }),
      },
      connectionStats: {
        pendingRequests,
        connectedDoctors,
      },
      recentPrescriptions: prescriptions,
      upcomingExpiryMedicines,
      lowStockMedicines,
    },
  });
});

const getDoctorDashboard = asyncHandler(async (req, res) => {
  const connectedPatientCount = await DoctorPatient.countDocuments({
    doctor: req.user._id,
    status: CONNECTION_STATUS.ACCEPTED,
  });

  const pendingPatientCount = await DoctorPatient.countDocuments({
    doctor: req.user._id,
    status: CONNECTION_STATUS.PENDING,
  });

  const prescriptions = await Prescription.find({
    doctor: req.user._id,
  })
    .populate('patient', 'name email patientCode')
    .sort({ createdAt: -1 })
    .limit(5);

  const totalPrescriptions = await Prescription.countDocuments({
    doctor: req.user._id,
  });

  const activePrescriptions = await Prescription.countDocuments({
    doctor: req.user._id,
    status: 'ACTIVE',
  });

  res.status(200).json({
    success: true,
    dashboard: {
      patientStats: {
        connectedPatients: connectedPatientCount,
        pendingRequests: pendingPatientCount,
      },
      prescriptionStats: {
        totalPrescriptions,
        activePrescriptions,
      },
      recentPrescriptions: prescriptions,
    },
  });
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({});
  const totalPatients = await User.countDocuments({
    role: USER_ROLES.PATIENT,
  });
  const totalDoctors = await User.countDocuments({
    role: USER_ROLES.DOCTOR,
  });
  const pendingDoctors = await User.countDocuments({
    role: USER_ROLES.DOCTOR,
    doctorStatus: 'PENDING',
  });
  const approvedDoctors = await User.countDocuments({
    role: USER_ROLES.DOCTOR,
    doctorStatus: 'APPROVED',
  });
  const totalMedicines = await Medicine.countDocuments({});
  const totalPrescriptions = await Prescription.countDocuments({});
  const activePrescriptions = await Prescription.countDocuments({
    status: 'ACTIVE',
  });

  const recentDoctors = await User.find({
    role: USER_ROLES.DOCTOR,
  })
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    dashboard: {
      userStats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        pendingDoctors,
        approvedDoctors,
      },
      systemStats: {
        totalMedicines,
        totalPrescriptions,
        activePrescriptions,
      },
      recentDoctors,
    },
  });
});

module.exports = {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
};