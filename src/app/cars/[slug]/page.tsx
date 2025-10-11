"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StarRating } from "@/components/ui/star-rating";
import { CarSpecTable } from "@/components/car/car-spec-table";
import { CarAvgBadges } from "@/components/car/car-avg-badges";
import { ReviewItem } from "@/components/review/review-item";
import { ReviewForm, type ReviewFormData } from "@/components/review/review-form";
import { EmptyState } from "@/components/common/empty-state";
import { ChevronLeft, Plus } from "lucide-react";
import carsData from "@/mock/cars.json";
import type { Car } from "@/types/car";
import { useAuthStore, useReviewStore, getUserById } from "@/lib/store";
import { computeCategoryAverages, computeOverallAverage } from "@/lib/rating-helpers";

const cars = carsData as Car[];

export default function CarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const car = cars.find((c) => c.slug === slug);

  if (!car) {
    notFound();
  }

  const [activeTab, setActiveTab] = useState("overview");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewSort, setReviewSort] = useState<"newest" | "rating">("newest");

  const { user } = useAuthStore();
  const { reviews: allReviews, addReview } = useReviewStore();

  const carReviews = allReviews.filter((r) => r.carId === car.id);
  const categoryAverages = computeCategoryAverages(carReviews);
  const overallAverage = computeOverallAverage(carReviews);

  const sortedReviews = [...carReviews].sort((a, b) => {
    if (reviewSort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.overall - a.overall;
  });

  const handleReviewSubmit = (data: ReviewFormData) => {
    if (!user) {
      alert("Please sign in to submit a review");
      return;
    }

    const overall =
      Object.values(data.ratings).reduce((sum, val) => sum + val, 0) / 8;

    addReview({
      carId: car.id,
      userId: user.id,
      text: data.text,
      ratings: data.ratings,
      overall,
    });

    setShowReviewDialog(false);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container px-6 md:px-8 lg:px-12 py-8 md:py-10 max-w-7xl mx-auto">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Araçlara Dön
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {car.brand} {car.model}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary">{car.year}</Badge>
                <Badge variant="outline">{car.body}</Badge>
                <Badge variant="outline">{car.fuel}</Badge>
                {carReviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating value={overallAverage} readonly size="sm" />
                    <span className="text-sm text-muted-foreground">
                      ({carReviews.length} yorum)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={() => setShowReviewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yorum Ekle
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="container px-6 md:px-8 lg:px-12 py-10 md:py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {car.images[0] && (
              <Image
                src={car.images[0]}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {car.images.slice(1, 5).map((img, i) => (
              <div
                key={i}
                className="relative aspect-video bg-muted rounded-lg overflow-hidden"
              >
                <Image
                  src={img}
                  alt={`${car.brand} ${car.model} ${i + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container px-6 md:px-8 lg:px-12 pb-12 md:pb-16 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="reviews">
              Yorumlar ({carReviews.length})
            </TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-6">
            {carReviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Kullanıcı Puanları</h2>
                <CarAvgBadges averages={categoryAverages} />
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Teknik Özellikler</h2>
              <CarSpecTable specs={car.specs} />
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Yorumlar</h2>
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value as "newest" | "rating")}
                className="text-sm border border-border rounded-md px-3 py-2 bg-background"
              >
                <option value="newest">En Yeni</option>
                <option value="rating">En Yüksek Puan</option>
              </select>
            </div>

            {sortedReviews.length > 0 ? (
              <div className="space-y-4">
                {sortedReviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    user={getUserById(review.userId)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Henüz yorum yok"
                description="Bu aracı yorumlayan ilk kişi siz olun"
                icon="file"
              />
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-8 mt-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Kategori Puanları</h2>
              {carReviews.length > 0 ? (
                <CarAvgBadges averages={categoryAverages} />
              ) : (
                <EmptyState
                  title="Henüz değerlendirme yok"
                  description="Yorumlar gönderildikten sonra burada görünecek"
                  icon="file"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {car.brand} {car.model} için Yorum Yaz
            </DialogTitle>
          </DialogHeader>
          {user ? (
            <ReviewForm
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewDialog(false)}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Yorum yazmak için lütfen giriş yapın
              </p>
              <Link href="/auth">
                <Button>Giriş Yap</Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

