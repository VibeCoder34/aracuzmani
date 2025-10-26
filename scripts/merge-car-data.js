/**
 * Merge Car Data Script
 * 
 * This script merges two car data files:
 * 1. cars_data_complete_final.json (hierarchical structure)
 * 2. all_cars_merged_20251025_234808.json (flat array structure)
 * 
 * Creates a unified cars_data_merged.json file
 */

const fs = require('fs');
const path = require('path');

// File paths
const HIERARCHICAL_FILE = path.join(__dirname, '..', 'cars_data_complete_final.json');
const FLAT_FILE = path.join(__dirname, '..', 'all_cars_merged_20251025_234808.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'cars_data_merged.json');

console.log('🚗 Starting car data merge process...');

// Read both files
console.log('📖 Reading hierarchical data file...');
const hierarchicalData = JSON.parse(fs.readFileSync(HIERARCHICAL_FILE, 'utf8'));

console.log('📖 Reading flat data file...');
const flatData = JSON.parse(fs.readFileSync(FLAT_FILE, 'utf8'));

console.log(`📊 Hierarchical data: ${hierarchicalData.brands.length} brands, ${hierarchicalData.total_models} models`);
console.log(`📊 Flat data: ${flatData.length} cars`);

// Convert flat data to hierarchical structure
console.log('🔄 Converting flat data to hierarchical structure...');

const flatBrandsMap = new Map();

flatData.forEach(car => {
  const brandName = car.Brand;
  const modelName = car.Model;
  const version = car.Version;
  const year = car.Year;
  const url = car.URL;
  const specs = car.Specs;

  // Normalize brand name
  const brandSlug = brandName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  
  if (!flatBrandsMap.has(brandSlug)) {
    flatBrandsMap.set(brandSlug, {
      name: brandName,
      slug: brandSlug,
      models: new Map()
    });
  }

  const brand = flatBrandsMap.get(brandSlug);
  
  // Normalize model name
  const modelSlug = modelName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  
  if (!brand.models.has(modelSlug)) {
    brand.models.set(modelSlug, {
      brand: brandSlug,
      model: modelSlug,
      name: modelName,
      properties: {}
    });
  }

  const model = brand.models.get(modelSlug);
  
  // Convert specs to properties format
  Object.entries(specs).forEach(([specKey, specValue]) => {
    if (!specValue || specValue === 'N/A' || specValue === '-') return;
    
    // Map spec keys to property keys
    let propertyKey = specKey.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    
    // Convert Turkish names to English keys
    const turkishToEnglish = {
      'beygir-gucu': 'power',
      'azami-tork': 'max-torque',
      'yakıt-tipi': 'fuel-type',
      'azami-hız': 'top-speed',
      '0-100kmh-hızlanma': 'acceleration',
      'çekiş-tipi': 'drive-wheel',
      'uzunluk': 'length',
      'genişlik': 'width',
      'yükseklik': 'height',
      'bagaj-hacmi': 'cargo-capacity',
      'ağırlık': 'curb-weight',
      'vites-türü': 'transmission'
    };
    
    propertyKey = turkishToEnglish[propertyKey] || propertyKey;
    
    if (!model.properties[propertyKey]) {
      model.properties[propertyKey] = {
        turkish_name: specKey,
        data: []
      };
    }
    
    // Add data entry
    const dataEntry = {
      Model: modelName,
      Year: year.toString(),
      Version: version,
      URL: url
    };
    
    // Map spec value to appropriate field
    switch (propertyKey) {
      case 'power':
        dataEntry.Power = specValue;
        break;
      case 'max-torque':
        dataEntry['Max torque'] = specValue;
        break;
      case 'fuel-type':
        dataEntry['Fuel type'] = specValue;
        break;
      case 'top-speed':
        dataEntry['Top speed'] = specValue;
        break;
      case 'acceleration':
        dataEntry['Acceleration 0-100 km / h'] = specValue;
        break;
      case 'drive-wheel':
        dataEntry['Drive wheel'] = specValue;
        break;
      case 'length':
        dataEntry.Length = specValue;
        break;
      case 'width':
        dataEntry.Width = specValue;
        break;
      case 'height':
        dataEntry.Height = specValue;
        break;
      case 'cargo-capacity':
        dataEntry['Cargo capacity'] = specValue;
        break;
      case 'curb-weight':
        dataEntry['Curb weight'] = specValue;
        break;
      case 'transmission':
        dataEntry.Transmission = specValue;
        break;
      default:
        dataEntry[specKey] = specValue;
    }
    
    model.properties[propertyKey].data.push(dataEntry);
  });
});

// Convert Maps to Arrays
const flatBrands = Array.from(flatBrandsMap.values()).map(brand => ({
  name: brand.name,
  slug: brand.slug,
  models: Array.from(brand.models.values())
}));

console.log(`📊 Converted flat data: ${flatBrands.length} brands, ${flatBrands.reduce((sum, brand) => sum + brand.models.length, 0)} models`);

// Merge with hierarchical data
console.log('🔀 Merging hierarchical and flat data...');

const mergedBrandsMap = new Map();

// Add hierarchical brands
hierarchicalData.brands.forEach(brand => {
  mergedBrandsMap.set(brand.slug, {
    name: brand.name,
    slug: brand.slug,
    models: new Map()
  });
  
  brand.models.forEach(model => {
    mergedBrandsMap.get(brand.slug).models.set(model.model, model);
  });
});

// Add/merge flat brands
flatBrands.forEach(brand => {
  if (!mergedBrandsMap.has(brand.slug)) {
    mergedBrandsMap.set(brand.slug, {
      name: brand.name,
      slug: brand.slug,
      models: new Map()
    });
  }
  
  const mergedBrand = mergedBrandsMap.get(brand.slug);
  
  brand.models.forEach(model => {
    if (!mergedBrand.models.has(model.model)) {
      mergedBrand.models.set(model.model, model);
    } else {
      // Merge properties
      const existingModel = mergedBrand.models.get(model.model);
      Object.entries(model.properties).forEach(([propKey, propValue]) => {
        if (!existingModel.properties[propKey]) {
          existingModel.properties[propKey] = propValue;
        } else {
          // Merge data arrays
          const existingData = existingModel.properties[propKey].data;
          const newData = propValue.data;
          
          // Avoid duplicates
          newData.forEach(newEntry => {
            const isDuplicate = existingData.some(existingEntry => 
              existingEntry.Model === newEntry.Model && 
              existingEntry.Year === newEntry.Year &&
              existingEntry.Version === newEntry.Version
            );
            
            if (!isDuplicate) {
              existingData.push(newEntry);
            }
          });
        }
      });
    }
  });
});

// Convert final structure
const mergedBrands = Array.from(mergedBrandsMap.values()).map(brand => ({
  name: brand.name,
  slug: brand.slug,
  models: Array.from(brand.models.values())
}));

// Calculate totals
const totalModels = mergedBrands.reduce((sum, brand) => sum + brand.models.length, 0);
const totalProperties = mergedBrands.reduce((sum, brand) => 
  sum + brand.models.reduce((modelSum, model) => modelSum + Object.keys(model.properties).length, 0), 0
);

// Create merged data structure
const mergedData = {
  scraped_date: new Date().toISOString(),
  merge_date: new Date().toISOString(),
  source_files: [
    'cars_data_complete_final.json',
    'all_cars_merged_20251025_234808.json'
  ],
  total_brands: mergedBrands.length,
  total_models: totalModels,
  total_properties_collected: totalProperties,
  brands: mergedBrands
};

// Write merged file
console.log('💾 Writing merged data file...');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mergedData, null, 2));

console.log('✅ Merge completed successfully!');
console.log(`📊 Final stats:`);
console.log(`   - Brands: ${mergedData.total_brands}`);
console.log(`   - Models: ${mergedData.total_models}`);
console.log(`   - Properties: ${mergedData.total_properties_collected}`);
console.log(`📁 Output file: ${OUTPUT_FILE}`);
console.log(`📏 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
