"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CarCard } from "@/components/car/card-car";
import { Search, TrendingUp, Star, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Car } from "@/types/car";

interface CarStats {
  carId: string;
  reviewCount: number;
  averageRating: number;
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [carStats, setCarStats] = useState<CarStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const supabase = createClient();

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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

  // Fallback: If stats are empty, aggregate from reviews endpoint
  useEffect(() => {
    const buildStatsFromReviews = async () => {
      // Only run if we finished initial load and have no stats
      if (loading) return;
      if (carStats.length > 0) return;

      try {
        const resp = await fetch('/api/reviews');
        if (!resp.ok) return;
        const data = await resp.json();
        const reviews: Array<{ carId: string; overall: number }> = data.reviews || [];

        // Group by carId and compute counts/averages
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

  // Get unique brands from database cars
  const brands = Array.from(new Set(cars.map(car => car.brand))).sort();

  // Get this week's most reviewed cars
  const carReviewCounts = cars.map((car) => {
    const stats = carStats.find(s => s.carId === car.id);
    return {
      car,
      reviewCount: stats?.reviewCount || 0,
      avgRating: stats?.averageRating || 0,
    };
  });

  const trending = carReviewCounts
    .filter((c) => c.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 4);

  const topRated = carReviewCounts
    .filter((c) => c.reviewCount >= 2)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 4);

  const risingStars = carReviewCounts
    .filter((c) => c.reviewCount >= 1 && c.avgRating >= 4.0)
    .slice(0, 4);

  // If no reviews yet, show some random cars from database
  const fallbackCars = cars.slice(0, 4);
  const fallbackTopRated = cars.slice(4, 8);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AracUzmanı
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Türkiye'nin en kapsamlı araç karşılaştırma ve değerlendirme platformu
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Marka, model veya özellik ara..."
                className="pl-12 pr-4 py-3 text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query.trim()) {
                      window.location.href = `/cars?search=${encodeURIComponent(query)}`;
                    }
                  }
                }}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/cars">
                <Button size="lg" className="px-8">
                  <Search className="mr-2 h-5 w-5" />
                  Tüm Araçları Gör
                </Button>
              </Link>
              <Link href="/compare">
                <Button variant="outline" size="lg" className="px-8">
                  <Zap className="mr-2 h-5 w-5" />
                  Araç Karşılaştır
                </Button>
              </Link>
              {!user && (
                <Link href="/signup">
                  <Button variant="secondary" size="lg" className="px-8">
                    <Star className="mr-2 h-5 w-5" />
                    Ücretsiz Üye Ol
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="container mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 max-w-7xl">
        <h2 className="text-2xl font-bold mb-6">Popüler Markalar</h2>
        <div className="flex flex-wrap gap-2">
          {brands.slice(0, 10).map((brand) => (
            <Link key={brand} href={`/cars?brand=${brand}`}>
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm hover:bg-accent cursor-pointer"
              >
                {brand}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Models */}
      <section className="container mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trend Modeller</h2>
          </div>
          <Link href="/highlights">
            <Button variant="ghost" size="sm">
              Tümünü Gör
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="aspect-video bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))
          ) : (
            (trending.length > 0 ? trending : fallbackCars.map(car => ({ car, reviewCount: 0, avgRating: 0 }))).map(({ car, reviewCount, avgRating }) => (
              <CarCard
                key={car.id}
                car={car}
                averageRating={avgRating}
                reviewCount={reviewCount}
              />
            ))
          )}
        </div>
      </section>

      {/* Top Rated */}
      <section className="container mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">En Yüksek Puanlılar</h2>
          </div>
          <Link href="/highlights">
            <Button variant="ghost" size="sm">
              Tümünü Gör
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
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
      </section>

      {/* Rising Stars */}
      <section className="container mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Yükselen Yıldızlar</h2>
          </div>
          <Link href="/highlights">
            <Button variant="ghost" size="sm">
              Tümünü Gör
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="aspect-video bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))
          ) : (
            (risingStars.length > 0 ? risingStars : cars.slice(8, 12).map(car => ({ car, reviewCount: 0, avgRating: 0 }))).map(({ car, reviewCount, avgRating }) => (
              <CarCard
                key={car.id}
                car={car}
                averageRating={avgRating}
                reviewCount={reviewCount}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

interface CarStats {
  carId: string;
  reviewCount: number;
  averageRating: number;
}

export default function HomePage() {
  const [carStats, setCarStats] = useState<CarStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const supabase = createClient();

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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

  // Fallback: If stats are empty, aggregate from reviews endpoint
  useEffect(() => {
    const buildStatsFromReviews = async () => {
      // Only run if we finished initial load and have no stats
      if (loading) return;
      if (carStats.length > 0) return;

      try {
        const resp = await fetch('/api/reviews');
        if (!resp.ok) return;
        const data = await resp.json();
        const reviews: Array<{ carId: string; overall: number }> = data.reviews || [];

        // Group by carId and compute counts/averages
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

  // Get trending models (cars with most reviews)
  const carReviewCounts = cars.map((car) => {
    const stats = carStats.find(s => s.carId === car.id);
    return {
      car,
      reviewCount: stats?.reviewCount || 0,
      avgRating: stats?.averageRating || 0,
    };
  });

  const trending = carReviewCounts
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 4);

  const popular = carReviewCounts
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 4);

  const brands = [...new Set(cars.map((c) => c.brand))];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 py-20 md:py-28 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              <span>Gerçek sürücülerden gerçek yorumlar</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Mükemmel Aracınızı Bulun
            </h1>
            <p className="text-lg text-muted-foreground">
              Yorumları inceleyin, modelleri karşılaştırın ve kapsamlı araç inceleme veritabanımız ile bilinçli kararlar verin.
            </p>
            <div className="flex gap-3 max-w-xl mx-auto mt-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Marka veya model ara..."
                  className="pl-10 h-12"
                />
              </div>
              <Link href="/cars">
                <Button size="lg" className="h-12">
                  Tümünü Gör
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="container mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 max-w-7xl">
        <h2 className="text-2xl font-bold mb-6">Popüler Markalar</h2>
        <div className="flex flex-wrap gap-2">
          {brands.slice(0, 10).map((brand) => (
            <Link key={brand} href={`/cars?brand=${brand}`}>
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm hover:bg-accent cursor-pointer"
              >
                {brand}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Models */}
      <section className="container mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trend Modeller</h2>
          </div>
          <Link href="/highlights">
            <Button variant="ghost" size="sm">
              Tümünü Gör
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="aspect-video bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))
          ) : (
            trending.map(({ car, reviewCount, avgRating }) => (
              <CarCard
                key={car.id}
                car={car}
                averageRating={avgRating}
                reviewCount={reviewCount}
              />
            ))
          )}
        </div>
      </section>

      {/* Top Rated */}
      <section className="container mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <h2 className="text-2xl font-bold">En Yüksek Puanlılar</h2>
          </div>
          <Link href="/cars?sort=rating">
            <Button variant="ghost" size="sm">
              Tümünü Gör
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="aspect-video bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))
          ) : (
            popular.map(({ car, reviewCount, avgRating }) => (
              <CarCard
                key={car.id}
                car={car}
                averageRating={avgRating}
                reviewCount={reviewCount}
              />
            ))
          )}
        </div>
      </section>

      {/* CTA Section - Only show for non-authenticated users */}
      {!user && (
        <section className="border-t border-border bg-muted/50">
          <div className="container mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-20 text-center max-w-7xl">
            <h2 className="text-3xl font-bold mb-4">
              Deneyiminizi paylaşmaya hazır mısınız?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Gerçek dünya deneyimlerini paylaşan binlerce otomobil tutkununun arasına katılın.
              Yorumunuz diğerlerinin daha iyi kararlar almasına yardımcı olur.
            </p>
            <Link href="/login">
              <Button size="lg">Kayıt Ol ve Yorum Yap</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
