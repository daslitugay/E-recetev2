const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-Recete API is running',
    service: 'e-recete-backend',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;