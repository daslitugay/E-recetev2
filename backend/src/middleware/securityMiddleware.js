const rateLimit = require('express-rate-limit');

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    const sanitizedObject = {};

    Object.keys(value).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        return;
      }

      sanitizedObject[key] = sanitizeValue(value[key]);
    });

    return sanitizedObject;
  }

  return value;
};

const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  if (req.query) {
    try {
      req.query = sanitizeValue(req.query);
    } catch (error) {
      // Some Express versions keep req.query as a getter.
      // If assignment fails, we simply continue because controllers use explicit fields.
    }
  }

  next();
};

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again later',
  },
});

module.exports = {
  sanitizeRequest,
  apiLimiter,
  authLimiter,
};