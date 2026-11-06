import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

// The admin audit log (sql/admin_audit_log.sql): one row per change made from the admin
// dashboard - who made it, when, to which account, and the details. Every admin action
// route calls recordAdminAction after the change succeeds. A failure to log is reported
// but never undoes or fails the change itself; it returns whether the row was written
// (notes, which live only here, check it).

// What each action is called in the log, and how the dashboard words it
export const ADMIN_ACTIONS = {
  "plan.update": "Changed plan",
  // Before roles: Admin / Super Admin. Kept so older entries still read right
  "role.update": "Changed role",
  "access.update": "Changed admin access",
  "role.create": "Created a role",
  "role.edit": "Edited a role",
  "role.delete": "Deleted a role",
  "account.suspend": "Suspended account",
  "account.restore": "Restored account",
  "account.delete": "Deleted account",
  "password.reset_sent": "Sent password reset",
  "user.create": "Created an account",
  "internal.mark": "Marked internal",
  "internal.unmark": "Counted as customer",
  "payment.exclude": "Excluded payment from revenue",
  "payment.include": "Counted payment in revenue",
  "payment.refund": "Refunded payment",
  "subscription.cancel_now": "Cancelled subscription now",
  "subscription.cancel_at_period_end": "Cancelled at period end",
  "subscription.sync": "Synced with Razorpay",
  "waitlist.invite": "Sent waitlist invites",
  "campaign.test": "Sent a campaign test",
  "campaign.send": "Sent a campaign",
  "credits.adjust": "Adjusted template credits",
  "template.give": "Gave a template",
  "installs.bonus": "Allowed extra installs today",
  "note.add": "Added a note",
  "settings.update": "Changed a setting",
  "effect.refresh": "Refreshed an effect page",
};

export async function recordAdminAction({ action, targetClerkUserId = null, details = {} }) {
  try {
    const { userId } = await auth();
    if (!userId) return false;
    let actorEmail = null;
    try {
      const actor = await (await clerkClient()).users.getUser(userId);
      actorEmail = actor?.emailAddresses?.[0]?.emailAddress || null;
    } catch {
      // The actor's id is enough; the email is a convenience
    }
    const { error } = await supabase.from("admin_audit_log").insert({
      actor_clerk_user_id: userId,
      actor_email: actorEmail,
      action,
      target_clerk_user_id: targetClerkUserId,
      details,
    });
    if (error) {
      console.error("ADMIN_AUDIT_LOG_ERROR:", action, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("ADMIN_AUDIT_LOG_ERROR:", action, error);
    return false;
  }
}
