import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { MobileTabBar } from "@/components/layout/mobile-tabbar";
import { InstallBanner } from "@/components/pwa/install-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Araç Uzmanı - Mükemmel Aracınızı Bulun",
  description:
    "Gerçek sürücülerden gerçek araç yorumlarını inceleyin. Modelleri karşılaştırın, detaylı değerlendirmeleri okuyun ve bilinçli kararlar verin.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Araç Uzmanı",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" dir="ltr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppHeader />
        <main>{children}</main>
        <AppFooter />
        <MobileTabBar />
        <InstallBanner />
      </body>
    </html>
  );
}
