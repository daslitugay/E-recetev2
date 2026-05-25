const express = require('express');

const {
  getUsers,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', getUsers);
router.get('/doctors/pending', getPendingDoctors);
router.patch('/doctors/:id/approve', approveDoctor);
router.patch('/doctors/:id/reject', rejectDoctor);

module.exports = router;