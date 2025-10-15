"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { getCategoryLabel } from "@/lib/rating-helpers";
import type { RatingCategory } from "@/types/car";

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export interface ReviewFormData {
  text: string;
  ratings: Record<RatingCategory, number>;
}

const categories: RatingCategory[] = [
  "interiorDesign",
  "exteriorDesign",
  "fuelEconomy",
  "performance",
  "comfort",
  "driveSafety",
  "technology",
  "pricePerformance",
];

export function ReviewForm({ onSubmit, onCancel, disabled = false }: ReviewFormProps) {
  const [text, setText] = React.useState("");
  const [ratings, setRatings] = React.useState<Record<RatingCategory, number>>({
    interiorDesign: 3,
    exteriorDesign: 3,
    fuelEconomy: 3,
    performance: 3,
    comfort: 3,
    driveSafety: 3,
    technology: 3,
    pricePerformance: 3,
  });

  const handleRatingChange = (category: RatingCategory, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      alert("Please write a review text");
      return;
    }

    onSubmit({ text, ratings });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="review-text" className="text-base">
          Yorumunuz
        </Label>
        <Textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bu araçla ilgili deneyiminizi paylaşın..."
          rows={5}
          required
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base">Her Kategoriyi Puanlayın</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center justify-between gap-4">
              <Label htmlFor={`rating-${cat}`} className="text-sm font-normal">
                {getCategoryLabel(cat)}
              </Label>
              <StarRating
                value={ratings[cat]}
                onChange={(value) => handleRatingChange(cat, value)}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
          İptal
        </Button>
        <Button type="submit" disabled={disabled}>
          {disabled ? "Gönderiliyor..." : "Yorumu Gönder"}
        </Button>
      </div>
    </form>
  );
}

