import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Blog içeriklerini buraya ekle
const blogContents: Record<string, {
  title: string;
  description: string;
  date: string;
  tags: string[];
  readTime: string;
  content: string; // HTML veya JSX olarak yaz
}> = {
  "1": {
    title: "İkinci El Araç Alırken Dikkat Edilmesi Gereken 10 Kritik Nokta (2025 Güncel Rehber)",
    description: "İkinci el araç alırken dikkat edilmesi gereken 10 kritik noktayı bu rehberde AracUzmanı ekibi senin için sıraladı.",
    date: "21 Ekim 2025",
    tags: ["ikinci el", "araç alımı", "rehber"],
    readTime: "8 dk okuma",
    content: `
      <p>İkinci el araç piyasası, sıfır araç fiyatlarının yükselmesiyle birlikte Türkiye'de hiç olmadığı kadar canlı. Ancak doğru inceleme yapılmadan alınan bir araç, aylarca sürecek masraf ve pişmanlık anlamına gelebilir. Bu rehberde, AracUzmanı ekibi olarak ikinci el araç alırken mutlaka dikkat etmen gereken 10 kritik noktayı paylaşıyoruz.</p>
      
      <h2>1️⃣ Ekspertiz Raporunu Asla Atlama</h2>
      <p>Bir aracın geçmişi, ekspertiz raporunda gizlidir. Motor, fren, yürür aksam, şasi, süspansiyon ve elektronik sistemlerin profesyonel kontrolü şarttır. Satıcının gösterdiği rapora güvenme, tarafsız bir ekspertiz merkezinde yeniden kontrol ettir.</p>
      
      <h2>2️⃣ Kilometre Gerçek mi?</h2>
      <p>Düşük kilometre her zaman avantaj değildir. Bazı araçlarda kilometre düşürme işlemleri yapılabilir. Aracın geçmiş TÜVTÜRK muayene kayıtlarını ve servis bakım geçmişini kontrol et. Gerçek kilometre verileri, aracın genel yıpranma seviyesi hakkında net bilgi verir.</p>
      
      <h2>3️⃣ Boya ve Değişen Parçalar</h2>
      <p>Kaza geçmişi olan araçlarda genellikle lokal boyalar veya değişen parçalar olur. Tüm kaporta yüzeyini ölçüm cihazıyla kontrol ettir. Boya kalınlığındaki tutarsızlıklar, kazalı bölgeleri hemen ele verir. Küçük çizikler problem değildir ama şasi ya da direk değişimi varsa uzak dur.</p>
      
      <h2>4️⃣ Motorun Sağlığı</h2>
      <p>Motor sesi, egzoz dumanı rengi ve yağ sızıntısı gibi detaylar büyük ipuçları verir. Soğuk motorla çalıştır ve ilk çalıştırma sesini dikkatle dinle. Egzozdan gelen mavi veya siyah duman, yağ yakma ya da yakıt sistemi sorunlarını gösterebilir.</p>
      
      <h2>5️⃣ Şasi ve Yürür Aksam Kontrolü</h2>
      <p>Şasi araçta iskelet görevi görür. Eğrilik, kaynak izi veya onarım belirtisi varsa aracın ağır kazaya karışmış olma ihtimali yüksektir. Aynı şekilde süspansiyon, aks ve direksiyon sistemleri de test sürüşünde dikkatle değerlendirilmelidir.</p>
      
      <h2>6️⃣ Test Sürüşü Yapmadan Alma</h2>
      <p>Test sürüşü, aracın gerçek durumunu anlamanın en iyi yoludur. Gaz tepkisi, fren mesafesi, direksiyon hassasiyeti ve süspansiyon tepkilerini hisset. Garip titreşimler, sesler veya gecikmeli tepkiler varsa mutlaka bir uzmana danış.</p>
      
      <h2>7️⃣ Elektronik Donanımları Denetle</h2>
      <p>Cam otomatikleri, klima, far sensörleri, park sensörleri, multimedya sistemi gibi tüm elektronik aksamları test et. Elektronik arızalar genellikle pahalıdır ve tamiri uzun sürebilir.</p>
      
      <h2>8️⃣ Belge ve Ruhsat Kontrolü</h2>
      <p>Ruhsattaki motor, şasi ve plaka bilgilerini araç üzerindeki numaralarla karşılaştır. Aracın üzerinde haciz, rehin veya borç kaydı olmadığından emin ol. Noter satışı öncesinde plaka ve şasi numarasını e-Devlet üzerinden sorgulamak akıllıca olur.</p>
      
      <h2>9️⃣ Aracın Geçmiş Sahipleri ve Kullanım Tipi</h2>
      <p>Aracın önceki sahip sayısı da önemlidir. Kısa sürede el değiştiren araçlar genelde sorunlu olur. Ayrıca araç filo, kiralama veya taksi çıkmasıysa uzak durmakta fayda var. Bu araçlarda kilometre yüksek ve yıpranma fazladır.</p>
      
      <h2>🔟 Fiyat Değerlendirmesi ve Pazarlık</h2>
      <p>Benzer model ve kilometredeki araçların ortalama fiyatını araştır. Piyasadan çok ucuz araçlar genellikle problemli olur. Ancak mantıklı aralıklarda kalan ilanlarda mutlaka pazarlık yap. Ekspertiz sonuçlarını elinde tutarak indirim istemek en etkili yöntemdir.</p>
      
      <h2>Sonuç</h2>
      <p>İkinci el araç alımı dikkat ve araştırma isteyen bir süreçtir. Unutma, ilk izlenim her zaman doğruyu göstermez. Soğukkanlı davran, detayları incele ve gerekirse bir uzmandan destek al.</p>
      
      <p><strong>AracUzmanı olarak biz</strong>, araç verilerini, kullanıcı yorumlarını ve teknik analizleri bir araya getirerek senin daha bilinçli karar vermeni sağlıyoruz. Aracını seçmeden önce, kullanıcıların gerçek deneyimlerini incelemeyi unutma — çünkü bazen en doğru bilgi, o aracı gerçekten kullanan kişiden gelir. 🚗</p>
    `
  },
  "2": {
    title: "SUV mu Sedan mı? Hangi Araç Tipi Size Uygun?",
    description: "SUV ve sedan araçlar arasındaki farkları detaylı şekilde inceleyin ve size en uygun araç tipini keşfedin.",
    date: "15 Ekim 2025",
    tags: ["araç tipleri", "SUV", "sedan"],
    readTime: "6 dk okuma",
    content: `
      <h2>SUV Nedir?</h2>
      <p>SUV'ler, yüksek kasa yapısı, geniş iç mekan ve genellikle 4x4 sürüş imkanı sunan araçlardır.</p>
      
      <h2>SUV'lerin Avantajları</h2>
      <ul>
        <li>Yüksek sürüş pozisyonu</li>
        <li>Geniş iç mekan</li>
        <li>Arazi performansı</li>
        <li>Prestij ve modern görünüm</li>
      </ul>
      
      <h2>Sedan Nedir?</h2>
      <p>Sedan araçlar, klasik kasa yapısına sahip, genellikle 4 kapılı ve kapalı bagajlı araçlardır.</p>
      
      <h2>Sedan'ların Avantajları</h2>
      <ul>
        <li>Yakıt ekonomisi</li>
        <li>Sürüş dinamiği</li>
        <li>Park kolaylığı</li>
        <li>Daha ekonomik fiyat</li>
      </ul>
    `
  },
  "3": {
    title: "2025'te Yakıt Tasarrufu: 15 Etkili Yöntem",
    description: "Artan yakıt fiyatlarına karşı cüzdanınızı koruyun! Kanıtlanmış 15 yakıt tasarrufu yöntemi.",
    date: "10 Ekim 2025",
    tags: ["yakıt tasarrufu", "ekonomi"],
    readTime: "7 dk okuma",
    content: `
      <h2>1. Düşük Hızda Seyahat Edin</h2>
      <p>Yakıt tüketimi, hız arttıkça üstel olarak artar. Otoyolda 120 km/s yerine 100 km/s ile gitmek %20'ye varan yakıt tasarrufu sağlayabilir.</p>
      
      <h2>2. Yumuşak Gaz ve Fren Kullanın</h2>
      <p>Ani gaz ve fren hareketleri yakıt tüketimini ciddi şekilde artırır.</p>
      
      <h2>3. Lastik Basınçlarını Düzenli Kontrol Edin</h2>
      <p>Düşük lastik basıncı, yuvarlanma direncini artırarak yakıt tüketimini %3-5 oranında yükseltir.</p>
      
      <h2>4. Aracınızın Ağırlığını Azaltın</h2>
      <p>Her 50 kg fazla ağırlık, yakıt tüketimini yaklaşık %2 artırır.</p>
      
      <h2>5. Klima Kullanımını Optimize Edin</h2>
      <p>Klima, motordan güç alarak yakıt tüketimini %10-20 oranında artırabilir.</p>
    `
  },
  "4": {
    title: "Elektrikli Araçlar: Geleceğin Ulaşım Teknolojisi",
    description: "Elektrikli araçların avantajları, dezavantajları ve Türkiye'deki geleceği hakkında kapsamlı rehber.",
    date: "5 Ekim 2025",
    tags: ["elektrikli araç", "teknoloji"],
    readTime: "9 dk okuma",
    content: `
      <h2>Elektrikli Araç Nedir?</h2>
      <p>Elektrikli araçlar (EV), geleneksel içten yanmalı motorlar yerine elektrik motorları kullanan ve şarj edilebilir bataryalardan enerji alan araçlardır.</p>
      
      <h2>Avantajları</h2>
      <h3>1. Çevre Dostu</h3>
      <p>Elektrikli araçlar, sıfır emisyon üretir ve karbon ayak izini önemli ölçüde azaltır.</p>
      
      <h3>2. Düşük İşletme Maliyeti</h3>
      <p>Elektrik, benzin ve dizele göre çok daha ucuzdur.</p>
      
      <h2>Dezavantajları</h2>
      <h3>1. Menzil Kaygısı</h3>
      <p>Tek şarjla gidilebilecek mesafe hala sınırlıdır.</p>
      
      <h3>2. Şarj Süresi</h3>
      <p>Tam şarj olmak saatler sürebilir.</p>
      
      <h2>Türkiye'de Durum</h2>
      <p>2025 itibarıyla Türkiye'de yaklaşık 3.000+ şarj istasyonu bulunmaktadır.</p>
    `
  }
};

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = blogContents[id];
  
  if (!post) {
    return { title: "Blog Bulunamadı" };
  }
  
  return {
    title: `${post.title} - Araç Uzmanı Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = blogContents[id];
  
  if (!post) {
    notFound();
  }
  
  return (
    <article className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Bloga Dön
          </Button>
        </Link>
      </div>
      
      {/* Article Header with Gradient Background */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {post.title}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.description}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Article Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Content Card */}
          <div className="bg-card rounded-2xl shadow-lg border p-8 md:p-12 mb-8">
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
          
          {/* Bottom CTA */}
          <div className="p-8 md:p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border-2 border-primary/20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.2),transparent_50%)]" />
            <div className="relative">
              <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                <span className="text-3xl">💡</span>
              </div>
              <p className="text-lg font-bold text-foreground mb-3">
                Bu yazı işine yaradı mı?
              </p>
              <p className="text-base text-muted-foreground mb-6 max-w-xl mx-auto">
                Daha fazla araç rehberi, kullanıcı yorumları ve karşılaştırma için araç kataloğumuzu incele!
              </p>
              <Link href="/cars">
                <Button size="lg" className="font-semibold">
                  Araçları Keşfet 🚗
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

