# 📝 Blog İçeriği Nasıl Düzenlenir?

## 📍 Dosya Konumu

Blog içerikleri tek bir dosyada:
```
src/app/blog/[id]/page.tsx
```

## ✏️ Yeni Blog Yazısı Eklemek

### Adım 1: Blog Listesine Ekle
`src/app/blog/page.tsx` dosyasını aç ve `blogPosts` dizisine ekle:

```typescript
const blogPosts = [
  // ... mevcut bloglar
  {
    id: 5,  // ← Yeni ID ver
    title: "Araç Bakım Rehberi",
    description: "Aracınızı nasıl bakımlı tutarsınız?",
    date: "25 Ekim 2025",
    tags: ["bakım", "rehber"],
    readTime: "5 dk okuma",
  },
];
```

### Adım 2: Blog İçeriğini Ekle
`src/app/blog/[id]/page.tsx` dosyasını aç ve `blogContents` objesine ekle:

```typescript
const blogContents = {
  // ... mevcut bloglar
  "5": {  // ← Aynı ID'yi kullan
    title: "Araç Bakım Rehberi",
    description: "Aracınızı nasıl bakımlı tutarsınız?",
    date: "25 Ekim 2025",
    tags: ["bakım", "rehber"],
    readTime: "5 dk okuma",
    content: `
      <h2>1. Motor Yağı Değişimi</h2>
      <p>Motor yağı düzenli değiştirilmelidir...</p>
      
      <h2>2. Lastik Kontrolü</h2>
      <p>Lastiklerinizi her ay kontrol edin...</p>
      
      <h3>Alt Başlık</h3>
      <p>Detaylı açıklama buraya...</p>
      
      <ul>
        <li>Madde 1</li>
        <li>Madde 2</li>
        <li>Madde 3</li>
      </ul>
      
      <p><strong>Önemli:</strong> Dikkat edilmesi gerekenler!</p>
    `
  }
};
```

## 🎨 İçerikte Kullanabileceğin HTML Etiketleri

### Başlıklar
```html
<h2>Ana Başlık</h2>
<h3>Alt Başlık</h3>
<h4>Daha Küçük Başlık</h4>
```

### Paragraflar
```html
<p>Normal metin buraya...</p>
<p><strong>Kalın yazı</strong> ve <em>italik yazı</em></p>
```

### Listeler
```html
<!-- Numarasız liste -->
<ul>
  <li>Madde 1</li>
  <li>Madde 2</li>
  <li>Madde 3</li>
</ul>

<!-- Numaralı liste -->
<ol>
  <li>Birinci adım</li>
  <li>İkinci adım</li>
  <li>Üçüncü adım</li>
</ol>
```

### Vurgu Kutusu
```html
<p><strong>Önemli Not:</strong> Buraya dikkat!</p>
```

### Bağlantılar
```html
<a href="https://example.com">Tıklayın</a>
```

## 📝 Örnek Tam Blog

```typescript
"6": {
  title: "Kış Lastiği Rehberi 2025",
  description: "Kış lastiği ne zaman takılır, nasıl seçilir? Tüm detaylar burada.",
  date: "1 Kasım 2025",
  tags: ["kış lastiği", "güvenlik", "rehber"],
  readTime: "6 dk okuma",
  content: `
    <h2>Kış Lastiği Nedir?</h2>
    <p>Kış lastiği, düşük sıcaklıklarda daha iyi performans gösteren özel lastiklerdir.</p>
    
    <h2>Ne Zaman Takılmalı?</h2>
    <p>Hava sıcaklığı 7°C'nin altına düştüğünde kış lastiği takmanız önerilir.</p>
    
    <h3>Yasal Zorunluluklar</h3>
    <ul>
      <li>1 Aralık - 1 Nisan arası zorunlu</li>
      <li>M+S veya 3PMSF işareti olmalı</li>
      <li>Diş derinliği min 4mm olmalı</li>
    </ul>
    
    <h2>Nasıl Seçilir?</h2>
    <ol>
      <li>Aracınızın lastik ölçüsüne uygun olmalı</li>
      <li>Hız ve yük indeksi doğru olmalı</li>
      <li>Kaliteli marka tercih edin</li>
    </ol>
    
    <p><strong>Önemli:</strong> Her mevsim lastiği kış lastiği değildir!</p>
    
    <h2>Fiyatlar</h2>
    <p>2025 itibarıyla ortalama fiyatlar:</p>
    <ul>
      <li>Ekonomik: 2.000-3.000 TL (4 adet)</li>
      <li>Orta segment: 4.000-6.000 TL (4 adet)</li>
      <li>Premium: 8.000+ TL (4 adet)</li>
    </ul>
  `
}
```

## ⚠️ Dikkat Edilecekler

1. **ID Eşleşmesi**: `page.tsx` ve `[id]/page.tsx` dosyalarındaki ID'ler aynı olmalı!
2. **Content HTML**: İçerik kısmında HTML kullan, normal metin değil
3. **Tırnak İşaretleri**: Content içinde backtick \` kullan
4. **Satır Atla**: Her paragraf ve başlık arasında boş satır bırak

## 🧪 Test Et

1. Dosyayı kaydet
2. Tarayıcıda: `http://localhost:3000/blog`
3. Yeni blog kartına tıkla
4. İçeriği kontrol et

## 🎯 İpuçları

- **Kısa tut**: Her bölüm 2-3 paragraftan fazla olmasın
- **Başlıklar kullan**: Her 2-3 paragrafta bir başlık at
- **Listeler yap**: Maddeler varsa liste kullan, okumayı kolaylaştırır
- **Önemli yerleri vurgula**: `<strong>` ile kalın yap

---

**İhtiyacın olursa:** Bu rehberi oku, örneklere bak ve kendi içeriğini ekle! 🚗


