export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
};

export const getDefaultRouteByRole = (user) => {
  if (!user) {
    return '/login';
  }

  if (user.role === USER_ROLES.ADMIN) {
    return '/admin/dashboard';
  }

  if (user.role === USER_ROLES.DOCTOR) {
    if (user.doctorStatus !== 'APPROVED') {
      return '/doctor/pending-approval';
    }

    return '/doctor/dashboard';
  }

  return '/patient/dashboard';
};