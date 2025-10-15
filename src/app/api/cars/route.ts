import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Transform database trims to Car format for frontend
    const cars = (trims || []).map((trim) => {
      const brand = trim.car_models.car_brands.name
      const model = trim.car_models.name
      const year = trim.year
      const trimName = trim.trim_name || ''
      
      // Create slug
      const slug = `${brand}-${model}-${year}${trimName ? `-${trimName}` : ''}`
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
        body: trim.body_type || 'N/A',
        fuel: trim.fuel_type || 'N/A',
        transmission: trim.transmission_type || trim.transmission || 'N/A',
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
          bodyType: trim.body_type,
          // Fuel Economy
          fuelType: trim.fuel_type,
          avgConsumption: trim.avg_consumption,
          // Performance
          maxTorque: trim.max_torque,
          maxSpeed: trim.max_speed,
          acceleration0to100: trim.acceleration_0_to_100,
          horsepower: trim.horsepower,
          transmissionType: trim.transmission_type,
          driveType: trim.drive_type,
          // Legacy fields
          engine: trim.engine,
          drivetrain: trim.drivetrain,
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

