// app/api/votes/stream/route.ts

export async function GET(req: Request) {
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

      // Store controller + send function somewhere if you want to trigger manual send later
      (globalThis as any).__votesSSEClients ||= [];
      (globalThis as any).__votesSSEClients.push(send);

      // Cleanup
      req.signal.addEventListener("abort", () => {
        clearInterval(keepAliveId);
        (globalThis as any).__votesSSEClients = (
          globalThis as any
        ).__votesSSEClients?.filter((fn: any) => fn !== send);
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
