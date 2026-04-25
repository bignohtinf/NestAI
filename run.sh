#!/bin/bash

# NestAI: Unified Startup Script
# This script handles setup and execution for Backend, Frontend, and Optimization Agent.

# Get the absolute path of the script directory
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}       NestAI Development Suite        ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}Root Directory: ${ROOT_DIR}${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}
trap cleanup SIGINT

# 1. Setup Optimization Agent (Crawler)
setup_agent() {
    echo -e "${GREEN}[1/3] Setting up Optimization Agent...${NC}"
    if [ -d "$ROOT_DIR/src/agents/optimization_food" ]; then
        cd "$ROOT_DIR/src/agents/optimization_food"
        if [ ! -d ".venv" ]; then
            python3 -m venv .venv
        fi
        source .venv/bin/activate
        pip install -q -r requirements.txt
    else
        echo -e "${YELLOW}Warning: Optimization agent directory not found at $ROOT_DIR/src/agents/optimization_food${NC}"
    fi
}

# 2. Setup & Start Backend
start_backend() {
    echo -e "${GREEN}[2/3] Starting Backend (FastAPI)...${NC}"
    if [ -d "$ROOT_DIR/src/backend" ]; then
        cd "$ROOT_DIR/src/backend"
        if [ ! -d ".venv" ]; then
            python3 -m venv .venv
        fi
        source .venv/bin/activate
        pip install -q -r requirements.txt
        
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}Warning: .env not found in backend. Copying .env.example...${NC}"
            cp .env.example .env
        fi
        
        python3 main.py &
        BACKEND_PID=$!
    else
        echo -e "${YELLOW}Error: Backend directory not found at $ROOT_DIR/src/backend${NC}"
    fi
}

# 3. Setup & Start Frontend
start_frontend() {
    echo -e "${GREEN}[3/3] Starting Frontend (Next.js)...${NC}"
    if [ -d "$ROOT_DIR/src/frontend" ]; then
        cd "$ROOT_DIR/src/frontend"
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}Installing npm packages (this may take a minute)...${NC}"
            npm install --silent
        fi
        
        npm run dev &
        FRONTEND_PID=$!
    else
        echo -e "${YELLOW}Error: Frontend directory not found at $ROOT_DIR/src/frontend${NC}"
    fi
}

# --- Execution ---

setup_agent
start_backend
start_frontend

echo -e "${BLUE}---------------------------------------${NC}"
echo -e "${GREEN}SUCCESS: Systems are initializing!${NC}"
echo -e "${BLUE}Backend:  ${NC}http://localhost:8000"
echo -e "${BLUE}Frontend: ${NC}http://localhost:3000"
echo -e "${BLUE}Docs:     ${NC}http://localhost:8000/docs"
echo -e "${YELLOW}Press Ctrl+C to stop all servers.${NC}"
echo -e "${BLUE}---------------------------------------${NC}"

# Keep script running to maintain background processes
wait
