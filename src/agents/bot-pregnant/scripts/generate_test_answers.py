#!/usr/bin/env python
"""
Script to generate test answers from gold questions using RAG system.
Queries the vector database and generates answers using OpenAI.
"""

import json
import os
import sys
from pathlib import Path

from openai import OpenAI

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.engine.retriever import NoriRetriever


def load_prompts() -> tuple[str, str]:
    prompts_dir = Path(__file__).resolve().parents[1] / "prompts"
    if not prompts_dir.exists():
        prompts_dir = Path("/app") / "agents" / "bot-pregnant" / "prompts"
    system_prompt = (prompts_dir / "system_prompt.txt").read_text(encoding="utf-8")
    rag_template = (prompts_dir / "rag_template.txt").read_text(encoding="utf-8")
    return system_prompt, rag_template


def load_gold_questions(gold_path: Path) -> list[dict]:
    """Load questions from gold_answer.json"""
    with open(gold_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def generate_test_answers(gold_data: list[dict], db_path: str, output_path: Path):
    """Generate answers for each question using RAG system with OpenAI."""
    retriever = NoriRetriever(db_path=db_path)
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY is not configured")
    client = OpenAI(api_key=openai_api_key)

    llm = {
        "client": client,
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "temperature": 0.2,
        "max_tokens": 1024,
    }
    
    test_answers = []
    
    for idx, item in enumerate(gold_data, 1):
        question = item["question"]
        print(f"[{idx}/{len(gold_data)}] Processing: {question[:60]}...")
        
        try:
            # Retrieve relevant documents from vector database
            docs = retriever.retrieve(question)
            
            if not docs:
                print(f"  ⚠ No documents retrieved")
                test_answers.append({
                    "question": question,
                    "answer": ""
                })
                continue
            
            # Combine retrieved documents as context
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Load unified prompts and build the final RAG prompt
            system_prompt, rag_template = load_prompts()
            rag_prompt = f"{system_prompt}\n\n{rag_template.format(context=context, question=question)}"

            # Generate answer using OpenAI with RAG context
            response = llm["client"].chat.completions.create(
                model=llm["model"],
                temperature=llm["temperature"],
                max_tokens=llm["max_tokens"],
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": rag_prompt},
                ],
            )
            answer = response.choices[0].message.content.strip()
            
            test_answers.append({
                "question": question,
                "answer": answer
            })
            
            print(f"  ✓ Generated answer ({len(docs)} docs retrieved)")
            
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            test_answers.append({
                "question": question,
                "answer": ""
            })
    
    # Save to file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(test_answers, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Test answers saved to {output_path}")
    print(f"  Total: {len(test_answers)} answers generated")


def main():
    base_dir = Path(__file__).resolve().parents[1]
    gold_path = base_dir / "tests" / "gold_answer.json"
    output_path = base_dir / "tests" / "test_answer.json"
    db_path = str(base_dir / "data" / "vectordb")
    
    print(f"Loading gold questions from {gold_path}...")
    gold_data = load_gold_questions(gold_path)
    print(f"Loaded {len(gold_data)} questions\n")
    
    print(f"Generating test answers using vector database at {db_path}...")
    print("Make sure OPENAI_API_KEY is configured in your environment.\n")
    generate_test_answers(gold_data, db_path, output_path)


if __name__ == "__main__":
    main()
