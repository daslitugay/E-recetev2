const express = require('express');

const {
  searchPatientByCode,
  sendConnectionRequest,
  getMyConnectionRequests,
  respondConnectionRequest,
  getMyPatients,
  getMyDoctors,
  getPatientMedicinesForDoctor,
} = require('../controllers/doctorPatientController');

const { protect } = require('../middleware/authMiddleware');
const {
  authorize,
  requireApprovedDoctor,
} = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get(
  '/doctor/search-patient',
  authorize('DOCTOR'),
  requireApprovedDoctor,
  searchPatientByCode
);

router.post(
  '/doctor/request',
  authorize('DOCTOR'),
  requireApprovedDoctor,
  sendConnectionRequest
);

router.get(
  '/doctor/patients',
  authorize('DOCTOR'),
  requireApprovedDoctor,
  getMyPatients
);

router.get(
  '/doctor/patients/:patientId/medicines',
  authorize('DOCTOR'),
  requireApprovedDoctor,
  getPatientMedicinesForDoctor
);

router.get(
  '/patient/requests',
  authorize('PATIENT'),
  getMyConnectionRequests
);

router.patch(
  '/patient/requests/:id/respond',
  authorize('PATIENT'),
  respondConnectionRequest
);

router.get(
  '/patient/doctors',
  authorize('PATIENT'),
  getMyDoctors
);

module.exports = router;