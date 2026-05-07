'use client';

import { Eye, MessageSquare, MoreHorizontal } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'published' | 'draft' | 'scheduled' | 'review';
  publishDate: string;
  views: number;
  comments: number;
  featured?: boolean;
}

const posts: Post[] = [
  {
    id: '1',
    title: 'Hướng dẫn dinh dưỡng cho trẻ 0-12 tháng',
    author: 'BS. Nguyễn Thị Hoa',
    category: 'Sức khỏe',
    status: 'published',
    publishDate: '2 giờ trước',
    views: 1247,
    comments: 23,
    featured: true,
  },
  {
    id: '2',
    title: 'Sản phẩm NestAI Premium - Ra mắt mới',
    author: 'Trần Văn Minh',
    category: 'Sản phẩm',
    status: 'published',
    publishDate: '5 giờ trước',
    views: 892,
    comments: 15,
  },
  {
    id: '3',
    title: 'Chương trình khuyến mãi tháng 6/2026',
    author: 'Lê Thị Mai',
    category: 'Khuyến mãi',
    status: 'scheduled',
    publishDate: 'Ngày mai, 9:00',
    views: 0,
    comments: 0,
  },
  {
    id: '4',
    title: 'Cập nhật chính sách giao hàng',
    author: 'Phạm Đức Anh',
    category: 'Thông báo',
    status: 'draft',
    publishDate: 'Bản nháp',
    views: 0,
    comments: 3,
  },
  {
    id: '5',
    title: 'Nghiên cứu mới về sữa công thức',
    author: 'BS. Vũ Thanh Tùng',
    category: 'Nghiên cứu',
    status: 'review',
    publishDate: 'Chờ duyệt',
    views: 0,
    comments: 1,
  },
];

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const statusLabels: Record<string, string> = {
  published: 'Đã đăng',
  draft: 'Nháp',
  scheduled: 'Lên lịch',
  review: 'Chờ duyệt',
};

const categoryColors: Record<string, string> = {
  'Sức khỏe': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Sản phẩm': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Khuyến mãi': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Thông báo': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Nghiên cứu': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function RecentPosts() {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bài viết gần đây
        </h3>
        <button className="text-sm text-rose-500 hover:underline">
          Xem tất cả
        </button>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
              post.featured
                ? 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10'
                : 'border-gray-200 dark:border-gray-800'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {post.author[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {post.title}
                  </h4>
                  {post.featured && (
                    <span className="px-1.5 py-0.5 text-xs bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-800 flex-shrink-0">
                      Nổi bật
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{post.author}</span>
                  <span>&bull;</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {post.category}
                  </span>
                  <span>&bull;</span>
                  <span>{post.publishDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              <span
                className={`px-1.5 py-0.5 text-xs rounded-full ${statusColors[post.status]}`}
              >
                {statusLabels[post.status]}
              </span>

              {post.status === 'published' && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              )}

              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
