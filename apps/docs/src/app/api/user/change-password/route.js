import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Wrong current passwords allowed in a window before this route stops checking them -
// so a session someone else holds can't be used to guess the password. Kept in
// privateMetadata.passwordChangeFailures (times of recent misses), like the reset OTP's sends.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request) {
  const { userId, sessionId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Both fields are required." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  // Signed up with Google (or another provider): no password to check yet - they set one
  // with the emailed code instead (Forgot password)
  if (!user.passwordEnabled) {
    return NextResponse.json({ error: "Your account has no password yet. Use “Set a password” to get a code by email." }, { status: 400 });
  }

  const now = Date.now();
  const failures = (user.privateMetadata?.passwordChangeFailures || []).filter((at) => now - at < WINDOW_MS);
  if (failures.length >= MAX_FAILURES) {
    const minutes = Math.ceil((WINDOW_MS - (now - Math.min(...failures))) / 60000);
    return NextResponse.json({ error: `Too many wrong passwords. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}, or reset it by email.` }, { status: 429 });
  }

  try {
    await clerk.users.verifyPassword({ userId, password: currentPassword });
  } catch {
    await clerk.users.updateUserMetadata(userId, { privateMetadata: { passwordChangeFailures: [...failures, now] } });
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  try {
    await clerk.users.updateUser(userId, { password: newPassword });
  } catch (err) {
    const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Unable to update password.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // The password has changed: clear the misses, and sign the account out everywhere else
  // (this session stays), so a session someone else holds ends with the old password -
  // as the emailed-code reset does. Failures here are logged, not returned.
  try {
    if (failures.length) await clerk.users.updateUserMetadata(userId, { privateMetadata: { passwordChangeFailures: null } });
    const { data: sessions } = await clerk.sessions.getSessionList({ userId, status: "active" });
    await Promise.all(
      (sessions || [])
        .filter((session) => session.id !== sessionId)
        .map((session) => clerk.sessions.revokeSession(session.id))
    );
  } catch (error) {
    console.error("CHANGE_PASSWORD_REVOKE_SESSIONS_ERROR:", error);
  }

  return NextResponse.json({ success: true });
}
