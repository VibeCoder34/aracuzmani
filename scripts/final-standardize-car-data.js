/**
 * Complete Car Data Standardization
 * 
 * This script ensures ALL car data has exactly the same format
 * for perfect database compatibility
 */

const fs = require('fs');
const path = require('path');

// File paths
const INPUT_FILE = path.join(__dirname, '..', 'cars_data_standardized.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'cars_data_final.json');

console.log('🔧 Starting complete car data standardization...');

// Read standardized data
console.log('📖 Reading standardized data file...');
const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

console.log(`📊 Found ${data.brands.length} brands, ${data.total_models} models`);

// Define the EXACT standard format we want
const STANDARD_DATA_FIELDS = [
  'Model',
  'Year', 
  'Body Type',
  'Fuel Type',
  'Transmission',
  'Power',
  'Cargo capacity',
  'Length',
  'Width', 
  'Height',
  'Curb weight',
  'Max torque',
  'Top speed',
  'Acceleration 0-100 km / h',
  'Drive wheel',
  'Number of seats',
  'Number of doors'
];

// Property key mapping to ensure consistency
const PROPERTY_MAPPING = {
  'beygir-gc': 'power',
  'azami-tork': 'max-torque',
  'yakt-tipi': 'fuel-type',
  'azami-hz': 'top-speed',
  '0-100kmh-hzlanma': 'acceleration',
  'eki-tipi': 'drive-wheel',
  'uzunluk': 'length',
  'genilik': 'width',
  'ykseklik': 'height',
  'bagaj-hacmi': 'cargo-capacity',
  'arllk': 'curb-weight',
  'vites-tr': 'transmission',
  'power': 'power',
  'max-torque': 'max-torque',
  'fuel-type': 'fuel-type',
  'top-speed': 'top-speed',
  'acceleration': 'acceleration',
  'drive-wheel': 'drive-wheel',
  'length': 'length',
  'width': 'width',
  'height': 'height',
  'cargo-capacity': 'cargo-capacity',
  'curb-weight': 'curb-weight',
  'transmission': 'transmission',
  'combined-consumption': 'combined-consumption',
  'urban-consumption': 'urban-consumption',
  'extra-urban-consumption': 'extra-urban-consumption',
  'body-type': 'body-type',
  'number-of-seats': 'number-of-seats',
  'number-of-doors': 'number-of-doors'
};

// Turkish name mapping
const TURKISH_NAMES = {
  'power': 'Beygir Gücü',
  'max-torque': 'Azami Tork',
  'fuel-type': 'Yakıt Tipi',
  'top-speed': 'Azami Hız',
  'acceleration': '0-100kmh Hızlanma',
  'drive-wheel': 'Çekiş Tipi',
  'length': 'Uzunluk',
  'width': 'Genişlik',
  'height': 'Yükseklik',
  'cargo-capacity': 'Bagaj Hacmi',
  'curb-weight': 'Ağırlık',
  'transmission': 'Vites Türü',
  'combined-consumption': 'Karma Tüketim',
  'urban-consumption': 'Şehir İçi Tüketim',
  'extra-urban-consumption': 'Şehir Dışı Tüketim',
  'body-type': 'Kasa Tipi',
  'number-of-seats': 'Koltuk Sayısı',
  'number-of-doors': 'Kapı Sayısı'
};

let processedCount = 0;
let errorCount = 0;

// Process each brand
data.brands.forEach((brand, brandIndex) => {
  console.log(`📦 Processing brand ${brandIndex + 1}/${data.brands.length}: ${brand.name}`);
  
  brand.models.forEach((model, modelIndex) => {
    const standardizedProperties = {};
    
    // Process each property
    Object.entries(model.properties).forEach(([propKey, propValue]) => {
      // Map to standard property key
      const standardPropKey = PROPERTY_MAPPING[propKey] || propKey;
      
      // Get Turkish name
      const turkishName = TURKISH_NAMES[standardPropKey] || propValue.turkish_name;
      
      // Standardize property data
      const standardizedData = propValue.data.map(dataEntry => {
        const standardizedEntry = {};
        
        // Ensure all standard fields exist
        STANDARD_DATA_FIELDS.forEach(field => {
          standardizedEntry[field] = dataEntry[field] || '';
        });
        
        // Keep additional fields that might be useful
        Object.entries(dataEntry).forEach(([fieldKey, fieldValue]) => {
          if (!STANDARD_DATA_FIELDS.includes(fieldKey) && fieldValue) {
            standardizedEntry[fieldKey] = fieldValue;
          }
        });
        
        return standardizedEntry;
      });
      
      // Create standardized property
      standardizedProperties[standardPropKey] = {
        turkish_name: turkishName,
        data: standardizedData
      };
    });
    
    // Update model with standardized properties
    model.properties = standardizedProperties;
    processedCount++;
  });
});

console.log(`✅ Processed ${processedCount} models`);

// Create final standardized data structure
const finalData = {
  scraped_date: data.scraped_date,
  merge_date: data.merge_date,
  standardization_date: data.standardization_date,
  final_standardization_date: new Date().toISOString(),
  source_files: data.source_files,
  total_brands: data.total_brands,
  total_models: data.total_models,
  total_properties_collected: data.total_properties_collected,
  standard_fields: STANDARD_DATA_FIELDS,
  brands: data.brands
};

// Write final standardized file
console.log('💾 Writing final standardized data file...');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));

console.log('✅ Complete standardization completed successfully!');
console.log(`📊 Final stats:`);
console.log(`   - Brands: ${finalData.total_brands}`);
console.log(`   - Models: ${finalData.total_models}`);
console.log(`   - Properties: ${finalData.total_properties_collected}`);
console.log(`   - Standard fields: ${STANDARD_DATA_FIELDS.length}`);
console.log(`📁 Output file: ${OUTPUT_FILE}`);
console.log(`📏 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);

// Final verification
console.log('\n🔍 Final Verification:');
const sampleBrand = finalData.brands.find(b => b.name === 'DS-Automobiles');
if (sampleBrand && sampleBrand.models.length > 0) {
  const sampleModel = sampleBrand.models[0];
  const sampleProp = Object.keys(sampleModel.properties)[0];
  if (sampleProp) {
    const sampleData = sampleModel.properties[sampleProp].data[0];
    console.log(`   Sample property: ${sampleProp}`);
    console.log(`   Sample data fields: ${Object.keys(sampleData).join(', ')}`);
    console.log(`   All standard fields present: ${STANDARD_DATA_FIELDS.every(field => sampleData.hasOwnProperty(field))}`);
  }
}
