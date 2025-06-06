// app/api/votes/stream/route.ts

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pollId = url.searchParams.get("pollId");

  if (!pollId) {
    return new Response("Poll ID is required", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Initial ping
      send({ message: "connected" });

      // Example: ping every 10 sec (to keep connection alive)
      const keepAliveId = setInterval(() => {
        send({ message: "ping" });
      }, 10000);

      // Store controller + send function by pollId
      (globalThis as any).__votesSSEClients ||= {};
      (globalThis as any).__votesSSEClients[pollId] ||= [];
      (globalThis as any).__votesSSEClients[pollId].push(send);

      // Cleanup
      req.signal.addEventListener("abort", () => {
        clearInterval(keepAliveId);
        (globalThis as any).__votesSSEClients[pollId] = (
          globalThis as any
        ).__votesSSEClients[pollId]?.filter((fn: any) => fn !== send);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
