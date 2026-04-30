import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from qdrant_client.http.exceptions import UnexpectedResponse

class NoriRetriever:
    def __init__(self, db_path="./data/vectordb"):
        self.use_qdrant = os.getenv("USE_QDRANT", "0").strip().lower() in ("1", "true", "yes", "on")
        self.db_path = db_path

        # Keep the same default embedding model as ingestion to avoid retrieval drift.
        model_name = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")

        self.embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
            cache_folder="./models",
        )

        if self.use_qdrant:
            self.qdrant_url = os.getenv("QDRANT_URL")
            self.qdrant_api_key = os.getenv("QDRANT_API_KEY")
            self.qdrant_collection = os.getenv("QDRANT_COLLECTION", "bot_pregnant")
            if not self.qdrant_url:
                raise ValueError("Qdrant mode enabled but QDRANT_URL is missing")
            if self.qdrant_api_key:
                self.qdrant = QdrantClient(url=self.qdrant_url, api_key=self.qdrant_api_key)
            else:
                self.qdrant = QdrantClient(url=self.qdrant_url)
            self._log_qdrant_collection_status()
            self._ensure_qdrant_payload_indexes()
        else:
            self.db = Chroma(
                persist_directory=db_path,
                embedding_function=self.embeddings
            )

    def _log_qdrant_collection_status(self):
        try:
            info = self.qdrant.get_collection(self.qdrant_collection)
            print(
                f"[BOT] Qdrant collection '{self.qdrant_collection}' "
                f"(vector_size={info.config.params.vectors.size}, points={info.points_count})"
            )
        except Exception as exc:
            print(f"[BOT] Unable to inspect Qdrant collection '{self.qdrant_collection}': {exc}")

    def _ensure_qdrant_payload_indexes(self):
        for field_name in ("stage", "safety_level"):
            try:
                self.qdrant.create_payload_index(
                    collection_name=self.qdrant_collection,
                    field_name=field_name,
                    field_schema=rest.PayloadSchemaType.KEYWORD,
                    wait=True,
                )
                print(f"[BOT] Ensured Qdrant payload index for '{field_name}'")
            except Exception as exc:
                # Continue startup even if index operation is unsupported/temporary failed.
                print(f"[BOT] Could not ensure payload index '{field_name}': {exc}")

    @staticmethod
    def _normalize_stage(stage: str) -> str:
        stage = stage.strip().lower()
        if stage.startswith("week_"):
            try:
                week = int(stage.split("_", 1)[1])
            except ValueError:
                return stage

            if 1 <= week <= 12:
                return "3_thang_dau"
            if 13 <= week <= 27:
                return "3_thang_giua"
            if 28 <= week <= 42:
                return "3_thang_cuoi"
            return stage

        if stage.startswith("postpartum_"):
            return "postpartum"

        return stage

    def retrieve(self, query, stage=None, safety_filter=None):
        """
        Truy xuất có lọc theo Metadata (tuần thai, mức độ an toàn)
        """
        if self.use_qdrant:
            return self._retrieve_qdrant(query, stage=stage, safety_filter=safety_filter)

        search_kwargs = {"k": 5}

        if stage:
            normalized_stage = self._normalize_stage(stage)
            search_kwargs["filter"] = {"stage": normalized_stage}

        if safety_filter:
            filter_obj = search_kwargs.get("filter", {})
            filter_obj["safety_level"] = safety_filter
            search_kwargs["filter"] = filter_obj

        docs = self.db.similarity_search(query, **search_kwargs)
        return docs

    def _retrieve_qdrant(self, query, stage=None, safety_filter=None):
        query_vector = self.embeddings.embed_query(query)

        must_conditions = []
        if stage:
            normalized_stage = self._normalize_stage(stage)
            must_conditions.append(
                rest.FieldCondition(
                    key="stage",
                    match=rest.MatchValue(value=normalized_stage),
                )
            )
        if safety_filter:
            must_conditions.append(
                rest.FieldCondition(
                    key="safety_level",
                    match=rest.MatchValue(value=safety_filter),
                )
            )

        query_filter = rest.Filter(must=must_conditions) if must_conditions else None

        try:
            result = self.qdrant.query_points(
                collection_name=self.qdrant_collection,
                query=query_vector,
                limit=5,
                query_filter=query_filter,
            )
        except UnexpectedResponse as exc:
            error_text = str(exc)
            if query_filter is not None and "Index required but not found" in error_text:
                print("[BOT] Missing Qdrant payload index, retrying retrieval without filter.")
                result = self.qdrant.query_points(
                    collection_name=self.qdrant_collection,
                    query=query_vector,
                    limit=5,
                )
            else:
                raise

        docs = []
        for point in result.points:
            payload = point.payload or {}
            metadata = payload.get("metadata", {})
            if not isinstance(metadata, dict):
                metadata = {"metadata": metadata}

            docs.append(
                Document(
                    page_content=payload.get("content", ""),
                    metadata=metadata,
                )
            )

        return docs