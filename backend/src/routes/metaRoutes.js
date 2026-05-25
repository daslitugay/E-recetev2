const express = require('express');

const { getMedicineForms } = require('../controllers/metaController');

const router = express.Router();

router.get('/medicine-forms', getMedicineForms);

module.exports = router;