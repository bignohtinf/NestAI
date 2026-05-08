from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class BlogCategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon_url: Optional[str] = None

class BlogCategoryCreate(BlogCategoryBase):
    pass

class BlogCategory(BlogCategoryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BlogCommentBase(BaseModel):
    post_id: UUID
    content: str
    parent_id: Optional[UUID] = None

class BlogCommentCreate(BlogCommentBase):
    pass

class BlogComment(BlogCommentBase):
    id: UUID
    user_id: UUID
    is_hidden: bool
    created_at: datetime
    updated_at: datetime
    user_email: Optional[str] = None # For display

    class Config:
        from_attributes = True

class BlogReactionToggle(BaseModel):
    post_id: UUID
    reaction_type: str = "like"

class BlogReactionCount(BaseModel):
    reaction_type: str
    count: int

class BlogPostSummary(BaseModel):
    id: UUID
    title: str
    slug: Optional[str] = None
    thumbnail_url: Optional[str] = None
    published_at: Optional[datetime] = None
    view_count: int = 0
    tags: List[str] = []
    author_name: Optional[str] = None
    categories: List[BlogCategory] = []

class BlogPostDetail(BlogPostSummary):
    content: str
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    reactions: List[BlogReactionCount] = []
    comment_count: int = 0

class BlogCommentListResponse(BaseModel):
    comments: List[BlogComment]
    total: int
    limit: int
    offset: int

class BlogPostListResponse(BaseModel):
    posts: List[BlogPostSummary]
    total: int
    limit: int
    offset: int
