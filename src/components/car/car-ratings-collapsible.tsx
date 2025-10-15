"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CategoryAverages, Car } from "@/types/car";
import { getCategoryLabel } from "@/lib/rating-helpers";
import { cn } from "@/lib/cn";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CarRatingsCollapsibleProps {
  averages: CategoryAverages;
  car: Car;
  className?: string;
}

export function CarRatingsCollapsible({
  averages,
  car,
  className,
}: CarRatingsCollapsibleProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Collapsible sections with sub-metrics
  const renderCollapsibleSection = (
    key: keyof CategoryAverages,
    subMetrics: { label: string; value: string | number | undefined }[]
  ) => {
    const value = averages[key];
    const percentage = (value / 5) * 100;
    const isExpanded = expandedSections.has(key);

    return (
      <div key={key} className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(key)}
          className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{getCategoryLabel(key)}</span>
              <Badge variant="secondary" className="text-xs">
                {value.toFixed(1)}
              </Badge>
            </div>
            <Progress value={percentage} max={100} />
          </div>
          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 space-y-2 bg-accent/20">
            {subMetrics.map((metric, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{metric.label}</span>
                <span className="font-medium">
                  {metric.value !== undefined && metric.value !== null 
                    ? metric.value 
                    : "Belirtilmemiş"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Non-collapsible sections (just rating)
  const renderSimpleSection = (key: keyof CategoryAverages) => {
    const value = averages[key];
    const percentage = (value / 5) * 100;

    return (
      <div key={key} className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{getCategoryLabel(key)}</span>
          <Badge variant="secondary" className="text-xs">
            {value.toFixed(1)}
          </Badge>
        </div>
        <Progress value={percentage} max={100} />
      </div>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* İç Tasarım - Collapsible */}
      {renderCollapsibleSection("interiorDesign", [
        { label: "Koltuk Sayısı", value: car.specs.seatCount },
        { label: "Bagaj Hacmi (L)", value: car.specs.trunkVolume },
      ])}

      {/* Dış Tasarım - Collapsible */}
      {renderCollapsibleSection("exteriorDesign", [
        { label: "Kapı Sayısı", value: car.specs.doorCount },
        { label: "Genişlik (mm)", value: car.specs.width },
        { label: "Uzunluk (mm)", value: car.specs.length },
        { label: "Yükseklik (mm)", value: car.specs.height },
        { label: "Ağırlık (kg)", value: car.specs.weight },
        { label: "Gövde Tipi", value: car.specs.bodyType || car.body },
      ])}

      {/* Yakıt Ekonomisi - Collapsible */}
      {renderCollapsibleSection("fuelEconomy", [
        { label: "Yakıt Tipi", value: car.specs.fuelType || car.fuel },
        { label: "Ortalama Yakıt Tüketimi (L/100km)", value: car.specs.avgConsumption },
      ])}

      {/* Performans - Collapsible */}
      {renderCollapsibleSection("performance", [
        { label: "Azami Tork (Nm)", value: car.specs.maxTorque },
        { label: "Azami Hız (km/h)", value: car.specs.maxSpeed },
        { label: "0-100 km/h Hızlanma (s)", value: car.specs.acceleration0to100 },
        { label: "Beygir Gücü (HP)", value: car.specs.horsepower },
        { label: "Vites Türü", value: car.specs.transmissionType || car.transmission },
        { label: "Çekiş Tipi", value: car.specs.driveType },
      ])}

      {/* Konfor - Simple */}
      {renderSimpleSection("comfort")}

      {/* Sürüş Güvenliği / Konforu - Simple */}
      {renderSimpleSection("driveSafety")}

      {/* Teknoloji ve Yenilik - Simple */}
      {renderSimpleSection("technology")}

      {/* Fiyat-Performans - Simple */}
      {renderSimpleSection("pricePerformance")}
    </div>
  );
}

