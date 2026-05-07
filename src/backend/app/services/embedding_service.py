"""
Embedding Service for generating vector embeddings using pre-trained models.

This service handles loading and caching of embedding models, generating
embeddings for detected dish names, and normalizing vectors for consistent
cosine similarity calculations.
"""

import logging
from typing import List, Optional
import numpy as np

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Manages embedding generation using pre-trained multilingual models.
    
    Supports single and batch embedding generation with automatic model
    loading and error handling.
    """
    
    _instance = None
    _model = None
    _model_name = None
    
    def __new__(cls, model_name: str = "intfloat/multilingual-e5-small"):
        """Singleton pattern to ensure only one model is loaded."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self, model_name: str = "intfloat/multilingual-e5-small"):
        """
        Initialize the embedding service with a pre-trained model.
        
        Args:
            model_name: HuggingFace model identifier for the embedding model.
                       Defaults to multilingual-e5-small for Vietnamese support.
        
        Raises:
            RuntimeError: If model loading fails.
        """
        if self._initialized:
            return
        
        self._model_name = model_name
        self._load_model()
        self._initialized = True
    
    def _load_model(self) -> None:
        """
        Load the pre-trained embedding model.
        
        Raises:
            RuntimeError: If model loading fails.
        """
        try:
            from sentence_transformers import SentenceTransformer
            
            logger.info(f"Loading embedding model: {self._model_name}")
            EmbeddingService._model = SentenceTransformer(self._model_name)
            logger.info(f"Successfully loaded embedding model: {self._model_name}")
        except ImportError as e:
            error_msg = f"sentence-transformers library not installed: {str(e)}"
            logger.error(error_msg)
            # Do not raise, allow initialization without model so fallback works
            EmbeddingService._model = None
        except Exception as e:
            error_msg = f"Failed to load embedding model {self._model_name}: {str(e)}"
            logger.error(error_msg)
            # Do not raise, allow initialization without model so fallback works
            EmbeddingService._model = None
    
    def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text string.
        
        Args:
            text: The text to embed (e.g., detected dish name).
        
        Returns:
            List of floats representing the normalized embedding vector.
        
        Raises:
            ValueError: If text is empty or None.
            RuntimeError: If embedding generation fails.
        """
        if not text or not isinstance(text, str):
            raise ValueError("Text must be a non-empty string")
        
        try:
            if EmbeddingService._model is None:
                raise RuntimeError("Embedding model not loaded")
            
            # Generate embedding
            embedding = EmbeddingService._model.encode(text, convert_to_numpy=True)
            
            # Normalize to unit length for consistent cosine similarity
            normalized = self._normalize_vector(embedding)
            
            return normalized.tolist()
        except Exception as e:
            error_msg = f"Failed to generate embedding for text '{text}': {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
    
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple text strings in batch.
        
        Args:
            texts: List of texts to embed (e.g., dish names from database).
        
        Returns:
            List of normalized embedding vectors.
        
        Raises:
            ValueError: If texts is empty or contains invalid items.
            RuntimeError: If batch embedding generation fails.
        """
        if not texts or not isinstance(texts, list):
            raise ValueError("Texts must be a non-empty list")
        
        if not all(isinstance(t, str) for t in texts):
            raise ValueError("All items in texts must be strings")
        
        try:
            if EmbeddingService._model is None:
                raise RuntimeError("Embedding model not loaded")
            
            # Generate embeddings for all texts
            embeddings = EmbeddingService._model.encode(texts, convert_to_numpy=True)
            
            # Normalize each embedding to unit length
            normalized_embeddings = []
            for embedding in embeddings:
                normalized = self._normalize_vector(embedding)
                normalized_embeddings.append(normalized.tolist())
            
            return normalized_embeddings
        except Exception as e:
            error_msg = f"Failed to generate batch embeddings: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
    
    @staticmethod
    def _normalize_vector(vector: np.ndarray) -> np.ndarray:
        """
        Normalize a vector to unit length (L2 normalization).
        
        This ensures consistent cosine similarity calculations across
        all embeddings.
        
        Args:
            vector: NumPy array representing the embedding vector.
        
        Returns:
            Normalized NumPy array with unit length.
        """
        norm = np.linalg.norm(vector)
        if norm == 0:
            return vector
        return vector / norm
    
    @classmethod
    def reset(cls) -> None:
        """
        Reset the singleton instance (useful for testing).
        
        This clears the cached model and allows a new instance to be created.
        """
        cls._instance = None
        cls._model = None
        cls._model_name = None
