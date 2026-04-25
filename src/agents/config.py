import os
from dotenv import load_dotenv

load_dotenv()

# API Keys for different providers
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")

# Default model (using litellm format, e.g., "anthropic/claude-3-5-sonnet-20240620" or "openai/gpt-4o")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "anthropic/claude-3-5-sonnet-20240620")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
