"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useAuthStore, mockSignIn } from "@/lib/store";

export default function AuthPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push("/profile");
    }
  }, [user, router]);

  const handleSignIn = (provider: "email" | "google") => {
    const mockUser = mockSignIn(provider);
    setUser(mockUser);
    router.push("/profile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-8 py-12 pb-20 md:pb-0">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">AÜ</span>
          </div>
          <CardTitle className="text-2xl">Araç Uzmanı&apos;na Hoş Geldiniz</CardTitle>
          <CardDescription>
            Yorum yazmak ve favorilerinizi kaydetmek için giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleSignIn("google")}
            variant="outline"
            className="w-full h-12"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
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
            Google ile Devam Et
          </Button>

          <Button
            onClick={() => handleSignIn("email")}
            variant="outline"
            className="w-full h-12"
          >
            <Mail className="h-5 w-5 mr-3" />
            E-posta ile Devam Et
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-4">
            Devam ederek Kullanım Koşullarımızı ve Gizlilik Politikamızı kabul etmiş olursunuz.
            <br />
            <strong className="text-primary">Demo Modu:</strong> Giriş, UI gösterimi amacıyla simüle edilmiştir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

