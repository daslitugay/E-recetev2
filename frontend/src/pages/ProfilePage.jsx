import {
  BadgeCheck,
  CalendarDays,
  Mail,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';

import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/roles';

const formatDate = (date) => {
  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const getRoleLabel = (role) => {
  const labels = {
    PATIENT: 'Hasta',
    DOCTOR: 'Doktor',
    ADMIN: 'Admin',
  };

  return labels[role] || role || '-';
};

const getRoleTone = (role) => {
  if (role === USER_ROLES.ADMIN) {
    return 'blue';
  }

  if (role === USER_ROLES.DOCTOR) {
    return 'green';
  }

  return 'slate';
};

const getDoctorStatusTone = (status) => {
  if (status === 'APPROVED') {
    return 'green';
  }

  if (status === 'PENDING') {
    return 'amber';
  }

  if (status === 'REJECTED') {
    return 'red';
  }

  return 'slate';
};

const getDoctorStatusLabel = (status) => {
  const labels = {
    NONE: 'Yok',
    PENDING: 'Onay Bekliyor',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
  };

  return labels[status] || status || '-';
};

const getProfileIcon = (role) => {
  if (role === USER_ROLES.ADMIN) {
    return ShieldCheck;
  }

  if (role === USER_ROLES.DOCTOR) {
    return Stethoscope;
  }

  return UserRound;
};

const InfoCard = ({ icon: Icon, title, value, description }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-1 break-words text-lg font-bold text-slate-900">
            {value || '-'}
          </p>
          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();

  const ProfileIcon = getProfileIcon(user?.role);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-emerald-500 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-white backdrop-blur">
              <ProfileIcon size={32} />
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-50">Profil</p>
              <h1 className="mt-2 text-3xl font-bold">{user?.name || '-'}</h1>
              <p className="mt-2 text-sm text-blue-50">{user?.email || '-'}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                  {getRoleLabel(user?.role)}
                </span>

                {user?.role === USER_ROLES.DOCTOR && (
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                    {getDoctorStatusLabel(user?.doctorStatus)}
                  </span>
                )}

                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                  {user?.isActive === false ? 'Pasif' : 'Aktif'}
                </span>
              </div>
            </div>
          </div>

          {user?.role === USER_ROLES.PATIENT && (
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="text-xs font-semibold text-blue-50">Hasta Kodu</p>
              <p className="mt-1 text-2xl font-bold tracking-wide">
                {user?.patientCode || '-'}
              </p>
              <p className="mt-1 text-xs text-blue-50">
                Doktor bağlantı isteği için bu kodu kullanır.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          icon={UserRound}
          title="Ad Soyad"
          value={user?.name}
          description="Hesap üzerinde görünen kullanıcı adı."
        />

        <InfoCard
          icon={Mail}
          title="E-posta"
          value={user?.email}
          description="Giriş yaparken kullanılan e-posta adresi."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <BadgeCheck size={21} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">Rol</p>
              <div className="mt-2">
                <StatusBadge tone={getRoleTone(user?.role)}>
                  {getRoleLabel(user?.role)}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Hesabın sistemdeki yetki seviyesini belirler.
              </p>
            </div>
          </div>
        </div>

        {user?.role === USER_ROLES.PATIENT && (
          <InfoCard
            icon={ShieldCheck}
            title="Hasta Kodu"
            value={user?.patientCode}
            description="Doktorunuz bu kodla size bağlantı isteği gönderebilir."
          />
        )}

        {user?.role === USER_ROLES.DOCTOR && (
          <>
            <InfoCard
              icon={Stethoscope}
              title="Uzmanlık Alanı"
              value={user?.specialization}
              description="Doktor hesabı oluştururken girilen uzmanlık bilgisi."
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Doktor Onay Durumu
                  </p>
                  <div className="mt-2">
                    <StatusBadge tone={getDoctorStatusTone(user?.doctorStatus)}>
                      {getDoctorStatusLabel(user?.doctorStatus)}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Admin onayı olmadan doktor paneli kullanılamaz.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <CalendarDays size={21} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Hesap Durumu
              </p>
              <div className="mt-2">
                <StatusBadge tone={user?.isActive === false ? 'red' : 'green'}>
                  {user?.isActive === false ? 'Pasif' : 'Aktif'}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pasif hesaplar sisteme erişemez.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Hesap Özeti</h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Kullanıcı ID
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-700">
              {user?._id || '-'}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Son Bilgi Güncellemesi
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {formatDate(user?.updatedAt)}
            </p>
          </div>
        </div>

        <p className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-700">
          Profil bilgileri şu anda sadece görüntülenebilir. İlerleyen sürümde
          profil güncelleme, şifre değiştirme ve hesap güvenliği ayarları bu
          ekrana eklenebilir.
        </p>
      </section>
    </div>
  );
};

export default ProfilePage;