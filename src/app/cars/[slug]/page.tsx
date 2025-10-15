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
import { CarSpecTable } from "@/components/car/car-spec-table";
import { CarAvgBadges } from "@/components/car/car-avg-badges";
import { CarRatingsCollapsible } from "@/components/car/car-ratings-collapsible";
import { ReviewItem } from "@/components/review/review-item";
import { ReviewForm, type ReviewFormData } from "@/components/review/review-form";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ChevronLeft, Plus } from "lucide-react";
import type { Car, Review } from "@/types/car";
import { useReviewStore } from "@/lib/store";
import { computeCategoryAverages, computeOverallAverage } from "@/lib/rating-helpers";
import { createClient } from "@/lib/supabase/client";

export default function CarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [car, setCar] = useState<Car | null>(null);
  const [carLoading, setCarLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewSort, setReviewSort] = useState<"newest" | "rating">("newest");
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    created_at?: string;
  } | null>(null);
  const [profile, setProfile] = useState<{
    full_name?: string;
    username?: string;
    avatar_url?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();
  const { reviews: allReviews, setReviews, addReview: addReviewToStore } = useReviewStore();

  // Fetch car data from API
  useEffect(() => {
    const fetchCar = async () => {
      setCarLoading(true);
      try {
        const response = await fetch('/api/cars');
        if (response.ok) {
          const data = await response.json();
          const foundCar = data.cars.find((c: Car) => c.slug === slug);
          if (foundCar) {
            setCar(foundCar);
          }
        }
      } catch (error) {
        console.error('Error fetching car:', error);
      } finally {
        setCarLoading(false);
      }
    };

    fetchCar();
  }, [slug]);

  // Get authenticated user from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Get profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch reviews from database
  useEffect(() => {
    if (!car) return;
    
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reviews?carId=${car.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
          console.log(`[CarDetail] Fetched ${data.reviews?.length || 0} reviews for ${car.id}`);
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
  }, [car, setReviews]);

  const carReviews = allReviews.filter((r) => r.carId === car.id);
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

    if (!car) {
      alert("Araç bilgisi yükleniyor, lütfen bekleyin");
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
          carId: car.id,
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
  if (!car) {
    notFound();
  }

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
                <CarRatingsCollapsible averages={categoryAverages} car={car} />
              </div>
            )}
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

