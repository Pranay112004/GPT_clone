export async function generateResponse(prompt) {
  try {
    console.log("🚀 Making API call to /api/generate");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    console.log("📡 Response status:", res.status);
    
    if (!res.ok) {
      console.error("❌ HTTP Error:", res.status, res.statusText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("📋 Response data:", data);

    if (data.response) {
      return data.response;
    } else {
      console.error("❌ API Error:", data);
      throw new Error(data.error || "No response from API");
    }
  } catch (err) {
    console.error("💥 Network or fetch error:", err);
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error("Cannot connect to server. Please check if the backend is running.");
    }
    throw new Error(err.message || "Network error");
  }
}
