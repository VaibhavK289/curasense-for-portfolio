@echo off
REM ============================================================
REM  ML-FastAPI Vision Server - Standalone Launcher
REM  Starts only the Vision/X-ray analysis backend on port 8001
REM ============================================================
REM
REM  For the full stack, use start_servers.bat in the project root.
REM
REM  Prerequisites:
REM    - Conda environment: curasense_vision_env
REM    - Dependencies installed: pip install -r requirements.txt
REM ============================================================

echo Starting ML-FastAPI Vision Server...
echo.

cd /d D:\final_curasense\ml-fastapi
call conda activate curasense_vision_env

echo Server starting on http://127.0.0.1:8001
echo.

uvicorn main:app --reload --host 127.0.0.1 --port 8001
pause
