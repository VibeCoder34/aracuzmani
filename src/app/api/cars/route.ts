import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateBodyType, translateFuelType, translateTransmissionType, translateDriveType } from '@/lib/translations'

/**
 * GET /api/cars - List all cars (trims) with their data
 * Query params:
 *   - brand: filter by brand name
 *   - year: filter by year
 *   - body_type: filter by body type
 *   - fuel_type: filter by fuel type
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API /api/cars] Received request');
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Build query
    console.log('[API /api/cars] Building query...');
    let query = supabase
      .from('car_trims')
      .select(`
        *,
        car_models!inner (
          id,
          name,
          car_brands!inner (
            id,
            name,
            country
          )
        )
      `)
      .order('year', { ascending: false })

    // Apply filters
    const brand = searchParams.get('brand')
    const year = searchParams.get('year')
    const bodyType = searchParams.get('body_type')
    const fuelType = searchParams.get('fuel_type')

    if (brand) {
      query = query.eq('car_models.car_brands.name', brand)
    }
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (bodyType) {
      query = query.eq('body_type', bodyType)
    }
    if (fuelType) {
      query = query.eq('fuel_type', fuelType)
    }

    console.log('[API /api/cars] Executing query...');
    const { data: trims, error } = await query

    if (error) {
      console.error('[API /api/cars] Database error:', error)
      throw error
    }

    console.log('[API /api/cars] Query result - trims count:', trims?.length || 0);
    console.log('[API /api/cars] First trim:', trims?.[0]);

    // Group trims by model and keep only the newest year for each model
    const modelMap = new Map<string, typeof trims[0]>();
    
    for (const trim of trims || []) {
      const modelKey = `${trim.car_models.car_brands.name}-${trim.car_models.name}`;
      const existing = modelMap.get(modelKey);
      
      // Keep the trim with the highest year (already sorted by year desc)
      if (!existing || trim.year > existing.year) {
        modelMap.set(modelKey, trim);
      }
    }
    
    console.log('[API /api/cars] Unique models after grouping:', modelMap.size);

    // Helper function to capitalize model names properly
    const capitalizeModelName = (name: string): string => {
      return name
        .split(/[-\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Transform database trims to Car format for frontend
    const cars = Array.from(modelMap.values()).map((trim) => {
      const brand = trim.car_models.car_brands.name
      const modelRaw = trim.car_models.name
      const model = capitalizeModelName(modelRaw)
      const year = trim.year
      const trimName = trim.trim_name || ''
      
      // Create slug - just brand-model (detail page handles all year/trim variants)
      const slug = `${brand}-${modelRaw}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Get images from storage (if available)
      // For now, we'll use a placeholder or the storage path
      const images = trim.image_urls || [`https://placehold.co/800x600/png?text=${brand}+${model}`]

      return {
        id: trim.id.toString(),
        slug,
        brand,
        model,
        year,
        trimName: trimName || undefined,
        body: translateBodyType(trim.body_type) || 'N/A',
        fuel: translateFuelType(trim.fuel_type) || 'N/A',
        transmission: translateTransmissionType(trim.transmission_type || trim.transmission) || 'N/A',
        images,
        specs: {
          // Interior Design
          seatCount: trim.seat_count,
          trunkVolume: trim.trunk_volume,
          // Exterior Design
          doorCount: trim.door_count,
          width: trim.width,
          length: trim.length,
          height: trim.height,
          weight: trim.weight,
          bodyType: translateBodyType(trim.body_type) || undefined,
          // Fuel Economy
          fuelType: translateFuelType(trim.fuel_type) || undefined,
          avgConsumption: trim.avg_consumption,
          urbanConsumption: trim.urban_consumption,
          extraUrbanConsumption: trim.extra_urban_consumption,
          // Performance
          maxTorque: trim.max_torque,
          maxSpeed: trim.max_speed,
          acceleration0to100: trim.acceleration_0_to_100,
          horsepower: trim.horsepower,
          transmissionType: translateTransmissionType(trim.transmission_type) || undefined,
          driveType: translateDriveType(trim.drive_type) || undefined,
          // Legacy fields
          engine: trim.engine,
          drivetrain: translateDriveType(trim.drivetrain) || undefined,
        },
      }
    })

    console.log('[API /api/cars] Transformed cars count:', cars.length);
    console.log('[API /api/cars] First transformed car:', cars[0]);
    
    return NextResponse.json({ cars, count: cars.length })
  } catch (error) {
    console.error('[API /api/cars] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cars', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

