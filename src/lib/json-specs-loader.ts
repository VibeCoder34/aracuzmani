import carsData from '../../cars_data_final.json';

// Type definitions for the JSON structure
type PropertyData = {
  Model?: string;
  Year?: string;
  'Body Type'?: string;
  'Fuel Type'?: string;
  Transmission?: string;
  Power?: string;
  [key: string]: string | undefined;
};

type Property = {
  turkish_name: string;
  data: PropertyData[];
};

type CarModel = {
  brand: string;
  model: string;
  name: string;
  properties: {
    [key: string]: Property;
  };
};

type Brand = {
  name: string;
  slug: string;
  models: CarModel[];
};

type CarsDataStructure = {
  scraped_date: string;
  total_brands: number;
  total_models: number;
  total_properties_collected: number;
  brands: Brand[];
};

/**
 * Load car specs from the JSON file
 * @param brandName - Brand name (e.g., "Toyota")
 * @param modelName - Model name (e.g., "Camry")
 * @param year - Optional year to filter specific year data
 * @returns Object with car specifications
 */
export function loadCarSpecsFromJSON(
  brandName: string,
  modelName: string,
  year?: number
): Record<string, string | number | null> {
  const data = carsData as CarsDataStructure;
  
  // Normalize strings for better matching
  const normalizeName = (str: string) => 
    str.toLowerCase()
       .replace(/[^\w\s-]/g, '') // Remove special chars except dash and space
       .replace(/\s+/g, '-')      // Replace spaces with dash
       .replace(/-+/g, '-')       // Remove duplicate dashes
       .trim();
  
  const normalizedBrand = normalizeName(brandName);
  const normalizedModel = normalizeName(modelName);
  
  // Find the brand
  const brand = data.brands.find(
    (b) => normalizeName(b.name) === normalizedBrand ||
           normalizeName(b.slug) === normalizedBrand
  );
  
  if (!brand) {
    console.warn(`[JSON-Loader] Brand "${brandName}" not found in JSON data`);
    return {};
  }
  
  // Find the model - try multiple matching strategies
  const model = brand.models.find((m) => {
    const modelSlug = normalizeName(m.model);
    const modelName = normalizeName(m.name);
    
    // Exact match with slug
    if (modelSlug === normalizedModel) return true;
    
    // Exact match with name
    if (modelName === normalizedModel) return true;
    
    // Partial match (model contains search term)
    if (modelSlug.includes(normalizedModel)) return true;
    if (modelName.includes(normalizedModel)) return true;
    
    // Search term contains model (for short names)
    if (normalizedModel.includes(modelSlug) && modelSlug.length > 2) return true;
    
    return false;
  });
  
  if (!model) {
    console.warn(`[JSON-Loader] Model "${modelName}" not found for brand "${brandName}" (tried: ${normalizedModel})`);
    // Show available models for debugging
    const availableModels = brand.models.slice(0, 5).map(m => m.model).join(', ');
    console.warn(`[JSON-Loader] Available models in ${brandName}: ${availableModels}...`);
    return {};
  }
  
  console.log(`[JSON-Loader] ✓ Found match: ${brand.name} ${model.name} (${Object.keys(model.properties).length} properties)`);
  
  const specs: Record<string, string | number | null> = {};
  
  // Extract all properties
  for (const [propKey, property] of Object.entries(model.properties)) {
    if (!property.data || property.data.length === 0) continue;
    
    // Get the most relevant data entry (filter by year if provided)
    let dataEntry = property.data[0];
    if (year) {
      const yearEntry = property.data.find(
        (d) => d.Year && parseInt(d.Year) === year
      );
      if (yearEntry) {
        dataEntry = yearEntry;
      }
    }
    
    // Map the property to a spec key
    switch (propKey) {
      case 'cargo-capacity':
        const cargoValue = dataEntry['Cargo capacity'];
        if (cargoValue) {
          // Extract numeric value (e.g., "185-610 l" -> "185-610")
          const match = cargoValue.match(/[\d-]+/);
          specs.trunkVolume = match ? match[0] : cargoValue;
        }
        break;
        
      case 'width':
        const widthValue = dataEntry['Width'];
        if (widthValue && widthValue !== 'N/A') {
          const match = widthValue.match(/\d+/);
          if (match) specs.width = parseInt(match[0]);
        }
        break;
        
      case 'length':
        const lengthValue = dataEntry['Length'];
        if (lengthValue && lengthValue !== 'N/A') {
          const match = lengthValue.match(/\d+/);
          if (match) specs.length = parseInt(match[0]);
        }
        break;
        
      case 'height':
        const heightValue = dataEntry['Height'];
        if (heightValue && heightValue !== 'N/A') {
          const match = heightValue.match(/\d+/);
          if (match) specs.height = parseInt(match[0]);
        }
        break;
        
      case 'curb-weight':
        const weightValue = dataEntry['Curb weight'];
        if (weightValue && weightValue !== 'N/A') {
          const match = weightValue.match(/\d+/);
          if (match) specs.weight = parseInt(match[0]);
        }
        break;
        
      case 'body-type':
        const bodyValue = dataEntry['Body type'];
        if (bodyValue && bodyValue !== 'N/A' && bodyValue !== '-') {
          specs.bodyType = bodyValue;
        }
        break;
        
      case 'fuel-type':
        const fuelValue = dataEntry['Fuel type'];
        if (fuelValue && fuelValue !== 'N/A' && fuelValue !== '-') {
          specs.fuelType = fuelValue;
        }
        break;
        
      case 'combined-consumption':
        const consumptionValue = dataEntry['Combined consumption'];
        if (consumptionValue && consumptionValue !== 'N/A' && consumptionValue !== '-' && !consumptionValue.startsWith('-')) {
          const match = consumptionValue.match(/[\d.]+/);
          if (match) specs.avgConsumption = parseFloat(match[0]);
        }
        break;
        
      case 'urban-consumption':
        const urbanValue = dataEntry['Urban consumption'];
        if (urbanValue && urbanValue !== 'N/A' && urbanValue !== '-' && !urbanValue.startsWith('-')) {
          const match = urbanValue.match(/[\d.]+/);
          if (match) specs.urbanConsumption = parseFloat(match[0]);
        }
        break;
        
      case 'extra-urban-consumption':
        const extraUrbanValue = dataEntry['Extra-urban consumption'];
        if (extraUrbanValue && extraUrbanValue !== 'N/A' && extraUrbanValue !== '-' && !extraUrbanValue.startsWith('-')) {
          const match = extraUrbanValue.match(/[\d.]+/);
          if (match) specs.extraUrbanConsumption = parseFloat(match[0]);
        }
        break;
        
      case 'power':
        const powerValue = dataEntry['Power'];
        if (powerValue && powerValue !== 'N/A') {
          const match = powerValue.match(/\d+/);
          if (match) specs.horsepower = parseInt(match[0]);
        }
        break;
        
      case 'max-torque':
        const torqueValue = dataEntry['Max torque'];
        if (torqueValue && torqueValue !== 'N/A' && torqueValue !== 'n.b.' && torqueValue !== '-') {
          const match = torqueValue.match(/\d+/);
          if (match) specs.maxTorque = parseInt(match[0]);
        }
        break;
        
      case 'top-speed':
        const speedValue = dataEntry['Top speed'];
        if (speedValue && speedValue !== 'N/A') {
          const match = speedValue.match(/\d+/);
          if (match) specs.maxSpeed = parseInt(match[0]);
        }
        break;
        
      case 'acceleration':
        const accelValue = dataEntry['Acceleration 0-100 km / h'] || dataEntry['Acceleration 0 - 100 km/h'];
        if (accelValue && accelValue !== 'N/A') {
          const match = accelValue.match(/[\d.]+/);
          if (match) specs.acceleration0to100 = parseFloat(match[0]);
        }
        break;
        
      case 'drive-wheel':
        const driveValue = dataEntry['Drive wheel'];
        if (driveValue && driveValue !== 'N/A' && driveValue !== '-') {
          specs.driveType = driveValue;
        }
        break;
        
      case 'number-of-seats':
        const seatsValue = dataEntry['Number of seats'];
        if (seatsValue && seatsValue !== 'N/A') {
          const match = seatsValue.match(/\d+/);
          if (match) specs.seatCount = parseInt(match[0]);
        }
        break;
        
      case 'number-of-doors':
        const doorsValue = dataEntry['Number of doors'];
        if (doorsValue && doorsValue !== 'N/A') {
          const match = doorsValue.match(/\d+/);
          if (match) specs.doorCount = parseInt(match[0]);
        }
        break;
        
      case 'transmission':
        const transmissionValue = dataEntry['Transmission'];
        if (transmissionValue && transmissionValue !== 'N/A' && transmissionValue !== '-') {
          specs.transmissionType = transmissionValue;
        }
        break;
    }
  }
  
  return specs;
}

/**
 * Merge JSON specs with database specs, prioritizing database data
 */
export function mergeSpecs(
  dbSpecs: Record<string, string | number | null | undefined>,
  jsonSpecs: Record<string, string | number | null>
): Record<string, string | number> {
  const merged: Record<string, string | number> = {};
  
  // Start with JSON specs
  for (const [key, value] of Object.entries(jsonSpecs)) {
    if (value !== null && value !== undefined) {
      merged[key] = value;
    }
  }
  
  // Override with database specs (database has priority)
  for (const [key, value] of Object.entries(dbSpecs)) {
    if (value !== null && value !== undefined) {
      merged[key] = value;
    }
  }
  
  return merged;
}

