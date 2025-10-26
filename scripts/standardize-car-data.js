/**
 * Standardize Car Data Format
 * 
 * This script ensures all car data in cars_data_merged.json has consistent format
 * for database compatibility
 */

const fs = require('fs');
const path = require('path');

// File paths
const INPUT_FILE = path.join(__dirname, '..', 'cars_data_merged.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'cars_data_standardized.json');

console.log('🔧 Starting car data standardization...');

// Read merged data
console.log('📖 Reading merged data file...');
const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

console.log(`📊 Found ${data.brands.length} brands, ${data.total_models} models`);

// Standard property mapping
const STANDARD_PROPERTIES = {
  'beygir-gc': 'power',
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

// Standard data field mapping
const STANDARD_DATA_FIELDS = {
  'Beygir Gücü': 'Power',
  'Azami Tork': 'Max torque',
  'Yakıt Tipi': 'Fuel type',
  'Azami Hız': 'Top speed',
  '0-100kmh Hızlanma': 'Acceleration 0-100 km / h',
  'Çekiş Tipi': 'Drive wheel',
  'Uzunluk': 'Length',
  'Genişlik': 'Width',
  'Yükseklik': 'Height',
  'Bagaj Hacmi': 'Cargo capacity',
  'Ağırlık': 'Curb weight',
  'Vites Türü': 'Transmission'
};

let standardizedCount = 0;
let errorCount = 0;

// Process each brand
data.brands.forEach((brand, brandIndex) => {
  console.log(`📦 Processing brand ${brandIndex + 1}/${data.brands.length}: ${brand.name}`);
  
  brand.models.forEach((model, modelIndex) => {
    const standardizedProperties = {};
    
    // Process each property
    Object.entries(model.properties).forEach(([propKey, propValue]) => {
      // Standardize property key
      const standardPropKey = STANDARD_PROPERTIES[propKey] || propKey;
      
      // Standardize property data
      const standardizedData = propValue.data.map(dataEntry => {
        const standardizedEntry = {
          Model: dataEntry.Model || '',
          Year: dataEntry.Year || '',
          'Body Type': dataEntry['Body Type'] || '',
          'Fuel Type': dataEntry['Fuel Type'] || '',
          Transmission: dataEntry.Transmission || '',
          Power: dataEntry.Power || ''
        };
        
        // Map additional fields
        Object.entries(dataEntry).forEach(([fieldKey, fieldValue]) => {
          if (STANDARD_DATA_FIELDS[fieldKey]) {
            const standardFieldKey = STANDARD_DATA_FIELDS[fieldKey];
            standardizedEntry[standardFieldKey] = fieldValue;
          } else if (!standardizedEntry.hasOwnProperty(fieldKey)) {
            // Keep unmapped fields as is
            standardizedEntry[fieldKey] = fieldValue;
          }
        });
        
        return standardizedEntry;
      });
      
      // Create standardized property
      standardizedProperties[standardPropKey] = {
        turkish_name: propValue.turkish_name,
        data: standardizedData
      };
    });
    
    // Update model with standardized properties
    model.properties = standardizedProperties;
    standardizedCount++;
  });
});

console.log(`✅ Standardized ${standardizedCount} models`);

// Create standardized data structure
const standardizedData = {
  scraped_date: data.scraped_date,
  merge_date: data.merge_date,
  standardization_date: new Date().toISOString(),
  source_files: data.source_files,
  total_brands: data.total_brands,
  total_models: data.total_models,
  total_properties_collected: data.total_properties_collected,
  brands: data.brands
};

// Write standardized file
console.log('💾 Writing standardized data file...');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(standardizedData, null, 2));

console.log('✅ Standardization completed successfully!');
console.log(`📊 Final stats:`);
console.log(`   - Brands: ${standardizedData.total_brands}`);
console.log(`   - Models: ${standardizedData.total_models}`);
console.log(`   - Properties: ${standardizedData.total_properties_collected}`);
console.log(`📁 Output file: ${OUTPUT_FILE}`);
console.log(`📏 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);

// Verify standardization
console.log('\n🔍 Verification:');
const sampleBrand = standardizedData.brands.find(b => b.name === 'DS-Automobiles');
if (sampleBrand && sampleBrand.models.length > 0) {
  const sampleModel = sampleBrand.models[0];
  const sampleProp = Object.keys(sampleModel.properties)[0];
  if (sampleProp) {
    const sampleData = sampleModel.properties[sampleProp].data[0];
    console.log(`   Sample property: ${sampleProp}`);
    console.log(`   Sample data fields: ${Object.keys(sampleData).join(', ')}`);
  }
}
