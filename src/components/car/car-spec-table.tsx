import type { Car, CarTrim } from "@/types/car";
import { cn } from "@/lib/cn";
import { translateSpecKey } from "@/lib/spec-translator";
import { translateBodyType, translateFuelType, translateTransmissionType, translateDriveType } from "@/lib/translations";

interface CarSpecTableProps {
  specs?: Car["specs"];
  trim?: CarTrim;
  className?: string;
}

export function CarSpecTable({ specs, trim, className }: CarSpecTableProps) {
  // Build specs object from trim if provided
  const displaySpecs = trim ? {
    // Performance
    ...(trim.horsepower && { horsepower: `${trim.horsepower} hp` }),
    ...(trim.max_torque && { maxTorque: `${trim.max_torque} Nm` }),
    ...(trim.max_speed && { maxSpeed: `${trim.max_speed} km/h` }),
    ...(trim.acceleration_0_to_100 && { acceleration0to100: `${trim.acceleration_0_to_100} sn` }),
    ...(trim.engine && { engine: trim.engine }),
    ...(trim.transmission && { transmission: translateTransmissionType(trim.transmission) }),
    
    // Fuel Economy
    ...(trim.fuel_type && { fuelType: translateFuelType(trim.fuel_type) }),
    ...(trim.avg_consumption && { avgConsumption: `${trim.avg_consumption} L/100km` }),
    
    // Dimensions
    ...(trim.length && { length: `${trim.length} mm` }),
    ...(trim.width && { width: `${trim.width} mm` }),
    ...(trim.height && { height: `${trim.height} mm` }),
    ...(trim.weight && { weight: `${trim.weight} kg` }),
    
    // Interior
    ...(trim.seat_count && { seatCount: `${trim.seat_count} kişi` }),
    ...(trim.door_count && { doorCount: `${trim.door_count} kapı` }),
    ...(trim.trunk_volume && { trunkVolume: `${trim.trunk_volume} L` }),
    
    // Body
    ...(trim.body_type && { bodyType: translateBodyType(trim.body_type) }),
    ...(trim.drivetrain && { drivetrain: translateDriveType(trim.drivetrain) }),
  } : specs || {};
  
  const entries = Object.entries(displaySpecs).filter(([, value]) => value != null);
  
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Bu varyant için teknik özellik bilgisi bulunamadı
      </div>
    );
  }

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      <table className="w-full">
        <tbody className="divide-y divide-border">
          {entries.map(([key, value]) => (
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

