# 🔄 Migration 010: Urban & Extra-Urban Consumption Fields

## 📋 Ne Yapılıyor?

Bu migration, araç teknik özelliklerine şu alanları ekliyor:
- `urban_consumption` (Şehir İçi Yakıt Tüketimi)
- `extra_urban_consumption` (Şehir Dışı Yakıt Tüketimi)

## 🚀 Nasıl Çalıştırılır?

### Supabase Dashboard'da:

1. Supabase projenize gidin: https://supabase.com/dashboard
2. Sol menüden **SQL Editor** seçin
3. Aşağıdaki SQL kodunu kopyalayıp yapıştırın:

```sql
-- =====================================================
-- Add urban and extra-urban consumption fields
-- =====================================================
-- This migration adds city and highway fuel consumption
-- fields to complement the existing combined consumption

ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS urban_consumption NUMERIC(4,1),
ADD COLUMN IF NOT EXISTS extra_urban_consumption NUMERIC(4,1);

-- Add comments for documentation
COMMENT ON COLUMN public.car_trims.urban_consumption IS 'City/urban fuel consumption in L/100km';
COMMENT ON COLUMN public.car_trims.extra_urban_consumption IS 'Highway/extra-urban fuel consumption in L/100km';
```

4. **Run** butonuna tıklayın

## ✅ Doğrulama

Migration'dan sonra şu SQL ile kolonları doğrulayın:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'car_trims' 
  AND column_name IN ('urban_consumption', 'extra_urban_consumption');
```

## 📊 Veri Import

Migration tamamlandıktan sonra verileri import edin:

```bash
node scripts/import-cars-from-json.js
```

Bu script şimdi urban ve extra-urban consumption değerlerini de import edecek.

## 🎯 Sonuç

Artık araç detay sayfalarında şu bilgiler görünecek:
- Ortalama Yakıt Tüketimi (Combined)
- Şehir İçi Yakıt Tüketimi (Urban)
- Şehir Dışı Yakıt Tüketimi (Extra-urban)

