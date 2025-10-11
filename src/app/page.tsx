import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CarCard } from "@/components/car/card-car";
import { Search, TrendingUp, Star, Zap } from "lucide-react";
import carsData from "@/mock/cars.json";
import reviewsData from "@/mock/reviews.json";
import type { Car, Review } from "@/types/car";
import { computeOverallAverage } from "@/lib/rating-helpers";

const cars = carsData as Car[];
const reviews = reviewsData as Review[];

export default function HomePage() {
  // Get trending models (cars with most reviews)
  const carReviewCounts = cars.map((car) => ({
    car,
    reviewCount: reviews.filter((r) => r.carId === car.id).length,
    avgRating: computeOverallAverage(reviews.filter((r) => r.carId === car.id)),
  }));

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
          {trending.map(({ car, reviewCount, avgRating }) => (
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
          {popular.map(({ car, reviewCount, avgRating }) => (
            <CarCard
              key={car.id}
              car={car}
              averageRating={avgRating}
              reviewCount={reviewCount}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-20 text-center max-w-7xl">
          <h2 className="text-3xl font-bold mb-4">
            Deneyiminizi paylaşmaya hazır mısınız?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerçek dünya deneyimlerini paylaşan binlerce otomobil tutkununun arasına katılın.
            Yorumunuz diğerlerinin daha iyi kararlar almasına yardımcı olur.
          </p>
          <Link href="/auth">
            <Button size="lg">Kayıt Ol ve Yorum Yap</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
