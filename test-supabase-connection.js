/* eslint-disable @typescript-eslint/no-require-imports */
// Quick test script to verify Supabase credentials
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🔍 Checking Supabase credentials...\n')

if (!url) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL is missing!')
} else if (!url.includes('supabase.co')) {
  console.log('⚠️  URL format looks wrong:', url)
} else {
  console.log('✅ Project URL found:', url)
}

if (!anonKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!')
} else if (!anonKey.startsWith('eyJ')) {
  console.log('⚠️  Anon key format looks wrong')
} else {
  console.log('✅ Anon key found (length:', anonKey.length, 'chars)')
}

console.log('\n')

if (url && anonKey && url.includes('supabase.co') && anonKey.startsWith('eyJ')) {
  console.log('🎉 All credentials look good! You can run: npm run dev\n')
} else {
  console.log('❌ Please check your .env.local file\n')
}

