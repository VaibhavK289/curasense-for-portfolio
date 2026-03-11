FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PDF processing and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch first (prevents ~3.5 GB CUDA download)
RUN pip install --no-cache-dir --timeout=300 \
    torch==2.5.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --timeout=300 -r requirements.txt

# Pre-download the HuggingFace NER model into the image
# This prevents 60s+ cold start on first /diagnose/text/ request
RUN python -c "\
from transformers import AutoTokenizer, AutoModelForTokenClassification; \
AutoTokenizer.from_pretrained('Clinical-AI-Apollo/Medical-NER'); \
AutoModelForTokenClassification.from_pretrained('Clinical-AI-Apollo/Medical-NER')"

# Copy application code
COPY . .

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
