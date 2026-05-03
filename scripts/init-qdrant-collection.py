#!/usr/bin/env python3
"""
Initialize Qdrant collections for bot-pregnant
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest

def init_qdrant_collections():
    """Create required Qdrant collections"""
    
    # Load .env file
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"Loaded .env from {env_path}")
    
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_api_key = os.getenv("QDRANT_API_KEY", "")
    
    print(f"Connecting to Qdrant at {qdrant_url}")
    
    # Initialize client
    if qdrant_api_key:
        client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    else:
        client = QdrantClient(url=qdrant_url)
    
    # Use 1024 for BAAI/bge-m3 embeddings
    vector_size = 1024
    
    # Collection names
    collections = {
        "bot_pregnant": vector_size,
        "nestai": vector_size,
    }
    
    for collection_name, size in collections.items():
        try:
            # Check if collection exists
            info = client.get_collection(collection_name)
            print(f"✓ Collection '{collection_name}' already exists (vectors: {info.config.params.vectors.size})")
            
            # If vector size doesn't match, delete and recreate
            if info.config.params.vectors.size != size:
                print(f"  Vector size mismatch: expected {size}, got {info.config.params.vectors.size}")
                print(f"  Deleting collection '{collection_name}'...")
                client.delete_collection(collection_name)
                raise Exception("Recreating collection")
        except Exception as e:
            if "not found" in str(e).lower() or "Recreating" in str(e):
                print(f"Creating collection '{collection_name}' with vector size {size}...")
                client.create_collection(
                    collection_name=collection_name,
                    vectors_config=rest.VectorParams(
                        size=size,
                        distance=rest.Distance.COSINE,
                    ),
                )
                print(f"✓ Collection '{collection_name}' created successfully")
            else:
                print(f"✗ Error checking collection '{collection_name}': {e}")
                raise
    
    print("\n✓ All collections initialized successfully!")

if __name__ == "__main__":
    init_qdrant_collections()
