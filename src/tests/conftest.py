"""Shared fixtures for NestAI test suite."""
import sys
from pathlib import Path

# ── Ensure project roots are importable ──────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parents[1]  # src/

# Add paths so tests can import from agents and backend
sys.path.insert(0, str(PROJECT_ROOT / "agents" / "optimization_food"))
sys.path.insert(0, str(PROJECT_ROOT / "agents" / "bot-pregnant"))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))
