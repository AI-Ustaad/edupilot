// lib/queue/publisher.ts
import { Client } from "@upstash/qstash";

// Initialize QStash Client
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export class Queue {
  static async publishJob(jobType: string, payload: any) {
    // Development اور Production کے URLs ہینڈل کرنے کے لیے
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";
    const webhookUrl = `${baseUrl}/api/webhooks/qstash`;

    console.log(`[Queue] Publishing ${jobType} job to ${webhookUrl}...`);

    return await qstash.publishJSON({
      url: webhookUrl,
      body: { type: jobType, data: payload },
      retries: 3, // اگر ورکر فیل ہو جائے، تو QStash اسے 3 بار خود دوبارہ چلائے گا!
    });
  }
}
