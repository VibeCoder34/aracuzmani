import Link from "next/link";
import Image from "next/image";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container px-4 py-8">
        <div className="mb-8">
          <Image 
            src="/arkaplansizsiyah.png" 
            alt="AracUzmanı" 
            width={144}
            height={48}
            className="h-12 w-auto dark:hidden"
          />
          <Image 
            src="/arkaplansizbeyaz.png" 
            alt="AracUzmanı" 
            width={144}
            height={48}
            className="h-12 w-auto hidden dark:block"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Hakkında</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Keşfet</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/cars" className="hover:text-foreground transition-colors">
                  Tüm Araçlar
                </Link>
              </li>
              <li>
                <Link href="/highlights" className="hover:text-foreground transition-colors">
                  Öne Çıkanlar
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-foreground transition-colors">
                  Karşılaştır
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Yasal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">PWA</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Daha iyi bir deneyim için uygulamamızı yükleyin
            </p>
            <button className="text-sm text-primary hover:underline">
              Uygulamayı Yükle
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Araç Uzmanı. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

