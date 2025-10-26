import { cn } from "@/lib/cn";

interface CarSkeletonProps {
  className?: string;
  showImage?: boolean;
  showSpecs?: boolean;
}

export function CarSkeleton({ 
  className, 
  showImage = true, 
  showSpecs = true 
}: CarSkeletonProps) {
  return (
    <div className={cn("border border-border rounded-lg p-4", className)}>
      {/* Image skeleton */}
      {showImage && (
        <div className="aspect-video bg-gradient-to-r from-muted via-muted/50 to-muted rounded mb-4 animate-pulse">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      )}
      
      {/* Title skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse">
          <div className="h-full w-3/4 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
        <div className="h-3 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-2/3 animate-pulse">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Specs skeleton */}
      {showSpecs && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/3 animate-pulse">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
            <div className="h-3 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/4 animate-pulse">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/2 animate-pulse">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
            <div className="h-3 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/3 animate-pulse">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CarGridSkeletonProps {
  count?: number;
  className?: string;
}

export function CarGridSkeleton({ count = 4, className }: CarGridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CarSkeleton key={i} />
      ))}
    </div>
  );
}
