const express = require('express');

const {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');

const { protect } = require('../middleware/authMiddleware');
const {
  authorize,
  requireApprovedDoctor,
} = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/patient', authorize('PATIENT'), getPatientDashboard);

router.get(
  '/doctor',
  authorize('DOCTOR'),
  requireApprovedDoctor,
  getDoctorDashboard
);

router.get('/admin', authorize('ADMIN'), getAdminDashboard);

module.exports = router;