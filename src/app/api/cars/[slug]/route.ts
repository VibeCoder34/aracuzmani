import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loadCarSpecsFromJSON, mergeSpecs } from '@/lib/json-specs-loader'
import { translateBodyType, translateFuelType, translateTransmissionType, translateDriveType } from '@/lib/translations'

/**
 * GET /api/cars/[slug] - Get a specific car model with all its trims
 * Returns model info and all available trims (year/engine/transmission variants)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log('[API /api/cars/[slug]] Fetching car:', slug)
    
    const supabase = await createClient()

    // Parse slug to extract brand and model names
    // Slug format: "brand-model" (e.g., "peugeot-5008")
    const slugParts = slug.split('-')
    if (slugParts.length < 2) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      )
    }

    // Extract brand name (first part) and model name (rest)
    const brandName = slugParts[0]
    const modelName = slugParts.slice(1).join('-')
    
    console.log('[API /api/cars/[slug]] Searching for:', { brandName, modelName })

    // Query more efficiently: search for brand and model directly
    // Using ilike for case-insensitive partial matching
    const { data: models, error: modelsError } = await supabase
      .from('car_models')
      .select(`
        id,
        name,
        start_year,
        end_year,
        car_brands!inner (
          id,
          name,
          country
        )
      `)
      .ilike('car_brands.name', `%${brandName}%`)
      .limit(100) // Reasonable limit since we're filtering by brand

    if (modelsError) {
      console.error('[API /api/cars/[slug]] Error fetching models:', modelsError)
      throw modelsError
    }

    console.log('[API /api/cars/[slug]] Fetched models count:', models?.length || 0);

    // Type for the model with joined brand
    type ModelWithBrand = {
      id: number;
      name: string;
      start_year: number | null;
      end_year: number | null;
      car_brands: {
        id: number;
        name: string;
        country: string;
      };
    };

    // Find exact matching model by comparing slugs
    const model = models?.find((m) => {
      const modelItem = m as unknown as ModelWithBrand;
      const modelSlug = `${modelItem.car_brands.name}-${modelItem.name}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      return slug === modelSlug || slug.startsWith(modelSlug + '-')
    })

    if (!model) {
      console.log('[API /api/cars/[slug]] Model not found for slug:', slug)
      console.log('[API /api/cars/[slug]] Searched in brand:', brandName)
      console.log('[API /api/cars/[slug]] Available models:', models?.slice(0, 5).map((m) => {
        const modelItem = m as unknown as ModelWithBrand;
        return {
          brand: modelItem.car_brands?.name,
          model: modelItem.name,
          slug: `${modelItem.car_brands.name}-${modelItem.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        };
      }))
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    const modelItem = model as unknown as ModelWithBrand;
    console.log('[API /api/cars/[slug]] Found model:', modelItem.name)

    // Fetch all trims for this model
    const { data: trims, error: trimsError } = await supabase
      .from('car_trims')
      .select('*')
      .eq('model_id', modelItem.id)
      .order('year', { ascending: false })

    if (trimsError) {
      console.error('[API /api/cars/[slug]] Error fetching trims:', trimsError)
      throw trimsError
    }

    console.log('[API /api/cars/[slug]] Found', trims?.length || 0, 'trims')

    // Helper function to capitalize model names properly
    const capitalizeModelName = (name: string): string => {
      return name
        .split(/[-\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Get a representative image (you can enhance this later)
    const carBrandName = modelItem.car_brands.name
    const carModelNameRaw = modelItem.name
    const carModelName = capitalizeModelName(carModelNameRaw)
    const images = [
      `https://placehold.co/800x600/png?text=${carBrandName}+${carModelName}`,
    ]

    // Load specs from JSON file (use raw model name for JSON lookup)
    const jsonSpecs = loadCarSpecsFromJSON(carBrandName, carModelNameRaw);
    console.log('[API /api/cars/[slug]] Loaded JSON specs:', Object.keys(jsonSpecs).length, 'properties');

    // Return model data with all trims
    return NextResponse.json({
      model: {
        id: modelItem.id.toString(),
        slug,
        brand: carBrandName,
        brandCountry: modelItem.car_brands.country,
        name: carModelName,
        startYear: modelItem.start_year,
        endYear: modelItem.end_year,
        images,
      },
      trims: (trims || []).map((trim) => {
        // Get JSON specs for this specific year if available (use raw model name)
        const yearJsonSpecs = loadCarSpecsFromJSON(carBrandName, carModelNameRaw, trim.year);
        
        // Database specs from the trim
        const dbSpecs = {
          engine: trim.engine,
          transmission: trim.transmission,
          fuel_type: trim.fuel_type,
          body_type: trim.body_type,
          horsepower: trim.horsepower,
          max_torque: trim.max_torque,
          max_speed: trim.max_speed,
          acceleration_0_to_100: trim.acceleration_0_to_100,
          avg_consumption: trim.avg_consumption,
          urban_consumption: trim.urban_consumption,
          extra_urban_consumption: trim.extra_urban_consumption,
          drive_type: trim.drive_type,
          width: trim.width,
          length: trim.length,
          height: trim.height,
          weight: trim.weight,
          trunk_volume: trim.trunk_volume,
          seat_count: trim.seat_count,
          door_count: trim.door_count,
          drivetrain: trim.drivetrain,
        };
        
        // Merge specs (database takes priority, JSON fills in gaps)
        const mergedSpecs = mergeSpecs(dbSpecs, Object.keys(yearJsonSpecs).length > 0 ? yearJsonSpecs : jsonSpecs);
        
        return {
          id: trim.id.toString(),
          model_id: trim.model_id.toString(),
          year: trim.year,
          trim_name: trim.trim_name,
          engine: mergedSpecs.engine || trim.engine,
          transmission: translateTransmissionType(mergedSpecs.transmissionType || trim.transmission) || undefined,
          fuel_type: translateFuelType(mergedSpecs.fuelType || trim.fuel_type) || undefined,
          body_type: translateBodyType(mergedSpecs.bodyType || trim.body_type) || undefined,
          horsepower: mergedSpecs.horsepower || trim.horsepower,
          max_torque: mergedSpecs.maxTorque || trim.max_torque,
          max_speed: mergedSpecs.maxSpeed || trim.max_speed,
          acceleration_0_to_100: mergedSpecs.acceleration0to100 || trim.acceleration_0_to_100,
          avg_consumption: mergedSpecs.avgConsumption || trim.avg_consumption,
          urban_consumption: mergedSpecs.urbanConsumption || trim.urban_consumption,
          extra_urban_consumption: mergedSpecs.extraUrbanConsumption || trim.extra_urban_consumption,
          drive_type: translateDriveType(mergedSpecs.driveType || trim.drive_type) || undefined,
          width: mergedSpecs.width || trim.width,
          length: mergedSpecs.length || trim.length,
          height: mergedSpecs.height || trim.height,
          weight: mergedSpecs.weight || trim.weight,
          trunk_volume: mergedSpecs.trunkVolume || trim.trunk_volume,
          seat_count: mergedSpecs.seatCount || trim.seat_count,
          door_count: mergedSpecs.doorCount || trim.door_count,
          drivetrain: translateDriveType(mergedSpecs.driveType || trim.drivetrain) || undefined,
        };
      }),
    })
  } catch (error) {
    console.error('[API /api/cars/[slug]] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch car',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

