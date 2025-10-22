const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rabbdwstkifnmioqnsua.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYmJkd3N0a2lmbm1pb3Fuc3VhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEzMjYxOCwiZXhwIjoyMDc1NzA4NjE4fQ.62YyT4FuH8Vq6N8cEfkG3PLh7UGFvW5UDcL7P0oqFHE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkStats() {
  console.log('📊 Veritabanı İstatistikleri\n');
  
  // Total counts
  const { count: totalTrims } = await supabase
    .from('car_trims')
    .select('*', { count: 'exact', head: true });
  
  console.log('🔧 Toplam Trim:', totalTrims);
  
  // Check NULL counts
  const { data: allTrims } = await supabase
    .from('car_trims')
    .select('horsepower, max_torque, max_speed, fuel_type, body_type, door_count');
  
  if (allTrims) {
    const stats = {
      horsepower_null: 0,
      max_torque_null: 0,
      max_speed_null: 0,
      fuel_type_null: 0,
      body_type_null: 0,
      door_count_null: 0,
    };
    
    allTrims.forEach(t => {
      if (!t.horsepower) stats.horsepower_null++;
      if (!t.max_torque) stats.max_torque_null++;
      if (!t.max_speed) stats.max_speed_null++;
      if (!t.fuel_type) stats.fuel_type_null++;
      if (!t.body_type) stats.body_type_null++;
      if (!t.door_count) stats.door_count_null++;
    });
    
    console.log('\n❌ NULL Değerler:');
    console.log('  Horsepower NULL:', stats.horsepower_null, '/', totalTrims, `(${Math.round(stats.horsepower_null/totalTrims*100)}%)`);
    console.log('  Max Torque NULL:', stats.max_torque_null, '/', totalTrims, `(${Math.round(stats.max_torque_null/totalTrims*100)}%)`);
    console.log('  Max Speed NULL:', stats.max_speed_null, '/', totalTrims, `(${Math.round(stats.max_speed_null/totalTrims*100)}%)`);
    console.log('  Fuel Type NULL:', stats.fuel_type_null, '/', totalTrims, `(${Math.round(stats.fuel_type_null/totalTrims*100)}%)`);
    console.log('  Body Type NULL:', stats.body_type_null, '/', totalTrims, `(${Math.round(stats.body_type_null/totalTrims*100)}%)`);
    console.log('  Door Count NULL:', stats.door_count_null, '/', totalTrims, `(${Math.round(stats.door_count_null/totalTrims*100)}%)`);
    
    console.log('\n💡 ÖNERİ:');
    if (stats.horsepower_null > totalTrims * 0.5) {
      console.log('  ⚠️  Verilerin yarısından fazlası boş!');
      console.log('  🔄 Veritabanını temizleyip YENİ script ile tekrar import et!');
    } else {
      console.log('  ✅ Veriler genel olarak dolu görünüyor.');
    }
  }
}

checkStats();
