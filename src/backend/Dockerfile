# ============================================================================
# Multi-stage Dockerfile — NestAI Backend + optimization_food + bot-pregnant
# Build context: project root (.)
# ============================================================================

# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM python:3.11-slim AS deps

WORKDIR /tmp

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Unified requirements from project root
COPY requirements.txt ./requirements.txt

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir -r requirements.txt

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

COPY --from=deps /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy backend source
COPY src/backend/ ./

# Copy bot-pregnant agent
COPY src/agents/bot-pregnant/ ./agents/bot-pregnant/

# Copy optimization_food agent
COPY src/agents/__init__.py ./agents/__init__.py
COPY src/agents/optimization_food/ ./agents/optimization_food/

# Ensure vector database directory exists
RUN mkdir -p ./agents/bot-pregnant/data/vectordb


EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

