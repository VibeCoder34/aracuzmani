# AracUzmanı - Authentication & Database Setup Guide

Bu doküman, AracUzmanı uygulaması için Supabase authentication ve database kurulum rehberidir.

## 📋 İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [Kurulum Adımları](#kurulum-adımları)
3. [Database Migration](#database-migration)
4. [Supabase Konfigürasyonu](#supabase-konfigürasyonu)
5. [Authentication Akışları](#authentication-akışları)
6. [Test Etme](#test-etme)
7. [Sorun Giderme](#sorun-giderme)

## 🎯 Gereksinimler

- Node.js 18+ ve npm/yarn
- [Supabase hesabı](https://supabase.com) (ücretsiz)
- Next.js 15+ bilgisi
- TypeScript bilgisi

## 🚀 Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
npm install
# veya
yarn install
```

Yeni eklenen paketler:
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Next.js için SSR desteği

### 2. Supabase Projesi Oluşturun

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. Proje adı: `aracuzmani` (veya istediğiniz isim)
4. Database şifresi belirleyin (kaydedin!)
5. Region: `Frankfurt` (Türkiye'ye en yakın)
6. "Create project" butonuna tıklayın
7. Proje hazır olana kadar bekleyin (~2 dakika)

### 3. Environment Variables

Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin ve Supabase bilgilerinizi ekleyin:

```env
# Supabase Dashboard > Settings > API'den alın
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Uygulama Ayarları
APP_LOCALE=tr
APP_NAME=AracUzmanı
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **DİKKAT**: `SUPABASE_SERVICE_ROLE_KEY` hassas bir bilgidir, asla client-side'da kullanmayın!

## 💾 Database Migration

### Yöntem 1: Supabase Dashboard (Önerilen)

1. [Supabase Dashboard](https://supabase.com/dashboard) > Projeniz > **SQL Editor**
2. Sol panelden **New query** butonuna tıklayın
3. Aşağıdaki dosyaları sırasıyla çalıştırın:

#### a) Core Schema ve Triggers
```sql
-- db/migrations/001_init_auth_and_core.sql içeriğini kopyalayın
-- SQL Editor'e yapıştırın
-- RUN butonuna tıklayın
```

#### b) Storage Buckets
```sql
-- db/migrations/002_storage_buckets.sql içeriğini kopyalayın
-- SQL Editor'e yapıştırın
-- RUN butonuna tıklayın
```

⚠️ Eğer bucket oluşturma hatası alırsanız:
1. **Storage** > **Buckets** > **New bucket**
2. `avatars` bucket'ı oluşturun (public: true, 5MB limit)
3. `review-images` bucket'ı oluşturun (public: true, 10MB limit)
4. Sonra migration'ı tekrar çalıştırın

#### c) RLS Policies
```sql
-- db/migrations/003_rls_policies.sql içeriğini kopyalayın
-- SQL Editor'e yapıştırın
-- RUN butonuna tıklayın
```

#### d) Reference Data (Opsiyonel)
```sql
-- db/migrations/004_seed_reference_data.sql içeriğini kopyalayın
-- SQL Editor'e yapıştırın
-- RUN butonuna tıklayın
```

### Yöntem 2: Supabase CLI

```bash
# Supabase CLI yükleyin (global)
npm install -g supabase

# Login olun
supabase login

# Projeyi bağlayın
supabase link --project-ref YOUR_PROJECT_REF

# Migrations'ları uygulayın
supabase db push
```

## ⚙️ Supabase Konfigürasyonu

### 1. Email Authentication

1. **Authentication** > **Providers** > **Email**
2. **Enable Email provider** ✅
3. **Confirm email** seçeneğini aktif edin
4. **Secure email change** seçeneğini aktif edin

#### Email Templates (Türkçe)

**Authentication** > **Email Templates** bölümünden:

1. **Confirm signup**
   - Subject: `AracUzmanı'na Hoş Geldiniz - E-posta Doğrulama`
   - `/emails/auth/magic-link.html` içeriğini kullanın

2. **Magic Link**
   - Subject: `AracUzmanı Giriş Linki`
   - `/emails/auth/magic-link.html` içeriğini kullanın

3. **Change Email Address**
   - Subject: `E-posta Adresinizi Doğrulayın`
   
4. **Reset Password**
   - Subject: `AracUzmanı - Şifre Sıfırlama`
   - `/emails/auth/reset-password.html` içeriğini kullanın

### 2. Google OAuth (Opsiyonel)

#### Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**
2. **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `AracUzmanı`
5. **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   http://localhost:3000/callback (development)
   ```
6. **Create** ve Client ID ile Client Secret'i kaydedin

#### Supabase Dashboard

1. **Authentication** > **Providers** > **Google**
2. **Enable Google provider** ✅
3. Client ID ve Client Secret'i yapıştırın
4. **Save**

### 3. URL Configuration

**Authentication** > **URL Configuration**:

- **Site URL**: 
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

- **Redirect URLs** (her satıra bir tane):
  ```
  http://localhost:3000/callback
  https://yourdomain.com/callback
  ```

## 🔐 Authentication Akışları

### Email/Password Signup

```typescript
// /signup sayfasında
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePass123',
  options: {
    data: { full_name: 'Ali Veli' },
    emailRedirectTo: 'http://localhost:3000/callback'
  }
})
```

**Akış**:
1. Kullanıcı formu doldurur
2. Supabase `auth.users` tablosuna kullanıcı ekler
3. Trigger otomatik olarak `profiles` tablosuna kayıt oluşturur
4. Doğrulama e-postası gönderilir
5. Kullanıcı e-postadaki linke tıklar → `/callback` → `/profile`

### Magic Link Login

```typescript
// /login sayfasında
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'http://localhost:3000/callback'
  }
})
```

### Google OAuth

```typescript
// /login veya /signup sayfasında
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:3000/callback'
  }
})
```

### Password Reset

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: 'http://localhost:3000/reset-password' }
)
```

### Logout

```typescript
await supabase.auth.signOut()
// veya
window.location.href = '/logout'
```

## 🧪 Test Etme

### 1. Development Server'ı Başlatın

```bash
npm run dev
```

### 2. Test Kullanıcısı Oluşturun

**Yöntem A: UI üzerinden**
1. `http://localhost:3000/signup` adresine gidin
2. Formu doldurun
3. E-postanızı kontrol edin
4. Doğrulama linkine tıklayın

**Yöntem B: Supabase Dashboard**
1. **Authentication** > **Users** > **Add user**
2. Email ve password girin
3. **Auto Confirm User** ✅
4. **Create user**

### 3. Test Senaryoları

#### ✅ Email/Password Login
- [ ] Kayıt olma
- [ ] E-posta doğrulama
- [ ] Giriş yapma
- [ ] Yanlış şifre hata mesajı
- [ ] Profile sayfasına yönlendirme

#### ✅ Magic Link
- [ ] Magic link isteği
- [ ] E-posta geldi mi?
- [ ] Link'e tıklayınca giriş oluyor mu?

#### ✅ Google OAuth (yapılandırıldıysa)
- [ ] Google ile giriş
- [ ] Profile otomatik oluşuyor mu?

#### ✅ Protected Routes
- [ ] `/profile` giriş yapmadan erişilemiyor
- [ ] Giriş yapınca `/profile` açılıyor
- [ ] Giriş yapmışken `/login` profile yönlendiriyor

#### ✅ Profile Management
- [ ] Ad soyad güncelleme
- [ ] Username güncelleme (unique check)
- [ ] Bio ekleme
- [ ] Avatar yükleme (Storage)
- [ ] Çıkış yapma

### 4. Database'i Kontrol Edin

```sql
-- Kullanıcılar
SELECT * FROM auth.users;

-- Profiller
SELECT * FROM public.profiles;

-- Brands ve Models
SELECT b.name, m.name FROM car_brands b
JOIN car_models m ON m.brand_id = b.id;
```

## 🔍 Sorun Giderme

### "Invalid API key" Hatası

**Çözüm**:
1. `.env.local` dosyasındaki anahtarları kontrol edin
2. Supabase Dashboard'dan tekrar kopyalayın
3. Development server'ı yeniden başlatın (`npm run dev`)

### "Email not confirmed" Hatası

**Çözüm**:
- Development'ta auto-confirm açın:
  1. **Authentication** > **Providers** > **Email**
  2. **Enable email confirmations** ❌ (development için)
  3. Production'da mutlaka ✅ olmalı!

### RLS Policy Hatası

```
new row violates row-level security policy
```

**Çözüm**:
1. SQL Editor'de policies'leri kontrol edin:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```
2. `003_rls_policies.sql` dosyasını tekrar çalıştırın
3. Policy'nin doğru user_id check'i yaptığından emin olun

### Storage Upload Hatası

**Çözüm**:
1. Bucket'ların oluşturulduğunu kontrol edin:
   - **Storage** > **Buckets**
2. Policies'leri kontrol edin (002 migration)
3. File size limiti: avatars 5MB, review-images 10MB

### Middleware Redirect Loop

**Çözüm**:
- `src/middleware.ts` içinde `publicRoutes` ve `protectedRoutes` dizilerini kontrol edin
- Callback route'unun public olduğundan emin olun

### TypeScript Hataları

```bash
# Supabase types'ı yeniden generate edin
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/lib/supabase/types.ts
```

## 📚 Ek Kaynaklar

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 Kabul Kriterleri

Aşağıdaki tüm maddeler çalışıyor olmalı:

- [x] Email/password ile kayıt olma
- [x] E-posta doğrulama
- [x] Email/password ile giriş yapma
- [x] Magic link ile giriş
- [x] Google OAuth ile giriş (yapılandırıldıysa)
- [x] `/profile` korumalı ve sadece giriş yapanlara açık
- [x] Profile düzenleme (isim, username, bio)
- [x] Avatar yükleme (Storage)
- [x] Çıkış yapma
- [x] Tüm tablolarda RLS aktif ve çalışıyor
- [x] Rate limiting aktif (10 review/day, 50 comment/day)
- [x] Trigger'lar çalışıyor (profile oluşturma, avg_score hesaplama)
- [x] Türkçe hata mesajları
- [x] Migration dosyaları hazır ve çalışıyor

## 🛠️ Geliştirme Notları

### Type Safety

Database types'ı güncel tutun:

```bash
npm run db:types
```

### Database Değişiklikleri

Yeni migration eklerken:

1. `db/migrations/005_your_migration.sql` oluşturun
2. İsimlendirme: `{sıra}_{açıklama}.sql`
3. Rollback plan düşünün
4. Test ortamında önce test edin

### Production Checklist

- [ ] Environment variables production'da ayarlı
- [ ] Email confirmation aktif
- [ ] Google OAuth production credentials
- [ ] Site URL doğru domain
- [ ] RLS policies test edildi
- [ ] Rate limiting ayarları kontrol edildi
- [ ] Storage bucket policies doğru
- [ ] Error tracking (Sentry vs.) kuruldu
- [ ] Database backup stratejisi hazır

## 📞 Destek

Sorun yaşarsanız:
1. Bu dokümandaki [Sorun Giderme](#sorun-giderme) bölümünü okuyun
2. Supabase Dashboard > Logs bölümünü kontrol edin
3. Browser console'da hata var mı bakın
4. GitHub Issues'da yeni issue açın

---

**Hazırlayan**: AracUzmanı Development Team  
**Versiyon**: 1.0.0  
**Son Güncelleme**: Ekim 2025

