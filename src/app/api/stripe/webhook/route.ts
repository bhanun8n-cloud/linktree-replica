import { db } from "@/lib/db";

export async function POST(request: Request) {
  let event: {
    type?: string;
    data?: {
      object?: {
        client_reference_id?: string;
        customer_email?: string;
        metadata?: { planId?: string };
      };
    };
  };

  try {
    event = await request.json();
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sessionObj = event.data?.object;
    const userId = sessionObj?.client_reference_id;
    const planId = sessionObj?.metadata?.planId ?? "pro";

    if (userId && ["starter", "pro", "premium"].includes(planId)) {
      db.prepare("UPDATE users SET plan = ? WHERE id = ?").run(planId, userId);
    }
  }

  return Response.json({ received: true });
}
