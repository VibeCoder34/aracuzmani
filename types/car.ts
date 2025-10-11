export type RatingCategory =
  | "comfort"
  | "drive"
  | "fuelEconomy"
  | "reliability"
  | "maintenance"
  | "interior"
  | "tech"
  | "resale";

export type Car = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  body: string;
  fuel: string;
  transmission: string;
  images: string[];
  specs: Record<string, string | number>;
};

export type Review = {
  id: string;
  carId: string;
  userId: string;
  createdAt: string; // ISO
  text: string;
  ratings: Record<RatingCategory, number>; // 1–5
  overall: number; // derived or stored
  helpfulCount: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinDate: string;
};

export type CategoryAverages = Record<RatingCategory, number>;

