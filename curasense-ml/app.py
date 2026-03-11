import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# Thread pool for running blocking operations
executor = ThreadPoolExecutor(max_workers=3)

# Initialize Groq client
groq_client = None


def get_groq_client():
    """Lazy load Groq client."""
    global groq_client
    if groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            groq_client = Groq(api_key=api_key)
    return groq_client


# Lazy import to avoid loading heavy ML models at startup
def get_pipeline():
    from flow import CdssPipeline

    return CdssPipeline


def get_pdf_parser():
    from src.pdf_parser import process_pdf_file

    return process_pdf_file


# Initialize the FastAPI app
app = FastAPI()

# Mount static files directory
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

# Add CORS middleware (adjust for production)
# Note: allow_origins=["*"] with allow_credentials=True is invalid per CORS spec.
# In production, set specific origins. For dev, use credentials=False with wildcard.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint for Docker/ECS
@app.get("/health")
def health():
    return {"status": "ok"}


# Input/Output Models
class InputText(BaseModel):
    text: str


class ResponseMessage(BaseModel):
    response: str


class DiagnosisResponse(BaseModel):
    status: str
    report: str | None = None
    error: str | None = None


# Mock functions for agents (replace with actual Mini-CDSS logic)
def talk_to_prelim_agent(input_text: str) -> str:
    """
    Simulates communication with the Prelim agent.
    Replace with the actual logic from the Mini-CDSS repository.
    """
    return f"Prelim Agent processed: {input_text}"


def talk_to_best_diag_agent(input_text: str) -> str:
    """
    Simulates communication with the BestDiag agent.
    Replace with the actual logic from the Mini-CDSS repository.
    """
    return f"BestDiag Agent processed: {input_text}"


# API Endpoints


@app.post("/input/", response_model=ResponseMessage)
def send_input_text(input_text: InputText):
    """
    Endpoint to send input text.
    """
    try:
        # Simply return the received text for now
        return {"response": f"Received input: {input_text.text}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/agent/prelim/", response_model=ResponseMessage)
def talk_with_prelim(input_text: InputText):
    """
    Endpoint to communicate with the Prelim agent.
    """
    try:
        response = talk_to_prelim_agent(input_text.text)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/agent/bestdiag/", response_model=ResponseMessage)
def talk_with_best_diag(input_text: InputText):
    """
    Endpoint to communicate with the BestDiag agent.
    """
    try:
        response = talk_to_best_diag_agent(input_text.text)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/diagnose/text/", response_model=DiagnosisResponse)
async def diagnose_text(input_text: InputText):
    """
    Run the complete CuraSense Diagnosis pipeline on text input.
    """
    try:
        # Get Tavily API key from environment
        tavily_api = os.getenv("TAVILY_API_KEY")
        if not tavily_api:
            return {
                "status": "error",
                "error": "TAVILY_API_KEY not found in environment variables",
            }

        # Lazy load and initialize the pipeline
        CdssPipeline = get_pipeline()
        pipeline = CdssPipeline(sample_text=input_text.text, tavily_api=tavily_api)

        # Run blocking kickoff in thread pool to avoid asyncio conflict
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(executor, pipeline.kickoff)

        # The pipeline returns the report content directly in-memory
        # (no longer reads from report.md — fixes race condition with concurrent requests)
        report = str(result) if result else "No report generated"

        return {"status": "success", "report": report}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/diagnose/pdf/", response_model=DiagnosisResponse)
async def diagnose_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file and run the complete CuraSense Diagnosis pipeline.
    """
    try:
        # Validate file type
        if not file.filename.endswith(".pdf"):
            return {"status": "error", "error": "Only PDF files are supported"}

        # Read file content
        file_content = await file.read()

        # Lazy load PDF parser and extract text (synchronous call)
        process_pdf_file = get_pdf_parser()
        pdf_result = process_pdf_file(file_content)

        if pdf_result["status"] == "error":
            return {"status": "error", "error": pdf_result["error"]}

        extracted_text = pdf_result["text"]

        # Get Tavily API key from environment
        tavily_api = os.getenv("TAVILY_API_KEY")
        if not tavily_api:
            return {
                "status": "error",
                "error": "TAVILY_API_KEY not found in environment variables",
            }

        # Lazy load and initialize the pipeline
        CdssPipeline = get_pipeline()
        pipeline = CdssPipeline(sample_text=extracted_text, tavily_api=tavily_api)

        # Run blocking kickoff in thread pool to avoid asyncio conflict
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(executor, pipeline.kickoff)

        # The pipeline returns the report content directly in-memory
        # (no longer reads from report.md — fixes race condition with concurrent requests)
        report = str(result) if result else "No report generated"

        return {"status": "success", "report": report}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.get("/", response_class=HTMLResponse)
async def root():
    """
    Serve the main dashboard HTML page.
    """
    with open("frontend/dashboard.html", "r", encoding="utf-8") as f:
        return f.read()


@app.get("/simple", response_class=HTMLResponse)
async def simple_interface():
    """
    Serve the simple frontend HTML page.
    """
    with open("frontend/index.html", "r", encoding="utf-8") as f:
        return f.read()


class ChatMessage(BaseModel):
    message: str
    report_context: str = None  # The complete diagnosis report for context
    conversation_history: list = []  # Optional: Previous messages for context


@app.post("/api/chat")
async def chat_endpoint(chat_msg: ChatMessage):
    """
    Intelligent AI chatbot powered by Groq (openai/gpt-oss-120b) that can answer questions
    about uploaded reports and final clinical diagnosis reports.
    """
    try:
        client = get_groq_client()

        if not client:
            # Fallback to basic response if Groq is not configured
            return {
                "response": "⚠️ AI assistant is not fully configured. Please add your GROQ_API_KEY to the .env file to enable advanced chat features.\n\nFor now, I can still help with basic information about CuraSense Diagnosis. What would you like to know?"
            }

        # Build the system prompt with medical context
        system_prompt = """You are a medical AI assistant for CuraSense Diagnosis. Help users understand their medical reports clearly and concisely.

Guidelines:
- Answer in 2-4 short paragraphs maximum
- Use simple, direct language without excessive medical jargon
- Focus on the key points that matter most
- When listing items, use simple bullet points (not numbered or formatted headers)
- Be conversational and friendly, not overly formal
- Always remind users to consult their doctor for medical decisions

Format your responses naturally without markdown headers (##), bold (**), or excessive formatting."""

        # Build the conversation messages
        messages = [{"role": "system", "content": system_prompt}]

        # Add report context if available
        if chat_msg.report_context and len(chat_msg.report_context.strip()) > 50:
            context_message = f"""Medical Report Context:
{chat_msg.report_context[:8000]}

Answer questions about this report concisely."""
            messages.append({"role": "system", "content": context_message})

        # Add conversation history if available
        if chat_msg.conversation_history:
            messages.extend(
                chat_msg.conversation_history[-10:]
            )  # Keep last 10 messages

        # Add the current user message
        messages.append({"role": "user", "content": chat_msg.message})

        # Call Groq API
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            executor,
            lambda: client.chat.completions.create(
                model="openai/gpt-oss-120b",  # Using Groq's OpenAI GPT-OSS 120B model
                messages=messages,
                temperature=0.5,
                max_tokens=500,
            ),
        )

        assistant_response = response.choices[0].message.content

        return {"response": assistant_response, "model": "openai/gpt-oss-120b (Groq)"}

    except Exception as e:
        # Fallback response on error
        error_msg = str(e)
        if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
            return {
                "response": "⚠️ Groq API key is not configured or invalid. Please check your .env file and ensure GROQ_API_KEY is set correctly.\n\nGet your free API key at: https://console.groq.com\n\nI can still provide basic assistance. What would you like to know?"
            }
        else:
            return {
                "response": f"I encountered an issue processing your request. Please try again. If you have a specific question about your report, I'll do my best to help!\n\nError: {error_msg}"
            }


# Fallback helper functions (kept for backward compatibility)
def extract_medicines_from_text(text: str) -> list[str]:
    """Extract medicine names from report text."""
    medicines = []
    lines = text.split("\n")
    for line in lines:
        # Look for common medicine patterns
        if any(
            keyword in line.lower()
            for keyword in ["tablet", "mg", "capsule", "syrup", "injection"]
        ):
            # Extract potential medicine name (first word before dosage)
            words = line.strip().split()
            if words and not words[0].startswith("#"):
                medicines.append(words[0])
    return medicines[:10]  # Return up to 10 medicines


def extract_section(text: str, section_name: str) -> str:
    """Extract a specific section from the report."""
    lines = text.split("\n")
    section_content = []
    capturing = False

    for line in lines:
        if section_name.lower() in line.lower():
            capturing = True
            continue
        elif capturing and line.startswith("#"):
            # Hit the next section header, stop capturing
            break
        elif capturing:
            section_content.append(line)

    return "\n".join(section_content).strip()


class CompareRequest(BaseModel):
    medicines: list[str]


@app.post("/api/compare")
async def compare_medicines(request: CompareRequest):
    """
    Compare multiple medicines (basic implementation).
    In production, this would integrate with medical databases.
    """
    medicines = request.medicines

    if len(medicines) < 2:
        raise HTTPException(
            status_code=400, detail="At least 2 medicines required for comparison"
        )

    # Mock comparison data - in production, integrate with medical database
    comparison_results = []
    for medicine in medicines:
        comparison_results.append(
            {
                "name": medicine,
                "category": "Antibiotic" if "cillin" in medicine.lower() else "Unknown",
                "commonUses": "Bacterial infections",
                "sideEffects": "Nausea, diarrhea, allergic reactions",
                "contraindications": "Known allergy to the medicine",
                "interactions": "May interact with anticoagulants",
                "dosage": "As prescribed by physician",
            }
        )

    return {"comparison": comparison_results}
