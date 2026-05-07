from __future__ import annotations

from typing import Any, TypedDict
from pathlib import Path

from langgraph.graph import END, StateGraph

from .chains import ResponseGenerator
from .retriever import NoriRetriever
from .trust_manager import TrustManager


class AgentState(TypedDict, total=False):
    question: str
    stage: str
    user_info: dict[str, Any]
    context: list[Any]
    trusted_context: str
    trust_note: str
    answer: str
    safety_level: str  # safe | warning | emergency
    chat_history: list[dict[str, Any]]  # [{"role": "user" | "assistant", "content": "..."}, ...]
    user_profile: dict[str, Any]  # {"gestation_weeks": int, "weight": float, "condition": str, ...}


class MommyEngine:
    def __init__(self, db_path: str | None = None, model: str = "gpt-4o-mini"):
        base_dir = Path(__file__).resolve().parents[2]
        resolved_db_path = db_path or str(base_dir / "data" / "vectordb")
        self.retriever = NoriRetriever(db_path=resolved_db_path)
        self.trust_manager = TrustManager(model=model)
        self.generator = ResponseGenerator(model=model)

    @staticmethod
    def analyze_query_node(state: AgentState) -> AgentState:
        question = state.get("question", "").lower()
        danger_keywords = ["ra máu", "đau bụng dữ dội", "vỡ ối", "co giật", "sốt cao", "thai không máy"]
        if any(keyword in question for keyword in danger_keywords):
            return {
                "safety_level": "emergency",
                "answer": (
                    "🚨 Đây có thể là dấu hiệu khẩn cấp trong thai kỳ. "
                    "Mẹ cần đến cơ sở y tế/sản khoa gần nhất ngay lập tức hoặc gọi cấp cứu."
                ),
            }
        return {"safety_level": "safe"}

    def retrieve_node(self, state: AgentState) -> AgentState:
        question = state.get("question", "")
        stage = state.get("stage")
        docs = self.retriever.retrieve(question, stage=stage)
        return {"context": docs}

    def trust_check_node(self, state: AgentState) -> AgentState:
        docs = state.get("context", [])
        trust_result = self.trust_manager.validate(docs)
        return {
            "trusted_context": trust_result["trusted_context"],
            "safety_level": trust_result["safety_level"],
            "trust_note": trust_result.get("trust_note", ""),
        }

    def generate_node(self, state: AgentState) -> AgentState:
        answer = self.generator.generate(
            question=state.get("question", ""),
            context=state.get("trusted_context", ""),
            safety_level=state.get("safety_level", "safe"),
            chat_history=state.get("chat_history"),
            user_profile=state.get("user_profile"),
        )
        return {"answer": answer}

    @staticmethod
    def route_after_analyze(state: AgentState) -> str:
        return "emergency" if state.get("safety_level") == "emergency" else "continue"

    @staticmethod
    def route_after_trust(state: AgentState) -> str:
        return "emergency" if state.get("safety_level") == "emergency" else "generate"

    def build(self):
        workflow = StateGraph(AgentState)
        workflow.add_node("analyze", self.analyze_query_node)
        workflow.add_node("retrieve", self.retrieve_node)
        workflow.add_node("trust_check", self.trust_check_node)
        workflow.add_node("generate", self.generate_node)
        workflow.set_entry_point("analyze")
        workflow.add_conditional_edges(
            "analyze",
            self.route_after_analyze,
            {"emergency": END, "continue": "retrieve"},
        )
        workflow.add_edge("retrieve", "trust_check")
        workflow.add_conditional_edges(
            "trust_check",
            self.route_after_trust,
            {"emergency": END, "generate": "generate"},
        )
        workflow.add_edge("generate", END)
        return workflow.compile()


def create_mommy_graph(db_path: str | None = None, model: str = "gpt-4o-mini"):
    engine = MommyEngine(db_path=db_path, model=model)
    return engine.build()