from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

class NoriRetriever:
    def __init__(self, db_path="./data/vectordb"):
        embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-m3",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
            cache_folder="./models",  # Cache locally
        )
        self.db = Chroma(
            persist_directory=db_path,
            embedding_function=embeddings
        )

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