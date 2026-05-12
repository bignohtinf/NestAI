# ============================================================================
# Dockerfile — Bot-Pregnant RAG Service (port 8001)
# Build context: project root (.)
#
# Stage model: model BAAI/bge-m3 được bake vào image khi build
# → Cloud Run không cần download lại mỗi lần cold start (~1.5GB)
# ============================================================================

# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM python:3.11-slim AS deps

WORKDIR /tmp

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Reuse unified requirements from project root
COPY requirements.txt ./requirements.txt

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir -r requirements.txt

# ─── Stage 2: Download model (bake vào image) ────────────────────────────────
FROM deps AS model-downloader

ENV PATH="/opt/venv/bin:$PATH"
ENV HF_HOME=/model-cache

# Download BAAI/bge-m3 tại build time — chỉ chạy 1 lần, không download lại khi deploy
ARG HF_TOKEN=""
ENV HF_TOKEN=$HF_TOKEN

RUN python -c "\
from huggingface_hub import snapshot_download; \
import os; \
token = os.getenv('HF_TOKEN') or None; \
snapshot_download('BAAI/bge-m3', cache_dir='/model-cache', token=token, ignore_patterns=['*.msgpack','*.h5','flax_model*','tf_model*'])"

# ─── Stage 3: Runtime ────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

RUN groupadd -r appgroup && useradd -r -g appgroup -m appuser

WORKDIR /app

COPY --from=deps --chown=appuser:appgroup /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy model đã download vào image — không cần HF_TOKEN lúc runtime
COPY --from=model-downloader --chown=appuser:appgroup /model-cache /app/models/hub
ENV HF_HOME=/app/models

# Copy bot-pregnant source
COPY --chown=appuser:appgroup src/agents/bot-pregnant/ ./

# Ensure vector database directory exists
RUN mkdir -p ./data/vectordb && \
    chown -R appuser:appgroup ./data

USER appuser

EXPOSE 8001

# start_period dài hơn vì model load từ disk (~15-30s)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

CMD ["uvicorn", "service:app", "--host", "0.0.0.0", "--port", "8001"]
