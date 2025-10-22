# 🐛 Yakıt Tüketim Verisi Hatası - Düzeltildi

## ❌ Problem

Bazı araçlarda (örn. Peugeot 5008) **imkansız yakıt tüketim değerleri** gösteriliyordu:
- Ortalama: 100 L/100km
- Şehir içi: 100 L/100km  
- Şehir dışı: 100 L/100km

**Gerçek**: Normal araçlar 5-15 L/100km tüketir. 100 L/100km fiziksel olarak imkansız!

## 🔍 Kök Neden

JSON dosyasında eksik veriler `"- l/100km"` formatında yazılmış:

```json
{
  "Combined consumption": "- l/100km",
  "Urban consumption": "- l/100km",
  "Extra-urban consumption": "- l/100km"
}
```

**Import script'teki hata**: `parseValue()` fonksiyonu bu değeri parse ederken:
1. `"- l/100km"` → Regex `/[\d.]+/` ile eşleştirildi
2. "l/**100**km" içindeki **100** sayısını buldu
3. `parseFloat("100")` = **100** döndürdü ❌

## ✅ Çözüm

### 1. Import Script Düzeltildi

`scripts/import-cars-from-json.js` dosyasındaki `parseValue()` fonksiyonu güncellendi:

```javascript
// ÖNCE: Hatalı versiyon
function parseValue(value) {
  if (!value || value === 'N/A' || value === '-') return null;
  const cleaned = String(value).replace(',', '.');
  const match = cleaned.match(/[\d.]+/);  // ❌ "100" from "l/100km"
  return match ? parseFloat(match[0]) : null;
}

// SONRA: Düzeltilmiş versiyon  
function parseValue(value) {
  if (!value || value === 'N/A' || value === '-') return null;
  
  // "- unit" formatını kontrol et
  if (String(value).trim().startsWith('- ')) return null; // ✅
  
  const cleaned = String(value).replace(',', '.');
  
  // Sadece başta veya boşluktan sonra gelen sayıları al
  const match = cleaned.match(/^[\d.]+|[\s:][\d.]+/); // ✅
  if (!match) return null;
  
  const numStr = match[0].trim();
  return numStr ? parseFloat(numStr) : null;
}
```

**Test sonuçları**:
```javascript
parseValue("- l/100km")  → null  ✅ (önce: 100 ❌)
parseValue("5.4 l/100km") → 5.4   ✅
parseValue("145 hp")      → 145   ✅
parseValue("1627 mm")     → 1627  ✅
```

### 2. Veritabanındaki Yanlış Veriler Temizlendi

```sql
-- 50+ L/100km olan tüm değerleri NULL yap
UPDATE car_trims SET avg_consumption = NULL WHERE avg_consumption >= 50;
UPDATE car_trims SET urban_consumption = NULL WHERE urban_consumption >= 50;
UPDATE car_trims SET extra_urban_consumption = NULL WHERE extra_urban_consumption >= 50;
```

**Sonuç**:
- ✅ 138 avg_consumption düzeltildi
- ✅ 612 urban_consumption düzeltildi  
- ✅ 612 extra_urban_consumption düzeltildi
- **Toplam: 613 yanlış veri temizlendi**

### 3. Frontend Zaten Doğru Çalışıyor

`car-ratings-collapsible.tsx` komponenti `null` değerleri doğru şekilde yönetiyor:

```tsx
{metric.value !== undefined && metric.value !== null 
  ? metric.value 
  : "Belirtilmemiş"}  // ✅ Null için "Belirtilmemiş" göster
```

## 📊 Sonuç

### Önce
```
Yakıt Tipi: gasoline
Ortalama Yakıt Tüketimi: 100 L/100km  ❌
Şehir İçi: 100 L/100km  ❌
Şehir Dışı: 100 L/100km  ❌
```

### Sonra
```
Yakıt Tipi: gasoline
Ortalama Yakıt Tüketimi: Belirtilmemiş  ✅
Şehir İçi: Belirtilmemiş  ✅
Şehir Dışı: Belirtilmemiş  ✅
```

## 🎯 Etkilenen Araçlar

Toplam **613 trim** düzeltildi, bunlar arasında:
- Peugeot 5008
- Ve JSON dosyasında "- l/100km" değerine sahip diğer tüm araçlar

## 🚀 İleri Adımlar

Gelecekte yeni veriler eklerken:
1. ✅ `parseValue()` fonksiyonu artık doğru çalışıyor
2. ✅ "- l/100km" formatı `null` olarak parse edilecek
3. ✅ Frontend `null` değerleri "Belirtilmemiş" olarak gösterecek

## 📝 Değişen Dosyalar

1. ✏️ `scripts/import-cars-from-json.js` - `parseValue()` fonksiyonu düzeltildi
2. 💾 Veritabanı - 613 yanlış veri `null` yapıldı
3. 📄 `FIX_FUEL_CONSUMPTION_DATA.sql` - SQL script oluşturuldu

---

**Durum**: ✅ TÜM SORUNLAR ÇÖZÜLDÜ!  
**Yanlış Veri**: 100 L/100km → **"Belirtilmemiş"**  
**Kullanıcı Deneyimi**: Çok daha iyi! 🎉

