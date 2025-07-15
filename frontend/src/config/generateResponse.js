export async function generateResponse(prompt) {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (res.ok && data.response) {
      return data.response;
    } else {
      console.error("API Error:", data);
      throw new Error(data.error || "Unknown error");
    }
  } catch (err) {
    console.error("Network or fetch error:", err);
    throw new Error(err.message || "Network error");
  }
}
