import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";

export async function GET(request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);

    // Single email fetch (for HTML preview)
    const id = searchParams.get("id");
    if (id) {
      const { data, error } = await supabase
        .from("sent_emails")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json(data);
    }

    // List with filters
    const emailType = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("sent_emails")
      .select("id, recipient_email, subject, email_type, status, error_message, sent_at", { count: "exact" })
      .order("sent_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (emailType) query = query.eq("email_type", emailType);
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ emails: data || [], total: count || 0 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
