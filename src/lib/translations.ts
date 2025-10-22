/**
 * Centralized translation system for car specifications
 * All English values should be translated to Turkish here
 */

// Gövde/Kasa Tipleri
export const translateBodyType = (bodyType: string | undefined | null): string | undefined => {
  if (!bodyType) return bodyType || undefined;
  
  const normalized = bodyType.toLowerCase().trim();
  const translations: Record<string, string> = {
    'suv': 'SUV',
    'sedan': 'Sedan',
    'hatchback': 'Hatchback',
    'coupe': 'Coupe',
    'wagon': 'Station Wagon',
    'station wagon': 'Station Wagon',
    'van': 'Van',
    'pickup': 'Pikap',
    'truck': 'Pikap',
    'convertible': 'Cabrio',
    'minivan': 'Minivan',
    'crossover': 'Crossover',
    // Compound formats like "5-doors, hatchback"
    '5-doors, hatchback': '5 Kapılı Hatchback',
    '3-doors, hatchback': '3 Kapılı Hatchback',
    '4-doors, sedan': '4 Kapılı Sedan',
    '2-doors, coupe': '2 Kapılı Coupe',
  };
  
  // Try direct match first
  if (translations[normalized]) {
    return translations[normalized];
  }
  
  // Try partial matches for compound formats
  for (const [key, value] of Object.entries(translations)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return bodyType;
};

// Yakıt Tipleri
export const translateFuelType = (fuelType: string | undefined | null): string | undefined => {
  if (!fuelType) return fuelType || undefined;
  
  const normalized = fuelType.toLowerCase().trim();
  const translations: Record<string, string> = {
    'gasoline': 'Benzin',
    'petrol': 'Benzin',
    'diesel': 'Dizel',
    'electric': 'Elektrik',
    'hybrid': 'Hibrit',
    'plug-in hybrid': 'Şarj Edilebilir Hibrit',
    'phev': 'Şarj Edilebilir Hibrit',
    'lpg': 'LPG',
    'cng': 'CNG',
    'hydrogen': 'Hidrojen',
  };
  
  return translations[normalized] || fuelType;
};

// Şanzıman/Vites Tipleri
export const translateTransmissionType = (transmission: string | undefined | null): string | undefined => {
  if (!transmission) return transmission || undefined;
  
  const normalized = transmission.toLowerCase().trim();
  const translations: Record<string, string> = {
    'manual': 'Manuel',
    'automatic': 'Otomatik',
    'semi-automatic': 'Yarı Otomatik',
    'cvt': 'CVT',
    'dsg': 'DSG',
    'dual-clutch': 'Çift Kavramalı',
    'pdk': 'PDK',
    'single-speed': 'Tek Vitesli',
    // Patterns with "speed"
    '6 speed manual': '6 İleri Manuel',
    '6 speed automatic': '6 İleri Otomatik',
    '7 speed automatic': '7 İleri Otomatik',
    '8 speed automatic': '8 İleri Otomatik',
    '9 speed automatic': '9 İleri Otomatik',
    '10 speed automatic': '10 İleri Otomatik',
    '6 speed manual transmission': '6 İleri Manuel',
    '6 speed automatic transmission': '6 İleri Otomatik',
    '7 speed automatic transmission': '7 İleri Otomatik',
    '8 speed automatic transmission': '8 İleri Otomatik',
    '9 speed automatic transmission': '9 İleri Otomatik',
    '10 speed automatic transmission': '10 İleri Otomatik',
  };
  
  // Try direct match first
  if (translations[normalized]) {
    return translations[normalized];
  }
  
  // Try to parse patterns like "X speed manual/automatic"
  const speedMatch = transmission.match(/(\d+)\s*speed\s*(manual|automatic)/i);
  if (speedMatch) {
    const [, speed, type] = speedMatch;
    const typeText = type.toLowerCase() === 'manual' ? 'Manuel' : 'Otomatik';
    return `${speed} İleri ${typeText}`;
  }
  
  return transmission;
};

// Çekiş Tipleri
export const translateDriveType = (driveType: string | undefined | null): string | undefined => {
  if (!driveType) return driveType || undefined;
  
  const normalized = driveType.toLowerCase().trim();
  const translations: Record<string, string> = {
    'fwd': 'Önden Çekiş',
    'rwd': 'Arkadan İtiş',
    'awd': '4x4',
    '4wd': '4x4',
    'front': 'Önden Çekiş',
    'rear': 'Arkadan İtiş',
    'front-wheel drive': 'Önden Çekiş',
    'rear-wheel drive': 'Arkadan İtiş',
    'all-wheel drive': '4x4',
    'four-wheel drive': '4x4',
  };
  
  return translations[normalized] || driveType;
};

// Genel değer çevirisi - tüm tipleri kapsayan
export const translateCarValue = (value: string | undefined | null, type?: 'body' | 'fuel' | 'transmission' | 'drive'): string | undefined => {
  if (!value) return value || undefined;
  
  switch (type) {
    case 'body':
      return translateBodyType(value);
    case 'fuel':
      return translateFuelType(value);
    case 'transmission':
      return translateTransmissionType(value);
    case 'drive':
      return translateDriveType(value);
    default:
      // Auto-detect and translate
      return translateBodyType(value) || 
             translateFuelType(value) || 
             translateTransmissionType(value) || 
             translateDriveType(value) || 
             value;
  }
};

