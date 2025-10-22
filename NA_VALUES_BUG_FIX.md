# 🐛 "N/A" Değerlerinin Veritabanı Değerlerinin Üzerine Yazması - Düzeltildi

## ❌ Problem

Tesla Model Y gibi elektrikli araçlarda:
- **Yakıt Tipi**: "N/A" gösteriyordu (DB'de "Electric" olmasına rağmen)
- **Yakıt Tüketimi**: "Belirtilmemiş" (doğru, çünkü elektrikli araçların yakıt tüketimi yok)

## 🔍 Kök Neden

`json-specs-loader.ts` dosyasında JSON'dan gelen **"N/A"** değerleri filtrelenmiyordu:

```typescript
// ❌ ÖNCE: "N/A" da geçerli bir değer olarak kabul ediliyordu
case 'fuel-type':
  const fuelValue = dataEntry['Fuel type'];
  if (fuelValue) specs.fuelType = fuelValue;  // "N/A" string truthy!
  break;
```

**Sonuç**: 
1. JSON'dan `fuelType: "N/A"` geliyordu
2. `mergeSpecs` fonksiyonu bunu valid sayıyordu
3. Veritabanındaki "Electric" değerinin üzerine yazıyordu

## ✅ Çözüm

JSON'dan gelen **"N/A"** ve **"-"** değerlerini filtrele:

```typescript
// ✅ SONRA: "N/A" ve "-" değerleri null olarak kabul ediliyor
case 'fuel-type':
  const fuelValue = dataEntry['Fuel type'];
  if (fuelValue && fuelValue !== 'N/A' && fuelValue !== '-') {
    specs.fuelType = fuelValue;
  }
  break;
```

### Düzeltilen Property'ler

1. ✅ `fuel-type` - Yakıt tipi
2. ✅ `body-type` - Gövde tipi
3. ✅ `drive-wheel` - Çekiş tipi
4. ✅ `transmission` - Vites tipi

## 📊 Sonuç

### Önce (Tesla Model Y)
```json
{
  "fuel_type": "N/A",     ❌ Yanlış!
  "avg_consumption": null,
  "horsepower": 258
}
```

### Sonra (Tesla Model Y)
```json
{
  "fuel_type": "Electric",  ✅ Doğru!
  "avg_consumption": null,
  "horsepower": 258
}
```

## 🎯 Frontend Görünüm

**Önce:**
```
Yakıt Tipi: N/A                          ❌
Ortalama Yakıt Tüketimi: Belirtilmemiş
```

**Sonra:**
```
Yakıt Tipi: Electric                     ✅
Ortalama Yakıt Tüketimi: Belirtilmemiş
```

## 💡 Neden "Belirtilmemiş"?

Elektrikli araçların **yakıt tüketimi yok**! Onların **enerji tüketimi** var (kWh/100km). 

Bu şu anda veritabanında mevcut değil, bu yüzden "Belirtilmemiş" göstermek doğru davranış.

## 🔮 Gelecek İyileştirmeler

Elektrikli araçlar için özel bir bölüm eklenebilir:
- ❌ Yakıt Tüketimi (gösterilmemeli)
- ✅ Enerji Tüketimi (kWh/100km) - yeni veri eklenebilir
- ✅ Menzil (km) - yeni veri eklenebilir
- ✅ Şarj Süresi - yeni veri eklenebilir

## 📝 Değişen Dosyalar

1. ✏️ `src/lib/json-specs-loader.ts`
   - `fuel-type` case: "N/A" filtresi eklendi
   - `body-type` case: "N/A" filtresi eklendi
   - `drive-wheel` case: "N/A" filtresi eklendi
   - `transmission` case: "N/A" filtresi eklendi

## 🧪 Test

```bash
# Tesla Model Y kontrol et
curl http://localhost:3001/api/cars/tesla-model-y | jq '.trims[0].fuel_type'
# Sonuç: "Electric" ✅

# Tarayıcıda kontrol et
http://localhost:3001/cars/tesla-model-y
# Yakıt Tipi: Electric ✅
```

---

**Durum**: ✅ DÜZELTILDI!  
**Etkilenen Araçlar**: Tüm elektrikli araçlar (Tesla, BMW i-series, vb.)  
**Önceki Değer**: "N/A" ❌  
**Yeni Değer**: "Electric" ✅

