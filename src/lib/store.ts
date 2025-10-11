import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Review } from "@/types/car";
import usersData from "@/mock/users.json";
import reviewsData from "@/mock/reviews.json";

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  signOut: () => void;
};

type ReviewStore = {
  reviews: Review[];
  helpfulReviews: Set<string>;
  addReview: (review: Omit<Review, "id" | "createdAt" | "helpfulCount">) => void;
  getReviewsForCar: (carId: string) => Review[];
  markReviewHelpful: (reviewId: string) => void;
  isReviewMarkedHelpful: (reviewId: string) => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      reviews: reviewsData as Review[],
      helpfulReviews: new Set<string>(),
      addReview: (review) => {
        const newReview: Review = {
          ...review,
          id: `r${Date.now()}`,
          createdAt: new Date().toISOString(),
          helpfulCount: 0,
        };
        set((state) => ({ reviews: [...state.reviews, newReview] }));
      },
      getReviewsForCar: (carId) => {
        return get().reviews.filter((r) => r.carId === carId);
      },
      markReviewHelpful: (reviewId) => {
        const state = get();
        // Toggle: if already marked, unmark it
        if (state.helpfulReviews.has(reviewId)) {
          const newHelpfulReviews = new Set(state.helpfulReviews);
          newHelpfulReviews.delete(reviewId);
          set({
            helpfulReviews: newHelpfulReviews,
            reviews: state.reviews.map((r) =>
              r.id === reviewId
                ? { ...r, helpfulCount: Math.max(0, r.helpfulCount - 1) }
                : r
            ),
          });
        } else {
          const newHelpfulReviews = new Set(state.helpfulReviews);
          newHelpfulReviews.add(reviewId);
          set({
            helpfulReviews: newHelpfulReviews,
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
            ),
          });
        }
      },
      isReviewMarkedHelpful: (reviewId) => {
        return get().helpfulReviews.has(reviewId);
      },
    }),
    {
      name: "review-storage",
      partialize: (state) => ({
        reviews: state.reviews,
        helpfulReviews: Array.from(state.helpfulReviews),
      }),
      merge: (persistedState: unknown, currentState) => ({
        ...currentState,
        ...(persistedState as object),
        helpfulReviews: new Set((persistedState as { helpfulReviews?: string[] })?.helpfulReviews || []),
      }),
    }
  )
);

// Mock sign in helper
export function mockSignIn(provider: "email" | "google"): User {
  const mockUser: User = {
    id: "mock-user-1",
    name: provider === "google" ? "Demo User (Google)" : "Demo User",
    email: "demo@example.com",
    avatarUrl: "/avatars/pp.jpg",
    joinDate: new Date().toISOString(),
  };
  return mockUser;
}

// Get all users (for review displays)
export function getAllUsers(): User[] {
  return usersData as User[];
}

// Get user by ID
export function getUserById(id: string): User | undefined {
  return getAllUsers().find((u) => u.id === id);
}

