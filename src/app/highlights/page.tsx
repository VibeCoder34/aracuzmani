"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarCard } from "@/components/car/card-car";
import { TrendingUp, Star, MessageSquare } from "lucide-react";
import type { Car } from "@/types/car";

interface CarStats {
  carId: string;
  reviewCount: number;
  averageRating: number;
}

export default function HighlightsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [carStats, setCarStats] = useState<CarStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cars from database
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('/api/cars');
        if (response.ok) {
          const data = await response.json();
          setCars(data.cars || []);
        } else {
          console.error('Failed to fetch cars');
        }
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };

    fetchCars();
  }, []);

  // Fetch review statistics from database
  useEffect(() => {
    const fetchCarStats = async () => {
      try {
        const response = await fetch('/api/cars/stats');
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
  }, []);

  // Fallback: If stats are empty (no DB aggregation yet), compute from reviews endpoint
  useEffect(() => {
    const buildStatsFromReviews = async () => {
      if (loading) return;           // wait until initial load done
      if (carStats.length > 0) return; // already have stats

      try {
        const resp = await fetch('/api/reviews');
        if (!resp.ok) return;
        const data = await resp.json();
        const reviews: Array<{ carId: string; overall: number }> = data.reviews || [];

        const map = new Map<string, { count: number; total: number }>();
        for (const r of reviews) {
          if (!r.carId) continue;
          const agg = map.get(r.carId) || { count: 0, total: 0 };
          map.set(r.carId, { count: agg.count + 1, total: agg.total + (r.overall || 0) });
        }

        const statsFromReviews = Array.from(map.entries()).map(([carId, agg]) => ({
          carId,
          reviewCount: agg.count,
          averageRating: agg.count > 0 ? agg.total / agg.count : 0,
        }));

        if (statsFromReviews.length > 0) {
          setCarStats(statsFromReviews);
        }
      } catch (e) {
        console.error('Error building stats from reviews:', e);
      }
    };

    buildStatsFromReviews();
  }, [loading, carStats.length]);

  // Get this week's most reviewed cars
  const carReviewCounts = cars.map((car) => {
    const stats = carStats.find(s => s.carId === car.id);
    return {
      car,
      reviewCount: stats?.reviewCount || 0,
      avgRating: stats?.averageRating || 0,
    };
  });

  const mostReviewed = carReviewCounts
    .filter((c) => c.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6);

  const topRated = carReviewCounts
    .filter((c) => c.reviewCount >= 2)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 6);

  const risingStars = carReviewCounts
    .filter((c) => c.reviewCount >= 1 && c.avgRating >= 4.0)
    .slice(0, 6);

  // Fallback cars if no reviews yet
  const fallbackCars = cars.slice(0, 6);
  const fallbackTopRated = cars.slice(6, 12);
  const fallbackRisingStars = cars.slice(12, 18);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container px-6 md:px-8 lg:px-12 py-10 md:py-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Haftalık Öne Çıkanlar</h1>
          <p className="text-muted-foreground">
            Bu haftanın trend modellerini ve en yüksek puanlı araçlarını keşfedin
          </p>
        </div>

        <div className="space-y-14 md:space-y-16">
          {/* Most Reviewed */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  En Çok Değerlendirilenler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                        <div className="aspect-video bg-muted rounded mb-4"></div>
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    ))
                  ) : (
                    (mostReviewed.length > 0 ? mostReviewed : fallbackCars.map(car => ({ car, reviewCount: 0, avgRating: 0 }))).map(({ car, reviewCount, avgRating }) => (
                      <CarCard
                        key={car.id}
                        car={car}
                        averageRating={avgRating}
                        reviewCount={reviewCount}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Top Rated */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  En Yüksek Puanlılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                        <div className="aspect-video bg-muted rounded mb-4"></div>
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    ))
                  ) : (
                    (topRated.length > 0 ? topRated : fallbackTopRated.map(car => ({ car, reviewCount: 0, avgRating: 0 }))).map(({ car, reviewCount, avgRating }) => (
                      <CarCard
                        key={car.id}
                        car={car}
                        averageRating={avgRating}
                        reviewCount={reviewCount}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Rising Stars */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Yükselen Yıldızlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                        <div className="aspect-video bg-muted rounded mb-4"></div>
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    ))
                  ) : (
                    (risingStars.length > 0 ? risingStars : fallbackRisingStars.map(car => ({ car, reviewCount: 0, avgRating: 0 }))).map(({ car, reviewCount, avgRating }) => (
                      <CarCard
                        key={car.id}
                        car={car}
                        averageRating={avgRating}
                        reviewCount={reviewCount}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

interface CarStats {
  carId: string;
  reviewCount: number;
  averageRating: number;
}

export default function HighlightsPage() {
  const [carStats, setCarStats] = useState<CarStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch review statistics from database
  useEffect(() => {
    const fetchCarStats = async () => {
      try {
        const response = await fetch('/api/cars/stats');
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
  }, []);

  // Fallback: If stats are empty (no DB aggregation yet), compute from reviews endpoint
  useEffect(() => {
    const buildStatsFromReviews = async () => {
      if (loading) return;           // wait until initial load done
      if (carStats.length > 0) return; // already have stats

      try {
        const resp = await fetch('/api/reviews');
        if (!resp.ok) return;
        const data = await resp.json();
        const reviews: Array<{ carId: string; overall: number }> = data.reviews || [];

        const map = new Map<string, { count: number; total: number }>();
        for (const r of reviews) {
          if (!r.carId) continue;
          const agg = map.get(r.carId) || { count: 0, total: 0 };
          map.set(r.carId, { count: agg.count + 1, total: agg.total + (r.overall || 0) });
        }

        const statsFromReviews = Array.from(map.entries()).map(([carId, agg]) => ({
          carId,
          reviewCount: agg.count,
          averageRating: agg.count > 0 ? agg.total / agg.count : 0,
        }));

        if (statsFromReviews.length > 0) {
          setCarStats(statsFromReviews);
        }
      } catch (e) {
        console.error('Error building highlights stats from reviews:', e);
      }
    };

    buildStatsFromReviews();
  }, [loading, carStats.length]);

  // Get this week's most reviewed cars
  const carReviewCounts = cars.map((car) => {
    const stats = carStats.find(s => s.carId === car.id);
    return {
      car,
      reviewCount: stats?.reviewCount || 0,
      avgRating: stats?.averageRating || 0,
    };
  });

  const mostReviewed = carReviewCounts
    .filter((c) => c.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6);

  const topRated = carReviewCounts
    .filter((c) => c.reviewCount >= 2)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 6);

  const risingStars = carReviewCounts
    .filter((c) => c.reviewCount >= 1 && c.avgRating >= 4.0)
    .slice(0, 6);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container px-6 md:px-8 lg:px-12 py-10 md:py-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Haftalık Öne Çıkanlar</h1>
          <p className="text-muted-foreground">
            Bu haftanın trend modellerini ve en yüksek puanlı araçlarını keşfedin
          </p>
        </div>

        <div className="space-y-14 md:space-y-16">
          {/* Most Reviewed This Week */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Bu Haftanın En Çok Yorumlananları</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mostReviewed.map(({ car, reviewCount, avgRating }) => (
                <CarCard
                  key={car.id}
                  car={car}
                  averageRating={avgRating}
                  reviewCount={reviewCount}
                />
              ))}
            </div>
          </section>

          {/* Top Rated */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Star className="h-6 w-6 text-primary fill-primary" />
              <h2 className="text-2xl font-bold">En Yüksek Puanlı Araçlar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRated.map(({ car, reviewCount, avgRating }) => (
                <CarCard
                  key={car.id}
                  car={car}
                  averageRating={avgRating}
                  reviewCount={reviewCount}
                />
              ))}
            </div>
          </section>

          {/* Rising Stars */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Yükselen Yıldızlar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {risingStars.map(({ car, reviewCount, avgRating }) => (
                <CarCard
                  key={car.id}
                  car={car}
                  averageRating={avgRating}
                  reviewCount={reviewCount}
                />
              ))}
            </div>
          </section>

          {/* Stats Overview */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Toplam Yorum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? "..." : carStats.reduce((sum, s) => sum + s.reviewCount, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Yorumlanan Araç
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? "..." : carStats.filter(s => s.reviewCount > 0).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ortalama Puan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? "..." : carStats.length > 0 
                    ? (carStats.reduce((sum, s) => sum + s.averageRating * s.reviewCount, 0) / 
                       carStats.reduce((sum, s) => sum + s.reviewCount, 0)).toFixed(1)
                    : "0.0"}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

