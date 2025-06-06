import { useEffect, useState } from "react";

export function useVoteStream(pollId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/votes/stream?pollId=${pollId}`);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onerror = (err) => {
      setError(new Error("SSE connection error"));
      setIsConnected(false);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "voteUpdate") {
          // Trigger a refetch of votes
          window.dispatchEvent(
            new CustomEvent("voteUpdate", { detail: { pollId } })
          );
        }
      } catch (err) {
        console.error("Error parsing SSE message:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [pollId]);

  return { isConnected, error };
}
