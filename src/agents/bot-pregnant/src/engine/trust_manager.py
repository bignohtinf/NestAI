from __future__ import annotations

import json
import re
from typing import Any

from langchain_core.documents import Document
from langchain_openai import ChatOpenAI


class TrustManager:
    """Đối soát context giữa nguồn chính thống và nguồn tham khảo."""

    def __init__(self, model: str = "gpt-4o-mini"):
        self.llm = ChatOpenAI(model=model, temperature=0)

    @staticmethod
    def _join_docs(docs: list[Document], max_chars: int = 6000) -> str:
        text = "\n\n".join(d.page_content for d in docs)
        return text[:max_chars]

    @staticmethod
    def _extract_json(text: str) -> dict[str, Any]:
        text = text.strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {}
        return {}

    def validate(self, docs: list[Document]) -> dict[str, Any]:
        vinmec_docs = [d for d in docs if d.metadata.get("source") == "vinmec"]
        official_docs = [d for d in docs if d.metadata.get("source") in {"health_care", "byt"}]

        # Không có nguồn chính thống: giữ nguyên context, gắn cảnh báo nhẹ.
        if not official_docs:
            return {
                "trusted_context": self._join_docs(vinmec_docs or docs),
                "selected_docs": vinmec_docs or docs,
                "safety_level": "warning",
                "trust_note": "Không tìm thấy tài liệu chính thống trong top-k, dùng nguồn tham khảo.",
            }

        # Có nguồn chính thống: ưu tiên official_docs khi tạo trusted context.
        official_text = self._join_docs(official_docs, max_chars=7000)
        reference_text = self._join_docs(vinmec_docs, max_chars=5000)

        prompt = (
            "Bạn là chuyên gia đối soát kiến thức y tế sản-nhi.\n"
            "Nhiệm vụ: ưu tiên nguồn chính thống, chỉ ra mức độ cảnh báo.\n"
            "Trả về JSON hợp lệ duy nhất theo schema:\n"
            '{"is_conflict": bool, "safety_level": "safe|warning|emergency", '
            '"final_instruction": "string ngắn gọn tiếng Việt"}\n\n'
            f"NGUON_CHINH_THONG:\n{official_text}\n\n"
            f"NGUON_THAM_KHAO:\n{reference_text}"
        )

        response = self.llm.invoke(prompt)
        parsed = self._extract_json(response.content if hasattr(response, "content") else str(response))

        safety_level = parsed.get("safety_level", "safe")
        if safety_level not in {"safe", "warning", "emergency"}:
            safety_level = "safe"

        return {
            "trusted_context": official_text,
            "selected_docs": official_docs,
            "safety_level": safety_level,
            "trust_note": parsed.get("final_instruction", "Đã ưu tiên nguồn chính thống."),
        }