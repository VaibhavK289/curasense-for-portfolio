# app.py (updated)
"""
Updated FastAPI app that:
- keeps your original endpoints (/input/, /agent/prelim/, /agent/bestdiag/)
- adds all endpoints expected by your server.js (streaming responses)
- supports /extractMedicalDetails which extracts text from uploaded PDFs (pdfplumber + optional OCR)
- integrates your real CdssPipeline from /mnt/data/flow.py (runs in a thread and appends results to cache/{thread_id}.md)
- exposes a small /cache/{thread_id} debug endpoint and /test-image returning the local uploaded image path
"""

import os
import io
import json
import asyncio
import importlib.util
from concurrent.futures import ThreadPoolExecutor
from typing import Any, List, Optional

from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, PlainTextResponse
from pydantic import BaseModel
from pathlib import Path

# Optional PDF/OCR libs
# pip install pdfplumber pillow pytesseract
try:
    import pdfplumber
except Exception:
    pdfplumber = None

try:
    from PIL import Image
    import pytesseract
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

# -------------------------
# App + basic config
# -------------------------
app = FastAPI(title="CDSS FastAPI (updated)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = Path(__file__).resolve().parent
CACHE_DIR = BASE_DIR / "cache"
UPLOADS_DIR = BASE_DIR / "uploads"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Sample uploaded image path (the path you provided earlier; will be transformed to URL by tooling)
SAMPLE_IMAGE_PATH = "/mnt/data/68a81724-5750-4d86-a492-b77644740b4d.png"

# -------------------------
# Models (your originals)
# -------------------------
class InputText(BaseModel):
    text: str

class ResponseMessage(BaseModel):
    response: str

# -------------------------
# Utilities
# -------------------------
_executor = ThreadPoolExecutor(max_workers=2)

async def _chunk_streamer(lines, delay=0.04):
    """Yield lines as bytes with a short delay (used for streaming endpoints)."""
    for line in lines:
        if not isinstance(line, str):
            line = str(line)
        yield (line + "\n").encode("utf-8")
        await asyncio.sleep(delay)

def append_cache(thread_id: str, text: str):
    """Append text to cache/{thread_id}.md for Node to read later."""
    if not thread_id:
        thread_id = "default"
    p = CACHE_DIR / f"{thread_id}.md"
    with p.open("a", encoding="utf-8") as f:
        f.write(text + "\n")

# -------------------------
# Load flow.py (CdssPipeline)
# -------------------------
FLOW_FILE_PATH = "flow.py"  # <-- replace if different at runtime
CdssPipeline = None
normalize_fn = None

def _load_flow_module(path: str):
    global CdssPipeline, normalize_fn
    try:
        spec = importlib.util.spec_from_file_location("user_flow_module", path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        CdssPipeline = getattr(module, "CdssPipeline", None)
        normalize_fn = getattr(module, "normalize", None)
        if CdssPipeline is None:
            print("CdssPipeline not found in flow module.")
        else:
            print("Loaded CdssPipeline from", path)
    except Exception as e:
        CdssPipeline = None
        normalize_fn = None
        print(f"Warning: failed to load flow module at {path}: {e}")

# Attempt to load on startup
_load_flow_module(FLOW_FILE_PATH)

def _run_pipeline_blocking(sample_text: str, tavily_api: str) -> Any:
    """Blocking call to instantiate and run the CdssPipeline; returns pipeline output/state."""
    if CdssPipeline is None:
        return {"_error": "CdssPipeline not loaded"}

    pipeline = CdssPipeline(sample_text=sample_text, tavily_api=tavily_api)
    try:
        pipeline.kickoff()
    except Exception as e:
        return {"_error": f"pipeline kickoff failed: {e}"}

    # try to fetch typical state keys
    state = getattr(pipeline, "state", {}) or {}
    out = state.get("report") or state.get("final_report") or state.get("prelim_report") or state
    # try to normalize
    if normalize_fn:
        try:
            out = normalize_fn(out)
        except Exception:
            pass
    return out

async def run_pipeline_async(sample_text: str, tavily_api: str) -> Any:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(_executor, _run_pipeline_blocking, sample_text, tavily_api)

# -------------------------
# PDF text extraction helper
# -------------------------
def extract_text_from_pdf_bytes(data: bytes) -> str:
    """
    Blocking extraction of text from PDF bytes.
    - tries pdfplumber for text PDFs
    - falls back to OCR via pytesseract if available
    """
    # Try pdfplumber
    if pdfplumber:
        try:
            text_parts = []
            with pdfplumber.open(io.BytesIO(data)) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        text_parts.append(t)
            joined = "\n".join(text_parts).strip()
            if joined:
                return joined
        except Exception:
            pass

    # Fallback OCR
    if OCR_AVAILABLE:
        try:
            text_parts = []
            if pdfplumber:
                with pdfplumber.open(io.BytesIO(data)) as pdf:
                    for page in pdf.pages:
                        # render as PIL image then OCR
                        pil = page.to_image(resolution=200).original
                        text_parts.append(pytesseract.image_to_string(pil))
            else:
                # if pdfplumber unavailable, attempt to open via PIL (rare)
                img = Image.open(io.BytesIO(data))
                text_parts.append(pytesseract.image_to_string(img))
            return "\n".join(text_parts).strip()
        except Exception:
            pass

    # Could not extract
    return ""

# -------------------------
# Your original endpoints (kept)
# -------------------------
@app.post("/input/", response_model=ResponseMessage)
def send_input_text(input_text: InputText):
    try:
        return {"response": f"Received input: {input_text.text}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/agent/prelim/", response_model=ResponseMessage)
def talk_with_prelim(input_text: InputText):
    try:
        # placeholder; you can hook into pipeline if desired
        return {"response": f"Prelim Agent processed: {input_text.text}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/agent/bestdiag/", response_model=ResponseMessage)
def talk_with_best_diag(input_text: InputText):
    try:
        # placeholder; you can hook into pipeline if desired
        return {"response": f"BestDiag Agent processed: {input_text.text}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# -------------------------
# Endpoints expected by server.js (streaming)
# -------------------------

@app.post("/graphstart")
async def graphstart(request: Request):
    """
    Trigger the real CdssPipeline (if available).
    Expects JSON: { thread_id, text, diagnosis_count, medical_report }
    Streams progress and final result, writes to cache/{thread_id}.md
    """
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")
    sample_text = payload.get("text", "") or ""
    tavily_api = os.getenv("TAVILY_API_KEY", "")

    async def streamer():
        try:
            yield f"[graphstart] starting pipeline for {thread_id}\n".encode()
            yield f"[graphstart] text length: {len(sample_text)}\n".encode()
            yield b"[graphstart] running pipeline (may take a while)...\n"

            # run pipeline
            result = await run_pipeline_async(sample_text, tavily_api)

            # format result for streaming & cache
            try:
                if isinstance(result, (dict, list)):
                    txt = json.dumps(result, indent=2)
                else:
                    txt = str(result)
            except Exception:
                txt = str(result)

            append_cache(thread_id, "\n\n## CdssPipeline result\n" + txt)

            # stream the result
            for line in txt.splitlines():
                yield (line + "\n").encode()
                await asyncio.sleep(0.01)

            yield f"[graphstart] finished for {thread_id}\n".encode()
        except Exception as e:
            yield f"[graphstart] error: {e}\n".encode()

    return StreamingResponse(streamer(), media_type="text/plain")


@app.post("/nerReport")
async def ner_report(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")

    lines = [
        f"[nerReport] generating NER for {thread_id}",
        "NER: AGE -> 42",
        "NER: CONDITION -> diabetes mellitus",
        "NER: SYMPTOM -> polyuria, polydipsia"
    ]
    append_cache(thread_id, "\n".join(lines))
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


@app.post("/prelimReport")
async def prelim_report(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")

    lines = [
        f"[prelimReport] compiling prelim report for {thread_id}",
        "PreliminaryDiagnosis: ExampleConditionA - high probability",
        "Recommendation: Start blood sugar control, follow up in 2 days",
    ]
    append_cache(thread_id, "\n".join(lines))
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


@app.post("/bestpracReport")
async def bestprac_report(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")

    lines = [
        f"[bestpracReport] fetching best practices for {thread_id}",
        "BestPractices: Tight glycemic control; monitor electrolytes",
        "BestPracticesSource: WHO / Diabetes Guidelines (simulated)"
    ]
    append_cache(thread_id, "\n".join(lines))
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


@app.post("/prelimInterruptTrigger")
async def prelim_interrupt(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")
    feedback = payload.get("human_feedback", "")

    lines = [
        f"[prelimInterruptTrigger] ack thread {thread_id}",
        f"[prelimInterruptTrigger] human_feedback_received: {feedback}"
    ]
    if feedback:
        append_cache(thread_id, f"\n\n## Human Feedback\n{feedback}\n\n")
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


@app.post("/extractMedicalDetails")
async def extract_medical_details_endpoint(files: List[UploadFile] = File(...), thread_id: str = Form(...)):
    """
    Accepts multipart files + thread_id, extracts text from PDFs/images, runs CdssPipeline on combined text,
    writes result to cache/{thread_id}.md and streams progress back.
    """
    tavily_api = os.getenv("TAVILY_API_KEY", "")

    # 1) read & extract text from each uploaded file (use executor for blocking IO)
    extracted_texts = []
    loop = asyncio.get_running_loop()
    for upload in files:
        raw = await upload.read()   # bytes
        # run extraction in thread to avoid blocking event loop
        text = await loop.run_in_executor(_executor, extract_text_from_pdf_bytes, raw)
        extracted_texts.append(f"--- {upload.filename} ---\n{text}")

        # save raw file to uploads folder for record
        try:
            save_dir = UPLOADS_DIR / thread_id
            save_dir.mkdir(parents=True, exist_ok=True)
            out_path = save_dir / upload.filename
            out_path.write_bytes(raw)
        except Exception:
            pass

    combined_text = "\n\n".join(extracted_texts).strip() or " "

    async def streamer():
        yield f"[extractMedicalDetails] received {len(files)} file(s) for {thread_id}\n".encode()
        yield f"[extractMedicalDetails] extracted text length: {len(combined_text)} chars\n".encode()
        yield b"[extractMedicalDetails] starting pipeline...\n"

        # run pipeline on extracted text
        result = await run_pipeline_async(combined_text, tavily_api)

        # format for cache and streaming
        try:
            if isinstance(result, (dict, list)):
                txt = json.dumps(result, indent=2)
            else:
                txt = str(result)
        except Exception:
            txt = str(result)

        append_cache(thread_id, "\n\n## extractMedicalDetails result\n" + txt)

        for line in txt.splitlines():
            yield (line + "\n").encode()
            await asyncio.sleep(0.01)

        yield f"[extractMedicalDetails] finished for {thread_id}\n".encode()

    return StreamingResponse(streamer(), media_type="text/plain")


@app.post("/ragSearch")
async def rag_search(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")
    question = payload.get("question", "")
    lines = [f"[ragSearch] started for {thread_id}", f"[ragSearch] query: {question}", "[ragSearch] indexing..."]
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


@app.post("/ragAnswer")
async def rag_answer(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")
    lines = [
        f"[ragAnswer] answering for {thread_id}",
        "RAG Answer: Relevant excerpt 1...",
        "RAG Answer: Final summary..."
    ]
    append_cache(thread_id, "\n".join(lines))
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


@app.post("/input-query")
async def input_query(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")
    query = payload.get("query", "")
    lines = [f"[input-query] received {query} for {thread_id}", "[input-query] running vision model (simulated)"]
    append_cache(thread_id, f"\n\n## PhotoQuery\n{query}\n\n")
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


@app.post("/vision-answer")
async def vision_answer(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")
    lines = [f"[vision-answer] generating for {thread_id}", "Vision: Detected lesion, probability 0.78", "Vision: Suggested next steps..."]
    append_cache(thread_id, "\n".join(lines))
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


@app.post("/vision-feedback")
async def vision_feedback(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")
    query = payload.get("query", "")
    lines = [f"[vision-feedback] received feedback for {thread_id}", f"[vision-feedback] feedback: {query}"]
    append_cache(thread_id, f"\n\n## VisionFeedback\n{query}\n\n")
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


@app.post("/medicalInsightReport")
async def medical_insight_report(request: Request):
    payload = await request.json()
    thread_id = payload.get("thread_id", "unknown")
    lines = [f"[medicalInsightReport] creating insights for {thread_id}", "Insight: Consider endocrine review", "Insight: Consider urgent HbA1c testing"]
    append_cache(thread_id, "\n".join(lines))
    return StreamingResponse(_chunk_streamer(lines), media_type="text/plain")


# -------------------------
# Misc: health, cache, test-image
# -------------------------
@app.get("/health")
async def health():
    return JSONResponse({"ok": True})

@app.get("/cache/{thread_id}")
async def get_cache(thread_id: str):
    p = CACHE_DIR / f"{thread_id}.md"
    if not p.exists():
        return PlainTextResponse("", status_code=204)
    return PlainTextResponse(p.read_text(encoding="utf-8"))

@app.get("/test-image")
async def test_image():
    # return local path; tooling will convert to served URL when needed
    return JSONResponse({"url": SAMPLE_IMAGE_PATH})
