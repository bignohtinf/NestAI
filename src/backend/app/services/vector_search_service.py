"""
Vector Search Service for semantic similarity search using pgvector.

This service performs semantic similarity search against the nutrition database
using pre-generated vector embeddings and pgvector queries.
"""

import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class VectorSearchService:
    """
    Performs semantic similarity search using pgvector.
    
    Queries the nutrition_database table for dishes similar to a detected dish
    based on vector embeddings and cosine similarity.
    """
    
    def __init__(self, supabase_client):
        """
        Initialize the vector search service.
        
        Args:
            supabase_client: Supabase client for database queries.
        
        Raises:
            ValueError: If supabase_client is None.
        """
        if supabase_client is None:
            raise ValueError("supabase_client cannot be None")
        
        self.supabase = supabase_client
        self._verify_pgvector_available()
    
    def _verify_pgvector_available(self) -> bool:
        """
        Verify that pgvector extension is available in the database.
        
        Returns:
            True if pgvector is available, False otherwise.
        
        Raises:
            RuntimeError: If database query fails.
        """
        try:
            # Query to check if pgvector extension exists
            result = self.supabase.rpc("check_pgvector_available").execute()
            
            if result.data is None or result.data is False:
                logger.warning("pgvector extension not available in database")
                return False
            
            logger.info("pgvector extension verified as available")
            return True
        except Exception as e:
            logger.warning(f"Could not verify pgvector availability: {str(e)}")
            # Don't raise - allow fallback to difflib
            return False
    
    def search_similar_dishes(
        self,
        embedding: List[float],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for the top-k most similar dishes using vector similarity.
        
        Uses pgvector's cosine similarity to find dishes with embeddings
        most similar to the provided embedding.
        
        Args:
            embedding: The embedding vector to search for (384-dimensional).
            top_k: Number of top matches to return (default 5).
        
        Returns:
            List of dictionaries containing matched dishes with scores,
            sorted by similarity score in descending order.
            Each dict contains: stt, dish_name_vi, dish_name_en, match_score,
            energy, protein, fat, carbohydrate, iron, calcium, dish_type.
        
        Raises:
            ValueError: If embedding is invalid or top_k is invalid.
            RuntimeError: If database query fails.
        """
        if not embedding or not isinstance(embedding, list):
            raise ValueError("Embedding must be a non-empty list")
        
        if len(embedding) != 384:
            raise ValueError(f"Embedding must be 384-dimensional, got {len(embedding)}")
        
        if top_k <= 0 or top_k > 100:
            raise ValueError("top_k must be between 1 and 100")
        
        try:
            # Convert embedding to string format for pgvector query
            embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
            
            # Query using pgvector cosine similarity
            # The <=> operator computes cosine distance (1 - cosine_similarity)
            # We order by distance ascending to get most similar first
            result = self.supabase.rpc(
                "search_similar_dishes",
                {
                    "query_embedding": embedding_str,
                    "similarity_threshold": 0.0,  # Return all results, filter by score later
                    "limit_count": top_k
                }
            ).execute()
            
            if not result.data:
                logger.debug("No similar dishes found for embedding")
                return []
            
            # Process results and calculate match scores
            matches = []
            for item in result.data:
                # Calculate cosine similarity from distance
                # pgvector returns distance, we convert to similarity
                distance = item.get("distance", 1.0)
                match_score = max(0.0, 1.0 - distance)  # Convert distance to similarity
                
                match_dict = {
                    "stt": item.get("stt"),
                    "dish_name_vi": item.get("dish_name_vi"),
                    "dish_name_en": item.get("dish_name_en"),
                    "dish_type": item.get("dish_type"),
                    "match_score": round(match_score, 4),
                    "energy": item.get("energy"),
                    "protein": item.get("protein"),
                    "fat": item.get("fat"),
                    "carbohydrate": item.get("carbohydrate"),
                    "iron": item.get("iron"),
                    "calcium": item.get("calcium"),
                }
                matches.append(match_dict)
            
            # Verify results are sorted by score descending
            matches.sort(key=lambda x: x["match_score"], reverse=True)
            
            logger.debug(f"Found {len(matches)} similar dishes")
            return matches
        
        except Exception as e:
            error_msg = f"Failed to search similar dishes: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
    
    def get_match_score(
        self,
        detected_name: str,
        db_dish: Dict[str, Any]
    ) -> float:
        """
        Calculate a match score between a detected dish name and a database dish.
        
        This is a utility method for comparing a detected name with a specific
        database entry. The actual similarity search uses vector embeddings.
        
        Args:
            detected_name: The detected dish name from vision analysis.
            db_dish: Dictionary containing database dish information.
        
        Returns:
            Match score between 0.0 and 1.0.
        
        Raises:
            ValueError: If inputs are invalid.
        """
        if not detected_name or not isinstance(detected_name, str):
            raise ValueError("detected_name must be a non-empty string")
        
        if not db_dish or not isinstance(db_dish, dict):
            raise ValueError("db_dish must be a non-empty dictionary")
        
        # This method is primarily for reference/documentation
        # Actual matching is done via vector similarity in search_similar_dishes
        # This could be used for fallback scoring if needed
        
        detected_lower = detected_name.strip().lower()
        db_name_vi = (db_dish.get("dish_name_vi") or "").strip().lower()
        db_name_en = (db_dish.get("dish_name_en") or "").strip().lower()
        
        # Simple string matching for fallback
        if detected_lower == db_name_vi or detected_lower == db_name_en:
            return 1.0
        
        if detected_lower in db_name_vi or detected_lower in db_name_en:
            return 0.8
        
        return 0.0
    
    def fallback_search(
        self,
        detected_name: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Fallback search using difflib when pgvector is unavailable.
        
        Args:
            detected_name: The detected dish name to search for.
            top_k: Number of top matches to return.
        
        Returns:
            List of matched dishes sorted by relevance.
        """
        if not detected_name or not isinstance(detected_name, str):
            raise ValueError("detected_name must be a non-empty string")
        
        try:
            import difflib
            normalized_name = detected_name.strip().lower()
            
            # Fetch all dish names to do difflib comparison
            select_fields = "stt, dish_name_vi, dish_name_en, dish_type, energy, protein, fat, carbohydrate, iron, calcium"
            result = self.supabase.table("nutrition_database").select(select_fields).execute()
            
            matches = []
            if result.data:
                # Use difflib to find closest matches
                dish_names = [item.get("dish_name_vi", "").lower() for item in result.data if item.get("dish_name_vi")]
                closest_matches = difflib.get_close_matches(normalized_name, dish_names, n=top_k, cutoff=0.3)
                
                # Retrieve the full records for the matches
                for match_name in closest_matches:
                    for item in result.data:
                        if item.get("dish_name_vi", "").lower() == match_name:
                            # Calculate a simple match score based on difflib ratio
                            score = difflib.SequenceMatcher(None, normalized_name, match_name).ratio()
                            match_dict = {
                                "stt": item.get("stt"),
                                "dish_name_vi": item.get("dish_name_vi"),
                                "dish_name_en": item.get("dish_name_en"),
                                "dish_type": item.get("dish_type"),
                                "match_score": round(score, 4),
                                "energy": item.get("energy"),
                                "protein": item.get("protein"),
                                "fat": item.get("fat"),
                                "carbohydrate": item.get("carbohydrate"),
                                "iron": item.get("iron"),
                                "calcium": item.get("calcium"),
                            }
                            matches.append(match_dict)
                            break
                            
            logger.info(f"Fallback search found {len(matches)} matches for '{detected_name}'")
            # Sort by match score descending
            matches.sort(key=lambda x: x["match_score"], reverse=True)
            return matches[:top_k]
        
        except Exception as e:
            error_msg = f"Fallback search failed: {str(e)}"
            logger.error(error_msg)
            # Return empty list instead of raising to avoid breaking the application
            return []
