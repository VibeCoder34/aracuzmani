# 🚀 AracUzmanı - Quick Start Guide

Bu kısa rehber, authentication ve database sistemini hızlıca çalıştırmanız için gerekli adımları içerir.

## ⏱️ 15 Dakikada Başla

### 1️⃣ Bağımlılıkları Yükle (2 dk)

```bash
npm install
```

### 2️⃣ Supabase Projesi Oluştur (3 dk)

1. [supabase.com](https://supabase.com) → **New Project**
2. İsim: `aracuzmani`
3. Database şifresi belirle ve kaydet
4. Region: **Frankfurt**
5. **Create project** → Hazır olmasını bekle

### 3️⃣ Environment Variables (2 dk)

```bash
cp .env.example .env.local
```

`.env.local` dosyasını aç ve doldur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

> 💡 Anahtarlar: Supabase Dashboard → Settings → API

### 4️⃣ Database Migration (5 dk)

Supabase Dashboard → **SQL Editor** → Her dosyayı sırayla çalıştır:

1. ✅ `db/migrations/001_init_auth_and_core.sql`
2. ✅ `db/migrations/002_storage_buckets.sql`  
   ⚠️ Hata alırsan: Storage → Buckets → Manuel oluştur (`avatars`, `review-images`)
3. ✅ `db/migrations/003_rls_policies.sql`
4. ✅ `db/migrations/004_seed_reference_data.sql`

### 5️⃣ Email Auth Ayarları (2 dk)

Supabase Dashboard → **Authentication** → **Providers** → **Email**:

- ✅ Enable Email provider
- ✅ Confirm email

### 6️⃣ URL Configuration (1 dk)

**Authentication** → **URL Configuration**:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/callback`

### 7️⃣ Başlat! 🎉

```bash
npm run dev
```

Tarayıcıda aç: `http://localhost:3000/signup`

---

## ✅ Hızlı Test

1. **Kayıt Ol**: `/signup` → Formu doldur
2. **E-posta Kontrol**: Doğrulama linkine tıkla (veya Dashboard'da manuel confirm et)
3. **Giriş Yap**: `/login` → Email ve şifre ile giriş
4. **Profil**: `/profile` → İsim, username düzenle
5. **Avatar**: Profilde "Resim Yükle" → Bir resim seç
6. **Çıkış**: "Çıkış Yap" butonu

---

## 🐛 Sık Sorunlar

### "Invalid API key"
→ `.env.local` dosyasını kontrol et, server'ı yeniden başlat

### "Email not confirmed" 
→ Dashboard → Authentication → Users → Kullanıcıyı bul → Confirm

### "RLS policy violation"
→ `003_rls_policies.sql` dosyasını tekrar çalıştır

### Storage upload hatası
→ Storage → Buckets → `avatars` ve `review-images` oluşturuldu mu?

---

## 📖 Detaylı Dokümantasyon

- **AUTH_DATABASE_SETUP.md** - Tam kurulum rehberi
- **IMPLEMENTATION_SUMMARY.md** - Teknik detaylar
- **supabase/config/README.md** - Supabase yapılandırma

---

## 🎯 Opsiyonel: Google OAuth (10 dk)

### Google Cloud Console

1. [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials** → **Create OAuth client ID**
3. Type: Web application
4. Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Client ID ve Secret'i kopyala

### Supabase Dashboard

1. **Authentication** → **Providers** → **Google**
2. ✅ Enable Google provider
3. Client ID ve Secret'i yapıştır
4. **Save**

---

## 💡 İpuçları

- **Development'ta**: Email confirmation'ı kapatabilirsin (Auth → Providers → Email → Disable confirmations)
- **Test User**: Dashboard → Authentication → Users → Add user → Auto Confirm ✅
- **Logs**: Dashboard → Logs bölümünden hataları izle
- **Database**: Dashboard → Table Editor'den verileri görüntüle

---

## ✨ Tamamlandı!

Artık tam fonksiyonel bir auth sistemi var:

✅ Email/password signup & login  
✅ Magic link login  
✅ Google OAuth (opsiyonel)  
✅ Profile yönetimi  
✅ Avatar upload  
✅ Protected routes  
✅ RLS güvenlik  
✅ Rate limiting  
✅ Türkçe hata mesajları  

**İyi kodlamalar! 🚗💨**

