from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Request
import traceback

from app.api.routes import router
from app.core.logger import setup_logger, get_logger


# ----------------------------------------
# Setup Logging
# ----------------------------------------
setup_logger()
logger = get_logger("main")


# ----------------------------------------
# Create App
# ----------------------------------------
app = FastAPI(
    title="Medicine AI API",
    description="AI-powered medicine comparison, recommendation & chat system",
    version="1.0.0",
)


# ----------------------------------------
# CORS (for frontend integration)
# ----------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------------------
# Include Routes
# ----------------------------------------
app.include_router(router)


# ----------------------------------------
# Global Exception Handler
# ----------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    logger.error(traceback.format_exc())

    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ----------------------------------------
# Health Check
# ----------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}
