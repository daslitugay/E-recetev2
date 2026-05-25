const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('You do not have permission to access this route');
    }

    next();
  };
};

const requireApprovedDoctor = (req, res, next) => {
  if (!req.user || req.user.role !== 'DOCTOR') {
    res.status(403);
    throw new Error('Only doctors can access this route');
  }

  if (req.user.doctorStatus !== 'APPROVED') {
    res.status(403);
    throw new Error('Doctor account is waiting for admin approval');
  }

  next();
};

module.exports = {
  authorize,
  requireApprovedDoctor,
};