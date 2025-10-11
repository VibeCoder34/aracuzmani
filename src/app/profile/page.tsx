"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewItem } from "@/components/review/review-item";
import { EmptyState } from "@/components/common/empty-state";
import { Star, MessageSquare, Calendar, TrendingUp } from "lucide-react";
import { useAuthStore, useReviewStore } from "@/lib/store";
import { formatDate } from "@/lib/formatters";
import carsData from "@/mock/cars.json";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { reviews: allReviews } = useReviewStore();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const userReviews = allReviews.filter((r) => r.userId === user.id);
  const avgUserRating =
    userReviews.length > 0
      ? userReviews.reduce((sum, r) => sum + r.overall, 0) / userReviews.length
      : 0;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container px-6 md:px-8 lg:px-12 py-10 md:py-12 max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-10">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-24 w-24">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                )}
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Katılım {formatDate(user.joinDate)}</span>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Çıkış Yap
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="reviews">
              Yorumlarım ({userReviews.length})
            </TabsTrigger>
            <TabsTrigger value="insights">İstatistikler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Toplam Yorum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold">
                      {userReviews.length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ortalama Puan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-primary fill-primary" />
                    <div className="text-3xl font-bold">
                      {avgUserRating.toFixed(1)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Faydalı Bulma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold">
                      {userReviews.reduce((sum, r) => sum + r.helpfulCount, 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {userReviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Son Yorumlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userReviews.slice(0, 3).map((review) => {
                    const car = cars.find((c) => c.id === review.carId);
                    return (
                      <div key={review.id}>
                        {car && (
                          <div className="mb-2">
                            <Badge variant="secondary">
                              {car.brand} {car.model}
                            </Badge>
                          </div>
                        )}
                        <ReviewItem
                          review={review}
                          user={user}
                          showCategories={false}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 mt-6">
            {userReviews.length > 0 ? (
              userReviews.map((review) => {
                const car = cars.find((c) => c.id === review.carId);
                return (
                  <div key={review.id}>
                    {car && (
                      <div className="mb-2">
                        <Badge variant="secondary" className="text-sm">
                          {car.brand} {car.model} {car.year}
                        </Badge>
                      </div>
                    )}
                    <ReviewItem review={review} user={user} />
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="Henüz yorum yok"
                description="Araçları yorumlamaya başlayın, burada görünecek"
                icon="file"
              />
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Yorum İstatistikleriniz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    En Faydalı Yorum
                  </span>
                  <span className="font-semibold">
                    {userReviews.length > 0
                      ? Math.max(...userReviews.map((r) => r.helpfulCount))
                      : 0}{" "}
                    oy
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Yorumlanan Araç
                  </span>
                  <span className="font-semibold">
                    {new Set(userReviews.map((r) => r.carId)).size}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Yorum Başına Ortalama Kelime
                  </span>
                  <span className="font-semibold">
                    {userReviews.length > 0
                      ? Math.round(
                          userReviews.reduce(
                            (sum, r) => sum + r.text.split(" ").length,
                            0
                          ) / userReviews.length
                        )
                      : 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

