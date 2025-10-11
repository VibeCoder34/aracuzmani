"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterSheetProps {
  filters: {
    brand: string;
    year: string;
    body: string;
    fuel: string;
    transmission: string;
    minRating: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onClose?: () => void;
}

const brandOptions = [
  "Toyota",
  "Honda",
  "Tesla",
  "Ford",
  "Mazda",
  "BMW",
  "Hyundai",
  "Chevrolet",
  "Subaru",
  "Audi",
  "Lexus",
  "Porsche",
  "Kia",
  "Volkswagen",
  "Nissan",
];

const bodyOptions = ["Sedan", "SUV", "Truck", "Coupe", "Wagon"];
const fuelOptions = ["Gasoline", "Hybrid", "Electric"];
const transmissionOptions = ["Automatic", "Manual", "CVT", "PDK", "Single-Speed"];

export function FilterSheet({
  filters,
  onFilterChange,
  onClearFilters,
  onClose,
}: FilterSheetProps) {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtreler</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="brand">Marka</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {brandOptions.map((brand) => (
              <Badge
                key={brand}
                variant={filters.brand === brand ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  onFilterChange("brand", filters.brand === brand ? "" : brand)
                }
              >
                {brand}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="year">Yıl</Label>
          <Input
            id="year"
            type="number"
            placeholder="örn., 2024"
            value={filters.year}
            onChange={(e) => onFilterChange("year", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="body">Kasa Tipi</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {bodyOptions.map((body) => (
              <Badge
                key={body}
                variant={filters.body === body ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  onFilterChange("body", filters.body === body ? "" : body)
                }
              >
                {body}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="fuel">Yakıt Tipi</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {fuelOptions.map((fuel) => (
              <Badge
                key={fuel}
                variant={filters.fuel === fuel ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  onFilterChange("fuel", filters.fuel === fuel ? "" : fuel)
                }
              >
                {fuel}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="transmission">Şanzıman</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {transmissionOptions.map((trans) => (
              <Badge
                key={trans}
                variant={filters.transmission === trans ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  onFilterChange(
                    "transmission",
                    filters.transmission === trans ? "" : trans
                  )
                }
              >
                {trans}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="minRating">Minimum Puan</Label>
          <Input
            id="minRating"
            type="number"
            min="0"
            max="5"
            step="0.5"
            placeholder="örn., 4.0"
            value={filters.minRating}
            onChange={(e) => onFilterChange("minRating", e.target.value)}
          />
        </div>
      </div>

      <Button variant="outline" onClick={onClearFilters} className="w-full">
        Tüm Filtreleri Temizle
      </Button>
    </div>
  );
}

