import { CustomAnimationFormEmail } from "@/components/WebsiteComps/emailTemplate/CustomAnimationFormEmail";
import { Resend } from "resend";
// import { CustomAnimationFormEmail } from "@/components/emails/CustomAnimationFormEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

function validatePayload(body) {
  const errors = {};

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const number = String(body?.number || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || name.length < 2) {
    errors.name = "Name is required.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "A valid email is required.";
  }

  if (!number || !/^[+()\-.\s0-9]{7,24}$/.test(number)) {
    errors.number = "A valid phone number is required.";
  }

  if (!message || message.length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return {
    errors,
    values: {
      name,
      email,
      number,
      message,
    },
  };
}

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        { error: "Missing RESEND_API_KEY." },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      return Response.json(
        { error: "Missing RESEND_FROM_EMAIL." },
        { status: 500 }
      );
    }


    const body = await request.json();

    const { errors, values } = validatePayload(body);

    if (Object.keys(errors).length > 0) {
      return Response.json(
        {
          error: "Please check the form fields.",
          errors,
        },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [process.env.RESEND_FROM_EMAIL],
      subject: `New custom animation request from ${values.name}`,
      replyTo: values.email,
      react: CustomAnimationFormEmail(values),
    });

    if (error) {
      console.error("Resend custom animation form error:", error);

      return Response.json(
        { error: "Failed to send request." },
        { status: 500 }
      );
    }

    return Response.json({
      ok: true,
      id: data?.id,
    });
  } catch (error) {
    console.error("Custom animation form API error:", error);

    return Response.json(
      { error: "Failed to send request." },
      { status: 500 }
    );
  }
}