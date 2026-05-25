const asyncHandler = require('express-async-handler');

const { MEDICINE_FORMS } = require('../models/Medicine');

const getMedicineForms = asyncHandler(async (req, res) => {
  const forms = Object.values(MEDICINE_FORMS).map((value) => ({
    value,
    label: value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  }));

  res.status(200).json({
    success: true,
    forms,
  });
});

module.exports = {
  getMedicineForms,
};