"""
Multi-Dish Processor for handling arrays of detected dishes.

This service processes multiple detected dishes from vision analysis,
matches each dish independently against the nutrition database,
and aggregates nutrition values across all dishes.
"""

import logging
from typing import List, Optional, Dict, Any
from app.services.embedding_service import EmbeddingService
from app.services.vector_search_service import VectorSearchService

logger = logging.getLogger(__name__)


class MultiDishProcessor:
    """
    Processes multiple detected dishes from a meal photo.
    
    Handles:
    - Independent matching of each dish against the nutrition database
    - Aggregation of nutrition values across all dishes
    - Null handling for unmatched dishes
    - Pregnancy-specific benefit analysis
    """
    
    def __init__(self, supabase_client, embedding_service: Optional[EmbeddingService] = None):
        """
        Initialize the multi-dish processor.
        
        Args:
            supabase_client: Supabase client for database queries.
            embedding_service: Optional EmbeddingService instance. If not provided,
                             a new instance will be created.
        
        Raises:
            ValueError: If supabase_client is None.
        """
        if supabase_client is None:
            raise ValueError("supabase_client cannot be None")
        
        self.supabase = supabase_client
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_search_service = VectorSearchService(supabase_client)
    
    def process_dishes(self, dishes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process multiple detected dishes and match each against the database.
        
        Args:
            dishes: List of detected dishes from vision analysis.
                   Each dish should have: name, estimated_grams, confidence
        
        Returns:
            List of processed dishes with matched nutrition data.
            Each dish contains: name, confidence, estimated_grams, matched_food,
            match_score, calories, protein, carbs, fat, iron, calcium,
            pregnancy_benefit, portion_multiplier
        
        Raises:
            ValueError: If dishes is invalid.
            RuntimeError: If processing fails.
        """
        if not dishes or not isinstance(dishes, list):
            raise ValueError("Dishes must be a non-empty list")
        
        if not all(isinstance(d, dict) for d in dishes):
            raise ValueError("All items in dishes must be dictionaries")
        
        try:
            processed_dishes = []
            
            for dish in dishes:
                processed_dish = self.match_single_dish(dish)
                processed_dishes.append(processed_dish)
            
            logger.info(f"Processed {len(processed_dishes)} dishes")
            return processed_dishes
        
        except Exception as e:
            error_msg = f"Failed to process dishes: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
    
    def match_single_dish(self, dish: Dict[str, Any]) -> Dict[str, Any]:
        """
        Match a single detected dish against the nutrition database.
        
        Args:
            dish: Dictionary containing detected dish information.
                 Expected keys: name, estimated_grams, confidence
        
        Returns:
            Dictionary containing matched nutrition data:
            - name: detected dish name
            - confidence: AI confidence score
            - estimated_grams: estimated portion size
            - matched_food: matched database entry or None
            - match_score: similarity score (0-1)
            - is_low_confidence: boolean flag for matches with score 0.50-0.60
            - calories: calculated calories
            - protein: calculated protein
            - carbs: calculated carbohydrates
            - fat: calculated fat
            - iron: iron content or None
            - calcium: calcium content or None
            - pregnancy_benefit: pregnancy-specific guidance
            - portion_multiplier: standard portion multiplier
        
        Raises:
            ValueError: If dish is invalid.
            RuntimeError: If matching fails.
        """
        if not dish or not isinstance(dish, dict):
            raise ValueError("Dish must be a non-empty dictionary")
        
        try:
            dish_name = dish.get("name") or "Unknown"
            estimated_grams = float(dish.get("estimated_grams") or 0.0)
            confidence = float(dish.get("confidence") or 0.0)
            
            # Generate embedding for the detected dish name
            try:
                embedding = self.embedding_service.embed_text(dish_name)
            except Exception as e:
                logger.warning(f"Failed to generate embedding for '{dish_name}': {str(e)}")
                embedding = None
            
            # Search for similar dishes
            matched_food = None
            match_score = 0.0
            is_low_confidence = False
            
            if embedding and self.vector_search_service._verify_pgvector_available():
                try:
                    search_results = self.vector_search_service.search_similar_dishes(
                        embedding, top_k=5
                    )
                    
                    if search_results:
                        # Get the top match
                        top_match = search_results[0]
                        match_score = top_match.get("match_score", 0.0)
                        
                        # Set matched_food if score is above 0.50 threshold
                        if match_score >= 0.50:
                            matched_food = top_match
                            # Flag as low confidence if score is between 0.50 and 0.60
                            if match_score < 0.60:
                                is_low_confidence = True
                                logger.debug(f"Low confidence match (score {match_score}) for '{dish_name}'")
                        else:
                            logger.debug(f"Match score {match_score} below threshold for '{dish_name}'")
                
                except Exception as e:
                    logger.warning(f"Vector search failed for '{dish_name}': {str(e)}")
                    # Fallback to difflib
                    search_results = self.vector_search_service.fallback_search(dish_name, top_k=5)
                    if search_results:
                        top_match = search_results[0]
                        match_score = top_match.get("match_score", 0.0)
                        if match_score >= 0.50:
                            matched_food = top_match
                            if match_score < 0.60:
                                is_low_confidence = True
            else:
                # Fallback to difflib
                try:
                    search_results = self.vector_search_service.fallback_search(dish_name, top_k=5)
                    if search_results:
                        top_match = search_results[0]
                        match_score = top_match.get("match_score", 0.0)
                        if match_score >= 0.50:
                            matched_food = top_match
                            if match_score < 0.60:
                                is_low_confidence = True
                except Exception as e:
                    logger.warning(f"Fallback search failed for '{dish_name}': {str(e)}")
            
            # Calculate nutrition values
            calories = 0.0
            protein = 0.0
            carbs = 0.0
            fat = 0.0
            iron = None
            calcium = None
            portion_multiplier = 1.0
            
            if matched_food and match_score >= 0.50:
                # Extract nutrition data from matched food
                energy_per_100g = float(matched_food.get("energy") or 0.0)
                protein_per_100g = float(matched_food.get("protein") or 0.0)
                carbs_per_100g = float(matched_food.get("carbohydrate") or 0.0)
                fat_per_100g = float(matched_food.get("fat") or 0.0)
                iron = matched_food.get("iron")
                calcium = matched_food.get("calcium")
                
                # Calculate portion multiplier (estimated_grams / 100)
                portion_multiplier = max(0.1, estimated_grams / 100.0) if estimated_grams > 0 else 1.0
                
                # Calculate nutrition values for the estimated portion
                calories = round(energy_per_100g * portion_multiplier, 1)
                protein = round(protein_per_100g * portion_multiplier, 1)
                carbs = round(carbs_per_100g * portion_multiplier, 1)
                fat = round(fat_per_100g * portion_multiplier, 1)
                
                # Scale iron and calcium if available
                if iron is not None:
                    iron = round(float(iron) * portion_multiplier, 2)
                if calcium is not None:
                    calcium = round(float(calcium) * portion_multiplier, 2)
            
            # Generate pregnancy benefit text
            pregnancy_benefit = self._generate_pregnancy_benefit(matched_food, match_score)
            
            return {
                "name": dish_name,
                "confidence": round(confidence, 3),
                "estimated_grams": round(estimated_grams, 1),
                "matched_food": matched_food,
                "match_score": round(match_score, 4),
                "is_low_confidence": is_low_confidence,
                "calories": calories,
                "protein": protein,
                "carbs": carbs,
                "fat": fat,
                "iron": iron,
                "calcium": calcium,
                "pregnancy_benefit": pregnancy_benefit,
                "portion_multiplier": round(portion_multiplier, 2),
            }
        
        except Exception as e:
            error_msg = f"Failed to match single dish: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
    
    def aggregate_nutrition(self, matched_dishes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregate nutrition values across multiple matched dishes.
        
        Args:
            matched_dishes: List of processed dishes with nutrition data.
        
        Returns:
            Dictionary containing aggregated nutrition values:
            - total_calories: sum of all calories
            - total_protein: sum of all protein
            - total_carbs: sum of all carbohydrates
            - total_fat: sum of all fat
            - total_iron: sum of all iron (if available)
            - total_calcium: sum of all calcium (if available)
            - dish_count: number of dishes processed
            - matched_count: number of successfully matched dishes
        
        Raises:
            ValueError: If matched_dishes is invalid.
        """
        if not matched_dishes or not isinstance(matched_dishes, list):
            raise ValueError("matched_dishes must be a non-empty list")
        
        if not all(isinstance(d, dict) for d in matched_dishes):
            raise ValueError("All items in matched_dishes must be dictionaries")
        
        try:
            total_calories = 0.0
            total_protein = 0.0
            total_carbs = 0.0
            total_fat = 0.0
            total_iron = 0.0
            total_calcium = 0.0
            matched_count = 0
            has_iron = False
            has_calcium = False
            
            for dish in matched_dishes:
                # Only aggregate if dish was matched
                if dish.get("matched_food") is not None:
                    matched_count += 1
                    total_calories += float(dish.get("calories") or 0.0)
                    total_protein += float(dish.get("protein") or 0.0)
                    total_carbs += float(dish.get("carbs") or 0.0)
                    total_fat += float(dish.get("fat") or 0.0)
                    
                    if dish.get("iron") is not None:
                        total_iron += float(dish.get("iron"))
                        has_iron = True
                    
                    if dish.get("calcium") is not None:
                        total_calcium += float(dish.get("calcium"))
                        has_calcium = True
            
            # Generate aggregated guidance
            guidance_points = []
            if total_protein > 20:
                guidance_points.append("Bữa ăn cung cấp dồi dào protein cho sự phát triển của thai nhi")
            elif total_protein > 10:
                guidance_points.append("Bữa ăn cung cấp lượng protein vừa phải")
            else:
                guidance_points.append("Mẹ nên bổ sung thêm thực phẩm giàu protein (thịt, cá, trứng) cho bữa ăn tiếp theo")
                
            if has_iron and total_iron > 3.0:
                guidance_points.append("giàu sắt giúp phòng chống thiếu máu")
                
            if has_calcium and total_calcium > 200:
                guidance_points.append("nhiều canxi hỗ trợ xương cho bé")
                
            pregnancy_guidance = ", ".join(guidance_points) + "." if guidance_points else "Bữa ăn cung cấp năng lượng cơ bản cho mẹ bầu."
            
            aggregation = {
                "total_calories": round(total_calories, 1),
                "total_protein": round(total_protein, 1),
                "total_carbs": round(total_carbs, 1),
                "total_fat": round(total_fat, 1),
                "total_iron": round(total_iron, 2) if has_iron else None,
                "total_calcium": round(total_calcium, 2) if has_calcium else None,
                "dish_count": len(matched_dishes),
                "matched_count": matched_count,
                "pregnancy_guidance": pregnancy_guidance,
            }
            
            logger.info(f"Aggregated nutrition for {matched_count}/{len(matched_dishes)} dishes")
            return aggregation
        
        except Exception as e:
            error_msg = f"Failed to aggregate nutrition: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
    
    def _generate_pregnancy_benefit(
        self,
        matched_food: Optional[Dict[str, Any]],
        match_score: float
    ) -> str:
        """
        Generate pregnancy-specific benefit text based on matched food.
        
        Args:
            matched_food: Matched database entry or None.
            match_score: Similarity score (0-1).
        
        Returns:
            Pregnancy-specific guidance text.
        """
        if not matched_food or match_score < 0.50:
            return "Món ăn được phân tích bởi AI; hiện chưa có dữ liệu khớp chính xác với DB để đánh giá dinh dưỡng."
        
        try:
            # Extract nutrition data
            protein = float(matched_food.get("protein") or 0.0)
            iron = matched_food.get("iron")
            calcium = matched_food.get("calcium")
            dish_type = (matched_food.get("dish_type") or "").lower()
            
            # Generate benefit based on nutritional profile
            benefits = []
            
            if protein > 15:
                benefits.append("giàu protein cho sự phát triển của thai nhi")
            
            if iron and float(iron) > 2.0:
                benefits.append("giàu sắt giúp phòng chống thiếu máu")
            
            if calcium and float(calcium) > 100:
                benefits.append("giàu canxi cho sự phát triển xương của thai nhi")
            
            if "canh" in dish_type or "rau" in dish_type:
                benefits.append("giàu nước và vi chất")
            
            if benefits:
                return "Món ăn này " + ", ".join(benefits) + "."
            
            return "Món ăn này cung cấp năng lượng và chất dinh dưỡng cần thiết cho mẹ bầu."
        
        except Exception as e:
            logger.warning(f"Failed to generate pregnancy benefit: {str(e)}")
            return "Món ăn này cung cấp năng lượng và chất dinh dưỡng cần thiết cho mẹ bầu."
