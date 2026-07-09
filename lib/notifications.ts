import sgMail from "@sendgrid/mail";
import twilio from "twilio";
import { logger } from "@/lib/logger/logger";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await sgMail.send({ to, from: "noreply@edupilot.com", subject, html });
    logger.info(`Email sent to ${to}`);
  } catch (err) { logger.error("Email error:", { metadata: { error: err } }); }
}

export async function sendSMS(to: string, body: string) {
  try {
    await twilioClient.messages.create({ body, to, from: process.env.TWILIO_PHONE_NUMBER! });
    logger.info(`SMS sent to ${to}`);
  } catch (err) { logger.error("SMS error:", { metadata: { error: err } }); }
}
