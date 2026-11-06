import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findContact, forgetUnsubscribedEmails, setProductUpdates } from "@/lib/email-unsubscribe";

// "Product updates" in the dashboard's settings: the account's email as a Resend contact,
// always listed in the Product Updates segment - subscribed when the switch is on,
// unsubscribed when it's off (campaigns and Resend's broadcasts skip unsubscribed
// contacts). The same flag the unsubscribe link in campaign emails turns off
// (lib/email-unsubscribe). Account and billing emails aren't optional, so they aren't
// stored here.

async function accountEmail() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null;
}

export async function GET() {
  const email = await accountEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const contact = await findContact(email);
    return NextResponse.json({ productUpdates: Boolean(contact && !contact.unsubscribed) });
  } catch (error) {
    console.error("EMAIL_PREFERENCES_READ_ERROR:", error);
    return NextResponse.json({ error: "Couldn't load your email preferences." }, { status: 502 });
  }
}

export async function POST(request) {
  const email = await accountEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productUpdates } = await request.json().catch(() => ({}));
  if (typeof productUpdates !== "boolean") {
    return NextResponse.json({ error: "productUpdates must be true or false." }, { status: 400 });
  }

  try {
    await setProductUpdates(email, productUpdates);
    forgetUnsubscribedEmails();
    return NextResponse.json({ productUpdates });
  } catch (error) {
    console.error("EMAIL_PREFERENCES_WRITE_ERROR:", error);
    return NextResponse.json({ error: "Couldn't update your email preferences." }, { status: 502 });
  }
}
