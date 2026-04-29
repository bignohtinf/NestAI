import os
import json
from pathlib import Path
import frontmatter
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


class NoriIngestion:
    def __init__(self, db_path=None):
        self.base_dir = Path(__file__).resolve().parents[2]
        self.env_path = self.base_dir / ".env"
        self.load_env_file(self.env_path)
        self.db_path = str(Path(db_path)) if db_path else str(self.base_dir / "data" / "vectordb")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-m3",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        self.header_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[("#", "h1"), ("##", "h2"), ("###", "h3"), ("####", "h4")],
            strip_headers=False,
        )
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

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

            for filename in os.listdir(path):
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