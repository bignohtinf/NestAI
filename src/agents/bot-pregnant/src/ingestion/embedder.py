import json
import os
import time
import uuid
from pathlib import Path

import frontmatter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from tqdm import tqdm


class NoriIngestion:
    def __init__(self, db_path=None):
        self.base_dir = Path(__file__).resolve().parents[2]
        self.env_path = self.base_dir / ".env"
        self.load_env_file(self.env_path)
        # Fallback to project root .env when running from repo root / backend container.
        self.load_env_file(self.base_dir.parents[2] / ".env")
        self.db_path = str(Path(db_path)) if db_path else str(self.base_dir / "data" / "vectordb")
        embedding_model = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
        self.embeddings = HuggingFaceEmbeddings(
            model_name=embedding_model,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        self.header_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[("#", "h1"), ("##", "h2"), ("###", "h3"), ("####", "h4")],
            strip_headers=False,
        )
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

        self.use_qdrant = self._env_flag("USE_QDRANT")
        self.qdrant_url = os.getenv("QDRANT_URL")
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY")
        self.qdrant_collection = os.getenv("QDRANT_COLLECTION", "bot_pregnant")
        # Default dimension for BAAI/bge-m3 embeddings.
        self.qdrant_vector_size = int(os.getenv("QDRANT_VECTOR_SIZE", "1024"))
        self.qdrant_batch_size = int(os.getenv("QDRANT_BATCH_SIZE", "64"))
        self.embedding_batch_size = int(os.getenv("EMBEDDING_BATCH_SIZE", "64"))
        self.qdrant_timeout = int(os.getenv("QDRANT_TIMEOUT_SECONDS", "180"))
        self.qdrant_max_retries = int(os.getenv("QDRANT_MAX_RETRIES", "4"))
        self.qdrant_recreate_collection = self._env_flag("QDRANT_RECREATE_COLLECTION")

        if self.use_qdrant:
            self._validate_qdrant_config()
            self.qdrant_client = QdrantClient(
                url=self.qdrant_url,
                api_key=self.qdrant_api_key,
                timeout=self.qdrant_timeout,
            )

    def load_env_file(self, env_path: Path):
        """Load biến môi trường từ file .env của bot-pregnant."""
        if not env_path.exists():
            print(f"[WARN] Không tìm thấy file .env: {env_path}")
            return

        for line in env_path.read_text(encoding="utf-8").splitlines():
            raw = line.strip()
            if not raw or raw.startswith("#") or "=" not in raw:
                continue
            key, value = raw.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value

    def _env_flag(self, key: str) -> bool:
        return os.getenv(key, "").strip().lower() in ("1", "true", "yes", "on")

    def _validate_qdrant_config(self):
        if not self.qdrant_url:
            raise ValueError("Missing QDRANT_URL for Qdrant ingestion")
        if not self.qdrant_api_key:
            raise ValueError("Missing QDRANT_API_KEY for Qdrant ingestion")

    def _create_qdrant_collection(self):
        exists = self.qdrant_client.collection_exists(self.qdrant_collection)
        if not exists:
            print(f"[QDRANT] Creating collection: {self.qdrant_collection}")
            self.qdrant_client.create_collection(
                collection_name=self.qdrant_collection,
                vectors_config=rest.VectorParams(
                    size=self.qdrant_vector_size,
                    distance=rest.Distance.COSINE,
                ),
            )
            return

        info = self.qdrant_client.get_collection(self.qdrant_collection)
        current_size = info.config.params.vectors.size
        if current_size != self.qdrant_vector_size:
            print(
                f"[QDRANT] Vector size mismatch for '{self.qdrant_collection}': "
                f"{current_size} != {self.qdrant_vector_size}, recreating..."
            )
            self.qdrant_client.delete_collection(self.qdrant_collection)
            self.qdrant_client.create_collection(
                collection_name=self.qdrant_collection,
                vectors_config=rest.VectorParams(
                    size=self.qdrant_vector_size,
                    distance=rest.Distance.COSINE,
                ),
            )
            return

        if self.qdrant_recreate_collection:
            print(f"[QDRANT] Recreating collection by config: {self.qdrant_collection}")
            self.qdrant_client.delete_collection(self.qdrant_collection)
            self.qdrant_client.create_collection(
                collection_name=self.qdrant_collection,
                vectors_config=rest.VectorParams(
                    size=self.qdrant_vector_size,
                    distance=rest.Distance.COSINE,
                ),
            )
            return

        print(f"[QDRANT] Using existing collection: {self.qdrant_collection}")

    def _upsert_batch_with_retry(self, batch, start: int, end: int):
        for attempt in range(1, self.qdrant_max_retries + 1):
            try:
                self.qdrant_client.upsert(
                    collection_name=self.qdrant_collection,
                    points=batch,
                    wait=True,
                )
                return
            except Exception as exc:
                if attempt >= self.qdrant_max_retries:
                    raise
                sleep_seconds = min(20, 2 ** attempt)
                print(
                    f"[QDRANT] Upsert batch {start}-{end} failed (attempt {attempt}/"
                    f"{self.qdrant_max_retries}): {exc}. Retrying in {sleep_seconds}s..."
                )
                time.sleep(sleep_seconds)

    def _upsert_documents_to_qdrant(self, documents):
        print(f"[QDRANT] Preparing {len(documents)} vectors for upsert")
        texts = [doc.page_content for doc in documents]
        vectors = []
        total_embed_batches = (len(texts) + self.embedding_batch_size - 1) // self.embedding_batch_size
        for start in tqdm(
            range(0, len(texts), self.embedding_batch_size),
            total=total_embed_batches,
            desc="Embedding texts",
            unit="batch",
        ):
            text_batch = texts[start:start + self.embedding_batch_size]
            vectors.extend(self.embeddings.embed_documents(text_batch))

        points = []
        for doc, vector in tqdm(
            zip(documents, vectors, strict=False),
            total=len(documents),
            desc="Building points",
            unit="point",
        ):
            payload = {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "source_file": doc.metadata.get("source_file"),
                "stage": doc.metadata.get("stage"),
                "safety_level": doc.metadata.get("safety_level"),
            }
            points.append(
                rest.PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload=payload,
                )
            )

        total_batches = (len(points) + self.qdrant_batch_size - 1) // self.qdrant_batch_size
        for start in tqdm(
            range(0, len(points), self.qdrant_batch_size),
            total=total_batches,
            desc="Qdrant upsert",
            unit="batch",
        ):
            batch = points[start:start + self.qdrant_batch_size]
            print(f"[QDRANT] Upserting batch {start}-{start + len(batch)}")
            self._upsert_batch_with_retry(batch, start, start + len(batch))

    def load_metadata(self, metadata_path):
        """Đọc file JSON metadata."""
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    def build_vinmec_metadata_map(self, metadata_path):
        """vinmec.json là list object -> map theo title."""
        raw_data = self.load_metadata(metadata_path)
        if not isinstance(raw_data, list):
            return {}

        metadata_map = {}
        for item in raw_data:
            if isinstance(item, dict) and item.get("title"):
                metadata_map[item["title"].strip()] = item
        return metadata_map

    def _load_post(self, file_path):
        """
        Parse markdown + frontmatter.
        Trả về None nếu frontmatter không nằm đầu file để tránh ingest lỗi.
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            raw_text = f.read()

        if raw_text.lstrip().startswith("---") and not raw_text.startswith("---"):
            print(f"[WARN] Bỏ qua file frontmatter không ở đầu: {file_path}")
            return None

        post = frontmatter.loads(raw_text)
        if not isinstance(post.metadata, dict):
            print(f"[WARN] Metadata không hợp lệ: {file_path}")
            return None
        return post

    def _flatten_metadata(self, metadata):
        """Convert complex metadata to Chroma-compatible format (str, int, float, bool only)."""
        flattened = {}
        for key, value in metadata.items():
            if isinstance(value, (str, int, float, bool)):
                flattened[key] = value
            elif isinstance(value, (list, dict)):
                # Serialize complex types to JSON string
                flattened[key] = json.dumps(value, ensure_ascii=False)
            elif value is None:
                flattened[key] = ""
            else:
                flattened[key] = str(value)
        return flattened

    def process_file(self, file_path, metadata_info):
        """Parse file MD, gộp metadata và chia nhỏ."""
        post = self._load_post(file_path)
        if post is None:
            return []

        content = post.content
        file_meta = post.metadata.copy()

        segments = self.header_splitter.split_text(content)
        final_docs = []
        for seg in segments:
            chunks = self.text_splitter.split_documents([seg])
            for chunk in chunks:
                chunk.metadata.update(file_meta)
                if isinstance(metadata_info, dict):
                    chunk.metadata.update(metadata_info)
                chunk.metadata["file_path"] = file_path
                chunk.metadata["source_file"] = os.path.basename(file_path)
                # Flatten metadata to ensure Chroma compatibility
                chunk.metadata = self._flatten_metadata(chunk.metadata)
                final_docs.append(chunk)
        return final_docs

    def run_pipeline(self, data_dirs):
        """Chạy pipeline ingestion cho tất cả thư mục nguồn."""
        all_documents = []

        for category, path in data_dirs.items():
            print(f"--- Đang xử lý nhóm: {category} ---")
            if not os.path.isdir(path):
                print(f"[WARN] Không tìm thấy thư mục: {path}")
                continue

            vinmec_meta_map = {}
            if category == "vinmec":
                vinmec_meta_path = self.base_dir / "data" / "processed" / "metadata" / "vinmec.json"
                vinmec_meta_map = self.build_vinmec_metadata_map(str(vinmec_meta_path))

            md_files = sorted([name for name in os.listdir(path) if name.endswith(".md")])
            for filename in tqdm(md_files, desc=f"Processing {category}", unit="file"):
                if filename.endswith(".md"):
                    file_path = os.path.join(path, filename)

                    metadata_info = {}
                    if category == "vinmec":
                        post = self._load_post(file_path)
                        if post is None:
                            print(f"[SKIP] {filename}")
                            continue
                        title = str(post.metadata.get("title", "")).strip()
                        metadata_info = vinmec_meta_map.get(title, {})
                        if title and not metadata_info:
                            print(f"[WARN] Không tìm thấy metadata theo title: {title}")
                    else:
                        json_name = f"{os.path.splitext(filename)[0]}.json"
                        meta_path = self.base_dir / "data" / "processed" / "metadata" / json_name
                        loaded_meta = self.load_metadata(str(meta_path))
                        if isinstance(loaded_meta, dict):
                            metadata_info = loaded_meta

                    docs = self.process_file(file_path, metadata_info)
                    all_documents.extend(docs)
                    print(f"Đã xử lý xong {filename} với {len(docs)} chunks.")

        if not all_documents:
            raise ValueError("Không có document nào để tạo vector DB.")

        if self.use_qdrant:
            print(f"\nĐang khởi tạo Qdrant collection: {self.qdrant_collection}...")
            self._create_qdrant_collection()
            self._upsert_documents_to_qdrant(all_documents)
            print("Hoàn thành! Dữ liệu đã sẵn sàng trong Qdrant.")
            return self.qdrant_client

        print(f"\nĐang khởi tạo Vector DB tại {self.db_path}...")
        vectorstore = Chroma.from_documents(
            documents=all_documents,
            embedding=self.embeddings,
            persist_directory=self.db_path
        )
        print("Hoàn thành! Dữ liệu đã sẵn sàng để truy vấn.")
        return vectorstore

# --- CHẠY THỬ ---
if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parents[2]
    DATA_DIRS = {
        "health_care": str(base_dir / "data" / "processed" / "health_care"),
        "vinmec": str(base_dir / "data" / "processed" / "vinmec"),
    }
    
    ingestion = NoriIngestion()
    vector_db = ingestion.run_pipeline(DATA_DIRS)