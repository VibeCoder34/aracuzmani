const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rabbdwstkifnmioqnsua.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYmJkd3N0a2lmbm1pb3Fuc3VhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEzMjYxOCwiZXhwIjoyMDc1NzA4NjE4fQ.62YyT4FuH8Vq6N8cEfkG3PLh7UGFvW5UDcL7P0oqFHE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testAPI() {
  console.log('🔍 Testing API and Supabase data...\n');
  
  // 1. Check if we have any brands
  const { data: brands, error: brandsError } = await supabase
    .from('car_brands')
    .select('id, name')
    .limit(5);
  
  console.log('📦 Brands in DB:', brands?.length || 0);
  if (brands && brands.length > 0) {
    brands.forEach(b => console.log('  -', b.name));
  }
  
  // 2. Check if we have any models
  const { data: models, error: modelsError } = await supabase
    .from('car_models')
    .select('id, name, car_brands!inner(name)')
    .limit(5);
  
  console.log('\n🏷️  Models in DB:', models?.length || 0);
  if (models && models.length > 0) {
    models.forEach(m => console.log('  -', m.car_brands.name, m.name));
  }
  
  // 3. Check if we have any trims with DATA
  const { data: trims, error: trimsError } = await supabase
    .from('car_trims')
    .select('id, year, horsepower, fuel_type, body_type')
    .limit(5);
  
  console.log('\n🔧 Trims in DB:', trims?.length || 0);
  if (trims && trims.length > 0) {
    trims.forEach(t => {
      console.log('  - Year:', t.year, '| HP:', t.horsepower || '❌ NULL', '| Fuel:', t.fuel_type || '❌ NULL', '| Body:', t.body_type || '❌ NULL');
    });
  }
  
  // 4. Test making a slug
  if (models && models.length > 0) {
    const testModel = models[0];
    const slug = `${testModel.car_brands.name}-${testModel.name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    console.log('\n🔗 Test Slug:', slug);
    console.log('📡 Test API URL: http://localhost:3001/api/cars/' + slug);
    
    // Test fetch API
    try {
      const response = await fetch(`http://localhost:3001/api/cars/${slug}`);
      console.log('\n🌐 API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Success!');
        console.log('   Model:', data.model?.name);
        console.log('   Trims:', data.trims?.length || 0);
        if (data.trims && data.trims.length > 0) {
          const trim = data.trims[0];
          console.log('   Sample Trim HP:', trim.horsepower || '❌ NULL');
          console.log('   Sample Trim Fuel:', trim.fuel_type || '❌ NULL');
        }
      } else {
        const error = await response.json();
        console.log('❌ API Error:', error);
      }
    } catch (fetchError) {
      console.log('⚠️  Could not fetch API (is server running?)');
      console.log('   Error:', fetchError.message);
    }
  }
}

testAPI();
