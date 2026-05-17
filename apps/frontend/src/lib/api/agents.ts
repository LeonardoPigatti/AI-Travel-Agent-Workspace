export interface ChatMessage {
  role: "user" | "agent";
  content: string;
  agent_name?: string;
}

export async function runAgent(
  tripId: string,
  message: string,
  sessionId: string | null,
  onToken: (token: string) => void,
  onDone: (sessionId: string) => void,
) {
  const res = await fetch("http://localhost:8000/api/v1/agents/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trip_id: tripId,
      message,
      session_id: sessionId,
    }),
  });

  if (!res.ok) throw new Error("Agent request failed");

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);

      if (data === "[DONE]") continue;
      if (data.startsWith("[SESSION:")) {
        const id = data.slice(9, -1);
        onDone(id);
        continue;
      }
      onToken(data);
    }
  }
}