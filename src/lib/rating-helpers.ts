import type { Review, CategoryAverages, RatingCategory } from "@/types/car";

/**
 * Compute average ratings per category for a car
 */
export function computeCategoryAverages(reviews: Review[]): CategoryAverages {
  if (reviews.length === 0) {
    return {
      comfort: 0,
      drive: 0,
      fuelEconomy: 0,
      reliability: 0,
      maintenance: 0,
      interior: 0,
      tech: 0,
      resale: 0,
    };
  }

  const categories: RatingCategory[] = [
    "comfort",
    "drive",
    "fuelEconomy",
    "reliability",
    "maintenance",
    "interior",
    "tech",
    "resale",
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
    comfort: "Konfor",
    drive: "Sürüş",
    fuelEconomy: "Yakıt Ekonomisi",
    reliability: "Güvenilirlik",
    maintenance: "Bakım Maliyeti",
    interior: "İç Mekan",
    tech: "Teknoloji",
    resale: "İkinci El Değeri",
  };
  return labels[category];
}

