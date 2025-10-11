"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp } from "lucide-react";
import type { Review, User } from "@/types/car";
import { formatRelativeTime } from "@/lib/formatters";
import { getCategoryLabel } from "@/lib/rating-helpers";
import { cn } from "@/lib/cn";
import { useReviewStore } from "@/lib/store";

interface ReviewItemProps {
  review: Review;
  user?: User;
  showCategories?: boolean;
  className?: string;
}

export function ReviewItem({
  review,
  user,
  showCategories = true,
  className,
}: ReviewItemProps) {
  const { markReviewHelpful, isReviewMarkedHelpful } = useReviewStore();
  const isMarkedHelpful = isReviewMarkedHelpful(review.id);
  
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  const handleHelpfulClick = () => {
    markReviewHelpful(review.id);
  };

  return (
    <div className={cn("border border-border rounded-lg p-4 space-y-4", className)}>
      <div className="flex items-start gap-3">
        <Avatar>
          {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback>{initials || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{user?.name || "Anonymous"}</p>
            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating value={review.overall} readonly size="sm" />
            <Badge variant="secondary" className="text-xs">
              {review.overall.toFixed(1)}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed">{review.text}</p>

      {showCategories && (
        <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-border">
          {Object.entries(review.ratings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {getCategoryLabel(key as keyof typeof review.ratings)}
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                <Progress value={(value / 5) * 100} max={100} className="h-1" />
                <span className="font-medium w-6 text-right">{value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={handleHelpfulClick}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-all",
            isMarkedHelpful
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-primary hover:scale-105"
          )}
        >
          <ThumbsUp className={cn("h-4 w-4 transition-all", isMarkedHelpful && "fill-primary")} />
          <span>Faydalı ({review.helpfulCount})</span>
        </button>
      </div>
    </div>
  );
}

