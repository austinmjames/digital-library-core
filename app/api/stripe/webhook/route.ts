import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe Webhook Orchestrator (v2.8 - Version Sync & Activity)
 * Filepath: app/api/stripe/webhook/route.ts
 * Role: Async payment event processing for tier synchronization.
 * PRD Alignment: Monetization (Phase 5), Subscription Management (SET-006).
 * Aesthetic: Synchronized with DrashX Diagnostic logging standards.
 */

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "δ Critical: STRIPE_SECRET_KEY is missing from environment."
    );
  }

  return new Stripe(key, {
    /**
     * Synchronized with the expected SDK type definition.
     * This version handles the "clover" release cycle logic for DrashX subscriptions.
     */
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
};

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new Response("δ Auth: Missing signature or secret.", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Signature verification failed";
    console.error(`❌ δ Payment: Webhook verification failed. ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  const supabase = await createClient();

  // Unified Event Processing Logic (PRD Phase 5)
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        // Upgrade to 'pro' (Chaver) tier as per SET-006
        const { error } = await supabase
          .from("users")
          .update({
            tier: "pro",
            stripe_customer_id: session.customer as string,
            last_activity_at: new Date().toISOString(), // Manifest Section 4 logic
          })
          .eq("id", userId);

        if (error) {
          console.error(
            `❌ δ DB: Tier sync failed for ${userId}. ${error.message}`
          );
        } else {
          console.log(`✅ δ Payment: User ${userId} promoted to 'pro' status.`);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      // Revert to 'free' (Talmid) tier upon cancellation
      const { error } = await supabase
        .from("users")
        .update({
          tier: "free",
          last_activity_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", subscription.customer as string);

      if (error) {
        console.error(
          `❌ δ DB: Subscription teardown failed for customer ${subscription.customer}.`
        );
      } else {
        console.log(
          `ℹ️ δ Payment: Subscription terminated for customer ${subscription.customer}.`
        );
      }
      break;
    }

    default:
      console.log(`🟡 δ Payment: Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
