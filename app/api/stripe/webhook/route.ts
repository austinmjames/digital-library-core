import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe Webhook Orchestrator (v2.3 - Version Sync)
 * Filepath: app/api/stripe/webhook/route.ts
 * Role: Handles asynchronous payment events from Stripe.
 * Fix: Synchronized apiVersion string with the expected SDK type definition.
 */

// Helper to initialize Stripe lazily
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined in environment variables."
    );
  }

  return new Stripe(key, {
    // Updated to match the expected SDK version type
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
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Webhook signature verification failed";
    console.error(`❌ Webhook Error: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  const supabase = await createClient();

  // Handle specific event types
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        // PRD 5.0: Upgrade user to 'pro' tier in public.users table
        const { error } = await supabase
          .from("users")
          .update({
            tier: "pro",
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error(`❌ DB Sync Error for user ${userId}:`, error.message);
        } else {
          console.log(`✅ User ${userId} upgraded to PRO tier.`);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // Revert user to 'free' tier upon cancellation
      await supabase
        .from("users")
        .update({ tier: "free" })
        .eq("stripe_customer_id", subscription.customer as string);

      console.log(
        `ℹ️ Subscription for customer ${subscription.customer} terminated.`
      );
      break;
    }

    default:
      console.log(`🟡 Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Ensure Next.js treats this as a dynamic route
export const dynamic = "force-dynamic";
