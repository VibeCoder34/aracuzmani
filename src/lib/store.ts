import { create } from "zustand";
import type { User, Review } from "@/types/car";

// Note: Auth is now handled by Supabase, this store is only for client-side state
type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  signOut: () => void;
};

type ReviewStore = {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;
  updateReviewHelpfulCount: (reviewId: string, count: number) => void;
  getReviewsForCar: (carId: string) => Review[];
};

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signOut: () => set({ user: null }),
}));

// Simplified review store - now just manages client-side state
// All persistence happens through API calls to the database
export const useReviewStore = create<ReviewStore>()((set, get) => ({
  reviews: [],
  setReviews: (reviews) => set({ reviews }),
  addReview: (review) => {
    set((state) => ({
      reviews: [...state.reviews, review],
    }));
  },
  updateReviewHelpfulCount: (reviewId, count) => {
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: count } : r
      ),
    }));
  },
  getReviewsForCar: (carId) => {
    return get().reviews.filter((r) => r.carId === carId);
  },
}));

