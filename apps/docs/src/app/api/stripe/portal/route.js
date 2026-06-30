import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("STRIPE_PORTAL_SUPABASE_ERROR:", error);
      return NextResponse.json({ error: "Unable to fetch customer record." }, { status: 500 });
    }

    if (!data?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please subscribe first." },
        { status: 404 }
      );
    }

    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    const appUrl = rawAppUrl
      ? rawAppUrl.startsWith("http") ? rawAppUrl : `https://${rawAppUrl}`
      : new URL(request.url).origin;

    const body = await request.json().catch(() => ({}));
    const returnPath = body.returnPath || "/dashboard/settings";

    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${appUrl}${returnPath}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE_PORTAL_ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Unable to open billing portal." },
      { status: 500 }
    );
  }
}
