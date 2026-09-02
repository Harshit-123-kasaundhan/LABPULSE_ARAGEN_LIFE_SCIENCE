const API_BASE = "http://localhost:8000";

export async function analyzeLabs(requestData) {
  const res = await fetch(`${API_BASE}/analyze_labs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestData)
  });
  
  if (!res.ok) {
    if (res.status === 422) {
      // Return details for inline errors if any
      const errorData = await res.json();
      throw { status: 422, data: errorData };
    }
    throw { status: res.status, message: "Analysis service unavailable" };
  }
  
  return res.json();
}

export async function getHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    return { status: "error", mcp_server: "unreachable" };
  }
  return { status: "error", mcp_server: "unreachable" };
}
