from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

from sentence_transformers import SentenceTransformer, util

BASE_DIR = Path(__file__).resolve().parent
GOLD_PATH = BASE_DIR / "gold_answer.json"
TEST_PATH = BASE_DIR / "test_answer.json"
REPORT_PATH = BASE_DIR / "similarity_report.json"


@dataclass
class SimilarityItem:
    index: int
    question: str
    semantic_similarity: float
    lexical_similarity: float
    final_score: float


def load_json(path: Path) -> Any:
    if not path.exists():
        raise FileNotFoundError(f"Không tìm thấy file: {path}")

    raw = path.read_text(encoding="utf-8").strip()
    if not raw:
        raise ValueError(f"File rỗng: {path}")

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"JSON không hợp lệ ở {path}: {exc}") from exc


def normalize_items(data: Any, source_name: str) -> list[dict[str, str]]:
    if not isinstance(data, list):
        raise ValueError(f"{source_name} phải là list các object.")

    normalized: list[dict[str, str]] = []
    for idx, item in enumerate(data):
        if not isinstance(item, dict):
            raise ValueError(f"{source_name}[{idx}] không phải object.")
        question = str(item.get("question", "")).strip()
        answer = str(item.get("answer", "")).strip()
        if not question or not answer:
            raise ValueError(f"{source_name}[{idx}] thiếu 'question' hoặc 'answer'.")
        normalized.append({"question": question, "answer": answer})
    return normalized


def cosine_similarity(model: SentenceTransformer, text_a: str, text_b: str) -> float:
    embeddings = model.encode([text_a, text_b], convert_to_tensor=True, normalize_embeddings=True)
    score = util.cos_sim(embeddings[0], embeddings[1]).item()
    return float(max(0.0, min(1.0, score)))


def lexical_similarity(text_a: str, text_b: str) -> float:
    return float(SequenceMatcher(None, text_a, text_b).ratio())


def build_question_index(items: list[dict[str, str]]) -> dict[str, str]:
    return {item["question"]: item["answer"] for item in items}


def evaluate(
    gold_items: list[dict[str, str]],
    test_items: list[dict[str, str]],
    semantic_weight: float = 0.7,
    lexical_weight: float = 0.3,
) -> dict[str, Any]:
    model = SentenceTransformer("BAAI/bge-m3")
    test_by_question = build_question_index(test_items)

    details: list[SimilarityItem] = []
    missing_questions: list[str] = []
    exact_match_count = 0

    for idx, gold in enumerate(gold_items, start=1):
        question = gold["question"]
        gold_answer = gold["answer"]
        test_answer = test_by_question.get(question)

        if test_answer is None:
            missing_questions.append(question)
            sem = 0.0
            lex = 0.0
            score = 0.0
        else:
            sem = cosine_similarity(model, gold_answer, test_answer)
            lex = lexical_similarity(gold_answer, test_answer)
            score = semantic_weight * sem + lexical_weight * lex
            if gold_answer.strip() == test_answer.strip():
                exact_match_count += 1

        details.append(
            SimilarityItem(
                index=idx,
                question=question,
                semantic_similarity=round(sem, 4),
                lexical_similarity=round(lex, 4),
                final_score=round(score, 4),
            )
        )

    total = len(details)
    avg_semantic = sum(item.semantic_similarity for item in details) / total if total else 0.0
    avg_lexical = sum(item.lexical_similarity for item in details) / total if total else 0.0
    avg_final = sum(item.final_score for item in details) / total if total else 0.0

    return {
        "summary": {
            "total_questions": total,
            "matched_questions": total - len(missing_questions),
            "missing_questions": len(missing_questions),
            "exact_match_count": exact_match_count,
            "average_semantic_similarity": round(avg_semantic, 4),
            "average_lexical_similarity": round(avg_lexical, 4),
            "average_final_score": round(avg_final, 4),
            "weights": {
                "semantic": semantic_weight,
                "lexical": lexical_weight,
            },
        },
        "missing_question_list": missing_questions,
        "details": [asdict(item) for item in details],
    }


def main():
    gold_raw = load_json(GOLD_PATH)
    test_raw = load_json(TEST_PATH)

    gold_items = normalize_items(gold_raw, "gold_answer.json")
    test_items = normalize_items(test_raw, "test_answer.json")

    report = evaluate(gold_items, test_items)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    summary = report["summary"]
    print("=== Similarity Summary ===")
    print(f"Total questions: {summary['total_questions']}")
    print(f"Matched questions: {summary['matched_questions']}")
    print(f"Missing questions: {summary['missing_questions']}")
    print(f"Exact match count: {summary['exact_match_count']}")
    print(f"Avg semantic similarity: {summary['average_semantic_similarity']}")
    print(f"Avg lexical similarity: {summary['average_lexical_similarity']}")
    print(f"Avg final score: {summary['average_final_score']}")
    print(f"Report saved: {REPORT_PATH}")


if __name__ == "__main__":
    main()
