# 🔧 Import Script Düzeltmeleri

## ❌ Sorunlar

Kullanıcı teknik özellikler sayfasında birçok alanın "Belirtilmemiş" olarak görünmesini bildirdi.

## ✅ Yapılan Düzeltmeler

### 1. **JSON Field İsimleri Düzeltildi**

JSON'daki gerçek field isimleri ile script'teki field isimleri eşleştirildi:

| Özellik | Eski (Yanlış) | Yeni (Doğru) |
|---------|---------------|--------------|
| Max Torque | `"Max. torque"` | `"Max torque"` |
| Top Speed | `"Max. speed"` | `"Top speed"` |
| Acceleration | `"Acceleration 0 - 100 km/h"` | `"Acceleration 0-100 km / h"` |
| Power | `"Max. power"` | `"Power"` |
| Fuel Type | - | `"Fuel type"` (lowercase 't') |

### 2. **Body Type & Door Count**

- Body type artık detaylı parse ediliyor: `"5-doors, hatchback"` → `bodyType: "Hatchback"`, `doorCount: 5`
- Gövde tipleri normalize ediliyor (SUV, Coupe, vb.)
- Kapı sayısı otomatik çıkarılıyor

### 3. **Fuel Type İyileştirmeleri**

- `"gasoline"` → `"Petrol"`
- `"diesel"` → `"Diesel"`  
- `"electric"` → `"Electric"`
- `"hybrid"` → `"Hybrid"`
- LPG ve CNG desteği eklendi

### 4. **Transmission İyileştirmeleri**

- `"5 speed manual transmission"` → `"Manual"` veya `"5-Speed Manual"`
- `"traploze automatic"` → `"Automatic"`
- CVT, DCT, Semi-Automatic tipleri tanınıyor

### 5. **Drive Type (Çekiş Tipi)**

- `"front"` → `"FWD"`
- `"rear"` → `"RWD"`
- `"all-wheel"` → `"AWD"`

### 6. **Yeni Consumption Alanları**

- ✅ Urban Consumption (Şehir İçi)
- ✅ Extra-Urban Consumption (Şehir Dışı)
- ✅ Combined Consumption (Ortalama)

## 📊 Şimdi Import Edilecek Tüm Alanlar

### ✅ İç Tasarım
- Bagaj Hacmi (Cargo capacity)
- ~~Koltuk Sayısı~~ (JSON'da yok)

### ✅ Dış Tasarım
- **Kapı Sayısı** (Body type'dan çıkarılıyor) ⭐ DÜZELT
- Genişlik (Width)
- Uzunluk (Length)
- Yükseklik (Height)
- Ağırlık (Curb weight)
- **Gövde Tipi** (Body type normalize) ⭐ DÜZELT

### ✅ Yakıt Ekonomisi
- **Yakıt Tipi** ⭐ DÜZELT
- **Ortalama Yakıt Tüketimi** ⭐ DÜZELT
- **Şehir İçi Yakıt Tüketimi** ⭐ YENİ
- **Şehir Dışı Yakıt Tüketimi** ⭐ YENİ

### ✅ Performans
- **Azami Tork** ⭐ DÜZELT
- **Azami Hız** ⭐ DÜZELT
- **0-100 km/h Hızlanma** ⭐ DÜZELT
- **Beygir Gücü** ⭐ DÜZELT
- **Vites Türü** ⭐ DÜZELT
- **Çekiş Tipi** ⭐ YENİ

## 🚀 Şimdi Yapılacaklar

### 1. Migration'ı Çalıştır

Supabase SQL Editor'de:

```sql
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS urban_consumption NUMERIC(4,1),
ADD COLUMN IF NOT EXISTS extra_urban_consumption NUMERIC(4,1);

COMMENT ON COLUMN public.car_trims.urban_consumption IS 'City/urban fuel consumption in L/100km';
COMMENT ON COLUMN public.car_trims.extra_urban_consumption IS 'Highway/extra-urban fuel consumption in L/100km';
```

### 2. Mevcut Verileri Temizle (Opsiyonel)

Eğer yeniden baştan import etmek istersen:

```sql
-- UYARI: Bu tüm araç verilerini siler!
DELETE FROM car_trims;
DELETE FROM car_models;
DELETE FROM car_brands;
```

### 3. Verileri Import Et

```bash
cd /Users/keremugurlu/Desktop/aracuzmani
node scripts/import-cars-from-json.js
```

Bu işlem:
- 64 markayı
- 1,737 modeli  
- Binlerce trim'i (varyant)

Tüm düzeltilmiş özelliklerle birlikte import edecek!

## 🎯 Beklenen Sonuç

Artık araç detay sayfasında **tüm teknik özellikler düzgün şekilde** görünecek:

- ✅ Kapı Sayısı: 5
- ✅ Gövde Tipi: Hatchback
- ✅ Yakıt Tipi: Petrol
- ✅ Ortalama Tüketim: 6.6 L/100km
- ✅ Şehir İçi Tüketim: 8.7 L/100km
- ✅ Şehir Dışı Tüketim: 5.4 L/100km
- ✅ Azami Tork: 206 Nm
- ✅ Azami Hız: 210 km/h
- ✅ 0-100: 7.8 s
- ✅ Beygir Gücü: 145 HP
- ✅ Vites: Manual
- ✅ Çekiş: FWD

**Artık "Belirtilmemiş" yerine gerçek değerler göreceksin!** 🎉

