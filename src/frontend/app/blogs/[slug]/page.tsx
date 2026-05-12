'use client';

import { HomeLayout } from '@/components/layouts/home-layout';
import { blogApi } from '@/lib/api';
import { useApp } from '@/lib/context';
import {
  Calendar, Clock, User, Tag, MessageCircle, Heart, Share2,
  ChevronLeft, Loader2, Send
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogPostDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useApp();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const postRes = await blogApi.getPostDetail(slug as string);
        setPost(postRes);
        
        const commentsRes = await blogApi.getComments(postRes.id);
        setComments(commentsRes.comments || []);
      } catch (error) {
        console.error('Failed to fetch post detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  const handleToggleReaction = async () => {
    if (!post || !user) return;
    try {
      await blogApi.toggleReaction({ post_id: post.id, reaction_type: 'like' });
      // Refresh post detail to get updated reaction count
      const updatedPost = await blogApi.getPostDetail(slug as string);
      setPost(updatedPost);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post || !user) return;
    
    setSubmittingComment(true);
    try {
      await blogApi.addComment({
        post_id: post.id,
        content: commentText
      });
      setCommentText('');
      // Refresh comments
      const commentsRes = await blogApi.getComments(post.id);
      setComments(commentsRes.comments || []);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <HomeLayout fullWidth>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </HomeLayout>
    );
  }

  if (!post) {
    return (
      <HomeLayout fullWidth>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy bài viết</h1>
          <Link href="/blogs" className="text-primary hover:underline mt-4 inline-block">Quay lại danh sách</Link>
        </div>
      </HomeLayout>
    );
  }

  const totalReactions = post.reactions?.reduce((acc: number, r: any) => acc + r.count, 0) || 0;

  return (
    <HomeLayout fullWidth>
      <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại</span>
        </button>

        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {post.categories?.map((cat: any) => (
              <span key={cat.id} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {cat.name}
              </span>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border/50 py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {post.author_name?.charAt(0) || 'U'}
              </div>
              <span className="font-medium text-foreground">{post.author_name || 'NestAI User'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {Math.ceil((post.content?.length || 0) / 1000) + 1} phút đọc
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              {post.comment_count} bình luận
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.thumbnail_url && (
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8 border-t border-border">
            <Tag className="h-4 w-4 text-muted-foreground mr-2" />
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-sm bg-muted px-3 py-1 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Interactions */}
        <div className="flex items-center justify-between py-6 border-y border-border">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleToggleReaction}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all shadow-sm border ${
                totalReactions > 0 
                  ? 'bg-primary/10 border-primary/20 text-primary' 
                  : 'bg-card border-border hover:bg-muted'
              }`}
            >
              <Heart className={`h-5 w-5 ${totalReactions > 0 ? 'fill-current' : ''}`} />
              <span className="font-bold">{totalReactions}</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-card border border-border hover:bg-muted transition-all shadow-sm text-muted-foreground">
              <Share2 className="h-5 w-5" />
              <span className="font-medium">Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-8 pt-10">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-primary" />
            Bình luận ({post.comment_count})
          </h3>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Chia sẻ suy nghĩ của bạn..."
                className="w-full min-h-[120px] p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {submittingComment ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-muted/30 border border-dashed border-border">
              <p className="text-muted-foreground">Vui lòng <Link href="/auth/login" className="text-primary font-bold hover:underline">đăng nhập</Link> để bình luận.</p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm animate-in fade-in slide-in-from-left-4">
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold">
                  {comment.user_email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{comment.user_email?.split('@')[0]}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="py-10 text-center text-muted-foreground italic">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </div>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
