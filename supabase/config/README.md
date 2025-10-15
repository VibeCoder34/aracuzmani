# Supabase Yapılandırma Rehberi

## API Anahtarlarını Alma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. Projenizi seçin
3. **Settings** > **API** bölümüne gidin
4. Aşağıdaki anahtarları kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (GÜVENLİ TUTUN!)

5. Bu anahtarları `.env.local` dosyasına yapıştırın (`.env.example`'ı kopyalayarak oluşturun)

## Email Authentication Ayarları

1. **Authentication** > **Providers** > **Email** bölümüne gidin
2. **Enable Email provider** seçeneğini aktif edin
3. **Email Templates** kısmından:
   - Dili Türkçe olarak ayarlayın
   - Özel template'leri `/emails/auth/` klasöründen yükleyebilirsiniz
4. **Site URL** ve **Redirect URLs** ayarlarını yapılandırın:
   - Site URL: `http://localhost:3000` (development için)
   - Redirect URLs: `http://localhost:3000/callback`
   - Production için kendi domain'inizi ekleyin

## Google OAuth Ayarları

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services** > **Credentials** bölümüne gidin
4. **Create Credentials** > **OAuth client ID** seçin
5. **Application type**: Web application
6. **Authorized redirect URIs** ekleyin:
   - `https://your-project.supabase.co/auth/v1/callback`
7. Client ID ve Client Secret'i alın

8. Supabase Dashboard'a dönün:
   - **Authentication** > **Providers** > **Google** bölümüne gidin
   - **Enable Google provider** seçeneğini aktif edin
   - Client ID ve Client Secret'i yapıştırın
   - **Save** butonuna tıklayın

## Apple OAuth (İsteğe Bağlı)

TODO: Apple Developer hesabı gereklidir. Benzer şekilde:
- Apple Developer Console'dan App ID oluşturun
- Sign in with Apple yapılandırın
- Supabase Dashboard'da Apple provider'ı aktif edin

## Storage Buckets

1. **Storage** bölümüne gidin
2. İki bucket oluşturun:
   - `avatars` (public: true)
   - `review-images` (public: true)
3. SQL migrations'ları çalıştırarak RLS policies otomatik eklenir

## Migrations Çalıştırma

### Seçenek 1: Supabase Dashboard (Önerilen)
1. **SQL Editor** bölümüne gidin
2. `db/migrations/` klasöründeki SQL dosyalarını sırasıyla:
   - `001_init_auth_and_core.sql`
   - `002_storage_buckets.sql`
   - `003_rls_policies.sql`
   - `004_seed_reference_data.sql`
3. Her dosyayı kopyalayıp SQL Editor'e yapıştırın ve **Run** butonuna tıklayın

### Seçenek 2: Supabase CLI
```bash
# Supabase CLI yükleyin
npm install -g supabase

# Login olun
supabase login

# Projeyi bağlayın
supabase link --project-ref your-project-ref

# Migrations'ları çalıştırın
supabase db push
```

## Production Checklist

- [ ] Environment variables production ortamda ayarlandı
- [ ] Site URL production domain'e güncellendi
- [ ] Email templates Türkçe olarak özelleştirildi
- [ ] RLS policies test edildi
- [ ] Storage buckets oluşturuldu ve policies ayarlandı
- [ ] Google OAuth production credentials ile yapılandırıldı
- [ ] Rate limiting ve güvenlik politikaları kontrol edildi

## Sorun Giderme

### "Invalid API key" hatası
- `.env.local` dosyasındaki anahtarları kontrol edin
- Supabase Dashboard'dan tekrar kopyalayın
- Development server'ı yeniden başlatın

### OAuth redirect hatası
- Redirect URLs'lerin doğru yapılandırıldığından emin olun
- Callback route'unun (`/callback`) doğru çalıştığını kontrol edin

### RLS policy hataları
- Migrations'ların sırasıyla çalıştırıldığından emin olun
- SQL Editor'de error mesajlarını kontrol edin
- Policy'lerin doğru kullanıcıya uygulandığını test edin

