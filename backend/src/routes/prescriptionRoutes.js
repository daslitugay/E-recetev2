const express = require('express');

const {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionById,
  refreshPrescriptionStock,
  updatePrescriptionStatus,
} = require('../controllers/prescriptionController');

const { protect } = require('../middleware/authMiddleware');
const {
  authorize,
  requireApprovedDoctor,
} = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('DOCTOR'),
  requireApprovedDoctor,
  createPrescription
);

router.get(
  '/doctor',
  authorize('DOCTOR'),
  requireApprovedDoctor,
  getDoctorPrescriptions
);

router.get(
  '/patient',
  authorize('PATIENT'),
  getPatientPrescriptions
);

router.get(
  '/:id',
  authorize('PATIENT', 'DOCTOR', 'ADMIN'),
  getPrescriptionById
);

router.patch(
  '/:id/refresh-stock',
  authorize('PATIENT', 'DOCTOR'),
  refreshPrescriptionStock
);

router.patch(
  '/:id/status',
  authorize('DOCTOR'),
  requireApprovedDoctor,
  updatePrescriptionStatus
);

module.exports = router;