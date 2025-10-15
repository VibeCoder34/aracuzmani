"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/common/empty-state";
import { ReviewItem } from "@/components/review/review-item";
import { X, Plus, MessageSquare } from "lucide-react";
import carsData from "@/mock/cars.json";
import type { Car } from "@/types/car";
import { translateSpecKey } from "@/lib/spec-translator";

const cars = carsData as Car[];

interface CarStats {
  carId: string;
  reviewCount: number;
  averageRating: number;
}

interface CarReviews {
  carId: string;
  reviews: (Review & { user?: { id: string; name: string; avatarUrl?: string | null } })[];
}

export default function ComparePage() {
  const [selectedCarIds, setSelectedCarIds] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [carStats, setCarStats] = useState<CarStats[]>([]);
  const [carReviews, setCarReviews] = useState<CarReviews[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch review statistics for selected cars
  useEffect(() => {
    const fetchCarStats = async () => {
      if (selectedCarIds.length === 0) {
        setCarStats([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const carIdsParam = selectedCarIds.join(',');
        const response = await fetch(`/api/cars/stats?carIds=${carIdsParam}`);
        if (response.ok) {
          const data = await response.json();
          setCarStats(data.stats || []);
        } else {
          console.error('Failed to fetch car stats');
        }
      } catch (error) {
        console.error('Error fetching car stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarStats();
  }, [selectedCarIds]);

  // Fetch reviews for selected cars
  useEffect(() => {
    const fetchReviews = async () => {
      if (selectedCarIds.length === 0) {
        setCarReviews([]);
        return;
      }

      setLoadingReviews(true);
      try {
        const reviewPromises = selectedCarIds.map(async (carId) => {
          const response = await fetch(`/api/reviews?carId=${carId}&limit=5`);
          if (response.ok) {
            const data = await response.json();
            return {
              carId,
              reviews: data.reviews || [],
            };
          }
          return { carId, reviews: [] };
        });

        const results = await Promise.all(reviewPromises);
        setCarReviews(results);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [selectedCarIds]);

  const selectedCars = selectedCarIds.map((id) => {
    const car = cars.find((c) => c.id === id)!;
    const stats = carStats.find(s => s.carId === id);
    const carReviewData = carReviews.find(r => r.carId === id);
    return {
      car,
      carReviews: carReviewData?.reviews || [],
      avgRating: stats?.averageRating || 0,
      reviewCount: stats?.reviewCount || 0,
      categoryAvg: {}, // Category averages would need individual review data
    };
  });

  const handleAddCar = (carId: string) => {
    if (selectedCarIds.length >= 3) {
      alert("You can only compare up to 3 cars");
      return;
    }
    if (!selectedCarIds.includes(carId)) {
      setSelectedCarIds([...selectedCarIds, carId]);
    }
    setShowSelector(false);
  };

  const handleRemoveCar = (carId: string) => {
    setSelectedCarIds(selectedCarIds.filter((id) => id !== carId));
  };

  // Get all unique spec keys
  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    selectedCars.forEach(({ car }) => {
      Object.keys(car.specs).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, [selectedCars]);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container px-6 md:px-8 lg:px-12 py-10 md:py-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Araçları Karşılaştır</h1>
          <p className="text-muted-foreground">
            Yan yana karşılaştırmak için en fazla 3 araç seçin ve detaylı karşılaştırma yapın
          </p>
        </div>

        {selectedCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <EmptyState
              title="Henüz araç seçilmedi"
              description="Karşılaştırmak istediğiniz araçları seçmeye başlayın"
            />
            <Button onClick={() => setShowSelector(true)} size="lg" className="mt-6">
              <Plus className="h-5 w-5 mr-2" />
              İlk Aracı Seç
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Car Cards with Images */}
            <div className={`grid gap-6 ${selectedCars.length === 1 ? 'md:grid-cols-1 max-w-2xl mx-auto' : selectedCars.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {selectedCars.map(({ car, avgRating, reviewCount }) => (
                <Card key={car.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-muted">
                    {car.images[0] && (
                      <Image
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model}`}
                        fill
                        className="object-cover"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveCar(car.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="pt-5 pb-6">
                    <h3 className="text-xl font-bold mb-1">
                      {car.brand} {car.model}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">{car.year}</Badge>
                      <Badge variant="outline">{car.body}</Badge>
                    </div>
                    {loading ? (
                      <div className="flex items-center gap-2 mb-4 h-8">
                        <div className="animate-pulse flex items-center gap-2">
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-4 w-16 bg-muted rounded"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-4">
                        <StarRating value={avgRating} readonly size="sm" />
                        <span className="text-lg font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({reviewCount} yorum)
                        </span>
                      </div>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yakıt:</span>
                        <span className="font-medium">{car.fuel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Şanzıman:</span>
                        <span className="font-medium">{car.transmission}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add Car Card */}
              {selectedCars.length < 3 && (
                <Card 
                  className="border-dashed border-2 cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors flex items-center justify-center min-h-[300px]"
                  onClick={() => setShowSelector(true)}
                >
                  <div className="text-center p-6">
                    <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Araç Ekle</h3>
                    <p className="text-sm text-muted-foreground">
                      Karşılaştırmaya yeni araç ekleyin
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Overall Rating Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Genel Puan Karşılaştırması</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCars.map(({ car, avgRating, reviewCount }) => {
                      const maxRating = Math.max(...selectedCars.map(c => c.avgRating));
                      const isMax = avgRating === maxRating && avgRating > 0;
                      return (
                        <div key={car.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {car.brand} {car.model}
                            </span>
                            <span className={`font-semibold ${isMax ? 'text-primary' : ''}`}>
                              {avgRating.toFixed(1)} ({reviewCount} yorum)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isMax ? 'bg-primary' : 'bg-primary/60'
                              }`}
                              style={{ width: `${(avgRating / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Teknik Özellikler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground bg-muted/50">
                          Özellik
                        </th>
                        {selectedCars.map(({ car }) => (
                          <th key={car.id} className="text-left py-3 px-4 font-semibold bg-muted/50">
                            {car.brand}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allSpecKeys.map((key, index) => (
                        <tr key={key} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="py-3 px-4 font-medium text-sm">
                            {translateSpecKey(key)}
                          </td>
                          {selectedCars.map(({ car }) => (
                            <td key={car.id} className="py-3 px-4 text-sm">
                              {car.specs[key] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="bg-muted/20">
                        <td className="py-3 px-4 font-medium text-sm">Kasa Tipi</td>
                        {selectedCars.map(({ car }) => (
                          <td key={car.id} className="py-3 px-4 text-sm">
                            <Badge variant="secondary" className="text-xs">
                              {car.body}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-sm">Yakıt Tipi</td>
                        {selectedCars.map(({ car }) => (
                          <td key={car.id} className="py-3 px-4 text-sm">
                            {car.fuel}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-muted/20">
                        <td className="py-3 px-4 font-medium text-sm">Şanzıman</td>
                        {selectedCars.map(({ car }) => (
                          <td key={car.id} className="py-3 px-4 text-sm">
                            {car.transmission}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Kullanıcı Yorumları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid gap-6 ${selectedCars.length === 1 ? 'md:grid-cols-1' : selectedCars.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                  {selectedCars.map(({ car, carReviews, reviewCount }) => (
                    <div key={car.id} className="space-y-4">
                      <div className="pb-3 border-b">
                        <h3 className="font-semibold text-lg">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {reviewCount} yorum • Son 5 yorum gösteriliyor
                        </p>
                      </div>
                      
                      {loadingReviews ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : carReviews.length > 0 ? (
                        <div className="space-y-3">
                          {carReviews.map((review) => (
                            <ReviewItem 
                              key={review.id} 
                              review={review}
                              showCategories={false}
                              className="text-sm"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Henüz yorum yok
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Car Selector Dialog */}
        {showSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowSelector(false)}
            />
            <div className="relative z-50 w-full max-w-2xl max-h-[80vh] overflow-auto bg-background border border-border rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Bir Araç Seçin</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSelector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3">
                {cars
                  .filter((car) => !selectedCarIds.includes(car.id))
                  .map((car) => (
                    <button
                      key={car.id}
                      onClick={() => handleAddCar(car.id)}
                      className="flex items-center gap-4 text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <div className="relative w-24 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                        {car.images[0] && (
                          <Image
                            src={car.images[0]}
                            alt={`${car.brand} ${car.model}`}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {car.brand} {car.model}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {car.year} • {car.body}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

