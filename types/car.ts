export type RatingCategory =
  | "interiorDesign"
  | "exteriorDesign"
  | "fuelEconomy"
  | "performance"
  | "comfort"
  | "driveSafety"
  | "technology"
  | "pricePerformance";

export type CarSpecs = {
  // Interior Design specs
  seatCount?: number;
  trunkVolume?: number;
  
  // Exterior Design specs
  doorCount?: number;
  width?: number;
  length?: number;
  height?: number;
  weight?: number;
  bodyType?: string;
  
  // Fuel Economy specs
  fuelType?: string;
  avgConsumption?: number;
  urbanConsumption?: number;
  extraUrbanConsumption?: number;
  
  // Performance specs
  maxTorque?: number;
  maxSpeed?: number;
  acceleration0to100?: number;
  horsepower?: number;
  transmissionType?: string;
  driveType?: string;
};

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
  specs: Record<string, string | number> & CarSpecs;
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
  username?: string | null;
  fullName?: string | null;
  email?: string;
  avatarUrl?: string | null;
  joinDate?: string;
};

export type CategoryAverages = Record<RatingCategory, number>;

export type CarTrim = {
  id: string;
  model_id: string;
  year: number;
  trim_name: string | null;
  engine?: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  body_type?: string | null;
  horsepower?: number | null;
  max_torque?: number | null;
  max_speed?: number | null;
  acceleration_0_to_100?: number | null;
  avg_consumption?: number | null;
  urban_consumption?: number | null;
  extra_urban_consumption?: number | null;
  drive_type?: string | null;
  width?: number | null;
  length?: number | null;
  height?: number | null;
  weight?: number | null;
  trunk_volume?: number | null;
  seat_count?: number | null;
  door_count?: number | null;
  drivetrain?: string | null;
};

