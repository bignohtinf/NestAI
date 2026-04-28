#!/usr/bin/env python
"""
Script to generate test answers from gold questions using RAG system.
Queries the vector database and generates answers using Ollama (Llama 3.2).
"""

import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.engine.retriever import NoriRetriever
from langchain_ollama import OllamaLLM


def load_gold_questions(gold_path: Path) -> list[dict]:
    """Load questions from gold_answer.json"""
    with open(gold_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def generate_test_answers(gold_data: list[dict], db_path: str, output_path: Path):
    """Generate answers for each question using RAG system with Ollama"""
    retriever = NoriRetriever(db_path=db_path)
    
    # Initialize Ollama with Llama 3.2
    llm = OllamaLLM(model="llama3.1:8b", temperature=0.2)
    
    # System prompt for RAG
    system_prompt = """Bạn là một trợ lý y tế chuyên về sức khỏe bà bầu và trẻ em.
Dựa trên thông tin được cung cấp, hãy trả lời câu hỏi một cách chính xác, chi tiết và hữu ích.
Nếu thông tin không đủ, hãy nói rõ điều đó."""
    
    test_answers = []
    
    for idx, item in enumerate(gold_data, 1):
        question = item["question"]
        print(f"[{idx}/{len(gold_data)}] Processing: {question[:60]}...")
        
        try:
            # Retrieve relevant documents
            docs = retriever.retrieve(question)
            
            # Combine retrieved documents as context
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Build RAG prompt
            rag_prompt = f"""Dựa trên thông tin sau:

{context}

Hãy trả lời câu hỏi này: {question}

Trả lời:"""
            
            # Generate answer using Ollama
            answer = llm.invoke(rag_prompt)
            
            test_answers.append({
                "question": question,
                "answer": answer.strip()
            })
            
            print(f"  ✓ Generated answer")
            
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            # Use empty answer on error
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
    print("Make sure Ollama is running with: ollama run llama3.1\n")
    generate_test_answers(gold_data, db_path, output_path)


if __name__ == "__main__":
    main()
