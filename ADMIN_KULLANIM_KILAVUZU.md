# 🚗 Admin Panel Kullanım Kılavuzu

## 📖 İçindekiler

1. [Admin Panel Nedir?](#admin-panel-nedir)
2. [Nasıl Admin Olunur?](#nasıl-admin-olunur)
3. [Admin Panel'e Nasıl Giriş Yapılır?](#admin-panele-nasıl-giriş-yapılır)
4. [Neler Yapılabilir?](#neler-yapılabilir)
5. [Adım Adım Kullanım](#adım-adım-kullanım)
6. [Sık Sorulan Sorular](#sık-sorulan-sorular)

---

## Admin Panel Nedir?

Admin Panel, **yetkilendirilmiş kullanıcıların** (admin ve moderatör) veritabanına **araç bilgisi ekleyip yönetebileceği** özel bir arayüzdür.

### Kimler Kullanabilir?

- ✅ **Admin**: Tam yetki (ekleme, silme, düzenleme)
- ✅ **Moderator**: Kısıtlı yetki (sadece ekleme)
- ❌ **Normal Kullanıcı**: Erişim yok

---

## Nasıl Admin Olunur?

### Yöntem 1: SQL ile (Hızlı)

Supabase Dashboard → SQL Editor:

```sql
-- Kendinizi admin yapın
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'sizin-email@example.com'
);
```

### Yöntem 2: Script ile

Terminal'de:

```bash
node scripts/change-role.js sizin-email@example.com admin
```

### ⚠️ Önemli Not

**Rol değişikliğinden sonra mutlaka logout yapıp tekrar login olun!**

---

## Admin Panel'e Nasıl Giriş Yapılır?

### Adım 1: Login Olun
Admin rolü aldıktan sonra normale site'ye giriş yapın.

### Adım 2: Admin Panel Linkini Bulun
Admin olduktan sonra 2 yerde göreceksiniz:

1. **Üst menüde**: "Admin Panel" linki (mavi/primary renkle vurgulanmış)
2. **Profil menüsünde**: Sağ üstteki profil resminize tıklayınca

### Adım 3: Tıklayın
Herhangi birine tıklayınca `/admin` sayfasına yönlendirileceksiniz.

---

## Neler Yapılabilir?

Admin Panel'de **4 ana sekme** var:

### 📋 1. Brands (Markalar)
- ✅ **Marka ekleyebilirsiniz** (Toyota, BMW, Ford, vb.)
- ✅ **Ülke bilgisi ekleyebilirsiniz** (Japonya, Almanya, ABD, vb.)
- 🔴 **Marka silebilirsiniz** (Sadece Admin - silinen markanın tüm modelleri de silinir!)

**Ne zaman kullanılır?**
- Veritabanında olmayan yeni bir marka eklemek istediğinizde

### 🚘 2. Models (Modeller)
- ✅ **Model ekleyebilirsiniz** (Corolla, 3 Serisi, Mustang, vb.)
- ✅ **Markaya bağlayabilirsiniz** (Corolla → Toyota)
- ✅ **Üretim yıllarını belirtebilirsiniz** (Başlangıç ve bitiş)
- 🔴 **Model silebilirsiniz** (Sadece Admin - silinen modelin tüm trim'leri de silinir!)

**Ne zaman kullanılır?**
- Bir markaya yeni model eklemek istediğinizde

### ⚙️ 3. Trims (Versiyonlar/Donanımlar)
- ✅ **Trim/versiyon ekleyebilirsiniz** (Sport, Limited, Premium, vb.)
- ✅ **Detaylı bilgi girebilirsiniz**:
  - Yıl (2024)
  - Trim adı (M Sport, Titanium, vb.)
  - Motor (2.0L Turbo, 1.5 Hybrid, vb.)
  - Şanzıman (Otomatik, Manuel, vb.)
  - Çekiş sistemi (FWD, AWD, 4WD, vb.)
- 🔴 **Trim silebilirsiniz** (Sadece Admin - AMA yorumu varsa silemezsiniz!)

**Ne zaman kullanılır?**
- Kullanıcıların yorum yapabileceği spesifik araç versiyonu eklemek için

### 📸 4. Upload Images (Fotoğraf Yükleme)
- ✅ **Araç fotoğrafı yükleyebilirsiniz**
- ✅ **Sürükle-bırak** ile kolay yükleme
- ✅ **Birden fazla fotoğraf** aynı anda
- ✅ **Public URL** otomatik oluşturulur
- 🔴 **Fotoğraf silebilirsiniz** (Sadece Admin)

**Desteklenen formatlar:**
- JPEG/JPG
- PNG
- WebP

**Maksimum boyut:** 10MB

---

## Adım Adım Kullanım

### 🎯 Senaryo 1: Tamamen Yeni Bir Araç Eklemek

Diyelim ki **2024 model Togg T10X Standard** eklemek istiyorsunuz:

#### 1. Marka Var mı Kontrol Edin
- **Brands** sekmesine gidin
- Listelerde "Togg" var mı bakın
- Yoksa ekleyin:

```
Marka Adı: Togg
Ülke: Türkiye
```

#### 2. Model Ekleyin
- **Models** sekmesine gidin
- Form doldurun:

```
Marka: Togg
Model Adı: T10X
Başlangıç Yılı: 2023
Bitiş Yılı: (boş bırakın - hala üretiliyor)
```

#### 3. Trim/Versiyon Ekleyin
- **Trims** sekmesine gidin
- Form doldurun:

```
Model: Togg T10X
Yıl: 2024
Trim Adı: Standard
Motor: Electric
Şanzıman: Otomatik
Çekiş: RWD
```

#### 4. Fotoğraf Yükleyin
- **Upload Images** sekmesine gidin
- Slug girin (küçük harf, tire ile):

```
Slug: togg-t10x-2024
```

- Fotoğrafları sürükle-bırak ile yükleyin
- Public URL'leri kopyalayın (sonra kullanacaksınız)

**✅ Tamamlandı!** Artık kullanıcılar bu araca yorum yapabilir.

---

### 🎯 Senaryo 2: Mevcut Bir Markaya Yeni Model Eklemek

Örnek: **Toyota'ya yeni Prius modeli eklemek**

#### 1. Marka Kontrolü
- Toyota zaten var mı? → Varsa atlayın
- Yoksa ekleyin (Brands sekmesi)

#### 2. Model Ekleyin
```
Marka: Toyota (dropdown'dan seçin)
Model Adı: Prius
Başlangıç Yılı: 2023
Bitiş Yılı: (boş)
```

#### 3. Trim Ekleyin
```
Model: Toyota Prius
Yıl: 2024
Trim Adı: Hybrid
Motor: 1.8L Hybrid
Şanzıman: CVT
Çekiş: FWD
```

#### 4. Fotoğraf Yükleyin
```
Slug: toyota-prius-2024
Fotoğraflar: 3-5 adet yükleyin
```

---

### 🎯 Senaryo 3: Sadece Yeni Bir Yıl Eklemek

Örnek: **Mevcut bir modelin 2025 yılı versiyonunu eklemek**

#### Direkt Trims Sekmesine Gidin
```
Model: BMW 3 Series (zaten var)
Yıl: 2025
Trim Adı: 320i M Sport
Motor: 2.0L Turbo I4
Şanzıman: 8-Speed Automatic
Çekiş: RWD
```

**Not:** Marka ve model zaten varsa onları tekrar eklemeyin!

---

## 📝 Önemli Kurallar ve Sınırlamalar

### ✅ Yapabilirsiniz

1. **Marka Ekleme**: Sınırsız
2. **Model Ekleme**: Her markaya sınırsız
3. **Trim Ekleme**: Her modele sınırsız
4. **Fotoğraf Yükleme**: Her araç için birden fazla (max 10MB/dosya)
5. **Aynı Araç, Farklı Yıllar**: Aynı modelin her yılını ayrı trim olarak ekleyebilirsiniz

### ❌ Yapamazsınız

1. **Yorumlu Trim Silme**: Eğer bir trim'e kullanıcı yorumu yapıldıysa, o trim silinemez
2. **Düzenleme**: Şu an direkt düzenleme yok, silip yeniden eklemeniz gerekir
3. **Toplu İşlem**: Tek tek eklemeniz gerekir (toplu import yok)
4. **Fotoğraf Düzenleme**: Yükledikten sonra düzenleyemezsiniz, sadece silebilirsiniz

### ⚠️ Dikkat!

1. **Cascade Silme**: 
   - Marka silerseniz → Tüm modelleri ve trim'leri de silinir
   - Model silerseniz → Tüm trim'leri silinir
   
2. **Geri Alma Yok**: Silinen veriler geri gelmez!

3. **Slug Formatı**: Fotoğraf yüklerken slug'ı doğru yazın:
   - ✅ Doğru: `toyota-corolla-2024`
   - ❌ Yanlış: `Toyota Corolla 2024`

---

## 🖼️ Fotoğraf Yükleme Detayları

### Slug Nedir?

Slug, araç için benzersiz bir tanımlayıcıdır. Fotoğraf dosya adında kullanılır.

**Format:**
```
{marka}-{model}-{yıl}
```

**Örnekler:**
- `bmw-3-series-2024`
- `toyota-corolla-2023`
- `tesla-model-3-2025`
- `togg-t10x-2024`

### Fotoğraf Yükleme Adımları

1. **Slug girin** (örn: `bmw-3-series-2024`)
2. **Fotoğrafları seçin** (sürükle-bırak veya tıkla)
3. **Yükleme tamamlanınca** public URL'ler gösterilir
4. **URL'leri kopyalayın** (daha sonra kullanmak için)

### Dosya Adı Formatı

Otomatik oluşturulur:
```
{slug}-{timestamp}.{uzantı}

Örnek:
bmw-3-series-2024-1729012345678.jpg
```

### Fotoğraf Tavsiyeleri

- 📐 **Boyut**: 1200x800px veya daha büyük
- 🎨 **Kalite**: Yüksek çözünürlüklü
- 📷 **Adet**: 3-5 fotoğraf ideal
- 🖼️ **İçerik**: Farklı açılardan çekim

---

## 🔐 Yetki Seviyeleri

### Admin (role = 'admin')

✅ Tüm haklar:
- Marka ekle/sil
- Model ekle/sil
- Trim ekle/sil
- Fotoğraf yükle/sil
- Her şeyi yönetebilir

### Moderator (role = 'moderator')

⚠️ Kısıtlı haklar:
- Marka ekle (ama silemez)
- Model ekle (ama silemez)
- Trim ekle (ama silemez)
- Fotoğraf yükle (ama silemez)

### Normal Kullanıcı (role = 'user')

❌ Admin panel'e erişim yok:
- Sadece siteyi kullanabilir
- Yorum yapabilir
- Admin özellikleri göremez

---

## 📊 Hızlı Referans Tablosu

| Özellik | Admin | Moderator | User |
|---------|-------|-----------|------|
| Admin panel görüntüleme | ✅ | ✅ | ❌ |
| Marka ekleme | ✅ | ✅ | ❌ |
| Marka silme | ✅ | ❌ | ❌ |
| Model ekleme | ✅ | ✅ | ❌ |
| Model silme | ✅ | ❌ | ❌ |
| Trim ekleme | ✅ | ✅ | ❌ |
| Trim silme | ✅ | ❌ | ❌ |
| Fotoğraf yükleme | ✅ | ✅ | ❌ |
| Fotoğraf silme | ✅ | ❌ | ❌ |
| Yorum yapma | ✅ | ✅ | ✅ |
| Site kullanma | ✅ | ✅ | ✅ |

---

## 🐛 Sorun Giderme

### "Forbidden - Admin access required" Hatası

**Sebep:** Rolünüz admin/moderator değil

**Çözüm:**
```sql
-- SQL Editor'de çalıştırın
SELECT role FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'sizin-email@example.com');

-- Eğer 'user' ise, admin yapın
UPDATE profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'sizin-email@example.com');
```

Sonra **logout → login** yapın!

---

### Admin Panel Linki Görünmüyor

**Çözüm:**
1. Logout yapın (tamamen)
2. Tarayıcı cache'ini temizleyin
3. Tekrar login olun
4. Sayfayı yenileyin (F5 veya Cmd+R)

---

### "Cannot delete trim with existing reviews" Hatası

**Sebep:** Bu trim'e kullanıcılar yorum yapmış

**Çözüm:**
- Trim'i silemezsiniz (veri bütünlüğü için)
- Yorumları silmek istemiyorsanız, trim'i olduğu gibi bırakın
- Gerçekten silmek gerekiyorsa, önce yorumları manuel silmelisiniz (önerilmez)

---

### Fotoğraf Yüklenmiyor

**Kontrol listesi:**
1. ✅ Dosya boyutu 10MB'dan küçük mü?
2. ✅ Dosya formatı JPEG/PNG/WebP mi?
3. ✅ Slug girdiniz mi?
4. ✅ Supabase Storage bucket'ı var mı?

**Supabase Storage Kontrolü:**
```sql
-- SQL Editor'de kontrol edin
SELECT * FROM storage.buckets WHERE id = 'review-images';
```

Eğer boş dönerse:
```sql
-- Bucket oluşturun
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);
```

---

## 💡 İpuçları ve En İyi Pratikler

### 1. Önce Araştırın
Marka/model eklemeden önce zaten var mı kontrol edin.

### 2. Tutarlı İsimlendirme
- Marka adları: "BMW", "Mercedes-Benz", "Volkswagen"
- Model adları: "3 Series", "C-Class", "Golf"
- Slug'lar: "bmw-3-series-2024"

### 3. Doğru Bilgi Girin
Motor, şanzıman gibi teknik bilgileri doğru yazın.

### 4. Kaliteli Fotoğraf
Yüksek çözünürlüklü, profesyonel fotoğraflar kullanın.

### 5. Yedekleme
Önemli silme işlemlerinden önce veritabanı yedeği alın.

### 6. Test Edin
Production'da değişiklik yapmadan önce, test kullanıcısı ile deneyin.

---

## 📞 Yardım ve Destek

### Daha Fazla Bilgi İçin

- 📖 **Teknik Detaylar**: `ADMIN_IMPLEMENTATION_SUMMARY.md`
- 🚀 **Hızlı Başlangıç**: `ADMIN_QUICK_START.md`
- 🇬🇧 **İngilizce Kılavuz**: `ADMIN_PANEL_GUIDE.md`
- 🛠️ **Script Yardımı**: `scripts/README.md`

### Komutlar

```bash
# Kullanıcıları listele
node scripts/list-users.js

# Rol değiştir
node scripts/change-role.js email@example.com admin

# Admin yap (legacy)
node scripts/make-admin.js email@example.com
```

---

## 🎉 Özet

Admin Panel ile:
1. ✅ Markaları yönetebilirsiniz
2. ✅ Modelleri ekleyebilirsiniz
3. ✅ Trim/versiyonları tanımlayabilirsiniz
4. ✅ Fotoğrafları yükleyebilirsiniz
5. ✅ Veritabanını zenginleştirebilirsiniz

**Unutmayın:**
- 🔑 Önce admin rolü alın
- 🚪 Logout → Login yapın
- 🎯 Admin Panel linkine tıklayın
- 🚗 Araçları eklemeye başlayın!

---

**Başarılar! 🚀**

*Son güncelleme: 2024*

