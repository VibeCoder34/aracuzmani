import carsData from '../../cars_data_complete_final.json';

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
  
  // Find the brand
  const brand = data.brands.find(
    (b) => b.name.toLowerCase() === brandName.toLowerCase()
  );
  
  if (!brand) {
    console.warn(`Brand "${brandName}" not found in JSON data`);
    return {};
  }
  
  // Find the model
  const model = brand.models.find(
    (m) => m.model.toLowerCase() === modelName.toLowerCase() ||
           m.name.toLowerCase().includes(modelName.toLowerCase())
  );
  
  if (!model) {
    console.warn(`Model "${modelName}" not found for brand "${brandName}"`);
    return {};
  }
  
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
        
      case 'fuel-consumption-combined':
        const consumptionValue = dataEntry['Fuel consumption combined'];
        if (consumptionValue && consumptionValue !== 'N/A') {
          const match = consumptionValue.match(/[\d.]+/);
          if (match) specs.avgConsumption = parseFloat(match[0]);
        }
        break;
        
      case 'power':
        const powerValue = dataEntry['Power'];
        if (powerValue && powerValue !== 'N/A') {
          const match = powerValue.match(/\d+/);
          if (match) specs.horsepower = parseInt(match[0]);
        }
        break;
        
      case 'maximum-torque':
        const torqueValue = dataEntry['Maximum torque'];
        if (torqueValue && torqueValue !== 'N/A') {
          const match = torqueValue.match(/\d+/);
          if (match) specs.maxTorque = parseInt(match[0]);
        }
        break;
        
      case 'maximum-speed':
        const speedValue = dataEntry['Maximum speed'];
        if (speedValue && speedValue !== 'N/A') {
          const match = speedValue.match(/\d+/);
          if (match) specs.maxSpeed = parseInt(match[0]);
        }
        break;
        
      case 'acceleration-0-100-kmh':
        const accelValue = dataEntry['Acceleration 0 - 100 km/h'];
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

