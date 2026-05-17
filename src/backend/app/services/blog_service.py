from typing import Any, Dict, List, Optional
from uuid import UUID

from app.schemas.blog import (
    BlogCategory,
    BlogComment,
    BlogCommentCreate,
    BlogPostDetail,
    BlogPostSummary,
    BlogReactionCount,
)


class BlogService:
    def __init__(self, supabase):
        self.supabase = supabase

    def get_categories(self) -> List[BlogCategory]:
        res = self.supabase.table("blog_categories").select("*").order("name").execute()
        return [BlogCategory(**c) for c in (res.data or [])]

    def get_posts(
        self, 
        limit: int = 20, 
        offset: int = 0, 
        category_slug: Optional[str] = None,
        search: Optional[str] = None,
        tag: Optional[str] = None
    ) -> Dict[str, Any]:
        query = self.supabase.table("cms_items").select(
            "*, users!cms_items_created_by_fkey(full_name), blog_post_categories(blog_categories(*))",
            count="exact"
        ).eq("type", "post").eq("status", "published")

        if search:
            query = query.or_(f"title.ilike.%{search}%,content.ilike.%{search}%")
        
        if tag:
            # tags is JSONB, using cs (contains)
            query = query.contains("tags", [tag])

        # Note: Filtering by category_slug in a single query with Supabase/PostgREST 
        # can be complex with joins. For now, we'll fetch and filter if needed, 
        # or use a RPC if performance becomes an issue.
        
        res = query.order("published_at", desc=True).range(offset, offset + limit - 1).execute()
        
        posts = []
        for p in (res.data or []):
            categories = [
                BlogCategory(**mapping["blog_categories"]) 
                for mapping in p.get("blog_post_categories", [])
                if mapping.get("blog_categories")
            ]
            
            # If category_slug filter is provided, check if post belongs to it
            if category_slug and not any(c.slug == category_slug for c in categories):
                continue

            post_summary = BlogPostSummary(
                id=p["id"],
                title=p["title"],
                slug=p.get("slug"),
                thumbnail_url=p.get("thumbnail_url"),
                published_at=p.get("published_at"),
                view_count=p.get("view_count", 0),
                tags=p.get("tags") or [],
                author_name=p.get("users", {}).get("full_name"),
                categories=categories
            )
            posts.append(post_summary)

        return {
            "posts": posts,
            "total": res.count or 0,
            "limit": limit,
            "offset": offset
        }

    def get_post_detail(self, slug_or_id: str) -> Optional[BlogPostDetail]:
        # Try finding by slug first, then by ID
        query = self.supabase.table("cms_items").select(
            "*, users!cms_items_created_by_fkey(full_name), blog_post_categories(blog_categories(*))"
        ).eq("type", "post")

        try:
            UUID(slug_or_id)
            query = query.or_(f"id.eq.{slug_or_id},slug.eq.{slug_or_id}")
        except ValueError:
            query = query.eq("slug", slug_or_id)

        res = query.execute()
        if not res.data:
            return None
        
        p = res.data[0]
        
        # Increment view count (fire and forget)
        self.supabase.table("cms_items").update({"view_count": p.get("view_count", 0) + 1}).eq("id", p["id"]).execute()

        # Get reactions count
        reaction_res = self.supabase.rpc("get_blog_reactions_count", {"p_post_id": p["id"]}).execute()
        reactions = [BlogReactionCount(**r) for r in (reaction_res.data or [])]

        # Get comment count
        comment_count_res = self.supabase.table("blog_comments").select("id", count="exact").eq("post_id", p["id"]).eq("is_hidden", False).execute()
        
        categories = [
            BlogCategory(**mapping["blog_categories"]) 
            for mapping in p.get("blog_post_categories", [])
            if mapping.get("blog_categories")
        ]

        return BlogPostDetail(
            id=p["id"],
            title=p["title"],
            content=p["content"],
            slug=p.get("slug"),
            thumbnail_url=p.get("thumbnail_url"),
            published_at=p.get("published_at"),
            view_count=p.get("view_count", 0) + 1,
            tags=p.get("tags") or [],
            author_name=p.get("users", {}).get("full_name"),
            categories=categories,
            seo_title=p.get("seo_title"),
            seo_description=p.get("seo_description"),
            reactions=reactions,
            comment_count=comment_count_res.count or 0
        )

    def get_comments(self, post_id: UUID, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        res = self.supabase.table("blog_comments").select(
            "*, users(email)", count="exact"
        ).eq("post_id", post_id).eq("is_hidden", False).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        comments = []
        for c in (res.data or []):
            comment_dict = c.copy()
            comment_dict["user_email"] = c.get("users", {}).get("email")
            comments.append(BlogComment(**comment_dict))
            
        return {
            "comments": comments,
            "total": res.count or 0,
            "limit": limit,
            "offset": offset
        }

    def add_comment(self, user_id: UUID, comment_data: BlogCommentCreate) -> BlogComment:
        data = comment_data.model_dump()
        data["user_id"] = user_id
        res = self.supabase.table("blog_comments").insert(data).execute()
        return BlogComment(**res.data[0])

    def toggle_reaction(self, user_id: UUID, post_id: UUID, reaction_type: str = "like") -> bool:
        # Check if exists
        check = self.supabase.table("blog_reactions").select("*").eq("post_id", post_id).eq("user_id", user_id).execute()
        
        if check.data:
            # If exists with same type, remove it (toggle off)
            if check.data[0]["reaction_type"] == reaction_type:
                self.supabase.table("blog_reactions").delete().eq("post_id", post_id).eq("user_id", user_id).execute()
                return False
            else:
                # Update to new type
                self.supabase.table("blog_reactions").update({"reaction_type": reaction_type}).eq("post_id", post_id).eq("user_id", user_id).execute()
                return True
        else:
            # Insert new
            self.supabase.table("blog_reactions").insert({
                "post_id": post_id,
                "user_id": user_id,
                "reaction_type": reaction_type
            }).execute()
            return True

    def set_post_categories(self, post_id: UUID, category_ids: List[UUID]) -> bool:
        # Clear existing mappings
        self.supabase.table("blog_post_categories").delete().eq("post_id", post_id).execute()
        
        if not category_ids:
            return True
            
        # Insert new mappings
        mappings = [{"post_id": str(post_id), "category_id": str(cid)} for cid in category_ids]
        self.supabase.table("blog_post_categories").insert(mappings).execute()
        return True
