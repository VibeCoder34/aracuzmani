"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (isDismissed) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);

    setIsIOS(ios);
    setIsAndroid(android);

    // Show banner if on mobile and not already installed
    if (ios || android) {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      if (!isStandalone) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:max-w-md z-40 p-4 shadow-lg">
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>

      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <Download className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="font-semibold">Araç Uzmanı Uygulamasını Yükle</h3>
          <p className="text-sm text-muted-foreground">
            {isIOS &&
              "Paylaş butonuna dokunun ve yüklemek için 'Ana Ekrana Ekle'yi seçin."}
            {isAndroid &&
              "Menü butonuna dokunun ve 'Uygulamayı Yükle' veya 'Ana Ekrana Ekle'yi seçin."}
          </p>
          <Button size="sm" onClick={handleDismiss} className="mt-2">
            Anladım
          </Button>
        </div>
      </div>
    </Card>
  );
}

