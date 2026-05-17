"""
Tool definitions for the agent.
Add new tools by creating a function and registering it in the TOOLS dict.
"""

import json

import httpx


def search_web(query: str) -> str:
    """Search for information on the web (placeholder)."""
    return f"Search results for: {query}"


def calculate(expression: str) -> str:
    """Evaluate a math expression."""
    try:
        # Note: eval is dangerous, this is just for demonstration
        result = eval(expression, {"__builtins__": {}})
        return str(result)
    except Exception as e:
        return f"Error: {e}"


def fetch_url(url: str) -> str:
    """Fetch content from a URL."""
    try:
        resp = httpx.get(url, timeout=10, follow_redirects=True)
        return resp.text[:2000]
    except Exception as e:
        return f"Error: {e}"


# Tool registry - the agent uses this dict
# Parameters follow JSON Schema format
TOOLS = {
    "search_web": {
        "fn": search_web,
        "description": "Search for information on the web",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query"}
            },
            "required": ["query"],
        },
    },
    "calculate": {
        "fn": calculate,
        "description": "Evaluate a math expression",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {"type": "string", "description": "The math expression to evaluate"}
            },
            "required": ["expression"],
        },
    },
    "fetch_url": {
        "fn": fetch_url,
        "description": "Fetch content from a URL",
        "parameters": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "The URL to fetch"}
            },
            "required": ["url"],
        },
    },
}


def get_tool_schemas() -> list[dict]:
    """Return tool schemas in a format compatible with litellm (OpenAI format)."""
    schemas = []
    for name, tool in TOOLS.items():
        schemas.append({
            "type": "function",
            "function": {
                "name": name,
                "description": tool["description"],
                "parameters": tool["parameters"],
            }
        })
    return schemas


def execute_tool(name: str, args_json: str | dict) -> str:
    """Execute a tool by name."""
    tool = TOOLS.get(name)
    if not tool:
        return f"Tool '{name}' does not exist"
    
    if isinstance(args_json, str):
        try:
            args = json.loads(args_json)
        except json.JSONDecodeError:
            return f"Error: Invalid JSON arguments for tool '{name}'"
    else:
        args = args_json
        
    try:
        return tool["fn"](**args)
    except Exception as e:
        return f"Error executing tool '{name}': {e}"
