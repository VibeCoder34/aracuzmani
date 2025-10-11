/**
 * Translate spec keys to Turkish
 */
export function translateSpecKey(key: string): string {
  const translations: Record<string, string> = {
    engine: "Motor",
    horsepower: "Beygir Gücü",
    torque: "Tork",
    mpg: "Yakıt Tüketimi",
    range: "Menzil",
    seating: "Koltuk Sayısı",
    drivetrain: "Çekiş",
  };
  
  return translations[key] || key;
}

