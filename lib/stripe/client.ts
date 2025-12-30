import Stripe from "stripe";

/**
 * Stripe Client Initialization
 * Filepath: lib/stripe/client.ts
 * Role: Phase 6 Monetization.
 * Purpose: Backend utility for managing subscriptions and Pro tier upgrades.
 * Fix: Removed unused @ts-expect-error as the API version is now correctly recognized.
 */

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";

export const stripe = new Stripe(stripeSecret, {
  apiVersion: "2025-12-15.clover",
  appInfo: {
    name: "DrashX Beit Midrash",
    version: "1.0.0",
  },
});

/**
 * Helper: createCheckoutSession
 * Creates a checkout session for a user to upgrade to Pro.
 */
export const createCheckoutSession = async (
  userId: string,
  userEmail: string
) => {
  return await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID, // monthly subscription price ID
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
    customer_email: userEmail,
    metadata: {
      supabase_user_id: userId,
    },
  });
};
