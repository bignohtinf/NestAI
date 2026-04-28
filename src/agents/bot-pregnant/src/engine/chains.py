from __future__ import annotations

from pathlib import Path

from langchain_openai import ChatOpenAI


class ResponseGenerator:
    def __init__(self, model: str = "gpt-4o-mini"):
        self.base_dir = Path(__file__).resolve().parents[2]
        self.prompts_dir = self.base_dir / "prompts"
        self.system_prompt = (self.prompts_dir / "system_prompt.txt").read_text(encoding="utf-8")
        self.rag_template = (self.prompts_dir / "rag_template.txt").read_text(encoding="utf-8")
        self.llm = ChatOpenAI(model=model, temperature=0.2)

    def generate(self, question: str, context: str, safety_level: str = "safe") -> str:
        if safety_level == "emergency":
            return (
                "🚨 MommyMate khuyên mẹ đi khám cấp cứu ngay vì có dấu hiệu nguy hiểm. "
                "Đừng chờ tư vấn online thêm."
            )

        final_prompt = self.rag_template.format(context=context, question=question)
        response = self.llm.invoke(
            [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": final_prompt},
            ]
        )
        return response.content.strip()
