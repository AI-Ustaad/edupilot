import sgMail from "@sendgrid/mail";
import twilio from "twilio";
import { logger } from "@/lib/logger/logger";

export function getTwilioClient(): twilio.Twilio | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return null;
  }
  return twilio(accountSid, authToken);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    logger.warn(`SendGrid API key not configured; skipping email to ${to}`);
    return;
  }

  try {
    sgMail.setApiKey(apiKey);
    await sgMail.send({ to, from: process.env.SENDGRID_FROM_EMAIL || "noreply@edupilot.com", subject, html });
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error("Email error:", { metadata: { error: err } });
  }
}

export async function sendSMS(to: string, body: string): Promise<void> {
  const twilioClient = getTwilioClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioClient || !fromNumber) {
    logger.warn(`Twilio credentials or phone number missing; skipping SMS to ${to}`);
    return;
  }

  try {
    await twilioClient.messages.create({ body, to, from: fromNumber });
    logger.info(`SMS sent to ${to}`);
  } catch (err) {
    logger.error("SMS error:", { metadata: { error: err } });
  }
}
