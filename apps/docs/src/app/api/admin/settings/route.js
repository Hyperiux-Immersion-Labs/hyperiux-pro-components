import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requirePermission } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { getAppSettings, isInstallLimitEnforced, setAppSetting } from "@/lib/app-settings";
import { clearClerkUsersCache, INTERNAL_EMAILS, INTERNAL_EMAIL_DOMAINS } from "@/lib/admin-data";
import { LIMITS } from "@/lib/install-limit";

// The admin Settings tab (super admins). GET: what's in force; POST { key, value }: change
// one setting (lib/app-settings), logged in the admin audit log.
//   install_limit_enforced  boolean
//   internal_emails         ["name@example.com", ...]
//   internal_domains        ["example.com", ...]
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

export async function GET() {
  if (!(await requirePermission("settings.manage"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await getAppSettings();
  return NextResponse.json({
    installLimit: {
      enforced: await isInstallLimitEnforced(),
      // "setting" when saved here; otherwise the INSTALL_LIMIT_ENFORCE variable decides
      source: typeof settings.install_limit_enforced === "boolean" ? "setting" : "environment",
      limits: { free: LIMITS.free, pro: LIMITS.pro, pro_plus: LIMITS.pro_plus },
    },
    internal: {
      builtInEmails: INTERNAL_EMAILS,
      builtInDomains: INTERNAL_EMAIL_DOMAINS,
      emails: Array.isArray(settings.internal_emails) ? settings.internal_emails : [],
      domains: Array.isArray(settings.internal_domains) ? settings.internal_domains : [],
    },
  });
}

export async function POST(request) {
  if (!(await requirePermission("settings.manage"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key, value } = await request.json().catch(() => ({}));
  let clean;
  if (key === "install_limit_enforced") {
    if (typeof value !== "boolean") return NextResponse.json({ error: "true or false." }, { status: 400 });
    clean = value;
  } else if (key === "internal_emails" || key === "internal_domains") {
    if (!Array.isArray(value) || value.length > 200) return NextResponse.json({ error: "A list of up to 200." }, { status: 400 });
    clean = [...new Set(value.map((item) => String(item).trim().toLowerCase()).filter(Boolean))];
    const pattern = key === "internal_emails" ? EMAIL : DOMAIN;
    const bad = clean.filter((item) => !pattern.test(item));
    if (bad.length) return NextResponse.json({ error: `Not ${key === "internal_emails" ? "an email" : "a domain"}: ${bad.join(", ")}` }, { status: 400 });
  } else {
    return NextResponse.json({ error: "Unknown setting." }, { status: 400 });
  }

  try {
    const { userId } = await auth();
    await setAppSetting(key, clean, userId);
    if (key !== "install_limit_enforced") clearClerkUsersCache();
  } catch (error) {
    console.error("ADMIN_SETTINGS_ERROR:", key, error);
    return NextResponse.json({ error: "Couldn't save the setting." }, { status: 500 });
  }

  await recordAdminAction({ action: "settings.update", details: { key, value: clean } });
  return NextResponse.json({ key, value: clean });
}
