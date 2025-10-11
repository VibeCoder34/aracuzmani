import type { Car } from "@/types/car";
import { cn } from "@/lib/cn";
import { translateSpecKey } from "@/lib/spec-translator";

interface CarSpecTableProps {
  specs: Car["specs"];
  className?: string;
}

export function CarSpecTable({ specs, className }: CarSpecTableProps) {
  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      <table className="w-full">
        <tbody className="divide-y divide-border">
          {Object.entries(specs).map(([key, value]) => (
            <tr key={key} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-muted-foreground w-1/3">
                {translateSpecKey(key)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

