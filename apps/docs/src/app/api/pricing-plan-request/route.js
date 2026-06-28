import { PricingPlanRequestEmail } from "@/components/WebsiteComps/emailTemplate/PricingPlanRequestEmail";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      message,
      planId,
      planName,
      billingCycle,
      displayedPrice,
      annualTotal,
    } = body || {};

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    if (!planName?.trim()) {
      return NextResponse.json(
        { error: "Plan is required." },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is missing." },
        { status: 500 }
      );
    }

    const toEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.CONTACT_TO_EMAIL ||
      "hello@hyperiux.com";

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "Hyperiux Vault <onboarding@resend.dev>";

    const subject = `New Vault ${planName} plan request from ${name}`;

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject,
      react: PricingPlanRequestEmail({
        name,
        email,
        phone,
        message,
        planId,
        planName,
        billingCycle,
        displayedPrice,
        annualTotal,
      }),
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Pricing plan request failed:", error);

    return NextResponse.json(
      { error: "Unable to send request right now." },
      { status: 500 }
    );
  }
}