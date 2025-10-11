import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarCard } from "@/components/car/card-car";
import { TrendingUp, Star, MessageSquare } from "lucide-react";
import carsData from "@/mock/cars.json";
import reviewsData from "@/mock/reviews.json";
import type { Car, Review } from "@/types/car";
import { computeOverallAverage } from "@/lib/rating-helpers";

const cars = carsData as Car[];
const reviews = reviewsData as Review[];

export default function HighlightsPage() {
  // Get this week's most reviewed (mock: just most reviewed overall)
  const carReviewCounts = cars.map((car) => {
    const carReviews = reviews.filter((r) => r.carId === car.id);
    return {
      car,
      reviewCount: carReviews.length,
      avgRating: computeOverallAverage(carReviews),
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
                <div className="text-3xl font-bold">{reviews.length}</div>
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
                  {new Set(reviews.map((r) => r.carId)).size}
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
                  {computeOverallAverage(reviews).toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

