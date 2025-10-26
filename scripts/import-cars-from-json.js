/**
 * Import Cars from JSON to Supabase
 * 
 * This script reads cars_data_final.json and imports:
 * - Brands → car_brands
 * - Models → car_models  
 * - Trims (year/engine/transmission variants) → car_trims
 */

const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Parse value with unit and extract number
 * Examples: "1627 mm" → 1627, "145 hp" → 145, "5.4 l/100km" → 5.4
 */
function parseValue(value) {
  if (!value || value === 'N/A' || value === '-') return null;
  
  // Handle "- unit" patterns (e.g., "- l/100km", "- mm")
  if (String(value).trim().startsWith('- ')) return null;
  
  // Remove commas and replace with dots for decimal
  const cleaned = String(value).replace(',', '.');
  
  // Extract first number (must be at start or after space/colon)
  // This prevents matching "100" from "l/100km" 
  const match = cleaned.match(/^[\d.]+|[\s:][\d.]+/);
  if (!match) return null;
  
  const numStr = match[0].trim();
  return numStr ? parseFloat(numStr) : null;
}

/**
 * Extract integer from string
 * Examples: "185-610 l" → 610 (use max), "3-doors" → 3
 */
function extractInt(value) {
  if (!value || value === 'N/A' || value === '-') return null;
  
  const str = String(value);
  
  // If range like "185-610", take max value
  const rangeMatch = str.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    return parseInt(rangeMatch[2], 10);
  }
  
  // Otherwise extract first number
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Normalize body type to a standard format
 * Also extracts door count if available
 * Example: "5-doors, hatchback" → { bodyType: "Hatchback", doorCount: 5 }
 */
function normalizeBodyType(bodyType) {
  if (!bodyType || bodyType === 'N/A') return null;
  
  const str = bodyType.toLowerCase();
  
  // Extract door count if present (e.g., "5-doors, hatchback")
  const doorMatch = str.match(/(\d+)-doors?/);
  const doorCount = doorMatch ? parseInt(doorMatch[1], 10) : null;
  
  // Determine body type
  let normalizedType = null;
  if (str.includes('sedan')) normalizedType = 'Sedan';
  else if (str.includes('hatchback')) normalizedType = 'Hatchback';
  else if (str.includes('suv') || str.includes('crossover')) normalizedType = 'SUV';
  else if (str.includes('coupé') || str.includes('coupe')) normalizedType = 'Coupe';
  else if (str.includes('convertible') || str.includes('cabrio')) normalizedType = 'Convertible';
  else if (str.includes('wagon') || str.includes('estate')) normalizedType = 'Wagon';
  else if (str.includes('minivan') || str.includes('mpv')) normalizedType = 'Minivan';
  else if (str.includes('pickup') || str.includes('truck')) normalizedType = 'Pickup';
  else if (str.includes('van')) normalizedType = 'Van';
  else normalizedType = bodyType;
  
  return { bodyType: normalizedType, doorCount };
}

/**
 * Normalize fuel type
 */
function normalizeFuelType(fuelType) {
  if (!fuelType || fuelType === 'N/A' || fuelType === '-') return null;
  
  const str = String(fuelType).toLowerCase().trim();
  
  if (str.includes('petrol') || str.includes('gasoline') || str.includes('benzin')) return 'Petrol';
  if (str.includes('diesel') || str.includes('dizel')) return 'Diesel';
  if (str.includes('electric') || str.includes('elektrik') || str.includes('ev')) return 'Electric';
  if (str.includes('hybrid') || str.includes('hibrit')) return 'Hybrid';
  if (str.includes('plug-in')) return 'Plug-in Hybrid';
  if (str.includes('lpg')) return 'LPG';
  if (str.includes('cng')) return 'CNG';
  
  // If still not matched, return capitalized version
  return fuelType.charAt(0).toUpperCase() + fuelType.slice(1).toLowerCase();
}

/**
 * Normalize transmission type
 */
function normalizeTransmission(transmission) {
  if (!transmission || transmission === 'N/A' || transmission === '-') return null;
  
  const str = String(transmission).toLowerCase().trim();
  
  // Check for specific types first (more specific patterns)
  if (str.includes('cvt')) return 'CVT';
  if (str.includes('dct') || str.includes('dual clutch')) return 'DCT';
  if (str.includes('semi-automatic') || str.includes('automated manual')) return 'Semi-Automatic';
  
  // Then check for general types
  if (str.includes('manual') || str.includes('manuel')) return 'Manual';
  if (str.includes('automatic') || str.includes('otomatik') || str.includes('auto')) return 'Automatic';
  
  // If it contains numbers and "speed", extract that info
  const speedMatch = str.match(/(\d+)\s*speed/);
  if (speedMatch) {
    if (str.includes('manual')) return `${speedMatch[1]}-Speed Manual`;
    if (str.includes('automatic') || str.includes('auto')) return `${speedMatch[1]}-Speed Automatic`;
  }
  
  // Return capitalized version if no match
  return transmission.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

/**
 * Extract specs from property data
 */
function extractSpecs(properties) {
  const specs = {};
  
  // Process each property type
  for (const [key, propertyData] of Object.entries(properties)) {
    if (!propertyData.data || !Array.isArray(propertyData.data)) continue;
    
    // Use the first available data point (they're usually similar across variants)
    const firstData = propertyData.data[0];
    if (!firstData) continue;
    
    // Map property keys to spec fields (using snake_case for database columns)
    switch (key) {
      case 'cargo-capacity':
        specs.trunk_volume = extractInt(firstData['Cargo capacity']);
        break;
      case 'width':
        specs.width = parseValue(firstData['Width']);
        break;
      case 'length':
        specs.length = parseValue(firstData['Length']);
        break;
      case 'height':
        specs.height = parseValue(firstData['Height']);
        break;
      case 'curb-weight':
        specs.weight = parseValue(firstData['Curb weight']);
        break;
      case 'body-type':
        const bodyTypeData = normalizeBodyType(firstData['Body type']);
        if (bodyTypeData) {
          specs.body_type = bodyTypeData.bodyType;
          if (bodyTypeData.doorCount) specs.door_count = bodyTypeData.doorCount;
        }
        break;
      case 'fuel-type':
        // Note: 'Fuel type' (lowercase 't') is the actual value, 'Fuel Type' is metadata
        specs.fuel_type = normalizeFuelType(firstData['Fuel type']);
        break;
      case 'max-torque':
        specs.max_torque = parseValue(firstData['Max torque']);
        break;
      case 'top-speed':
        specs.max_speed = parseValue(firstData['Top speed']);
        break;
      case 'acceleration':
        specs.acceleration_0_to_100 = parseValue(firstData['Acceleration 0-100 km / h']);
        break;
      case 'power':
        specs.horsepower = parseValue(firstData['Power']);
        break;
      case 'transmission':
        specs.transmission = normalizeTransmission(firstData['Transmission']);
        break;
      case 'drive-wheel':
        const driveWheel = firstData['Drive wheel'];
        if (driveWheel) {
          const dw = driveWheel.toLowerCase();
          if (dw.includes('front')) specs.drive_type = 'FWD';
          else if (dw.includes('rear')) specs.drive_type = 'RWD';
          else if (dw.includes('all') || dw.includes('4wd') || dw.includes('awd')) specs.drive_type = 'AWD';
          else specs.drive_type = driveWheel;
        }
        break;
      case 'combined-consumption':
        specs.avg_consumption = parseValue(firstData['Combined consumption']);
        break;
      case 'urban-consumption':
        specs.urban_consumption = parseValue(firstData['Urban consumption']);
        break;
      case 'extra-urban-consumption':
        specs.extra_urban_consumption = parseValue(firstData['Extra-urban consumption']);
        break;
      case 'number-of-seats':
        specs.seat_count = extractInt(firstData['Number of seats']);
        break;
      case 'doors':
        specs.door_count = extractInt(firstData['Doors']);
        break;
    }
  }
  
  return specs;
}

/**
 * Create trims from property data
 * Groups by Year + Body Type + Fuel Type + Transmission + Power
 */
function createTrimsFromProperties(properties) {
  const trimMap = new Map();
  
  // Collect all unique combinations
  for (const [key, propertyData] of Object.entries(properties)) {
    if (!propertyData.data || !Array.isArray(propertyData.data)) continue;
    
    for (const dataPoint of propertyData.data) {
      const year = dataPoint.Year ? parseInt(dataPoint.Year, 10) : null;
      if (!year) continue;
      
      const bodyTypeData = normalizeBodyType(dataPoint['Body Type']);
      const bodyType = bodyTypeData?.bodyType || null;
      // Note: We use 'Fuel Type' (uppercase) here as it's a categorization field in the trim key
      // The actual fuel type value is in 'Fuel type' (lowercase) in fuel-type property
      const fuelType = normalizeFuelType(dataPoint['Fuel Type']);
      const transmission = normalizeTransmission(dataPoint['Transmission']);
      const power = dataPoint['Power'];
      
      // Create unique key for this trim
      const trimKey = `${year}|${bodyType}|${fuelType}|${transmission}|${power}`;
      
      if (!trimMap.has(trimKey)) {
        trimMap.set(trimKey, {
          year,
          bodyType,
          fuelType,
          transmission,
          power,
          trimName: `${year} ${power || ''}`.trim(),
          specs: {}
        });
      }
      
      // Add spec data to this trim
      const trim = trimMap.get(trimKey);
      
      // Update specs based on property key
      switch (key) {
        case 'cargo-capacity':
          trim.specs.trunk_volume = extractInt(dataPoint['Cargo capacity']);
          break;
        case 'width':
          trim.specs.width = parseValue(dataPoint['Width']);
          break;
        case 'length':
          trim.specs.length = parseValue(dataPoint['Length']);
          break;
        case 'height':
          trim.specs.height = parseValue(dataPoint['Height']);
          break;
        case 'curb-weight':
          trim.specs.weight = parseValue(dataPoint['Curb weight']);
          break;
        case 'body-type':
          const bodyTypeData2 = normalizeBodyType(dataPoint['Body type']);
          if (bodyTypeData2) {
            if (bodyTypeData2.bodyType) trim.bodyType = bodyTypeData2.bodyType;
            if (bodyTypeData2.doorCount && !trim.specs.door_count) trim.specs.door_count = bodyTypeData2.doorCount;
          }
          break;
        case 'fuel-type':
          // Update with actual fuel type value from 'Fuel type' field (lowercase t)
          const fuelTypeValue = normalizeFuelType(dataPoint['Fuel type']);
          if (fuelTypeValue && !trim.fuelType) {
            trim.fuelType = fuelTypeValue;
          }
          break;
        case 'max-torque':
          trim.specs.max_torque = parseValue(dataPoint['Max torque']);
          break;
        case 'top-speed':
          trim.specs.max_speed = parseValue(dataPoint['Top speed']);
          break;
        case 'acceleration':
          trim.specs.acceleration_0_to_100 = parseValue(dataPoint['Acceleration 0-100 km / h']);
          break;
        case 'power':
          trim.specs.horsepower = parseValue(dataPoint['Power']);
          break;
        case 'transmission':
          // Transmission is already extracted in the main trim creation
          break;
        case 'drive-wheel':
          const driveWheel = dataPoint['Drive wheel'];
          if (driveWheel) {
            const dw = driveWheel.toLowerCase();
            if (dw.includes('front')) trim.specs.drive_type = 'FWD';
            else if (dw.includes('rear')) trim.specs.drive_type = 'RWD';
            else if (dw.includes('all') || dw.includes('4wd') || dw.includes('awd')) trim.specs.drive_type = 'AWD';
            else trim.specs.drive_type = driveWheel;
          }
          break;
        case 'combined-consumption':
          trim.specs.avg_consumption = parseValue(dataPoint['Combined consumption']);
          break;
        case 'urban-consumption':
          trim.specs.urban_consumption = parseValue(dataPoint['Urban consumption']);
          break;
        case 'extra-urban-consumption':
          trim.specs.extra_urban_consumption = parseValue(dataPoint['Extra-urban consumption']);
          break;
        case 'number-of-seats':
          trim.specs.seat_count = extractInt(dataPoint['Number of seats']);
          break;
        case 'doors':
          trim.specs.door_count = extractInt(dataPoint['Doors']);
          break;
      }
    }
  }
  
  return Array.from(trimMap.values());
}

/**
 * Main import function
 */
async function importCars() {
  console.log('🚀 Starting car data import...\n');
  
  // Read JSON file
  const jsonPath = path.join(__dirname, '..', 'cars_data_final.json');
  console.log('📖 Reading JSON file...');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(rawData);
  
  console.log(`✅ Found ${data.total_brands} brands, ${data.total_models} models\n`);
  
  let stats = {
    brandsAdded: 0,
    modelsAdded: 0,
    trimsAdded: 0,
    brandsSkipped: 0,
    modelsSkipped: 0,
    trimsSkipped: 0,
    errors: []
  };
  
  // Process each brand
  for (const brand of data.brands) {
    console.log(`\n📦 Processing brand: ${brand.name}`);
    
    try {
      // Insert or get brand
      const { data: existingBrand, error: brandSelectError } = await supabase
        .from('car_brands')
        .select('id, name')
        .eq('name', brand.name)
        .single();
      
      let brandId;
      
      if (existingBrand) {
        brandId = existingBrand.id;
        console.log(`  ↪ Brand already exists (ID: ${brandId})`);
        stats.brandsSkipped++;
      } else {
        const { data: newBrand, error: brandInsertError } = await supabase
          .from('car_brands')
          .insert({ name: brand.name, country: null })
          .select()
          .single();
        
        if (brandInsertError) {
          console.error(`  ❌ Failed to insert brand: ${brandInsertError.message}`);
          stats.errors.push(`Brand ${brand.name}: ${brandInsertError.message}`);
          continue;
        }
        
        brandId = newBrand.id;
        console.log(`  ✅ Brand added (ID: ${brandId})`);
        stats.brandsAdded++;
      }
      
      // Process models for this brand
      for (const model of brand.models) {
        console.log(`  🏷️  Processing model: ${model.name}`);
        
        try {
          // Insert or get model
          const { data: existingModel, error: modelSelectError } = await supabase
            .from('car_models')
            .select('id, name')
            .eq('brand_id', brandId)
            .eq('name', model.model)
            .single();
          
          let modelId;
          
          if (existingModel) {
            modelId = existingModel.id;
            console.log(`    ↪ Model already exists (ID: ${modelId})`);
            stats.modelsSkipped++;
          } else {
            const { data: newModel, error: modelInsertError } = await supabase
              .from('car_models')
              .insert({
                brand_id: brandId,
                name: model.model,
                start_year: null,
                end_year: null
              })
              .select()
              .single();
            
            if (modelInsertError) {
              console.error(`    ❌ Failed to insert model: ${modelInsertError.message}`);
              stats.errors.push(`Model ${model.name}: ${modelInsertError.message}`);
              continue;
            }
            
            modelId = newModel.id;
            console.log(`    ✅ Model added (ID: ${modelId})`);
            stats.modelsAdded++;
          }
          
          // Create trims from properties
          const trims = createTrimsFromProperties(model.properties);
          console.log(`    📋 Found ${trims.length} trims`);
          
          // Insert trims
          for (const trim of trims) {
            try {
              // Check if trim already exists
              const { data: existingTrim } = await supabase
                .from('car_trims')
                .select('id')
                .eq('model_id', modelId)
                .eq('year', trim.year)
                .eq('trim_name', trim.trimName || '')
                .maybeSingle();
              
              if (existingTrim) {
                stats.trimsSkipped++;
                continue;
              }
              
              // Prepare trim data (all keys must match database column names - snake_case)
              const trimData = {
                model_id: modelId,
                year: trim.year,
                trim_name: trim.trimName,
                engine: trim.power,
                transmission: trim.transmission,
                drivetrain: null,
                fuel_type: trim.fuelType,
                body_type: trim.bodyType,
                ...trim.specs
              };
              
              // Insert trim
              const { error: trimInsertError } = await supabase
                .from('car_trims')
                .insert(trimData);
              
              if (trimInsertError) {
                // Skip duplicate constraint errors silently
                if (!trimInsertError.message.includes('duplicate') && 
                    !trimInsertError.message.includes('unique')) {
                  console.error(`      ❌ Failed to insert trim: ${trimInsertError.message}`);
                  stats.errors.push(`Trim ${model.name} ${trim.year}: ${trimInsertError.message}`);
                }
                stats.trimsSkipped++;
              } else {
                stats.trimsAdded++;
              }
            } catch (trimError) {
              console.error(`      ❌ Error processing trim: ${trimError.message}`);
              stats.trimsSkipped++;
            }
          }
          
        } catch (modelError) {
          console.error(`    ❌ Error processing model: ${modelError.message}`);
          stats.errors.push(`Model ${model.name}: ${modelError.message}`);
        }
      }
      
    } catch (brandError) {
      console.error(`  ❌ Error processing brand: ${brandError.message}`);
      stats.errors.push(`Brand ${brand.name}: ${brandError.message}`);
    }
  }
  
  // Print final statistics
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 IMPORT COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\n✅ Successfully added:`);
  console.log(`   - Brands: ${stats.brandsAdded}`);
  console.log(`   - Models: ${stats.modelsAdded}`);
  console.log(`   - Trims: ${stats.trimsAdded}`);
  console.log(`\n↪ Skipped (already exist):`);
  console.log(`   - Brands: ${stats.brandsSkipped}`);
  console.log(`   - Models: ${stats.modelsSkipped}`);
  console.log(`   - Trims: ${stats.trimsSkipped}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more errors`);
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run the import
importCars().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

