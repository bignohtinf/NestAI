from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.supabase_client import get_supabase
from app.schemas.blog import (
    BlogPostListResponse, 
    BlogPostDetail, 
    BlogCategory, 
    BlogCommentListResponse,
    BlogCommentCreate,
    BlogReactionToggle
)
from app.services.blog_service import BlogService
from typing import Optional, List
from uuid import UUID

router = APIRouter()

@router.get("/categories", response_model=List[BlogCategory])
async def get_categories(supabase = Depends(get_supabase)):
    service = BlogService(supabase)
    return service.get_categories()

@router.get("/posts", response_model=BlogPostListResponse)
async def get_posts(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    service = BlogService(supabase)
    return service.get_posts(limit, offset, category, search, tag)

@router.get("/posts/{slug_or_id}", response_model=BlogPostDetail)
async def get_post_detail(slug_or_id: str, supabase = Depends(get_supabase)):
    service = BlogService(supabase)
    post = service.get_post_detail(slug_or_id)
    if not post:
        raise HTTPException(status_code=404, detail="Bài viết không tồn tại")
    return post

@router.get("/posts/{post_id}/comments", response_model=BlogCommentListResponse)
async def get_comments(
    post_id: UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    supabase = Depends(get_supabase)
):
    service = BlogService(supabase)
    return service.get_comments(post_id, limit, offset)

@router.post("/comments")
async def add_comment(
    comment_data: BlogCommentCreate, 
    user_id: str = "00000000-0000-0000-0000-000000000000", # Placeholder, nên lấy từ Auth
    supabase = Depends(get_supabase)
):
    # Trong thực tế, user_id sẽ được lấy từ token JWT
    service = BlogService(supabase)
    try:
        res = service.add_comment(UUID(user_id), comment_data)
        return {"success": True, "comment": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reactions")
async def toggle_reaction(
    reaction_data: BlogReactionToggle,
    user_id: str = "00000000-0000-0000-0000-000000000000", # Placeholder
    supabase = Depends(get_supabase)
):
    service = BlogService(supabase)
    is_active = service.toggle_reaction(UUID(user_id), reaction_data.post_id, reaction_data.reaction_type)
    return {"success": True, "is_active": is_active}
