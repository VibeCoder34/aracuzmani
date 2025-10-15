"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp } from "lucide-react";
import type { Review } from "@/types/car";
import { formatRelativeTime } from "@/lib/formatters";
import { getCategoryLabel } from "@/lib/rating-helpers";
import { cn } from "@/lib/cn";
import { useReviewStore } from "@/lib/store";

interface ReviewItemProps {
  review: Review & { user?: { id: string; name: string; username?: string | null; fullName?: string | null; avatarUrl?: string | null } };
  showCategories?: boolean;
  className?: string;
}

export function ReviewItem({
  review,
  showCategories = true,
  className,
}: ReviewItemProps) {
  const [isMarkedHelpful, setIsMarkedHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const { updateReviewHelpfulCount } = useReviewStore();

  // Check if user has voted on mount
  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const response = await fetch(`/api/reviews/${review.id}/vote`);
        if (response.ok) {
          const data = await response.json();
          setIsMarkedHelpful(data.hasVoted);
        }
      } catch (error) {
        console.error('Error checking vote status:', error);
      }
    };
    checkVoteStatus();
  }, [review.id]);
  
  const user = review.user;
  
  // Get display name - prioritize username, fallback to full name
  const displayName = user?.username ? `@${user.username}` : (user?.fullName || user?.name || "Anonymous");
  
  // Get initials from username or full name
  const initials = user?.username 
    ? user.username.slice(0, 2).toUpperCase()
    : (user?.fullName || user?.name || "A")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
  
  const handleHelpfulClick = async () => {
    try {
      const response = await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsMarkedHelpful(data.action === 'added');
        setHelpfulCount(data.helpfulCount);
        updateReviewHelpfulCount(review.id, data.helpfulCount);
      }
    } catch (error) {
      console.error('Error toggling helpful vote:', error);
    }
  };

  return (
    <div className={cn("border border-border rounded-lg p-4 space-y-4", className)}>
      <div className="flex items-start gap-3">
        <Avatar>
          {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
          <AvatarFallback>{initials || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{displayName}</p>
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
          <span>Faydalı ({helpfulCount})</span>
        </button>
      </div>
    </div>
  );
}

