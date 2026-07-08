import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 * Creates a demo-first Stripe Checkout Session for the starter subscription.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

    const priceId = String(body.priceId ?? process.env.STRIPE_STARTER_PRICE_ID ?? "");

    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_STARTER_PRICE_ID is not configured." },
        { status: 503 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not configured." },
        { status: 503 },
      );
    }

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const session = await createCheckoutSession({
      priceId,
      userId: "demo-owner",
      successUrl: String(body.successUrl ?? `${origin}/pricing?checkout=success`),
      cancelUrl: String(body.cancelUrl ?? `${origin}/pricing?checkout=canceled`),
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.redirect(session.url ?? `${origin}/pricing`, { status: 303 });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
