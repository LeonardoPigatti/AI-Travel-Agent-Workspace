export interface ChatMessage {
  role: "user" | "agent";
  content: string;
  agent_name?: string;
}

export interface SessionHistory {
  session_id: string | null;
  messages: ChatMessage[];
}

export async function getSessionHistory(tripId: string): Promise<SessionHistory> {
  const res = await fetch(
    `http://localhost:8000/api/v1/agents/sessions/${tripId}`
  );
  if (!res.ok) return { session_id: null, messages: [] };
  return res.json();
}

export async function runAgent(
  tripId: string,
  message: string,
  sessionId: string | null,
  onToken: (token: string) => void,
  onDone: (sessionId: string, agentName: string) => void,
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
  let agentName = "Coordinator";

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
        onDone(id, agentName);
        continue;
      }
      if (data.startsWith("[AGENT:")) {
        agentName = data.slice(7, -1);
        continue;
      }
      onToken(data);
    }
  }
}
export async function saveAgentMessage(
  sessionId: string,
  agentName: string,
  content: string,
): Promise<void> {
  await fetch(
    `http://localhost:8000/api/v1/agents/sessions/${sessionId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_name: agentName, content }),
    }
  );
}