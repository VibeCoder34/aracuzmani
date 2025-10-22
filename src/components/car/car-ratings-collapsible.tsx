"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CategoryAverages, Car } from "@/types/car";
import { getCategoryLabel } from "@/lib/rating-helpers";
import { cn } from "@/lib/cn";
import { ChevronDown, ChevronUp } from "lucide-react";
import { translateBodyType, translateFuelType, translateTransmissionType, translateDriveType } from "@/lib/translations";

interface CarRatingsCollapsibleProps {
  averages: CategoryAverages;
  car: Car;
  className?: string;
  hasRatings?: boolean; // New prop to indicate if there are actual ratings
}

export function CarRatingsCollapsible({
  averages,
  car,
  className,
  hasRatings = true,
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
    const percentage = hasRatings ? (value / 5) * 100 : 0;
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
              {hasRatings ? (
                <Badge variant="secondary" className="text-xs">
                  {value.toFixed(1)}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Henüz puanlanmadı
                </Badge>
              )}
            </div>
            {hasRatings && <Progress value={percentage} max={100} />}
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
            {subMetrics.map((metric, idx) => {
              // Özel görünüm: "Not" etiketi için tam genişlikte bilgi kutusu
              if (metric.label === "Not") {
                return (
                  <div key={idx} className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                      ℹ️ {metric.value}
                    </p>
                  </div>
                );
              }
              
              // Normal görünüm: Diğer metrikler için
              return (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="font-medium">
                    {metric.value !== undefined && metric.value !== null 
                      ? metric.value 
                      : "Belirtilmemiş"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Non-collapsible sections (just rating)
  const renderSimpleSection = (key: keyof CategoryAverages) => {
    const value = averages[key];
    const percentage = hasRatings ? (value / 5) * 100 : 0;

    return (
      <div key={key} className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{getCategoryLabel(key)}</span>
          {hasRatings ? (
            <Badge variant="secondary" className="text-xs">
              {value.toFixed(1)}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Henüz puanlanmadı
            </Badge>
          )}
        </div>
        {hasRatings && <Progress value={percentage} max={100} />}
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
        { label: "Gövde Tipi", value: translateBodyType(car.specs.bodyType || car.body) },
      ])}

      {/* Yakıt Ekonomisi - Collapsible */}
      {(() => {
        const fuelType = car.specs.fuelType || car.fuel;
        const translatedFuelType = translateFuelType(fuelType);
        const isElectric = fuelType?.toLowerCase().includes('electric') || 
                          fuelType?.toLowerCase().includes('elektrik');
        
        if (isElectric) {
          // Elektrikli araçlar için özel gösterim
          return renderCollapsibleSection("fuelEconomy", [
            { label: "Yakıt Tipi", value: translatedFuelType },
            { label: "Enerji Kaynağı", value: "Elektrik" },
            { label: "Not", value: "Elektrikli araçlar için yakıt tüketimi yerine enerji tüketimi (kWh/100km) ölçülür" },
          ]);
        } else {
          // Benzin/Dizel araçlar için normal gösterim
          return renderCollapsibleSection("fuelEconomy", [
            { label: "Yakıt Tipi", value: translatedFuelType },
            { label: "Ortalama Yakıt Tüketimi (L/100km)", value: car.specs.avgConsumption },
            { label: "Şehir İçi Yakıt Tüketimi (L/100km)", value: car.specs.urbanConsumption },
            { label: "Şehir Dışı Yakıt Tüketimi (L/100km)", value: car.specs.extraUrbanConsumption },
          ]);
        }
      })()}

      {/* Performans - Collapsible */}
      {renderCollapsibleSection("performance", [
        { label: "Azami Tork (Nm)", value: car.specs.maxTorque },
        { label: "Azami Hız (km/h)", value: car.specs.maxSpeed },
        { label: "0-100 km/h Hızlanma (s)", value: car.specs.acceleration0to100 },
        { label: "Beygir Gücü (HP)", value: car.specs.horsepower },
        { label: "Vites Türü", value: translateTransmissionType(car.specs.transmissionType || car.transmission) },
        { label: "Çekiş Tipi", value: translateDriveType(car.specs.driveType) },
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

