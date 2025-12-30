import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe Webhook Handler (v1.3 - Type Safe & Production Ready)
 * Filepath: app/api/stripe/webhook/route.ts
 * Role: Phase 6 - Tier & Subscription Lifecycle.
 * Updates:
 * - Replaced all 'any' types with official Stripe interfaces.
 * - Added metadata interface for type-safe Supabase ID retrieval.
 */

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Admin client for backend operations (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DrashCheckoutMetadata {
  supabase_user_id: string;
}

export async function POST(req: Request) {
  const body = await req.text();

  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Stripe Webhook] Error: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // 1. Handle Successful Checkout (Initial Upgrade)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata as unknown as DrashCheckoutMetadata;
    const userId = metadata?.supabase_user_id;
    const customerId = session.customer as string;

    if (userId) {
      const { error } = await supabaseAdmin
        .from("users")
        .update({
          tier: "pro",
          stripe_customer_id: customerId,
        })
        .eq("id", userId);

      if (error) {
        console.error("[Stripe Webhook] Checkout Update Error:", error);
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }
      console.log(`[Stripe Webhook] User ${userId} upgraded via checkout.`);
    }
  }

  // 2. Handle Subscription Updates (Renewals/Changes)
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const status = subscription.status;

    // Pro status maintained for active/trialing, otherwise revert to free
    const newTier =
      status === "active" || status === "trialing" ? "pro" : "free";

    await supabaseAdmin
      .from("users")
      .update({ tier: newTier })
      .eq("stripe_customer_id", customerId);

    console.log(
      `[Stripe Webhook] Subscription updated for customer ${customerId}: ${status}`
    );
  }

  // 3. Handle Cancellation / Deletion
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const { error } = await supabaseAdmin
      .from("users")
      .update({ tier: "free" })
      .eq("stripe_customer_id", customerId);

    if (error) {
      console.error("[Stripe Webhook] Deletion Error:", error);
      return NextResponse.json(
        { error: "Database downgrade failed" },
        { status: 500 }
      );
    }

    console.log(
      `[Stripe Webhook] Subscription deleted for customer: ${customerId}`
    );
  }

  return NextResponse.json({ received: true });
}
