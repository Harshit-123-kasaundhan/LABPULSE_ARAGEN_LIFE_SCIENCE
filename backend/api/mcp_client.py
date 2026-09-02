import json
import httpx
from typing import Dict, Any, List
from ..mcp_server.core.config import config
from mcp.client.sse import sse_client
from mcp import ClientSession

class MCPClient:
    def __init__(self):
        self.server_url = config.MCP_SERVER_URL
        
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """
        Calls an MCP tool over SSE transport.
        """
        # The FastMCP server using `run(transport="sse")` uses a specific path structure.
        # Typically it exposes /sse as the endpoint. Let's assume standard FastMCP behavior.
        # For a robust implementation, we might need a longer lived session, 
        # but for simplicity in this stateless API, we open/close.
        
        # NOTE: FastMCP's built-in run() uses /sse for the endpoint when transport="sse".
        url = self.server_url if self.server_url.endswith("/sse") else f"{self.server_url}/sse"
        if not url.startswith("http"):
            url = f"http://{config.MCP_SERVER_HOST}:{config.MCP_SERVER_PORT}/sse"

        try:
            async with sse_client(url, timeout=30.0) as streams:
                async with ClientSession(streams[0], streams[1]) as session:
                    await session.initialize()
                    result = await session.call_tool(tool_name, arguments)
                    
                    if getattr(result, "isError", False):
                        error_msg = result.content[0].text if result.content else "Unknown tool error"
                        raise Exception(f"Tool error from {tool_name}: {error_msg}")
                        
                    # Result is a CallToolResult. Text content is in result.content[0].text or result.content[0]["text"]
                    if result.content and len(result.content) > 0:
                        content_item = result.content[0]
                        if isinstance(content_item, dict):
                            # The tool returns dicts, not json strings now!
                            # Wait, the FastMCP framework itself wraps the tool's return value.
                            # If the tool returned a dict, does FastMCP JSON serialize it, or just return the dict?
                            # FastMCP translates dicts to TextContent(text=json.dumps(dict)) according to the spec, 
                            # but sometimes returns it directly as a dict in the client.
                            if "text" in content_item:
                                return content_item["text"]
                            else:
                                # It might just BE the dict returned by the tool. We should json.dumps it to match agent.py expectation.
                                import json
                                return json.dumps(content_item)
                        else:
                            # It's an object (TextContent)
                            return content_item.text
                    return ""
        except Exception as e:
            raise Exception(f"Failed to call MCP tool '{tool_name}': {e}")
            
    async def check_health(self) -> bool:
        """Checks if the MCP server is reachable."""
        try:
            # We ping the base URL. FastMCP will return a 404, but that's fine. 
            # We just want to know if the server is up and listening without hanging on a streaming endpoint.
            url = f"http://{config.MCP_SERVER_HOST}:{config.MCP_SERVER_PORT}/"
                
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(url)
                # If we get a response (even a 404), the server is alive.
                return True
        except httpx.RequestError:
            # Connection refused, timeout, etc.
            return False
        except Exception:
            return False

mcp_client = MCPClient()
