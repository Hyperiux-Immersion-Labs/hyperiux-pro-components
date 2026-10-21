import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { can, requireAdminAccess } from "@/lib/admin";
import { displayName } from "@/lib/display-name";
import { resolveDateBounds } from "@/lib/admin-activity";
import { ADMIN_ACTIONS } from "@/lib/admin-audit";

// The admin audit log, newest first: the Log tab (every change) and the Manage drawer's
// History (one account, ?userId=). It names refunds and amounts, so super admins only.
// The Log tab's per-page choices go up to 200
const MAX_LIMIT = 200;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const action = searchParams.get("action");
  // The log needs log.view; one account's notes (the Manage drawer's Support section) are
  // also open to whoever can add them
  const access = await requireAdminAccess();
  const notesOnly = Boolean(userId) && action === "note.add";
  if (!access || !(can(access, "log.view") || (notesOnly && can(access, "users.support")))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Changes by one admin: part of their email (?actor=), any case; % and _ literal
    const actor = (searchParams.get("actor") || "").trim().slice(0, 200).replace(/[\\%_]/g, (c) => `\\${c}`);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), MAX_LIMIT);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);
    // The window: ?range= (today / 7d / 30d / 90d / all) or a custom ?from=&to= (YYYY-MM-DD)
    const { startISO, endISO } = resolveDateBounds({
      range: searchParams.get("range") || "all",
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });

    let query = supabase
      .from("admin_audit_log")
      .select("id, created_at, actor_email, action, target_clerk_user_id, details", { count: "exact" }).order("created_at", { ascending: false });
    if (userId) query = query.eq("target_clerk_user_id", userId);
    if (action && ADMIN_ACTIONS[action]) query = query.eq("action", action);
    if (actor) query = query.ilike("actor_email", `%${actor}%`);
    if (startISO) query = query.gte("created_at", startISO);
    if (endISO) query = query.lt("created_at", endISO);
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    // Names for the accounts each entry is about (the actor's email is stored)
    const ids = [...new Set((data || []).map((row) => row.target_clerk_user_id).filter(Boolean))];
    let users = {};
    if (ids.length) {
      const { data: list } = await (await clerkClient()).users.getUserList({ userId: ids, limit: ids.length });
      users = Object.fromEntries((list || []).map((user) => [user.id, user]));
    }

    return NextResponse.json({
      total: count || 0,
      entries: (data || []).map((row) => {
        const target = row.target_clerk_user_id ? users[row.target_clerk_user_id] : null;
        return {
          id: row.id,
          at: row.created_at,
          action: row.action,
          label: ADMIN_ACTIONS[row.action] || row.action,
          actorEmail: row.actor_email,
          targetId: row.target_clerk_user_id,
          targetName: target ? displayName(target) : null,
          targetEmail: target?.emailAddresses?.[0]?.emailAddress || null,
          details: row.details || {},
        };
      }),
    });
  } catch (error) {
    console.error("ADMIN_AUDIT_READ_ERROR:", error);
    return NextResponse.json({ error: "Couldn't load the log." }, { status: 500 });
  }
}
