export async function generateResponse(prompt) {
  try {
    const res = await fetch("http://localhost:3000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (data.response) {
      return data.response;
    } else {
      throw new Error(data.error || "Unknown error");
    }
  } catch (err) {
    throw new Error(err.message);
  }
}
