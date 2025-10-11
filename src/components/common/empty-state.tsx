import { SearchX, FileQuestion } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "search" | "file";
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = "search",
  className,
}: EmptyStateProps) {
  const Icon = icon === "search" ? SearchX : FileQuestion;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <Icon className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      )}
    </div>
  );
}

