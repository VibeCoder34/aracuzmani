'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  const supabase = createClient()

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Translate common errors to Turkish
        if (error.message.includes('Invalid login credentials')) {
          setError('E-posta veya şifre hatalı.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanızı kontrol edin.')
        } else if (error.message.includes('rate limit')) {
          setError('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.')
        } else {
          setError(error.message)
        }
        return
      }

      // Successful login - redirect to profile or previous page
      router.push('/profile')
      router.refresh()
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      })

      if (error) {
        if (error.message.includes('rate limit')) {
          setError('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.')
        } else {
          setError(error.message)
        }
        return
      }

      setMagicLinkSent(true)
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      })

      if (error) {
        setError('Google ile giriş yapılamadı. Lütfen tekrar deneyin.')
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">✉️ E-posta Gönderildi</h1>
            <p className="text-muted-foreground">
              <strong>{email}</strong> adresine bir giriş bağlantısı gönderdik.
            </p>
            <p className="text-sm text-muted-foreground">
              Lütfen e-postanızı kontrol edin ve bağlantıya tıklayarak giriş yapın.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setMagicLinkSent(false)
              setEmail('')
            }}
            className="w-full"
          >
            Geri Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Giriş Yap</h1>
          <p className="text-muted-foreground">
            AracUzmanı hesabınıza giriş yapın
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-2 rounded-lg bg-muted p-1">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'password'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Şifre ile
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'magic'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sihirli Link
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Şifre</Label>
                <Link
                  href="/reset-password"
                  className="text-sm text-primary hover:underline"
                >
                  Şifremi unuttum
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magic-email">E-posta</Label>
              <Input
                id="magic-email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                E-postanıza şifresiz giriş bağlantısı gönderilecektir
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Sihirli Link Gönder'}
            </Button>
          </form>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              veya
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google ile Giriş Yap
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  )
}

