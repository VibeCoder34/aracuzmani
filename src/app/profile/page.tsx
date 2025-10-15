'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Star, MessageSquare, Calendar, TrendingUp, Upload, Settings } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'
import carsData from '@/mock/cars.json'

type Profile = Database['public']['Tables']['profiles']['Row']
type Review = Database['public']['Tables']['reviews']['Row']

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Edit state
  const [editMode, setEditMode] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/login')
        return
      }

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        setError('Profil yüklenemedi')
        return
      }

      setProfile(profileData)
      setFullName(profileData.full_name || '')
      setUsername(profileData.username || '')
      setBio(profileData.bio || '')

      // Get user's reviews from our API endpoint (same as car pages)
      try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
          const data = await response.json();
          // Filter reviews by current user
          const userReviews = data.reviews.filter((r: Review & { userId: string }) => r.userId === user.id);
          
          // Debug: Log the reviews to help identify duplicates
          console.log('[Profile] Raw user reviews from API:', userReviews);
          console.log('[Profile] User ID:', user.id);
          console.log('[Profile] Total reviews found:', userReviews.length);
          
          type ReviewWithUser = Review & { userId: string; carId: string; text: string; createdAt: string; overall: number };
          
          // Remove duplicates based on unique combination of carId and text
          const uniqueReviews = userReviews.reduce((acc: ReviewWithUser[], current: ReviewWithUser) => {
            const isDuplicate = acc.some(review => 
              review.carId === current.carId && 
              review.text === current.text &&
              review.createdAt === current.createdAt
            );
            if (!isDuplicate) {
              acc.push(current);
            } else {
              console.log('[Profile] Removed duplicate review:', current);
            }
            return acc;
          }, []);
          
          console.log('[Profile] Unique reviews after deduplication:', uniqueReviews.length);
          
          setReviews(uniqueReviews.map((r: ReviewWithUser) => ({
            id: parseInt(r.id),
            author_id: r.userId,
            car_id: r.carId,
            title: null, // We'll use car name instead
            body: r.text,
            ratings: r.ratings,
            avg_score: r.overall,
            pros: [],
            cons: [],
            status: 'published' as const,
            created_at: r.createdAt,
            updated_at: r.createdAt,
          })));
        }
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      }
    } catch (err) {
      console.error('Load profile error:', err)
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları yüklenebilir')
      return
    }

    setAvatarFile(file)
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !profile) return null

    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Resim yüklenemedi')
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError('Resim yüklenirken hata oluştu')
      return null
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      let avatarUrl = profile.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar()
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          username: username || null,
          bio: bio || null,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id)

      if (updateError) {
        if (updateError.message.includes('unique')) {
          setError('Bu kullanıcı adı zaten kullanılıyor')
        } else {
          setError('Profil güncellenemedi: ' + updateError.message)
        }
        return
      }

      setSuccess('Profil başarıyla güncellendi!')
      setEditMode(false)
      setAvatarFile(null)
      
      // Reload profile
      await loadProfile()
    } catch (err) {
      console.error('Save profile error:', err)
      setError('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Profil bulunamadı</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Ana Sayfaya Dön
          </Button>
        </Card>
      </div>
    )
  }

  const initials = (profile.full_name || profile.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Calculate stats from database reviews only
  const totalReviews = reviews.length
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + (r.avg_score || 0), 0) / reviews.length 
    : 0

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container px-6 md:px-8 lg:px-12 py-10 md:py-12 max-w-6xl mx-auto">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-800">
            {success}
          </div>
        )}

        {/* Profile Header */}
        <Card className="mb-10">
          <CardContent className="pt-6">
            {!editMode ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-24 w-24">
                  {profile.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
                  )}
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {profile.full_name || profile.username || 'Kullanıcı'}
                  </h1>
                  {profile.username && (
                    <p className="text-sm text-muted-foreground mb-2">@{profile.username}</p>
                  )}
                  {profile.bio && (
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Katılım {new Date(profile.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    {profile.role !== 'user' && (
                      <Badge variant="secondary" className="capitalize">
                        {profile.role}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setEditMode(true)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    Çıkış Yap
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Profili Düzenle</h2>
                
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="h-24 w-24">
                      {avatarFile ? (
                        <AvatarImage src={URL.createObjectURL(avatarFile)} alt="Preview" />
                      ) : profile.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
                      ) : (
                        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Upload className="h-4 w-4" />
                        <span>Resim Yükle</span>
                      </div>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </Label>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Ad Soyad</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Kullanıcı Adı</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="kullaniciadi"
                        maxLength={24}
                      />
                      <p className="text-xs text-muted-foreground">
                        3-24 karakter, sadece harf, rakam ve alt çizgi
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Hakkında</Label>
                      <Input
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Kendiniz hakkında kısa bir açıklama"
                        maxLength={200}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false)
                      setAvatarFile(null)
                      setFullName(profile.full_name || '')
                      setUsername(profile.username || '')
                      setBio(profile.bio || '')
                      setError(null)
                      setSuccess(null)
                    }}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="reviews">
              Yorumlarım ({totalReviews})
            </TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Toplam Yorum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold">{totalReviews}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ortalama Puan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-primary fill-primary" />
                    <div className="text-3xl font-bold">
                      {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Durum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div className="text-lg font-bold capitalize">
                      {reviews.filter(r => r.status === 'published').length} Yayında
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {totalReviews === 0 && (
              <Card className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Henüz yorum yok</h3>
                <p className="text-muted-foreground mb-4">
                  Araçları yorumlamaya başlayın, burada görünecek
                </p>
                <Button onClick={() => router.push('/cars')}>
                  Araçları Keşfet
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 mt-6">
            {totalReviews > 0 ? (
              <>
                {/* Database Reviews (from Supabase) */}
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {(() => {
                              const car = carsData.find(c => c.id === review.car_id);
                              return car ? `${car.brand} ${car.model} ${car.year}` : (review.title || 'İsimsiz Yorum');
                            })()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Badge variant={review.status === 'published' ? 'default' : 'secondary'}>
                          {review.status === 'published' ? 'Yayında' : 
                           review.status === 'pending' ? 'Beklemede' :
                           review.status === 'rejected' ? 'Reddedildi' : 'Kaldırıldı'}
                        </Badge>
                      </div>
                      {review.body && (
                        <p className="text-sm">{review.body}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">
                          {review.avg_score?.toFixed(1) || '-'}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          • {(() => {
                            const car = carsData.find(c => c.id === review.car_id);
                            return car ? `${car.brand} ${car.model} ${car.year}` : review.car_id || 'Bilinmeyen araç';
                          })()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Henüz yorum yok</h3>
                <p className="text-muted-foreground">
                  İlk yorumunuzu oluşturun
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Yorum İstatistikleriniz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Toplam Yorum</span>
                  <span className="font-semibold">{totalReviews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Yayındaki Yorumlar</span>
                  <span className="font-semibold">
                    {reviews.filter(r => r.status === 'published').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ortalama Puan</span>
                  <span className="font-semibold">
                    {avgRating > 0 ? avgRating.toFixed(2) : 'Henüz yok'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">En Yüksek Puan</span>
                  <span className="font-semibold">
                    {reviews.length > 0 ? Math.max(...reviews.map(r => r.avg_score || 0)).toFixed(1) : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
