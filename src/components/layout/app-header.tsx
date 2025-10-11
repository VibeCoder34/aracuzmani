"use client";

import Link from "next/link";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store";
import { useState } from "react";

export function AppHeader() {
  const { user, signOut } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = user?.name
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
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CR</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              Araç Uzmanı
            </span>
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
                  {user.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">
                  {user.name.split(" ")[0]}
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
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
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
                      <button
                        onClick={() => {
                          signOut();
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
            <Link href="/auth">
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

