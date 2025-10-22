# 🚗 Araba Verisi Import Kılavuzu

## 📋 Genel Bakış

`cars_data_complete_final.json` dosyanız:
- **64 marka**
- **1,737 model**
- **169,640 özellik** içeriyor

Bu kılavuz bu verileri veritabanınıza nasıl aktaracağınızı açıklar.

---

## 🎯 Veri Yapısı ve Strateji

### JSON Yapısı
```
Brand (Abarth, Toyota, vb.)
  └── Model (595, Corolla, vb.)
        └── Properties
              ├── cargo-capacity
              ├── width, length, height
              ├── curb-weight
              ├── body-type
              ├── fuel-consumption
              ├── acceleration-0-100
              ├── max-speed
              ├── max-torque
              └── ... daha fazla
```

Her property altında **farklı trim kombinasyonları** var:
- Year (Yıl)
- Body Type (Gövde tipi)
- Fuel Type (Yakıt tipi)
- Transmission (Vites)
- Power (Motor gücü)

### Veritabanı Yapısı

```
car_brands (Markalar)
  └── car_models (Modeller)
        └── car_trims (Trim'ler - yıl/motor/vites kombinasyonları)
```

**Örnek:**
```
Toyota (brand)
  └── Corolla (model)
        ├── 2019 Sedan Petrol Manual 145hp (trim)
        ├── 2020 Sedan Hybrid Automatic 122hp (trim)
        └── 2021 Sedan Petrol CVT 140hp (trim)
```

---

## 🚀 Kullanım

### 1. Hazırlık

Script çalışması için Supabase credentials gerekli:

```bash
# .env.local dosyanıza ekleyin veya export edin:
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2. Script'i Çalıştırın

```bash
node scripts/import-cars-from-json.js
```

### 3. Import Süreci

Script şunları yapacak:

1. ✅ **Markaları ekle** (`car_brands` tablosuna)
2. ✅ **Modelleri ekle** (`car_models` tablosuna)
3. ✅ **Trim'leri oluştur ve ekle** (`car_trims` tablosuna)

Her trim için otomatik olarak şu özellikler çıkarılacak:
- 📏 **Boyutlar**: width, length, height
- ⚖️ **Ağırlık**: curb weight
- 🎒 **Bagaj**: trunk volume
- 🚪 **Kapı/Koltuk**: door count, seat count
- ⚡ **Performans**: horsepower, max torque, max speed, 0-100 acceleration
- ⛽ **Yakıt**: fuel type, avg consumption
- 🎨 **Gövde**: body type

---

## 🔍 Model Bazlı Ayırma Stratejisi

### Sorun
Aynı model farklı özelliklere sahip olabilir:
- **2019 Toyota Corolla Sedan** → farklı
- **2020 Toyota Corolla Hatchback** → farklı
- **2021 Toyota Corolla Hybrid** → farklı

### Çözüm: Trim Sistemi

Script her **benzersiz kombinasyon** için ayrı bir **trim** oluşturur:

```javascript
Trim Key = Year + Body Type + Fuel Type + Transmission + Power
```

**Örnek:**
```
Toyota Corolla modeli için 3 ayrı trim:

Trim 1:
  - Year: 2019
  - Body Type: Sedan
  - Fuel Type: Petrol
  - Transmission: Manual
  - Power: 145 hp
  - Specs: {width: 1780, length: 4640, ...}

Trim 2:
  - Year: 2020
  - Body Type: Hatchback
  - Fuel Type: Petrol
  - Transmission: Automatic
  - Power: 140 hp
  - Specs: {width: 1780, length: 4370, ...}

Trim 3:
  - Year: 2021
  - Body Type: Sedan
  - Fuel Type: Hybrid
  - Transmission: CVT
  - Power: 122 hp
  - Specs: {width: 1780, length: 4640, ...}
```

---

## 💡 Uygulamada Kullanım

### 1. Araba Listeleme Sayfası

Her **model** bir kart olarak gösterilir:

```typescript
// Örnek: /app/cars/page.tsx
const models = await supabase
  .from('car_models')
  .select(`
    *,
    brand:car_brands(name),
    trims:car_trims(count)
  `)
```

### 2. Araba Detay Sayfası

Kullanıcı bir model seçince, o modelin **tüm trim'lerini** gösterin:

```typescript
// Örnek: /app/cars/[slug]/page.tsx
const { data: model } = await supabase
  .from('car_models')
  .select(`
    *,
    brand:car_brands(name),
    trims:car_trims(*)
  `)
  .eq('id', modelId)
  .single()

// Trims'leri yıl ve özelliklere göre filtrele
```

### 3. Trim Seçici Komponenti

Kullanıcı özellik seçebilsin:

```tsx
<TrimSelector>
  <YearFilter years={[2019, 2020, 2021]} />
  <BodyTypeFilter types={['Sedan', 'Hatchback']} />
  <FuelTypeFilter types={['Petrol', 'Hybrid']} />
  <TransmissionFilter types={['Manual', 'Automatic', 'CVT']} />
</TrimSelector>
```

### 4. Karşılaştırma

Kullanıcı farklı trim'leri karşılaştırabilir:

```typescript
// İki farklı trim'i karşılaştır
const trim1 = '2019 Corolla Petrol Manual'
const trim2 = '2021 Corolla Hybrid CVT'

// Specs karşılaştırması
- Horsepower: 145 hp vs 122 hp
- Consumption: 6.2 L/100km vs 4.1 L/100km
- Weight: 1300 kg vs 1370 kg
```

---

## 🎨 Frontend Önerileri

### Detay Sayfası Layout

```
┌─────────────────────────────────────┐
│  Toyota Corolla                     │
│  ⭐ 4.5/5 (23 değerlendirme)        │
├─────────────────────────────────────┤
│  📅 Yıl Seç:  [2019] [2020] [2021]  │
│  🚗 Gövde:    [Sedan] [Hatchback]   │
│  ⛽ Yakıt:    [Petrol] [Hybrid]     │
│  🔧 Vites:    [Manual] [Auto] [CVT] │
├─────────────────────────────────────┤
│  Seçili: 2021 Sedan Hybrid CVT     │
│                                     │
│  📊 Özellikler                      │
│  • Motor Gücü: 122 hp               │
│  • 0-100: 10.5 saniye               │
│  • Yakıt Tüketimi: 4.1 L/100km      │
│  • Bagaj: 450 L                     │
│  • Ağırlık: 1370 kg                 │
│  ...                                │
└─────────────────────────────────────┘
```

### Karşılaştırma Sayfası

```
┌─────────────────────────────────────────────────────┐
│  Corolla 2019 Petrol  vs  Corolla 2021 Hybrid       │
├────────────────────────┬────────────────────────────┤
│  145 hp               │  122 hp         Horsepower  │
│  6.2 L/100km          │  4.1 L/100km    Consumption │
│  9.8 sn               │  10.5 sn        0-100       │
│  1300 kg              │  1370 kg        Weight      │
└────────────────────────┴────────────────────────────┘
```

---

## 📊 İstatistikler

Import sonrası beklenen veriler:

```
✅ 64 marka
✅ 1,737 model
✅ ~5,000-10,000 trim (tahmin)
```

Her trim:
- Benzersiz yıl/motor/vites kombinasyonu
- Tüm teknik özellikler
- İlişkili reviews için hazır

---

## 🔧 Troubleshooting

### Problem: Duplicate key hatası
**Çözüm:** Script zaten var olan kayıtları atlar, tekrar çalıştırabilirsiniz.

### Problem: Bazı veriler N/A
**Çözüm:** Script otomatik olarak N/A değerlerini `null` yapar.

### Problem: Import çok uzun sürüyor
**Çözüm:** Normal! 1700+ model ve binlerce trim var. 10-30 dakika sürebilir.

---

## 🎯 Sonraki Adımlar

1. ✅ **Import'u çalıştırın**
2. ✅ **Frontend'de trim seçici ekleyin**
3. ✅ **Detay sayfasını güncelleyin**
4. ✅ **Karşılaştırma özelliği ekleyin**
5. ✅ **Filtre sistemini trim'leri destekleyecek şekilde güncelleyin**

---

## 💾 Veritabanı Şeması

Mevcut şemanız zaten hazır:

```sql
car_brands
  ├── id
  ├── name
  └── country

car_models
  ├── id
  ├── brand_id (FK → car_brands)
  ├── name
  ├── start_year
  └── end_year

car_trims (✨ Burası önemli!)
  ├── id
  ├── model_id (FK → car_models)
  ├── year
  ├── trim_name
  ├── engine
  ├── transmission
  ├── drivetrain
  ├── fuel_type
  ├── body_type
  ├── horsepower
  ├── max_torque
  ├── max_speed
  ├── acceleration_0_to_100
  ├── avg_consumption
  ├── width, length, height
  ├── weight
  ├── trunk_volume
  ├── seat_count
  └── door_count
```

Tüm veriler `car_trims` tablosunda saklanacak!

---

## 📞 Yardım

Sorun olursa:
1. Import sırasında console logları kontrol edin
2. Script hata mesajları varsa, en fazla ilk 10 hatayı gösterir
3. Supabase dashboard'dan verileri manuel kontrol edebilirsiniz

