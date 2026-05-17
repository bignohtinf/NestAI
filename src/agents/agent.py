"""
Model-agnostic agent loop using LiteLLM.
Receives user input, calls tools as needed, and returns results.
Supports multiple providers like Anthropic, OpenAI, Google, etc.
"""

import json
import logging

import litellm

from .config import (
    ANTHROPIC_API_KEY,
    DEFAULT_MODEL,
    GOOGLE_API_KEY,
    LOG_LEVEL,
    MISTRAL_API_KEY,
    OPENAI_API_KEY,
)
from .tools import execute_tool, get_tool_schemas

# Setup logging
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Configure LiteLLM
litellm.drop_params = True  # Drop unsupported params for different models
# Set API keys in environment for litellm if they are not already there
import os

if ANTHROPIC_API_KEY: os.environ["ANTHROPIC_API_KEY"] = ANTHROPIC_API_KEY
if OPENAI_API_KEY: os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
if GOOGLE_API_KEY: os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
if MISTRAL_API_KEY: os.environ["MISTRAL_API_KEY"] = MISTRAL_API_KEY

SYSTEM_PROMPT = """You are an intelligent AI assistant.
You can use the provided tools to complete tasks.
Think step by step and use tools when necessary."""


def run_agent_loop(user_input: str, model: str = DEFAULT_MODEL, max_turns: int = 10) -> str:
    """
    Run the agent loop: send message -> receive response -> call tool -> repeat.

    Args:
        user_input: User's question or request
        model: Model name in litellm format (e.g., "openai/gpt-4o")
        max_turns: Maximum number of tool-calling turns

    Returns:
        The agent's final response
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_input}
    ]
    tools = get_tool_schemas()

    for turn in range(max_turns):
        logger.info(f"Turn {turn + 1}/{max_turns} using model: {model}")

        response = litellm.completion(
            model=model,
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )

        message = response.choices[0].message
        messages.append(message)

        # If agent stops (no more tool calls)
        if not message.tool_calls:
            return message.content or ""

        # Handle tool calls
        for tool_call in message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            
            logger.info(f"Calling tool: {function_name}({function_args})")
            result = execute_tool(function_name, function_args)
            logger.info(f"Result: {str(result)[:200]}...")

            messages.append({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": function_name,
                "content": str(result),
            })

    return "Agent reached the maximum number of processing turns."


def main():
    """Interactive loop - enter a prompt and receive results."""
    print(f"Model-Agnostic Agentic App (using {DEFAULT_MODEL})")
    print("Type 'quit' to exit")
    print("-" * 50)

    while True:
        user_input = input("\nYou: ").strip()
        if not user_input or user_input.lower() in ("quit", "exit", "q"):
            print("Bye!")
            break

        try:
            response = run_agent_loop(user_input)
            print(f"\nAgent: {response}")
        except Exception as e:
            logger.error(f"Error: {e}")
            print(f"\nError: {e}")


if __name__ == "__main__":
    main()
