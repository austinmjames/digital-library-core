import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe Webhook Handler (DrashX Edition)
 * Filepath: app/api/stripe/webhook/route.ts
 * Role: Manages the transition between 'Talmid' (Free) and 'Chaver' (Pro) tiers.
 * PRD Alignment: Section 5 (Monetization) & Section 2.1 (Social Identity/Notifications).
 */

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // 1. Initial Upgrade Logic
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;
    const customerId = session.customer as string;

    if (userId) {
      await supabaseAdmin
        .from("users")
        .update({
          tier: "pro",
          stripe_customer_id: customerId,
        })
        .eq("id", userId);

      // Create System Notification (PRD 2.1)
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        type: "SYSTEM",
        payload: {
          title: "Tier Upgraded",
          message:
            "Welcome to the Chaver (Pro) tier. Custom avatars are now unlocked.",
          icon: "Trophy",
        },
      });
    }
  }

  // 2. Subscription Sync Logic (Renewals / Status Changes)
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const status = subscription.status;
    const isPro = status === "active" || status === "trialing";

    const { data: user } = await supabaseAdmin
      .from("users")
      .update({ tier: isPro ? "pro" : "free" })
      .eq("stripe_customer_id", customerId)
      .select("id")
      .single();

    if (!isPro && user) {
      // Notify user of tier revert
      await supabaseAdmin.from("notifications").insert({
        user_id: user.id,
        type: "SYSTEM",
        payload: {
          title: "Subscription Updated",
          message:
            "Your Pro status has expired. Reverting to Talmid (Free) tier.",
          icon: "AlertCircle",
        },
      });
    }
  }

  // 3. Payment Failure Alert
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (user) {
      await supabaseAdmin.from("notifications").insert({
        user_id: user.id,
        type: "SYSTEM",
        payload: {
          title: "Payment Action Required",
          message:
            "We encountered an issue with your last payment. Please update your billing info to maintain Pro access.",
          icon: "CreditCard",
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
