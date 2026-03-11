FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies (no PyTorch needed — all inference is API-based)
COPY requirements.txt .
RUN pip install --no-cache-dir --timeout=300 -r requirements.txt

# Copy application code
COPY . .

# Create writable directories for ChromaDB and temp files
RUN mkdir -p /app/.chroma /app/logs

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/ping')" || exit 1

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
