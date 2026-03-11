# CuraSense Medicine Intelligence Backend

FastAPI backend powering the CuraSense Medicine Hub. Provides medicine lookup, drug interaction checking, symptom-based recommendations, medicine comparison, and AI-powered medicine image scanning.

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | FastAPI |
| LLM | Google Gemini 2.5 Flash, Groq (fallback) |
| Search | Tavily Search API |
| Vector DB | ChromaDB |
| Embeddings | Sentence-Transformers (all-MiniLM-L6-v2) |
| Vision | Gemini Vision API |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns `{"status":"ok"}` |
| `GET` | `/medicine/{name}` | Get full medicine info (uses, side effects, alternatives) |
| `POST` | `/recommend` | Get medicine recommendations for symptoms |
| `POST` | `/interaction` | Check interaction between two medicines |
| `POST` | `/compare` | Compare two medicines side-by-side |
| `POST` | `/compare-images` | Compare medicines from uploaded images |
| `POST` | `/analyze-image` | Analyze medicine image (label/packaging) |

### Request/Response Examples

**Medicine Lookup:**
```
GET /medicine/paracetamol
Response: { basic_info, pros, cons, similar_medicines, detailed_analysis }
```

**Symptom Recommendations:**
```json
POST /recommend
{ "symptoms": "headache and fever", "user_context": {} }
Response: { recommendations: [...] }
```

**Drug Interaction:**
```json
POST /interaction
{ "medicine1": "aspirin", "medicine2": "warfarin" }
Response: { interaction_data }
```

**Medicine Image Analysis:**
```
POST /analyze-image
Content-Type: multipart/form-data
image: [medicine_photo.jpg]
Response: { medicine_info, extracted_name, detailed_analysis }
```

---

## Architecture

```
app/
├── main.py                    # FastAPI entry point with CORS
├── api/
│   └── routes.py              # All endpoint definitions
├── services/
│   ├── medicine_insight.py    # Core medicine lookup (Gemini + Tavily)
│   ├── vision.py              # Gemini Vision image extraction
│   ├── vision_rag.py          # Vision -> RAG chain (image -> medicine info)
│   ├── rag_service.py         # RAG with ChromaDB
│   ├── retrieval.py           # Web search retrieval
│   └── chat_service.py        # Medicine chat service
├── schemas/
│   └── medicine.py            # Pydantic request/response models
└── core/
    └── config.py              # Settings (env vars)
```

### Service Chain for Image Analysis

```
Upload Image
    -> VisionService.extract_medicine_info() [Gemini Vision]
    -> Extract medicine name from image
    -> MedicineInsightService.get_full_insight(name) [Gemini + Tavily]
    -> Return combined vision + knowledge results
```

---

## Setup

### Prerequisites

- Python 3.10+
- Conda (Miniconda or Anaconda)

### Installation

```bash
conda create -n curasense_medicine_env python=3.10 -y
conda activate curasense_medicine_env
pip install -r requirements.txt
```

### Environment Variables

Create `.env` in the project root:

```env
GEMINI_API_KEY="your-gemini-api-key"
GROQ_API_KEY="your-groq-api-key"
TAVILY_API_KEY="your-tavily-api-key"
HF_TOKEN="your-huggingface-token"
```

### Run

```bash
conda activate curasense_medicine_env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8002
```

> **Note:** First startup takes **60-120 seconds** because it loads the `all-MiniLM-L6-v2` sentence-transformers model and initializes ChromaDB collections.

### Health Check

```bash
curl http://127.0.0.1:8002/health
# {"status":"ok"}
```

---

## Integration with CuraSense Frontend

The frontend proxies all medicine requests through Next.js API routes:

| Frontend Route | Backend Endpoint |
|---|---|
| `/api/medicine/[name]` | `GET /medicine/{name}` |
| `/api/medicine/recommend` | `POST /recommend` |
| `/api/medicine/interaction` | `POST /interaction` |
| `/api/medicine/compare` | `POST /compare` |
| `/api/medicine/analyze-image` | `POST /analyze-image` |

The frontend `.env.development` must include:

```env
MEDICINE_API_URL="http://127.0.0.1:8002"
```

---

## License

MIT
