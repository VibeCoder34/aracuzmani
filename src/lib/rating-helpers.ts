import type { Review, CategoryAverages, RatingCategory } from "@/types/car";

/**
 * Compute average ratings per category for a car
 */
export function computeCategoryAverages(reviews: Review[]): CategoryAverages {
  if (reviews.length === 0) {
    return {
      interiorDesign: 0,
      exteriorDesign: 0,
      fuelEconomy: 0,
      performance: 0,
      comfort: 0,
      driveSafety: 0,
      technology: 0,
      pricePerformance: 0,
    };
  }

  const categories: RatingCategory[] = [
    "interiorDesign",
    "exteriorDesign",
    "fuelEconomy",
    "performance",
    "comfort",
    "driveSafety",
    "technology",
    "pricePerformance",
  ];

  const averages = {} as CategoryAverages;

  for (const cat of categories) {
    const sum = reviews.reduce((acc, r) => acc + r.ratings[cat], 0);
    averages[cat] = sum / reviews.length;
  }

  return averages;
}

/**
 * Compute overall average rating
 */
export function computeOverallAverage(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.overall, 0);
  return sum / reviews.length;
}

/**
 * Get display label for rating category
 */
export function getCategoryLabel(category: RatingCategory): string {
  const labels: Record<RatingCategory, string> = {
    interiorDesign: "İç Tasarım",
    exteriorDesign: "Dış Tasarım",
    fuelEconomy: "Yakıt Ekonomisi",
    performance: "Performans",
    comfort: "Konfor",
    driveSafety: "Sürüş Güvenliği / Konforu",
    technology: "Teknoloji ve Yenilik",
    pricePerformance: "Fiyat-Performans",
  };
  return labels[category];
}

