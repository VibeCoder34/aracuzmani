# Debug: Araçlar Gözükmüyor

## 🔍 Sorun Tespiti

### Adım 1: Browser Console'u Kontrol Et

1. `/cars` sayfasına git
2. **F12** veya **Cmd+Option+I** ile Developer Tools'u aç
3. **Console** sekmesine git
4. Şu logları ara:

```
[CarsPage] Fetching cars from /api/cars...
[CarsPage] Cars response status: 200
[CarsPage] Cars data: {...}
[CarsPage] Number of cars: X
```

**Ne görüyorsun?**
- [ ] `Number of cars: 0` → Database boş veya migration yapılmadı
- [ ] `Number of cars: 1` veya daha fazla → Veri var, başka sorun var
- [ ] `Failed to fetch cars: 500` → API hatası
- [ ] Hiçbir log yok → Sayfa yüklenmiyor

---

### Adım 2: Server Terminal'i Kontrol Et

Terminal'de (Next.js çalıştığın yer) şu logları ara:

```
[API /api/cars] Received request
[API /api/cars] Building query...
[API /api/cars] Query result - trims count: X
```

**Ne görüyorsun?**
- [ ] `trims count: 0` → Database'de veri yok
- [ ] `trims count: 1+` → Veri var
- [ ] `Database error:` → Supabase connection sorunu
- [ ] Hiçbir log yok → API route çağrılmıyor

---

### Adım 3: Migration'ları Kontrol Et

Supabase Dashboard > SQL Editor'da çalıştır:

```sql
-- Trims var mı kontrol et
SELECT 
  ct.id,
  ct.year,
  ct.trim_name,
  cm.name as model_name,
  cb.name as brand_name,
  ct.image_urls
FROM car_trims ct
JOIN car_models cm ON ct.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
ORDER BY ct.created_at DESC
LIMIT 10;
```

**Sonuç:**
- [ ] Satır yok (0 rows) → Database boş, trim ekle
- [ ] Satırlar var ama `image_urls` NULL → Fotoğraf yok
- [ ] Satırlar var ve dolu → Veri tamam

---

### Adım 4: image_urls Kolonu Var mı?

```sql
-- Kolon kontrolü
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'car_trims' 
AND column_name = 'image_urls';
```

**Sonuç:**
- [ ] 1 satır döndü → Kolon var ✅
- [ ] 0 satır → **`FIX_500_ERROR.sql` çalıştır!**

---

## 🛠️ Olası Çözümler

### Çözüm 1: Migration Eksik
```sql
-- FIX_500_ERROR.sql çalıştır
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
```

### Çözüm 2: Database Boş
1. `/admin` → Trims sekmesi
2. Yeni trim ekle
3. Model seç, fotoğraf yükle, kaydet

### Çözüm 3: Server Restart
```bash
# Terminal'de Ctrl+C
# Sonra:
npm run dev
```

### Çözüm 4: Supabase Connection
`.env.local` dosyasını kontrol et:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Çözüm 5: Browser Cache
1. Hard refresh: **Cmd+Shift+R** (Mac) veya **Ctrl+Shift+R** (Windows)
2. Veya incognito/private mode'da aç

---

## 📊 Test Senaryosu

### Hızlı Test: API Direkt Çağır

Browser console'da:

```javascript
fetch('/api/cars')
  .then(r => r.json())
  .then(d => console.log('API Result:', d));
```

**Beklenen sonuç:**
```javascript
{
  cars: [
    {
      id: "1",
      slug: "renault-clio-2018",
      brand: "Renault",
      model: "Clio",
      // ...
    }
  ],
  count: 1
}
```

---

## 🎯 En Yaygın Sorunlar

### 1. Migration Yapılmadı (500 Error)
**Belirti**: Console'da 500 error  
**Çözüm**: `FIX_500_ERROR.sql` çalıştır

### 2. Database Boş
**Belirti**: `Number of cars: 0`  
**Çözüm**: Admin panelden trim ekle

### 3. RLS Policy Sorunu
**Belirti**: Trims var ama API döndürmüyor  
**Çözüm**: 
```sql
-- car_trims tablosunda SELECT policy var mı?
SELECT * FROM pg_policies 
WHERE tablename = 'car_trims' 
AND cmd = 'SELECT';
```

### 4. Frontend Cache
**Belirti**: Eski veriyi gösteriyor  
**Çözüm**: Hard refresh (Cmd+Shift+R)

---

## ✅ Checklist

Sırayla kontrol et:

1. Migration'lar:
   - [ ] `007_add_detailed_specs.sql` çalıştırıldı
   - [ ] `008_admin_storage_policies.sql` çalıştırıldı
   - [ ] `009_add_image_urls.sql` veya `FIX_500_ERROR.sql` çalıştırıldı

2. Database'de veri var:
   - [ ] En az 1 brand var
   - [ ] En az 1 model var
   - [ ] En az 1 trim var
   - [ ] image_urls kolonu var

3. API çalışıyor:
   - [ ] Console'da API logs görünüyor
   - [ ] Terminal'de API logs görünüyor
   - [ ] 500 error yok
   - [ ] RLS policy'ler var

4. Frontend:
   - [ ] Server restart edildi
   - [ ] Browser cache temizlendi
   - [ ] Console'da veri geliyor
   - [ ] `next.config.ts` Supabase hostname ekli

---

## 🆘 Hızlı Yardım

**Hala çalışmıyor mu?**

1. **Browser Console screenshot al** (F12 > Console)
2. **Server terminal screenshot al**
3. **SQL sonuçlarını at** (yukarıdaki SELECT query'leri)
4. Bana gönder, birlikte bakalım!

---

**Oluşturulma**: 15 Ekim 2025  
**Durum**: Debug Rehberi

