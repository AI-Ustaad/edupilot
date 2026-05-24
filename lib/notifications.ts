import sgMail from "@sendgrid/mail";
import twilio from "twilio";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await sgMail.send({ to, from: "noreply@edupilot.com", subject, html });
    console.log(`Email sent to ${to}`);
  } catch (err) { console.error("Email error:", err); }
}

export async function sendSMS(to: string, body: string) {
  try {
    await twilioClient.messages.create({ body, to, from: process.env.TWILIO_PHONE_NUMBER! });
    console.log(`SMS sent to ${to}`);
  } catch (err) { console.error("SMS error:", err); }
}
