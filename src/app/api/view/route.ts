import { recordView, getUserById } from "@/lib/data";

export async function POST(request: Request) {
  let body: { userId?: string; referrer?: string } | null = null;
  try {
    body = (await request.json()) as { userId?: string; referrer?: string };
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const userId = body?.userId;
  if (!userId || !getUserById(userId)) {
    return Response.json({ ok: false, error: "Unknown profile" }, { status: 404 });
  }

  let referrer = (body?.referrer ?? "direct").toLowerCase();
  if (referrer && referrer !== "direct") {
    try {
      referrer = new URL(referrer).hostname.replace(/^www\./, "");
    } catch {
      referrer = "direct";
    }
  }

  const country = (request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? "IN").toUpperCase();
  recordView(userId, referrer || "direct", country.slice(0, 2));

  return Response.json({ ok: true });
}
