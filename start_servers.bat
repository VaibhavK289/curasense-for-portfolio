@echo off
REM ============================================================
REM  CuraSense - Full Stack Server Launcher
REM  Starts all 4 services: ML Backend, Vision API, Medicine
REM  Model, and Next.js Frontend
REM ============================================================
REM
REM  Prerequisites:
REM    - Conda environments: curasense_env, curasense_vision_env,
REM      curasense_medicine_env
REM    - Node.js and npm installed
REM    - All dependencies installed (pip install -r requirements.txt
REM      for each backend, npm install for frontend)
REM
REM  Port Assignments:
REM    8000  - CuraSense ML (diagnosis, chat, compare)
REM    8001  - ML-FastAPI Vision (X-ray, medical imaging)
REM    8002  - Medicine Model (medicine hub, scanner)
REM    3000  - Next.js Frontend
REM
REM  If port 8000 is blocked by a ghost socket, change ML_PORT
REM  below to 8003 and update .env.development accordingly.
REM ============================================================

setlocal

REM --- Configuration ---
set ML_PORT=8000
set VISION_PORT=8001
set MEDICINE_PORT=8002
set FRONTEND_PORT=3000

set ML_DIR=D:\final_curasense\curasense-ml
set VISION_DIR=D:\final_curasense\ml-fastapi
set MEDICINE_DIR=E:\medicine_model_curasense
set FRONTEND_DIR=D:\final_curasense\curasense-frontend

set ML_ENV=curasense_env
set VISION_ENV=curasense_vision_env
set MEDICINE_ENV=curasense_medicine_env

echo.
echo  ============================================================
echo   CuraSense - Starting All Services
echo  ============================================================
echo.
echo   [1] CuraSense ML      - port %ML_PORT%  (diagnosis, chat, compare)
echo   [2] ML-FastAPI Vision  - port %VISION_PORT%  (X-ray, medical imaging)
echo   [3] Medicine Model     - port %MEDICINE_PORT%  (medicine hub, scanner)
echo   [4] Next.js Frontend   - port %FRONTEND_PORT%  (web application)
echo.
echo  ============================================================
echo.

REM --- Start CuraSense ML Backend ---
echo [1/4] Starting CuraSense ML Backend on port %ML_PORT%...
start "CuraSense ML (port %ML_PORT%)" cmd /k "cd /d %ML_DIR% && conda activate %ML_ENV% && uvicorn app:app --reload --host 127.0.0.1 --port %ML_PORT%"

REM Wait for conda activation and initial import
timeout /t 5 /nobreak >nul

REM --- Start Vision API ---
echo [2/4] Starting ML-FastAPI Vision on port %VISION_PORT%...
start "ML-FastAPI Vision (port %VISION_PORT%)" cmd /k "cd /d %VISION_DIR% && conda activate %VISION_ENV% && uvicorn main:app --reload --host 127.0.0.1 --port %VISION_PORT%"

timeout /t 3 /nobreak >nul

REM --- Start Medicine Model Backend ---
echo [3/4] Starting Medicine Model on port %MEDICINE_PORT%...
echo       (This takes 60-120 seconds to load sentence-transformers model)
start "Medicine Model (port %MEDICINE_PORT%)" cmd /k "cd /d %MEDICINE_DIR% && conda activate %MEDICINE_ENV% && uvicorn app.main:app --reload --host 127.0.0.1 --port %MEDICINE_PORT%"

timeout /t 3 /nobreak >nul

REM --- Start Next.js Frontend ---
echo [4/4] Starting Next.js Frontend on port %FRONTEND_PORT%...
start "CuraSense Frontend (port %FRONTEND_PORT%)" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

echo.
echo  ============================================================
echo   All 4 services are starting...
echo  ============================================================
echo.
echo   CuraSense ML:      http://127.0.0.1:%ML_PORT%
echo   Vision API:        http://127.0.0.1:%VISION_PORT%
echo   Medicine Model:    http://127.0.0.1:%MEDICINE_PORT%  (wait 60-120s)
echo   Frontend:          http://localhost:%FRONTEND_PORT%
echo.
echo   NOTE: The Medicine Model takes 60-120 seconds to start
echo   because it loads the sentence-transformers model and
echo   ChromaDB collections on first import.
echo.
echo   If port %ML_PORT% is blocked, close this script, change
echo   ML_PORT to 8003, and update BACKEND_API_URL in
echo   curasense-frontend\.env.development to match.
echo.
echo  ============================================================
echo.
echo  Press any key to open the frontend in your browser...
pause >nul

start http://localhost:%FRONTEND_PORT%

echo.
echo  Frontend opened in browser!
echo  To stop all services, close each terminal window.
echo.
pause
