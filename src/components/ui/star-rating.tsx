"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  max = 5,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (!readonly && onChange) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChange(rating);
      }
    }
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readonly && setHoverValue(null)}
        role="radiogroup"
        aria-label={`Puan: ${max} üzerinden ${value} yıldız`}
      >
        {Array.from({ length: max }, (_, i) => {
          const rating = i + 1;
          const isFilled = rating <= displayValue;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => !readonly && setHoverValue(rating)}
              onKeyDown={(e) => handleKeyDown(e, rating)}
              disabled={readonly}
              className={cn(
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm",
                !readonly && "cursor-pointer hover:scale-110",
                readonly && "cursor-default"
              )}
              aria-label={`${rating} yıldız`}
              role="radio"
              aria-checked={rating === Math.round(value)}
            >
              <Star
                className={cn(
                  sizeMap[size],
                  isFilled
                    ? "fill-primary text-primary"
                    : "fill-none text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-2 text-sm font-medium text-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

