import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from '../layouts/AppLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminDoctorsPage from '../pages/admin/AdminDoctorsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import DoctorCreatePrescriptionPage from '../pages/doctor/DoctorCreatePrescriptionPage';
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import DoctorPatientsPage from '../pages/doctor/DoctorPatientsPage';
import DoctorPendingApprovalPage from '../pages/doctor/DoctorPendingApprovalPage';
import DoctorPrescriptionDetailPage from '../pages/doctor/DoctorPrescriptionDetailPage';
import DoctorPrescriptionsPage from '../pages/doctor/DoctorPrescriptionsPage';
import PatientDashboardPage from '../pages/patient/PatientDashboardPage';
import PatientDoctorsPage from '../pages/patient/PatientDoctorsPage';
import PatientMedicinesPage from '../pages/patient/PatientMedicinesPage';
import PatientPrescriptionDetailPage from '../pages/patient/PatientPrescriptionDetailPage';
import PatientPrescriptionsPage from '../pages/patient/PatientPrescriptionsPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { getDefaultRouteByRole, USER_ROLES } from '../utils/roles';

const RootRedirect = () => {
  const { user } = useAuth();

  return <Navigate to={getDefaultRouteByRole(user)} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/doctor/pending-approval"
        element={<DoctorPendingApprovalPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RoleRoute allowedRoles={[USER_ROLES.PATIENT]} />}>
            <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
            <Route path="/patient/medicines" element={<PatientMedicinesPage />} />
            <Route
              path="/patient/prescriptions"
              element={<PatientPrescriptionsPage />}
            />
            <Route
              path="/patient/prescriptions/:id"
              element={<PatientPrescriptionDetailPage />}
            />
            <Route path="/patient/doctors" element={<PatientDoctorsPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[USER_ROLES.DOCTOR]} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
            <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
            <Route
              path="/doctor/prescriptions"
              element={<DoctorPrescriptionsPage />}
            />
            <Route
              path="/doctor/prescriptions/create"
              element={<DoctorCreatePrescriptionPage />}
            />
            <Route
              path="/doctor/prescriptions/:id"
              element={<DoctorPrescriptionDetailPage />}
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;