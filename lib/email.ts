import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const client = getResend();

  if (!client) {
    console.warn("RESEND_API_KEY not configured.");
    return {
      success: false,
      error: "Email service not configured",
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: "EduPilot <noreply@edupilot.com>",
      to,
      subject,
      html,
    });

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err,
    };
  }
}