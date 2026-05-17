from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel

from app.core.supabase_client import get_supabase

router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatHistoryCreate(BaseModel):
    title: str
    messages: List[ChatMessage] = []

class ChatHistoryUpdate(BaseModel):
    title: str

@router.get("")
async def get_chat_histories(
    limit: int = Query(5, ge=1, le=100),
    offset: int = Query(0, ge=0),
    x_user_id: Optional[str] = Header(None),
    supabase = Depends(get_supabase)
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    try:
        # Lấy từ bảng conversations thay vì chat_histories
        res = supabase.table("conversations").select("id, user_id, title, created_at, updated_at")\
            .eq("user_id", x_user_id)\
            .order("updated_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        data = res.data or []
        return {
            "data": data,
            "total": len(data),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        print(f"[DEBUG] Error in get_chat_histories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_chat_history(
    data: ChatHistoryCreate,
    x_user_id: Optional[str] = Header(None),
    supabase = Depends(get_supabase)
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    try:
        # 1. Tạo conversation
        conv_res = supabase.table("conversations").insert({
            "user_id": x_user_id,
            "title": data.title,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).execute()
        
        if not conv_res.data:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        
        conv_id = conv_res.data[0]["id"]
        
        # 2. Nếu có tin nhắn đi kèm, chèn vào bảng messages
        if data.messages:
            messages_to_insert = [
                {
                    "conversation_id": conv_id,
                    "role": m.role,
                    "content": m.content,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                for m in data.messages
            ]
            supabase.table("messages").insert(messages_to_insert).execute()
        
        return conv_res.data[0]
    except Exception as e:
        print(f"[DEBUG] Error in create_chat_history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{chat_id}")
async def get_chat_history(
    chat_id: str,
    x_user_id: Optional[str] = Header(None),
    supabase = Depends(get_supabase)
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    try:
        # 1. Lấy thông tin conversation
        conv_res = supabase.table("conversations").select("*")\
            .eq("id", chat_id)\
            .eq("user_id", x_user_id)\
            .execute()
        
        if not conv_res.data:
            raise HTTPException(status_code=404, detail="Chat history not found")
        
        conversation = conv_res.data[0]
        
        # 2. Lấy danh sách tin nhắn từ bảng messages
        msg_res = supabase.table("messages")\
            .select("*")\
            .eq("conversation_id", chat_id)\
            .order("timestamp", desc=False)\
            .execute()
        
        conversation["messages"] = msg_res.data or []
        return conversation
    except Exception as e:
        print(f"[DEBUG] Error in get_chat_history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{chat_id}")
async def update_chat_history(
    chat_id: str,
    data: ChatHistoryUpdate,
    x_user_id: Optional[str] = Header(None),
    supabase = Depends(get_supabase)
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    try:
        res = supabase.table("conversations").update({
            "title": data.title,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", chat_id).eq("user_id", x_user_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Chat history not found or update failed")
        
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{chat_id}")
async def delete_chat_history(
    chat_id: str,
    x_user_id: Optional[str] = Header(None),
    supabase = Depends(get_supabase)
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    try:
        # Xóa conversation (Cascade sẽ tự xóa messages nếu có foreign key, nếu không cần xóa thủ công)
        # Ở đây giả định database có ON DELETE CASCADE, nếu không ta xóa messages trước
        supabase.table("messages").delete().eq("conversation_id", chat_id).execute()
        supabase.table("conversations").delete().eq("id", chat_id).eq("user_id", x_user_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{chat_id}/messages")
async def add_messages_to_chat(
    chat_id: str,
    messages: List[ChatMessage],
    x_user_id: Optional[str] = Header(None),
    supabase = Depends(get_supabase)
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    try:
        # Kiểm tra quyền sở hữu
        conv_res = supabase.table("conversations").select("id").eq("id", chat_id).eq("user_id", x_user_id).execute()
        if not conv_res.data:
            raise HTTPException(status_code=404, detail="Chat history not found")
        
        # Chèn tin nhắn mới
        messages_to_insert = [
            {
                "conversation_id": chat_id,
                "role": m.role,
                "content": m.content,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            for m in messages
        ]
        
        res = supabase.table("messages").insert(messages_to_insert).execute()
        
        # Cập nhật thời gian update của conversation
        supabase.table("conversations").update({
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", chat_id).execute()
        
        return res.data
    except Exception as e:
        print(f"[DEBUG] Error in add_messages_to_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
