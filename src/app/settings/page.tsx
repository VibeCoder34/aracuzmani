"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Bell, User, Shield, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const [profile, setProfile] = useState<{
    full_name?: string;
    username?: string;
    avatar_url?: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      } else {
        router.push("/login");
      }
    };

    getUser();
  }, [supabase, router]);

  if (!user) {
    return null;
  }

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container px-6 md:px-8 lg:px-12 py-10 md:py-12 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Ayarlar</h1>
          <p className="text-muted-foreground">
            Hesap ayarlarınızı ve tercihlerinizi yönetin
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Profil Ayarları */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Profil Bilgileri</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Profil bilgilerinizi güncelleyin
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  defaultValue={profile?.full_name || ""}
                  placeholder="Adınızı girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  placeholder="E-posta adresiniz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Hakkımda</Label>
                <Input
                  id="bio"
                  placeholder="Kendinizden kısaca bahsedin"
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </CardContent>
          </Card>

          {/* Bildirim Ayarları */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Bildirimler</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bildirim tercihlerinizi yönetin
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">E-posta Bildirimleri</p>
                  <p className="text-sm text-muted-foreground">
                    Yeni yorumlar ve güncellemeler için bildirim alın
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Yorum Yanıtları</p>
                  <p className="text-sm text-muted-foreground">
                    Yorumlarınıza gelen yanıtlar için bildirim alın
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Haftalık Özet</p>
                  <p className="text-sm text-muted-foreground">
                    Haftalık aktivite özeti alın
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Gizlilik ve Güvenlik */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Gizlilik ve Güvenlik</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hesap güvenliği ve gizlilik ayarları
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profilimi Herkese Aç</p>
                  <p className="text-sm text-muted-foreground">
                    Yorumlarınız ve profiliniz herkese açık olsun
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-gray-300"
                />
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full sm:w-auto">
                  Şifre Değiştir
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Görünüm Ayarları */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Görünüm</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uygulama görünümünü özelleştirin
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="text-sm font-medium">Açık</div>
                  </button>
                  <button className="flex-1 px-4 py-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="text-sm font-medium">Koyu</div>
                  </button>
                  <button className="flex-1 px-4 py-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="text-sm font-medium">Sistem</div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dil ve Bölge */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Dil ve Bölge</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dil ve bölge tercihlerinizi ayarlayın
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Dil</Label>
                <select
                  id="language"
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  defaultValue="tr"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

