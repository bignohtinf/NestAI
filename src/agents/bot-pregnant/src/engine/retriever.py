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

    def retrieve(self, query, stage=None, safety_filter=None):
        """
        Truy xuất có lọc theo Metadata (tuần thai, mức độ an toàn)
        """
        search_kwargs = {"k": 5}
        
        # Tạo bộ lọc nếu người dùng cung cấp thông tin giai đoạn thai kỳ
        if stage:
            search_kwargs["filter"] = {"stage": {"$in": [stage, "all"]}}

        if safety_filter:
            filter_obj = search_kwargs.get("filter", {})
            filter_obj["safety_level"] = safety_filter
            search_kwargs["filter"] = filter_obj
            
        docs = self.db.similarity_search(query, **search_kwargs)
        return docs