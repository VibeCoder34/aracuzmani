import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import type { Car } from "@/types/car";
import { cn } from "@/lib/cn";

interface CarCardProps {
  car: Car;
  averageRating?: number;
  reviewCount?: number;
  className?: string;
}

export function CarCard({
  car,
  averageRating = 0,
  reviewCount = 0,
  className,
}: CarCardProps) {
  return (
    <Link href={`/cars/${car.slug}`}>
      <Card
        className={cn(
          "hover:shadow-md transition-shadow cursor-pointer overflow-hidden group",
          className
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {car.images[0] ? (
            <Image
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {car.brand} {car.model}
              </h3>
              <p className="text-sm text-muted-foreground">{car.year}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {car.body}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{car.fuel}</span>
            <span>•</span>
            <span>{car.transmission}</span>
          </div>
          {reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={averageRating} readonly size="sm" />
              <span className="text-sm text-muted-foreground">
                ({reviewCount})
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

