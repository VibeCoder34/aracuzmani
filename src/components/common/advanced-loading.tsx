import { Loader2, Car, Zap, Star } from "lucide-react";
import { cn } from "@/lib/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "car" | "lightning" | "star";
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8", 
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const iconMap = {
  default: Loader2,
  car: Car,
  lightning: Zap,
  star: Star,
};

export function LoadingSpinner({ 
  size = "md", 
  variant = "default",
  className,
  text
}: LoadingSpinnerProps) {
  const Icon = iconMap[variant];
  
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div className="relative">
        <Icon className={cn(
          "animate-spin text-primary", 
          sizeMap[size],
          variant === "default" ? "" : "animate-pulse"
        )} />
        {variant !== "default" && (
          <div className="absolute inset-0 animate-ping">
            <Icon className={cn("text-primary/30", sizeMap[size])} />
          </div>
        )}
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

interface PageLoaderProps {
  message?: string;
  variant?: "default" | "car" | "lightning" | "star";
}

export function PageLoader({ 
  message = "Yükleniyor...", 
  variant = "car" 
}: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-4">
        <LoadingSpinner 
          size="xl" 
          variant={variant}
          className="mb-4"
        />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {message}
          </h2>
          <p className="text-muted-foreground">
            Lütfen bekleyin...
          </p>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-1 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface BrandSkeletonProps {
  count?: number;
}

export function BrandSkeleton({ count = 10 }: BrandSkeletonProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full px-4 py-2 animate-pulse"
          style={{ width: `${60 + Math.random() * 40}px` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-full"></div>
        </div>
      ))}
    </div>
  );
}

// Re-export CarGridSkeleton from car-skeleton.tsx
export { CarGridSkeleton } from "./car-skeleton";
