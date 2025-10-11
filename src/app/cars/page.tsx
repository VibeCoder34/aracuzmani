"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CarCard } from "@/components/car/card-car";
import { FilterSheet } from "@/components/search/filter-sheet";
import { EmptyState } from "@/components/common/empty-state";
import { Filter, Search } from "lucide-react";
import carsData from "@/mock/cars.json";
import reviewsData from "@/mock/reviews.json";
import type { Car, Review } from "@/types/car";
import { computeOverallAverage } from "@/lib/rating-helpers";

const cars = carsData as Car[];
const reviews = reviewsData as Review[];

function CarsPageContent() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    brand: "",
    year: "",
    body: "",
    fuel: "",
    transmission: "",
    minRating: "",
  });

  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam) {
      setFilters(prev => ({ ...prev, brand: brandParam }));
    }
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      brand: "",
      year: "",
      body: "",
      fuel: "",
      transmission: "",
      minRating: "",
    });
  };

  const filteredCars = useMemo(() => {
    let result = cars;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (car) =>
          car.brand.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.brand) {
      result = result.filter((car) => car.brand === filters.brand);
    }
    if (filters.year) {
      result = result.filter((car) => car.year === parseInt(filters.year));
    }
    if (filters.body) {
      result = result.filter((car) => car.body === filters.body);
    }
    if (filters.fuel) {
      result = result.filter((car) => car.fuel === filters.fuel);
    }
    if (filters.transmission) {
      result = result.filter((car) => car.transmission === filters.transmission);
    }
    if (filters.minRating) {
      const minRating = parseFloat(filters.minRating);
      result = result.filter((car) => {
        const carReviews = reviews.filter((r) => r.carId === car.id);
        const avgRating = computeOverallAverage(carReviews);
        return avgRating >= minRating;
      });
    }

    return result;
  }, [searchQuery, filters]);

  const carsWithStats = filteredCars.map((car) => {
    const carReviews = reviews.filter((r) => r.carId === car.id);
    return {
      car,
      reviewCount: carReviews.length,
      avgRating: computeOverallAverage(carReviews),
    };
  });

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container px-6 md:px-8 lg:px-12 py-10 md:py-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-4">Araçları İncele</h1>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Marka veya model ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtreler
            </Button>
          </div>
        </div>

        <div className="flex gap-8 lg:gap-10">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20">
              <FilterSheet
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setShowFilters(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border overflow-auto">
                <FilterSheet
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              {carsWithStats.length} sonuç gösteriliyor
            </p>
            {carsWithStats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {carsWithStats.map(({ car, reviewCount, avgRating }) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    averageRating={avgRating}
                    reviewCount={reviewCount}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Araç bulunamadı"
                description="Filtrelerinizi veya arama sorgunuzu ayarlamayı deneyin"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <CarsPageContent />
    </Suspense>
  );
}
