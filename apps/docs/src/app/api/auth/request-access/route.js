import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

const ALLOWED_USER_TYPES = [
  "student",
  "founder",
  "designer",
  "developer",
  "agency",
  "organisation",
  "other",
];

function generateTemporaryPassword() {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const length = 14;

  let password = "";

  for (let index = 0; index < length; index += 1) {
    password += alphabet[crypto.randomInt(0, alphabet.length)];
  }

  return password;
}

function splitName(fullName) {
  const safeName = fullName.trim().replace(/\s+/g, " ");
  const parts = safeName.split(" ");

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getResendErrorMessage(error) {
  if (!error) return "";

  return (
    error.message ||
    error.name ||
    JSON.stringify(error, null, 2) ||
    "Unknown Resend error"
  );
}

async function sendWaitingListEmail({
  email,
  firstName,
  userType,
  organisationName,
  isExisting = false,
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const vaultUrl = `${appUrl}/effects`;

  const readableUserType =
    userType === "agency"
      ? "Agency / Studio"
      : userType
      ? userType.charAt(0).toUpperCase() + userType.slice(1)
      : "Vault explorer";

  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: [email],
    subject: "You’re on the Hyperiux Vault waiting list",
    html: `
      <div style="font-family: Arial, sans-serif; background: #050505; color: #ffffff; padding: 32px;">
        <div style="max-width: 620px; margin: 0 auto; background: #111111; border: 1px solid rgba(255,255,255,0.12); border-radius: 28px; padding: 34px;">
          <p style="color: #ff5f00; text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; margin: 0 0 18px;">
            Hyperiux Vault
          </p>

          <h1 style="font-size: 32px; line-height: 1.05; letter-spacing: -0.04em; margin: 0 0 18px;">
            Thank you for your interest.
          </h1>

          <p style="color: rgba(255,255,255,0.68); font-size: 15px; line-height: 1.75; margin: 0 0 22px;">
            Hi ${firstName || "there"}, you’re now on the Hyperiux Vault waiting list.
            We’re reviewing early access requests and will notify you when your account is ready to use.
          </p>

          <div style="background: #050505; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 10px; color: rgba(255,255,255,0.48); font-size: 13px;">Request details</p>

            <p style="margin: 0 0 8px; font-size: 15px;">
              <strong>Email:</strong> ${email}
            </p>

            <p style="margin: 0 0 8px; font-size: 15px;">
              <strong>I am:</strong> ${readableUserType}
            </p>

            ${
              organisationName
                ? `<p style="margin: 0; font-size: 15px;"><strong>Organisation:</strong> ${organisationName}</p>`
                : ""
            }
          </div>

          <p style="color: rgba(255,255,255,0.62); font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
            While you wait, you can still explore the public Vault pages, preview effects, and shortlist the interactions you want to try first.
          </p>

          <a href="https://vault.hyperiux.com/" style="display: inline-block; background: #ff5f00; color: #ffffff; text-decoration: none; border-radius: 999px; padding: 13px 24px; font-size: 14px; font-weight: 700;">
            Explore Hyperiux Vault
          </a>

          <p style="color: rgba(255,255,255,0.38); font-size: 13px; line-height: 1.6; margin: 26px 0 0;">
            ${
              isExisting
                ? "We found an earlier request with this email, so we refreshed your waiting list details."
                : "You do not need to submit another request. We’ll contact you when access opens."
            }
          </p>
        </div>
      </div>
    `,
  });

  if (result.error) {
    console.error("RESEND_EMAIL_ERROR:", result.error);
  }

  return result;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const userType = String(body.userType || "").trim();
    const organisationName = String(body.organisationName || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: "Please enter a valid name." },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!ALLOWED_USER_TYPES.includes(userType)) {
      return NextResponse.json(
        { message: "Please choose the option that best describes you." },
        { status: 400 }
      );
    }

    if (
      (userType === "organisation" || userType === "agency") &&
      !organisationName
    ) {
      return NextResponse.json(
        { message: "Please enter your organisation name." },
        { status: 400 }
      );
    }

    if (!process.env.CLERK_SECRET_KEY) {
      return NextResponse.json(
        { message: "CLERK_SECRET_KEY is missing in .env.local." },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { message: "RESEND_API_KEY is missing in .env.local." },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      return NextResponse.json(
        { message: "RESEND_FROM_EMAIL is missing in .env.local." },
        { status: 500 }
      );
    }

    const client = await clerkClient();
    const { firstName, lastName } = splitName(name);
    const temporaryPassword = generateTemporaryPassword();

    const existingUsersResponse = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });

    const existingUser = existingUsersResponse?.data?.[0];

    if (existingUser) {
      await client.users.updateUser(existingUser.id, {
        firstName,
        lastName,
        publicMetadata: {
          ...existingUser.publicMetadata,
          plan: existingUser.publicMetadata?.plan || "free",
          accountStatus: "waitlist",
          userType,
          organisationName: organisationName || null,
          source: "custom-access-request",
        },
        privateMetadata: {
          ...existingUser.privateMetadata,
          waitlistRequestedAt:
            existingUser.privateMetadata?.waitlistRequestedAt ||
            new Date().toISOString(),
          waitlistUpdatedAt: new Date().toISOString(),
        },
      });

      const { error } = await sendWaitingListEmail({
        email,
        firstName,
        userType,
        organisationName,
        isExisting: true,
      });

      if (error) {
        const resendError = getResendErrorMessage(error);

        if (process.env.NODE_ENV === "development") {
          return NextResponse.json({
            ok: true,
            mode: "waitlist-existing-dev",
            message:
              "Dev mode: your waiting list request was saved, but Resend failed.",
            resendError,
          });
        }

        return NextResponse.json(
          {
            message:
              "Your waiting list request was saved, but the email could not be sent. Please contact support.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        mode: "waitlist-existing",
        message:
          "Thank you for your interest. We refreshed your waiting list request and sent a confirmation email.",
      });
    }

    const user = await client.users.createUser({
      emailAddress: [email],
      password: temporaryPassword,
      firstName,
      lastName,
      publicMetadata: {
        plan: "free",
        accountStatus: "waitlist",
        userType,
        organisationName: organisationName || null,
        source: "custom-access-request",
      },
      privateMetadata: {
        waitlistRequestedAt: new Date().toISOString(),
      },
    });

    const { error } = await sendWaitingListEmail({
      email,
      firstName,
      userType,
      organisationName,
      isExisting: false,
    });

    if (error) {
      const resendError = getResendErrorMessage(error);

      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          ok: true,
          mode: "waitlist-created-dev",
          message:
            "Dev mode: your waiting list request was saved, but Resend failed.",
          resendError,
          userId: user.id,
        });
      }

      return NextResponse.json(
        {
          message:
            "Your waiting list request was saved, but the email could not be sent. Please contact support.",
          userId: user.id,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "waitlist-created",
      message:
        "Thank you for your interest. You are now on the Hyperiux Vault waiting list. We sent a confirmation email to your inbox.",
    });
  } catch (error) {
    console.error("REQUEST_ACCESS_ERROR:", error);

    const clerkErrorMessage =
      error?.errors?.[0]?.longMessage ||
      error?.errors?.[0]?.message ||
      error?.message;

    return NextResponse.json(
      {
        message:
          clerkErrorMessage ||
          "Something went wrong while submitting your request.",
      },
      { status: 500 }
    );
  }
}