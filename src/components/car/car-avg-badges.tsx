import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CategoryAverages, RatingCategory } from "@/types/car";
import { getCategoryLabel } from "@/lib/rating-helpers";
import { cn } from "@/lib/cn";

interface CarAvgBadgesProps {
  averages: CategoryAverages;
  className?: string;
  showProgress?: boolean;
}

export function CarAvgBadges({
  averages,
  className,
  showProgress = true,
}: CarAvgBadgesProps) {
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

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {categories.map((cat) => {
        const value = averages[cat];
        const percentage = (value / 5) * 100;

        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{getCategoryLabel(cat)}</span>
              <Badge variant="secondary" className="text-xs">
                {value.toFixed(1)}
              </Badge>
            </div>
            {showProgress && <Progress value={percentage} max={100} />}
          </div>
        );
      })}
    </div>
  );
}

