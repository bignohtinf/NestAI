'use client';

import { HomeLayout } from '@/components/layouts/home-layout';
import { Search, Filter, BookOpen, Clock, ChevronRight, User, Tag, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Mock data based on cms_items schema
const mockPosts = [
  {
    id: '1',
    title: 'Dinh dưỡng vàng cho mẹ bầu 3 tháng đầu',
    excerpt: 'Giai đoạn 3 tháng đầu đời là vô cùng quan trọng cho sự phát triển của thai nhi. Cùng tìm hiểu những nhóm chất thiết yếu mẹ cần bổ sung ngay.',
    content: '...',
    thumbnail_url: '/blog/nutrition.png',
    published_at: '2026-05-01',
    view_count: 1250,
    tags: ['Dinh dưỡng', 'Thai kỳ'],
    author: 'BS. Nguyễn Thị Hoa',
    category: 'Sức khỏe'
  },
  {
    id: '2',
    title: 'Bí quyết gắn kết tình cảm mẹ và bé',
    excerpt: 'Sợi dây liên kết vô hình giữa mẹ và bé bắt đầu ngay từ những ngày đầu tiên. Hãy khám phá cách để nuôi dưỡng tình yêu này mỗi ngày.',
    content: '...',
    thumbnail_url: '/blog/baby-care.png',
    published_at: '2026-05-03',
    view_count: 980,
    tags: ['Chăm sóc bé', 'Gắn kết'],
    author: 'Tâm lý gia Lê Mai',
    category: 'Nuôi dạy con'
  },
  {
    id: '3',
    title: 'Thực đơn lợi sữa cho mẹ sau sinh',
    excerpt: 'Làm sao để có nguồn sữa dồi dào và đầy đủ dưỡng chất cho bé? Tham khảo ngay thực đơn 7 ngày dành riêng cho mẹ bỉm sữa.',
    content: '...',
    thumbnail_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop',
    published_at: '2026-04-28',
    view_count: 2100,
    tags: ['Sau sinh', 'Lợi sữa'],
    author: 'Dinh dưỡng viên Trần Nam',
    category: 'Sức khỏe'
  }
];

const categories = ['Tất cả', 'Sức khỏe', 'Nuôi dạy con', 'Dinh dưỡng', 'Kinh nghiệm'];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <HomeLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              NestAI <span className="text-primary">Blog</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Kiến thức chuyên khoa và kinh nghiệm thực tiễn giúp bạn tự tin trên hành trình làm cha mẹ.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post (if search is empty and category is 'Tất cả') */}
        {searchQuery === '' && selectedCategory === 'Tất cả' && filteredPosts.length > 0 && (
          <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl transition-all hover:shadow-2xl">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-full min-h-[320px] overflow-hidden">
                <Image
                  src={filteredPosts[0].thumbnail_url}
                  alt={filteredPosts[0].title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-black/40 md:to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Nổi bật
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {filteredPosts[0].published_at}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    5 phút đọc
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {filteredPosts[0].title}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed line-clamp-3">
                  {filteredPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {filteredPosts[0].author.split(' ').pop()?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{filteredPosts[0].author}</span>
                  </div>
                  <Link
                    href={`/blog/${filteredPosts[0].id}`}
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                  >
                    Đọc tiếp <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(searchQuery === '' && selectedCategory === 'Tất cả' ? 1 : 0).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.thumbnail_url}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {post.tags.slice(0, 1).map(tag => (
                    <span key={tag} className="bg-white/90 backdrop-blur-md text-primary text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5 space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.published_at}
                  </span>
                  <span>•</span>
                  <span>{post.category}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">{post.author}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Không tìm thấy bài viết nào</h3>
            <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác hoặc chọn chuyên mục khác.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('Tất cả'); }}
              className="text-primary font-medium hover:underline"
            >
              Xem tất cả bài viết
            </button>
          </div>
        )
}
      </div>
    </HomeLayout>
  );
}
