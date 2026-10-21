import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { recordAdminAction } from "@/lib/admin-audit";
import { requirePermission } from "@/lib/admin";
import { sendEmail } from "@/lib/resend";
import {
  renderProUnlockedEmail,
  proUnlockedSubject,
  proUnlockedText,
} from "@/lib/emails/pro-unlocked-email";
import { getPlanLabel, isValidTier } from "@/lib/plans";
import { expireCredits, grantCreditsForAdminGrant } from "@/lib/template-credits";
import { razorpay, withRazorpayRetry } from "@/lib/razorpay";

const GRANT_INTERVALS = ["monthly", "quarterly", "yearly"];

// Razorpay subscription states that are (or can resume) charging the customer
const BILLING_STATUSES = new Set(["authenticated", "active", "pending", "halted"]);

// Manually-granted pro (no real Razorpay subscription behind it) has no
// webhook to ever expire it - it must carry its own period_end so
// getUserPlan()/getEffectAccessDecision() cut it off on their own, the same
// way they already do for real subscriptions.
function computePeriodEnd(billingInterval) {
  const end = new Date();

  if (billingInterval === "monthly") {
    end.setMonth(end.getMonth() + 1);
  } else if (billingInterval === "quarterly") {
    end.setMonth(end.getMonth() + 3);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }

  return end.toISOString();
}

// Razorpay's answer for an id it doesn't have: 400 BAD_REQUEST_ERROR, "The id provided does not exist"
function isRazorpayNotFound(error) {
  return error?.statusCode === 400 && /does not exist/i.test(error?.error?.description || "");
}

export async function POST(request) {
  if (!(await requirePermission("users.plan"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { clerkUserId, plan, billingInterval, tier } = await request.json();

    if (!clerkUserId || !["free", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "clerkUserId and plan (free|pro) are required." },
        { status: 400 }
      );
    }

    if (plan === "pro" && !GRANT_INTERVALS.includes(billingInterval)) {
      return NextResponse.json(
        { error: "billingInterval (monthly|quarterly|yearly) is required when granting pro." },
        { status: 400 }
      );
    }

    if (plan === "pro" && !isValidTier(tier)) {
      return NextResponse.json(
        { error: "tier (pro|pro_plus) is required when granting pro." },
        { status: 400 }
      );
    }

    // A paying subscriber's plan belongs to Razorpay: moving them to Free here would
    // leave them being charged (and the next subscription.charged webhook puts Pro back),
    // and a grant would overwrite their paid period. End the subscription first (Billing →
    // Cancel subscription), then change the plan. Fails closed if Razorpay can't be read -
    // except when Razorpay says the subscription doesn't exist: one it no longer has, or a
    // live-mode id read with test keys (local dev reads the production database). Then the
    // status saved in our row decides instead.
    const { data: existing, error: existingError } = await supabase
      .from("subscriptions")
      .select("razorpay_subscription_id, status")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();
    if (existingError) {
      console.error("ADMIN_UPDATE_PLAN_READ_ERROR:", existingError);
      return NextResponse.json({ error: "Couldn't read their subscription." }, { status: 500 });
    }
    if (existing?.razorpay_subscription_id) {
      let status;
      try {
        status = (await withRazorpayRetry(() => razorpay.subscriptions.fetch(existing.razorpay_subscription_id)))?.status;
      } catch (fetchError) {
        if (!isRazorpayNotFound(fetchError)) {
          console.error("ADMIN_UPDATE_PLAN_RAZORPAY_ERROR:", existing.razorpay_subscription_id, fetchError);
          return NextResponse.json({ error: "Couldn't check their Razorpay subscription, so nothing was changed. Try again." }, { status: 502 });
        }
        console.warn("ADMIN_UPDATE_PLAN_RAZORPAY_NOT_FOUND:", existing.razorpay_subscription_id, "- using the saved status:", existing.status);
        status = existing.status;
      }
      if (BILLING_STATUSES.has(status)) {
        return NextResponse.json(
          { error: `They have a ${status} Razorpay subscription. Cancel it under Billing first (Cancel now, to end it today), then change the plan here.` },
          { status: 409 }
        );
      }
    }

    const grantedTier = plan === "pro" ? tier : null;

    const newStatus = plan === "pro" ? "active" : "inactive";
    const currentPeriodEnd = plan === "pro" ? computePeriodEnd(billingInterval) : null;

    // Downgrading to free must kill any existing CLI token outright, not
    // just rely on verifyCliToken's plan check - otherwise a later
    // re-upgrade without a fresh `npx hyperiux login` would silently
    // reactivate the old token.
    const revokeFields =
      plan === "free"
        ? {
            cli_token_hash: null,
            cli_token_revoked_at: new Date().toISOString(),
          }
        : {};

    // Update Supabase
    const { error: supabaseError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          clerk_user_id: clerkUserId,
          plan,
          tier: grantedTier,
          status: newStatus,
          billing_interval: plan === "pro" ? billingInterval : null,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
          ...revokeFields,
        },
        { onConflict: "clerk_user_id" }
      );

    if (supabaseError) {
      console.error("ADMIN_UPDATE_PLAN_SUPABASE_ERROR:", supabaseError);
      return NextResponse.json({ error: supabaseError.message }, { status: 500 });
    }

    // Moving someone to Free ends their plan, and its template credits with it. A grant
    // comes with the credits the same paid plan earns (lib/template-credits); the plan
    // is already given, so a failure here is reported to the admin, not undone.
    let creditsAdded = 0;
    let creditsError = null;
    if (plan === "free") {
      await expireCredits(clerkUserId);
    } else {
      try {
        creditsAdded = await grantCreditsForAdminGrant({ clerkUserId, tier, interval: billingInterval });
      } catch {
        creditsError = "Plan given, but its template credits couldn't be added. Add them under Support → Template credits.";
      }
    }

    // Update Clerk publicMetadata - mirrors the shape markUserProFromSubscription
    // writes for real subscriptions, so both grant paths look the same downstream.
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        plan,
        proAccess: plan === "pro",
        tier: grantedTier,
        billingInterval: plan === "pro" ? billingInterval : null,
        currentPeriodEnd,
      },
    });

    // Same welcome email a real first purchase sends - never blocks the
    // actual grant if it fails, matching sendInvoiceEmail's posture in
    // pro-access.js.
    if (plan === "pro") {
      try {
        const clerkUser = await clerk.users.getUser(clerkUserId);
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

        if (email) {
          const planLabel = getPlanLabel(tier, billingInterval);

          await sendEmail({
            to: email,
            subject: proUnlockedSubject,
            react: renderProUnlockedEmail({ planLabel, isAdminGrant: true }),
            text: proUnlockedText({ planLabel, isAdminGrant: true }),
            emailType: "pro_unlocked",
          });
        }
      } catch (emailError) {
        console.error("ADMIN_UPDATE_PLAN_EMAIL_ERROR:", emailError);
      }
    }

    await recordAdminAction({
      action: "plan.update",
      targetClerkUserId: clerkUserId,
      details: { plan, tier: grantedTier, billingInterval: plan === "pro" ? billingInterval : null, currentPeriodEnd, creditsAdded },
    });

    return NextResponse.json({
      success: true,
      plan,
      tier: grantedTier,
      status: newStatus,
      billingInterval: plan === "pro" ? billingInterval : null,
      currentPeriodEnd,
      creditsAdded,
      creditsError,
    });
  } catch (error) {
    console.error("ADMIN_UPDATE_PLAN_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
