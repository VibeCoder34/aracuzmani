# Database'den Frontend'e Geçiş - Kurulum Rehberi

## Sorun
Admin panelden eklediğiniz trim'ler ve fotoğraflar frontend'de gözükmüyordu çünkü frontend hala `mock/cars.json` dosyasından veri çekiyordu, database'den değil.

## Çözüm
Şimdi frontend database'den veri çekiyor! Aşağıdaki adımları takip edin.

---

## 📋 Kurulum Adımları

### 1. Database Migration'larını Çalıştırın

Supabase SQL Editor'da aşağıdaki migration'ları sırasıyla çalıştırın:

#### a) Fotoğraf URL'leri için kolon ekleyin
```bash
# Supabase Dashboard > SQL Editor
# Dosya: db/migrations/009_add_image_urls.sql
```

Veya doğrudan SQL:
```sql
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.car_trims.image_urls IS 'Array of public image URLs from Supabase Storage';

CREATE INDEX IF NOT EXISTS idx_trims_with_images ON public.car_trims 
USING GIN (image_urls) 
WHERE array_length(image_urls, 1) > 0;
```

#### b) Admin storage politikalarını ekleyin
```bash
# Dosya: db/migrations/008_admin_storage_policies.sql
# VEYA
# Dosya: QUICK_FIX_STORAGE.sql
```

Bu migration admin'lerin fotoğraf yüklemesi için gerekli.

### 2. Artık Admin Panelden Araç Ekleyebilirsiniz!

#### Adım 1: Brand Ekleyin (Gerekirse)
1. `/admin` sayfasına gidin
2. **Brands** sekmesinde yeni marka ekleyin (örn: Toyota, BMW)

#### Adım 2: Model Ekleyin (Gerekirse)
1. **Models** sekmesinde brand'i seçin
2. Model adını girin (örn: Corolla, X5)
3. Yıl aralığını belirtin

#### Adım 3: Fotoğrafları Yükleyin
1. **Upload Images** sekmesine gidin
2. Car slug girin (örn: `toyota-corolla-2024`)
3. Fotoğrafları yükleyin
4. **ÇOK ÖNEMLİ**: Yüklenen fotoğraf URL'lerini kopyalayın! 
   - URL'ler otomatik olarak gösterilecek
   - Hepsini birden kopyalayın (virgülle ayrılmış)

#### Adım 4: Trim (Araç) Ekleyin
1. **Trims** sekmesine gidin
2. Model ve yıl seçin
3. **Tüm özellikleri doldurun**:
   - Trim Name, Engine, Transmission, Drivetrain
   - **İç Tasarım**: Koltuk sayısı, bagaj hacmi
   - **Dış Tasarım**: Kapı sayısı, boyutlar, gövde tipi
   - **Yakıt Ekonomisi**: Yakıt tipi, tüketim
   - **Performans**: HP, tork, hız, hızlanma, vites, çekiş
4. **Araba Fotoğrafları** alanına:
   - Kopyaladığınız URL'leri yapıştırın
   - Virgülle ayırın:
   ```
   https://.../image1.jpg, https://.../image2.jpg, https://.../image3.jpg
   ```
5. **Add Trim** butonuna tıklayın

### 3. Frontend'de Görüntüleyin

1. `/cars` sayfasına gidin
2. Eklediğiniz araç listede görünecek!
3. Araca tıklayarak detay sayfasını açın
4. Fotoğrafları, özellikleri ve puanlama sistemini göreceksiniz

---

## 🎯 Yeni Sistem Nasıl Çalışıyor?

### Backend
- **API Endpoint**: `/api/cars` - Database'den tüm araçları çeker
- **Database**: `car_trims` tablosundan veri alır
- **İlişkiler**: `car_trims` → `car_models` → `car_brands`
- **Fotoğraflar**: `image_urls` kolonunda TEXT[] array olarak saklanır

### Frontend
- **Cars List** (`/cars`): API'den araçları çeker, loading state gösterir
- **Car Detail** (`/cars/[slug]`): Slug'a göre araç bulur, detayları gösterir
- **Mock Data**: Artık kullanılmıyor! Tamamen database'den çekiliyor

### Admin Panel
- **Tam Kontrol**: Brand, Model, Trim ekleyin/silin
- **Özellikler**: Tüm araç özelliklerini girebilirsiniz
- **Fotoğraflar**: Storage'a yükleyin, URL'leri kaydedin
- **Kolay Kullanım**: Tek formda her şey

---

## 📝 Örnek Kullanım Senaryosu

### Yeni Bir Toyota Corolla 2024 Ekleyelim:

1. **Brand kontrolü** (zaten varsa atla):
   - Brands → Add New Brand
   - Name: `Toyota`
   - Country: `Japan`

2. **Model kontrolü** (zaten varsa atla):
   - Models → Add New Model
   - Brand: `Toyota`
   - Name: `Corolla`
   - Start Year: `2024`

3. **Fotoğrafları yükle**:
   - Upload Images → Car Slug: `toyota-corolla-2024`
   - 3-4 fotoğraf yükle
   - URL'leri kopyala:
   ```
   https://your-project.supabase.co/storage/v1/object/public/review-images/cars/toyota-corolla-2024-1234.jpg,
   https://your-project.supabase.co/storage/v1/object/public/review-images/cars/toyota-corolla-2024-5678.jpg
   ```

4. **Trim ekle**:
   - Trims → Add New Trim
   - Model: `Toyota Corolla`
   - Year: `2024`
   - Trim Name: `1.6 Hybrid Executive`
   
   **İç Tasarım:**
   - Koltuk Sayısı: `5`
   - Bagaj Hacmi: `450`
   
   **Dış Tasarım:**
   - Kapı Sayısı: `4`
   - Gövde Tipi: `Sedan`
   - Genişlik: `1780`
   - Uzunluk: `4630`
   - Yükseklik: `1435`
   - Ağırlık: `1370`
   
   **Yakıt Ekonomisi:**
   - Yakıt Tipi: `Hybrid`
   - Ort. Yakıt Tüketimi: `4.5`
   
   **Performans:**
   - Beygir Gücü: `122`
   - Azami Tork: `142`
   - Azami Hız: `180`
   - 0-100 km/h: `10.9`
   - Vites Türü: `Otomatik CVT`
   - Çekiş Tipi: `FWD`
   
   **Araba Fotoğrafları:**
   - (Kopyaladığınız URL'leri yapıştırın)

5. **Sonuç**:
   - `/cars` sayfasında görünecek
   - `/cars/toyota-corolla-2024-1-6-hybrid-executive` detay sayfası oluşacak
   - Kullanıcılar yorum yapabilecek
   - Rating sistemi çalışacak

---

## 🔄 Migration Checklist

- [ ] `007_add_detailed_specs.sql` çalıştırıldı mı?
- [ ] `008_admin_storage_policies.sql` çalıştırıldı mı?
- [ ] `009_add_image_urls.sql` çalıştırıldı mı?
- [ ] Admin kullanıcısı var mı? (scripts/make-admin.js)
- [ ] En az 1 brand eklendi mi?
- [ ] En az 1 model eklendi mi?
- [ ] Fotoğraf yükleme test edildi mi?
- [ ] Trim ekleme test edildi mi?
- [ ] Frontend'de görüntü kontrol edildi mi?

---

## 🐛 Sorun Giderme

### "Failed to upload image: new row violates row-level security policy"
- **Çözüm**: `008_admin_storage_policies.sql` migration'ını çalıştırın
- **Kontrol**: Kullanıcınızın `admin` veya `moderator` rolü var mı?

### "Araç listede görünmüyor"
- **Kontrol 1**: Migration'lar çalıştırıldı mı?
- **Kontrol 2**: `image_urls` alanı dolu mu?
- **Kontrol 3**: Browser console'da hata var mı?
- **Kontrol 4**: `/api/cars` endpoint'ine doğrudan gidin, veriyi görüyor musunuz?

### "Fotoğraflar yüklenmiyor"
- **Kontrol 1**: Storage bucket'ı (`review-images`) oluşturuldu mu?
- **Kontrol 2**: Admin storage policy'leri var mı?
- **Çözüm**: `QUICK_FIX_STORAGE.sql` dosyasını çalıştırın

### "Trim eklerken hata"
- **Kontrol**: Tüm zorunlu alanlar dolu mu? (model_id, year)
- **Kontrol**: image_urls formatı doğru mu? (virgülle ayrılmış URL'ler)

---

## 📚 İlgili Dosyalar

### Database Migrations
- `db/migrations/007_add_detailed_specs.sql` - Araç özellikleri kolonları
- `db/migrations/008_admin_storage_policies.sql` - Storage politikaları
- `db/migrations/009_add_image_urls.sql` - Fotoğraf URL'leri kolonu

### API Routes
- `src/app/api/cars/route.ts` - Araçları listeler
- `src/app/api/admin/trims/route.ts` - Trim CRUD işlemleri

### Frontend Pages
- `src/app/cars/page.tsx` - Araç listesi (database'den)
- `src/app/cars/[slug]/page.tsx` - Araç detayı (database'den)
- `src/app/admin/page.tsx` - Admin paneli (güncellenmiş form)

### Components
- `src/components/car/car-ratings-collapsible.tsx` - Yeni rating sistemi
- `src/components/admin/image-uploader.tsx` - Fotoğraf yükleyici

---

## ✅ Artık Hazırsınız!

Sisteminiz şimdi tamamen database-driven! Artık:
- ✅ Admin panelden araç ekleyebilirsiniz
- ✅ Fotoğrafları yükleyip yönetebilirsiniz
- ✅ Tüm araç özellikleri database'de saklanır
- ✅ Frontend otomatik olarak güncellenmiş verileri gösterir
- ✅ Mock data'ya gerek yok!

**İyi çalışmalar! 🚀**

---

**Oluşturulma Tarihi**: 15 Ekim 2025  
**Durum**: Hazır ve Test Edilmeye Hazır

