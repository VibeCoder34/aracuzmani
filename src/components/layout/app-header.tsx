"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const [profile, setProfile] = useState<{
    full_name?: string;
    username?: string;
    avatar_url?: string;
    role?: string;
  } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Get initial user
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
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Get profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const displayName = profile?.username 
    ? `@${profile.username}` 
    : (profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı');
  
  const initials = profile?.username 
    ? profile.username.slice(0, 2).toUpperCase()
    : displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/arkaplansizsiyah.png" 
              alt="AracUzmanı" 
              width={120}
              height={40}
              className="h-10 w-auto dark:hidden"
              priority
            />
            <Image 
              src="/arkaplansizbeyaz.png" 
              alt="AracUzmanı" 
              width={120}
              height={40}
              className="h-10 w-auto hidden dark:block"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/cars"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Araçlar
            </Link>
            <Link
              href="/compare"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Karşılaştır
            </Link>
            <Link
              href="/highlights"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Öne Çıkanlar
            </Link>
            {profile?.role && ['admin', 'moderator'].includes(profile.role) && (
              <Link
                href="/admin"
                className="transition-colors hover:text-foreground/80 text-primary font-semibold"
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Ara</span>
          </Button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full hover:bg-accent px-2 py-1.5 transition-colors"
              >
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">
                  {profile?.username ? displayName : displayName.split(" ")[0]}
                </span>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-background shadow-lg z-50">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium">{displayName}</p>
                      {profile?.username && profile?.full_name && (
                        <p className="text-xs text-muted-foreground">{profile.full_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profil
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Ayarlar
                      </Link>
                      {profile?.role && ['admin', 'moderator'].includes(profile.role) && (
                        <Link
                          href="/admin"
                          className="block px-3 py-2 text-sm rounded-md hover:bg-accent text-primary font-semibold transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent text-red-600 transition-colors"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Giriş Yap
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menü</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

