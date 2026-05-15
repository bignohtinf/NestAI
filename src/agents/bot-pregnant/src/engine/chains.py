from __future__ import annotations

from pathlib import Path
from typing import List, Dict, Any, Optional, AsyncGenerator

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage


class ResponseGenerator:
    def __init__(self, model: str = "gpt-4o-mini"):
        self.base_dir = Path(__file__).resolve().parents[2]
        self.prompts_dir = self.base_dir / "prompts"
        self.system_prompt = (self.prompts_dir / "system_prompt.txt").read_text(encoding="utf-8")
        self.rag_template = (self.prompts_dir / "rag_template.txt").read_text(encoding="utf-8")
        self.llm = ChatOpenAI(model=model, temperature=0.2)

    def format_system_prompt(self, user_profile: Optional[Dict[str, Any]]) -> str:
        """Inject user profile into system prompt.
        
        For any user profile data, formats and injects all profile fields into the system prompt.
        If profile is missing, returns base system prompt.
        
        **Validates: Requirements 2.1, 2.3**
        """
        if not user_profile:
            return self.system_prompt
        
        profile_text = "\n\nThông tin người dùng:\n"
        if user_profile.get("gestation_weeks") is not None:
            # Hiển thị giống header: "X tuần Y ngày"
            days = user_profile.get("days_in_week")
            if days:
                profile_text += f"- Tuần thai kỳ: {user_profile['gestation_weeks']} tuần {days} ngày\n"
            else:
                profile_text += f"- Tuần thai kỳ: {user_profile['gestation_weeks']} tuần\n"
        if user_profile.get("weight"):
            profile_text += f"- Cân nặng: {user_profile['weight']} kg\n"
        if user_profile.get("condition") and user_profile["condition"] != "none":
            profile_text += f"- Tình trạng sức khỏe: {user_profile['condition']}\n"
        if user_profile.get("food_preference"):
            profile_text += f"- Hạn chế thực phẩm: {user_profile['food_preference']}\n"
        
        return self.system_prompt + profile_text

    def convert_chat_history(self, chat_history: List[Dict[str, str]]) -> List[BaseMessage]:
        """Convert chat history to LangChain message objects.
        
        For any chat history, converts each message to a LangChain message object.
        Preserves chronological order and role information.
        
        **Validates: Requirements 1.2, 1.3**
        """
        messages = []
        for msg in chat_history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))
        
        return messages

    def generate(
        self,
        question: str,
        context: str,
        safety_level: str = "safe",
        chat_history: Optional[List[Dict[str, str]]] = None,
        user_profile: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Generate response with context, chat history, and user profile.
        
        Generates a response by:
        1. Injecting user profile into system prompt
        2. Converting chat history to LangChain messages
        3. Passing messages to LLM instead of just question
        
        **Validates: Requirements 1.3, 2.2, 2.3**
        """
        if safety_level == "emergency":
            return (
                "🚨 Nori khuyên mẹ đi khám cấp cứu ngay vì có dấu hiệu nguy hiểm. "
                "Đừng chờ tư vấn online thêm."
            )

        # Format system prompt with user profile
        system_prompt = self.format_system_prompt(user_profile)
        
        # Convert chat history to LangChain messages
        messages = []
        if chat_history:
            messages = self.convert_chat_history(chat_history)
        
        # Format the RAG template with context and question
        final_prompt = self.rag_template.format(context=context, question=question)
        
        # Build the message list for the LLM
        llm_messages = [
            {"role": "system", "content": system_prompt},
            *[{"role": "user" if isinstance(m, HumanMessage) else "assistant", "content": m.content} for m in messages],
            {"role": "user", "content": final_prompt},
        ]
        
        response = self.llm.invoke(llm_messages)
        return response.content.strip()

    async def astream(
        self,
        question: str,
        context: str,
        safety_level: str = "safe",
        chat_history: Optional[List[Dict[str, str]]] = None,
        user_profile: Optional[Dict[str, Any]] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens with context, chat history, and user profile.
        
        Streams tokens by:
        1. Injecting user profile into system prompt
        2. Converting chat history to LangChain messages
        3. Using LLM's stream method to yield tokens
        
        For any streaming response, the concatenation of all streamed tokens 
        SHALL equal the complete response text that would be returned by the 
        non-streaming endpoint.
        
        **Validates: Requirements 3.2, 3.3**
        """
        if safety_level == "emergency":
            yield (
                "🚨 Nori khuyên mẹ đi khám cấp cứu ngay vì có dấu hiệu nguy hiểm. "
                "Đừng chờ tư vấn online thêm."
            )
            return

        # Format system prompt with user profile
        system_prompt = self.format_system_prompt(user_profile)
        
        # Convert chat history to LangChain messages
        messages = []
        if chat_history:
            messages = self.convert_chat_history(chat_history)
        
        # Format the RAG template with context and question
        final_prompt = self.rag_template.format(context=context, question=question)
        
        # Build the message list for the LLM
        llm_messages = [
            {"role": "system", "content": system_prompt},
            *[{"role": "user" if isinstance(m, HumanMessage) else "assistant", "content": m.content} for m in messages],
            {"role": "user", "content": final_prompt},
        ]
        
        # Stream tokens from the LLM
        async for chunk in self.llm.astream(llm_messages):
            if chunk.content:
                yield chunk.content
