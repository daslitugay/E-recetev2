export const getStockStatusLabel = (status) => {
  const labels = {
    IN_STOCK: 'Stokta',
    LOW_STOCK: 'Stok az',
    OUT_OF_STOCK: 'Stok bitti',
    ENOUGH: 'Yeterli',
    NOT_FOUND: 'Yok',
    EXPIRED: 'Tarihi geçmiş',
  };

  return labels[status] || status || '-';
};

export const getExpiryStatusLabel = (status) => {
  const labels = {
    VALID: 'Geçerli',
    EXPIRING_SOON: 'Yaklaşıyor',
    EXPIRED: 'Tarihi geçmiş',
    UNKNOWN: 'Bilinmiyor',
  };

  return labels[status] || status || '-';
};

export const getPrescriptionStatusLabel = (status) => {
  const labels = {
    ACTIVE: 'Aktif',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal edildi',
  };

  return labels[status] || status || '-';
};

export const getStatusTone = (status) => {
  const warningStatuses = ['LOW_STOCK', 'EXPIRING_SOON'];
  const dangerStatuses = ['OUT_OF_STOCK', 'EXPIRED', 'NOT_FOUND', 'CANCELLED'];
  const successStatuses = ['IN_STOCK', 'VALID', 'ENOUGH', 'COMPLETED'];
  const infoStatuses = ['ACTIVE'];

  if (warningStatuses.includes(status)) {
    return 'amber';
  }

  if (dangerStatuses.includes(status)) {
    return 'red';
  }

  if (successStatuses.includes(status)) {
    return 'green';
  }

  if (infoStatuses.includes(status)) {
    return 'blue';
  }

  return 'slate';
};