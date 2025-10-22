import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog - Araç Uzmanı",
  description: "Otomotiv dünyasından haberler, rehberler ve uzman tavsiyeleri.",
};

// Basit statik blog yazıları
const blogPosts = [
  {
    id: 1,
    title: "İkinci El Araç Alırken Dikkat Edilmesi Gereken 10 Kritik Nokta (2025 Güncel Rehber)",
    description: "İkinci el araç alırken dikkat edilmesi gereken 10 kritik noktayı bu rehberde AracUzmanı ekibi senin için sıraladı.",
    date: "21 Ekim 2025",
    tags: ["ikinci el", "araç alımı", "rehber"],
    readTime: "8 dk okuma",
  },
  {
    id: 2,
    title: "SUV mu Sedan mı? Hangi Araç Tipi Size Uygun?",
    description: "SUV ve sedan araçlar arasındaki farkları detaylı şekilde inceleyin ve size en uygun araç tipini keşfedin.",
    date: "15 Ekim 2025",
    tags: ["araç tipleri", "SUV", "sedan"],
    readTime: "6 dk okuma",
  },
  {
    id: 3,
    title: "2025'te Yakıt Tasarrufu: 15 Etkili Yöntem",
    description: "Artan yakıt fiyatlarına karşı cüzdanınızı koruyun! Kanıtlanmış 15 yakıt tasarrufu yöntemi.",
    date: "10 Ekim 2025",
    tags: ["yakıt tasarrufu", "ekonomi"],
    readTime: "7 dk okuma",
  },
  {
    id: 4,
    title: "Elektrikli Araçlar: Geleceğin Ulaşım Teknolojisi",
    description: "Elektrikli araçların avantajları, dezavantajları ve Türkiye'deki geleceği hakkında kapsamlı rehber.",
    date: "5 Ekim 2025",
    tags: ["elektrikli araç", "teknoloji"],
    readTime: "9 dk okuma",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-block mb-4">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            Blog
          </Badge>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Araç Uzmanı Blog
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Otomotiv dünyasından son haberler, rehberler ve uzman tavsiyeleri
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`}>
            <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 h-full flex flex-col cursor-pointer overflow-hidden border-2 hover:border-primary/50">
              {/* Gradient Header */}
              <div className="h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs backdrop-blur-sm bg-background/80"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <CardHeader className="flex-grow pb-3">
                <h3 className="font-bold text-xl leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{post.date}</span>
                  </div>
                  <span className="font-medium">{post.readTime}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Note */}
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl text-center border border-primary/20">
        <p className="text-base text-muted-foreground font-medium">
          💡 Yakında daha fazla içerik eklenecek. Güncel kalmak için düzenli ziyaret edin! 🚗
        </p>
      </div>
    </div>
  );
}
