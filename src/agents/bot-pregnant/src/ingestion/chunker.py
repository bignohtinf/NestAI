from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

class NoriChunker:
    def __init__(self):
        self.header_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[
                ("#", "h1"),
                ("##", "h2"),
                ("###", "h3"),
                ("####", "h4"),
            ],
            strip_headers=False,
        )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=120,
            separators=["\n\n", "\n", ". ", "? ", "! ", " ", ""]
        )

    def chunk_document(self, doc_content, file_metadata):
        sections = self.header_splitter.split_text(doc_content)
        
        final_chunks = []
        for section in sections:
            sub_chunks = self.text_splitter.split_documents([section])
            
            for chunk in sub_chunks:
                chunk.metadata.update(file_metadata)
                
                # Gắn ngữ cảnh tiêu đề lớn vào nội dung để tăng recall khi search.
                if "h1" in chunk.metadata:
                    chunk.page_content = f"Chủ đề: {chunk.metadata['h1']}\n{chunk.page_content}"
                
                final_chunks.append(chunk)
                
        return final_chunks