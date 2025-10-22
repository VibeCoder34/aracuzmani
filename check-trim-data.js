const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkData() {
  console.log('🔍 Checking trim data in Supabase...\n');
  
  // Get a random trim
  const { data: trims, error } = await supabase
    .from('car_trims')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (!trims || trims.length === 0) {
    console.log('⚠️  No trims found in database!');
    return;
  }
  
  const trim = trims[0];
  console.log('📊 Sample Trim Data:');
  console.log('ID:', trim.id);
  console.log('Year:', trim.year);
  console.log('Trim Name:', trim.trim_name);
  console.log('\n🔧 Technical Specs:');
  console.log('├─ horsepower:', trim.horsepower || '❌ NULL');
  console.log('├─ max_torque:', trim.max_torque || '❌ NULL');
  console.log('├─ max_speed:', trim.max_speed || '❌ NULL');
  console.log('├─ acceleration_0_to_100:', trim.acceleration_0_to_100 || '❌ NULL');
  console.log('├─ avg_consumption:', trim.avg_consumption || '❌ NULL');
  console.log('├─ urban_consumption:', trim.urban_consumption || '❌ NULL');
  console.log('├─ extra_urban_consumption:', trim.extra_urban_consumption || '❌ NULL');
  console.log('├─ fuel_type:', trim.fuel_type || '❌ NULL');
  console.log('├─ transmission:', trim.transmission || '❌ NULL');
  console.log('├─ drive_type:', trim.drive_type || '❌ NULL');
  console.log('├─ body_type:', trim.body_type || '❌ NULL');
  console.log('├─ door_count:', trim.door_count || '❌ NULL');
  console.log('├─ seat_count:', trim.seat_count || '❌ NULL');
  console.log('├─ trunk_volume:', trim.trunk_volume || '❌ NULL');
  console.log('├─ width:', trim.width || '❌ NULL');
  console.log('├─ length:', trim.length || '❌ NULL');
  console.log('├─ height:', trim.height || '❌ NULL');
  console.log('└─ weight:', trim.weight || '❌ NULL');
  
  console.log('\n📈 Statistics:');
  const { count } = await supabase
    .from('car_trims')
    .select('*', { count: 'exact', head: true });
  
  console.log('Total trims in DB:', count);
  
  // Check how many have NULL values
  const { data: nullCheck } = await supabase
    .from('car_trims')
    .select('horsepower, max_torque, fuel_type, body_type')
    .limit(10);
  
  console.log('\n🔍 Checking first 10 trims for NULL values:');
  let nullCount = {
    horsepower: 0,
    max_torque: 0,
    fuel_type: 0,
    body_type: 0
  };
  
  nullCheck?.forEach(t => {
    if (!t.horsepower) nullCount.horsepower++;
    if (!t.max_torque) nullCount.max_torque++;
    if (!t.fuel_type) nullCount.fuel_type++;
    if (!t.body_type) nullCount.body_type++;
  });
  
  console.log('NULL horsepower:', nullCount.horsepower + '/10');
  console.log('NULL max_torque:', nullCount.max_torque + '/10');
  console.log('NULL fuel_type:', nullCount.fuel_type + '/10');
  console.log('NULL body_type:', nullCount.body_type + '/10');
}

checkData();
