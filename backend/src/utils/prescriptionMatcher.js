const normalizeText = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

const calculateRequiredUnits = (frequencyPerDay, durationDays, unitsPerDose) => {
  const frequency = Number(frequencyPerDay) || 0;
  const duration = Number(durationDays) || 0;
  const doseUnits = Number(unitsPerDose) || 1;

  return frequency * duration * doseUnits;
};

const getExpiryStatus = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'EXPIRED';
  }

  if (diffDays <= 30) {
    return 'EXPIRING_SOON';
  }

  return 'VALID';
};

const matchPrescriptionItemWithMedicines = (item, medicines) => {
  const itemName = normalizeText(item.medicineName);
  const itemDosage = normalizeText(item.dosage);
  const itemForm = normalizeText(item.form);

  const matchedMedicine = medicines.find((medicine) => {
    const medicineName = normalizeText(medicine.name);
    const medicineDosage = normalizeText(medicine.dosage);
    const medicineForm = normalizeText(medicine.form);

    return (
      medicineName === itemName &&
      medicineDosage === itemDosage &&
      medicineForm === itemForm
    );
  });

  if (!matchedMedicine) {
    return {
      matchedMedicine: null,
      stockStatus: 'NOT_FOUND',
      availableUnits: 0,
      missingUnits: item.requiredUnits,
      expiryStatus: 'UNKNOWN',
    };
  }

  const expiryStatus = getExpiryStatus(matchedMedicine.expiryDate);

  if (expiryStatus === 'EXPIRED') {
    return {
      matchedMedicine: matchedMedicine._id,
      stockStatus: 'EXPIRED',
      availableUnits: matchedMedicine.remainingUnits,
      missingUnits: item.requiredUnits,
      expiryStatus,
    };
  }

  if (matchedMedicine.remainingUnits <= 0) {
    return {
      matchedMedicine: matchedMedicine._id,
      stockStatus: 'OUT_OF_STOCK',
      availableUnits: matchedMedicine.remainingUnits,
      missingUnits: item.requiredUnits,
      expiryStatus,
    };
  }

  if (matchedMedicine.remainingUnits < item.requiredUnits) {
    return {
      matchedMedicine: matchedMedicine._id,
      stockStatus: 'LOW_STOCK',
      availableUnits: matchedMedicine.remainingUnits,
      missingUnits: item.requiredUnits - matchedMedicine.remainingUnits,
      expiryStatus,
    };
  }

  return {
    matchedMedicine: matchedMedicine._id,
    stockStatus: 'ENOUGH',
    availableUnits: matchedMedicine.remainingUnits,
    missingUnits: 0,
    expiryStatus,
  };
};

const enrichPrescriptionItemsWithStock = (items, medicines) => {
  return items.map((item) => {
    const requiredUnits =
      item.requiredUnits ||
      calculateRequiredUnits(
        item.frequencyPerDay,
        item.durationDays,
        item.unitsPerDose
      );

    const itemWithRequiredUnits = {
      ...item,
      requiredUnits,
    };

    const matchResult = matchPrescriptionItemWithMedicines(
      itemWithRequiredUnits,
      medicines
    );

    return {
      ...itemWithRequiredUnits,
      ...matchResult,
    };
  });
};

module.exports = {
  calculateRequiredUnits,
  enrichPrescriptionItemsWithStock,
};