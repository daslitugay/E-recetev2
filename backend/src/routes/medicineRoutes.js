const express = require('express');

const {
  createMedicine,
  getMyMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getMedicineStats,
} = require('../controllers/medicineController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('PATIENT'), getMedicineStats);

router
  .route('/')
  .post(authorize('PATIENT'), createMedicine)
  .get(authorize('PATIENT'), getMyMedicines);

router
  .route('/:id')
  .get(authorize('PATIENT', 'ADMIN'), getMedicineById)
  .put(authorize('PATIENT'), updateMedicine)
  .delete(authorize('PATIENT'), deleteMedicine);

module.exports = router;