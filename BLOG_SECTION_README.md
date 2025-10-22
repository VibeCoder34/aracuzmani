# Blog Section - AracUzmanı

## 📚 Overview

Complete blog section with SEO-optimized Turkish content for the AracUzmanı platform. Built with Next.js App Router, MDX, and TypeScript.

## 🗂️ File Structure

```
aracuzmani/
├── content/
│   └── blog/
│       ├── ikinci-el-arac-alirken-dikkat-edilmesi-gerekenler.mdx
│       ├── suv-vs-sedan-hangisi-uygun.mdx
│       └── yakit-tasarrufu-yollari.mdx
├── src/
│   ├── app/
│   │   └── blog/
│   │       ├── page.tsx                    # Blog homepage with listing
│   │       ├── blog-search.tsx             # Client-side search component
│   │       └── [slug]/
│   │           └── page.tsx                # Dynamic blog post page
│   ├── components/
│   │   └── blog/
│   │       └── blog-card.tsx               # Blog post card component
│   └── lib/
│       └── blog.ts                         # Blog utility functions
├── public/
│   └── images/
│       └── blog/
│           ├── ikinci-el-arac.jpg
│           ├── suv-sedan.jpg
│           └── yakit-tasarrufu.jpg
└── mdx-components.tsx                      # MDX styling components
```

## ✨ Features

### 1. Blog Homepage (`/blog`)
- Grid layout (3 columns on desktop, responsive)
- Search functionality (by title, description, or tags)
- Article cards with:
  - Cover image
  - Title and description
  - Publication date
  - Tags
  - Read time
- SEO-optimized metadata

### 2. Dynamic Blog Post Page (`/blog/[slug]`)
- Full MDX content rendering
- Cover image display
- Meta information (date, read time, author)
- Tag badges
- Previous/next article navigation
- Schema.org JSON-LD for SEO
- Open Graph tags
- Twitter Card tags

### 3. MDX Support
- Custom styled components (headings, paragraphs, lists, etc.)
- Code highlighting
- Image optimization
- Markdown features (bold, italic, links, quotes, etc.)

### 4. SEO Optimization
- Dynamic page titles and descriptions
- Open Graph meta tags
- Twitter Card meta tags
- Schema.org BlogPosting markup
- Turkish language meta tags (`lang="tr"`)
- Optimized URLs (`/blog/[slug]`)

## 📝 Adding New Blog Posts

### Step 1: Create MDX File

Create a new `.mdx` file in `content/blog/` with frontmatter:

```mdx
---
title: "Your Blog Post Title"
description: "A short description for SEO"
date: "2025-10-21"
tags: ["tag1", "tag2", "tag3"]
coverImage: "/images/blog/your-image.jpg"
author: "Author Name"
readTime: "5 dk okuma"
---

Your blog content here...
```

### Step 2: Add Cover Image

Place your cover image in `public/images/blog/` with recommended dimensions:
- **Size**: 1200x675px (16:9 aspect ratio)
- **Format**: JPG or PNG
- **File size**: < 500KB (optimized)

### Step 3: Write Content

Use Markdown/MDX syntax:

```mdx
## Heading 2

Your paragraph text here...

### Heading 3

- List item 1
- List item 2
- List item 3

**Bold text** and *italic text*.

> Blockquote for important notes

[Link text](https://example.com)
```

### Step 4: Test

1. Run development server: `npm run dev`
2. Navigate to `/blog`
3. Click on your new post
4. Check formatting and images

## 🎨 Styling & Theme

All blog components use the existing AracUzmanı design system:
- **Colors**: Uses CSS custom properties from `globals.css`
- **Typography**: Inter font with proper hierarchy
- **Components**: Shadcn/UI components (Card, Badge, Button, etc.)
- **Dark Mode**: Fully supported

## 🔍 SEO Best Practices

### ✅ Implemented
- [ ] Dynamic meta tags
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Schema.org markup
- [ ] Clean URL structure
- [ ] Image alt texts
- [ ] Semantic HTML
- [ ] Turkish language tags
- [ ] Read time calculation

### 📈 Future Enhancements
- [ ] Sitemap.xml integration
- [ ] RSS feed
- [ ] Social share buttons
- [ ] Related posts section
- [ ] Category system
- [ ] Pagination for large number of posts
- [ ] Search engine indexing

## 🔧 Technical Details

### Dependencies Added
```json
{
  "@next/mdx": "^15.x",
  "@mdx-js/loader": "^3.x",
  "@mdx-js/react": "^3.x",
  "@types/mdx": "^2.x",
  "gray-matter": "^4.x",
  "remark-gfm": "^4.x",
  "rehype-highlight": "^7.x",
  "@radix-ui/react-separator": "^1.x"
}
```

### Next.js Configuration
Updated `next.config.ts` to support MDX:
```typescript
pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx']
```

### Blog Utilities (`src/lib/blog.ts`)
- `getAllBlogPosts()`: Get all posts sorted by date
- `getBlogPostBySlug(slug)`: Get single post
- `getAdjacentPosts(slug)`: Get previous/next posts
- `calculateReadTime(content)`: Calculate reading time

## 🚀 Performance

- Static Site Generation (SSG) for all blog posts
- Image optimization with Next.js Image component
- Lazy loading for images
- Minimal client-side JavaScript
- Fast page loads

## 📱 Mobile Responsive

- Fully responsive design
- Touch-friendly cards
- Optimized typography for mobile
- Responsive images
- Mobile navigation support

## 🌐 Sample Content

### 3 Turkish Blog Posts Included:

1. **İkinci El Araç Alırken Dikkat Edilmesi Gereken 10 Kritik Nokta**
   - Comprehensive guide for buying used cars
   - 8 min read
   - Tags: ikinci el, araç alımı, rehber

2. **SUV mu Sedan mı? Hangi Araç Tipi Size Uygun?**
   - Detailed comparison of SUV vs Sedan
   - 6 min read
   - Tags: araç tipleri, SUV, sedan, karşılaştırma

3. **2025'te Yakıt Tasarrufu: 15 Etkili Yöntem**
   - Fuel saving tips and techniques
   - 7 min read
   - Tags: yakıt tasarrufu, ekonomi, bakım, sürüş teknikleri

## 🔗 Navigation

Blog link added to main navigation:
- Desktop: Header navigation bar
- Mobile: Can be added to mobile tab bar

Current route: `/blog`

## 🐛 Troubleshooting

### Issue: Blog posts not showing
**Solution**: Ensure `.mdx` files are in `content/blog/` directory

### Issue: Images not loading
**Solution**: Check image paths start with `/images/blog/`

### Issue: MDX rendering errors
**Solution**: Validate frontmatter YAML syntax

### Issue: Build errors
**Solution**: Run `npm install` to ensure all dependencies are installed

## 📊 Analytics (Future)

Consider adding:
- Page view tracking
- Reading progress tracking
- Popular posts widget
- Time on page metrics

## 🎯 Content Strategy

### Recommended Topics:
- İkinci el araç alım rehberleri
- Araç bakım tavsiyeleri
- Yakıt tasarrufu yöntemleri
- Yeni model incelemeleri
- Karşılaştırma yazıları
- Teknoloji haberleri
- Sürüş güvenliği
- Yasal bilgiler ve düzenlemeler

### Publishing Frequency:
- Minimum 2-3 posts per month
- Consistent publishing schedule
- Seasonal content (winter tires, summer maintenance, etc.)

## 🔐 Security

- No user-generated content in MDX
- All content reviewed before publishing
- Safe HTML rendering
- XSS protection (React's built-in)

## ✅ Checklist for Production

- [ ] Replace placeholder images with real photos
- [ ] Add more blog posts (aim for 10-15 initially)
- [ ] Configure sitemap generation
- [ ] Set up RSS feed
- [ ] Add social share buttons
- [ ] Test on multiple devices
- [ ] Run Lighthouse audit
- [ ] Submit to search engines
- [ ] Set up analytics

## 📞 Support

For questions or issues:
1. Check this README
2. Review the code comments
3. Test with sample posts
4. Check Next.js and MDX documentation

---

**Built with ❤️ for AracUzmanı**

