"use client";

import { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StarRating } from "@/components/ui/star-rating";
import { CarRatingsCollapsible } from "@/components/car/car-ratings-collapsible";
import { ReviewItem } from "@/components/review/review-item";
import { ReviewForm, type ReviewFormData } from "@/components/review/review-form";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ChevronLeft, Plus } from "lucide-react";
import type { Car } from "@/types/car";
import { useReviewStore } from "@/lib/store";
import { computeCategoryAverages, computeOverallAverage } from "@/lib/rating-helpers";
import { createClient } from "@/lib/supabase/client";

type CarModel = {
  id: string;
  slug: string;
  brand: string;
  brandCountry: string | null;
  name: string;
  startYear: number | null;
  endYear: number | null;
  images: string[];
};

type CarTrim = {
  id: string;
  model_id: string;
  year: number;
  trim_name: string | null;
  engine: string | null;
  transmission: string | null;
  fuel_type: string | null;
  body_type: string | null;
  horsepower: number | null;
  max_torque: number | null;
  max_speed: number | null;
  acceleration_0_to_100: number | null;
  avg_consumption: number | null;
  urban_consumption: number | null;
  extra_urban_consumption: number | null;
  drive_type: string | null;
  width: number | null;
  length: number | null;
  height: number | null;
  weight: number | null;
  trunk_volume: number | null;
  seat_count: number | null;
  door_count: number | null;
};

export default function CarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [carModel, setCarModel] = useState<CarModel | null>(null);
  const [selectedTrim, setSelectedTrim] = useState<CarTrim | null>(null);
  const [carLoading, setCarLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("reviews");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewSort, setReviewSort] = useState<"newest" | "rating">("newest");
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    created_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();
  const { reviews: allReviews, setReviews, addReview: addReviewToStore } = useReviewStore();

  // Fetch car model and trims from new API
  useEffect(() => {
    const fetchCarData = async () => {
      setCarLoading(true);
      try {
        console.log(`[CarDetail] Fetching car data for slug: ${slug}`);
        const response = await fetch(`/api/cars/${slug}`);
        console.log(`[CarDetail] API response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[CarDetail] Received data:`, {
            model: data.model?.name,
            trims: data.trims?.length
          });
          setCarModel(data.model);
          // Auto-select newest trim (first one)
          if (data.trims && data.trims.length > 0) {
            setSelectedTrim(data.trims[0]);
          }
        } else {
          const errorText = await response.text();
          console.error(`[CarDetail] Failed to fetch car data:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
        }
      } catch (error) {
        console.error('[CarDetail] Error fetching car:', error);
      } finally {
        setCarLoading(false);
      }
    };

    fetchCarData();
  }, [slug]);

  // Get authenticated user from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch reviews from database for the selected trim
  useEffect(() => {
    if (!selectedTrim) return;
    
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reviews?carId=${selectedTrim.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
          console.log(`[CarDetail] Fetched ${data.reviews?.length || 0} reviews for trim ${selectedTrim.id}`);
        } else {
          console.error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [selectedTrim, setReviews]);

  const carReviews = selectedTrim ? allReviews.filter((r) => r.carId === selectedTrim.id) : [];
  const categoryAverages = computeCategoryAverages(carReviews);
  const overallAverage = computeOverallAverage(carReviews);

  const sortedReviews = [...carReviews].sort((a, b) => {
    if (reviewSort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.overall - a.overall;
  });

  const handleReviewSubmit = async (data: ReviewFormData) => {
    if (!user) {
      alert("Yorum yapmak için lütfen giriş yapın");
      return;
    }

    if (!selectedTrim) {
      alert("Araç bilgileri yükleniyor, lütfen bekleyin");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId: selectedTrim.id,
          text: data.text,
          ratings: data.ratings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      const result = await response.json();
      
      // Add the new review to local state
      addReviewToStore(result.review);

      setShowReviewDialog(false);
      alert("Yorumunuz başarıyla eklendi! 🎉");
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading spinner while car data is being fetched
  if (carLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show 404 if car not found
  if (!carModel) {
    notFound();
  }

  // Create a fake Car object for backwards compatibility with some components
  const legacyCar: Car = {
    id: selectedTrim?.id || '',
    slug: carModel.slug,
    brand: carModel.brand,
    model: carModel.name,
    year: selectedTrim?.year || 0,
    body: selectedTrim?.body_type || 'N/A',
    fuel: selectedTrim?.fuel_type || 'N/A',
    transmission: selectedTrim?.transmission || 'N/A',
    images: carModel.images,
    specs: {
      // From Supabase selectedTrim
      horsepower: selectedTrim?.horsepower ?? undefined,
      maxTorque: selectedTrim?.max_torque ?? undefined,
      maxSpeed: selectedTrim?.max_speed ?? undefined,
      acceleration0to100: selectedTrim?.acceleration_0_to_100 ?? undefined,
      avgConsumption: selectedTrim?.avg_consumption ?? undefined,
      urbanConsumption: selectedTrim?.urban_consumption ?? undefined,
      extraUrbanConsumption: selectedTrim?.extra_urban_consumption ?? undefined,
      fuelType: selectedTrim?.fuel_type ?? undefined,
      transmissionType: selectedTrim?.transmission ?? undefined,
      bodyType: selectedTrim?.body_type ?? undefined,
      driveType: selectedTrim?.drive_type ?? undefined,
      seatCount: selectedTrim?.seat_count ?? undefined,
      doorCount: selectedTrim?.door_count ?? undefined,
      trunkVolume: selectedTrim?.trunk_volume ?? undefined,
      width: selectedTrim?.width ?? undefined,
      length: selectedTrim?.length ?? undefined,
      height: selectedTrim?.height ?? undefined,
      weight: selectedTrim?.weight ?? undefined,
    },
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
                {carModel.brand} {carModel.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {selectedTrim && (
                  <>
                    <Badge variant="secondary">{selectedTrim.year}</Badge>
                    {selectedTrim.body_type && (
                      <Badge variant="outline">{selectedTrim.body_type}</Badge>
                    )}
                    {selectedTrim.fuel_type && (
                      <Badge variant="outline">{selectedTrim.fuel_type}</Badge>
                    )}
                  </>
                )}
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
            <Button onClick={() => setShowReviewDialog(true)} disabled={!selectedTrim}>
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
            {carModel.images[0] && (
              <Image
                src={carModel.images[0]}
                alt={`${carModel.brand} ${carModel.name}`}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {carModel.images.slice(1, 5).map((img, i) => (
              <div
                key={i}
                className="relative aspect-video bg-muted rounded-lg overflow-hidden"
              >
                <Image
                  src={img}
                  alt={`${carModel.brand} ${carModel.name} ${i + 2}`}
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
            <TabsTrigger value="reviews">
              Yorumlar ({carReviews.length})
            </TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
          </TabsList>

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

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : sortedReviews.length > 0 ? (
              <div className="space-y-4">
                {sortedReviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
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
            {selectedTrim && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Kullanıcı Puanları</h2>
                {carReviews.length > 0 ? (
                  <CarRatingsCollapsible 
                    averages={categoryAverages} 
                    car={legacyCar}
                    hasRatings={true}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
                      <p className="text-muted-foreground mb-2 font-medium">
                        Bu araç için henüz kullanıcı puanlaması yapılmamış
                      </p>
                      <p className="text-sm text-muted-foreground">
                        İlk yorumu siz yaparak diğer kullanıcılara yardımcı olabilirsiniz!
                      </p>
                    </div>
                    <CarRatingsCollapsible 
                      averages={categoryAverages} 
                      car={legacyCar}
                      hasRatings={false}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {carModel.brand} {carModel.name} için Yorum Yaz
              {selectedTrim && selectedTrim.year && (
                <span className="text-sm font-normal text-muted-foreground block mt-1">
                  {selectedTrim.year} {selectedTrim.trim_name || ''}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {user ? (
            <ReviewForm
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewDialog(false)}
              disabled={submitting}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Yorum yazmak için lütfen giriş yapın
              </p>
              <Link href="/login">
                <Button>Giriş Yap</Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

