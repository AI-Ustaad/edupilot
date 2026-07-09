import { Client } from "@upstash/qstash";
import { logger } from "@/lib/logger/logger";

let qstash: Client | null = null;

function getQstash() {
  if (!process.env.QSTASH_TOKEN) {
    return null;
  }

  if (!qstash) {
    qstash = new Client({
      token: process.env.QSTASH_TOKEN,
    });
  }

  return qstash;
}

export class Queue {
  static async publishJob(jobType: string, payload: any) {
    const client = getQstash();

    if (!client) {
      logger.warn("QSTASH_TOKEN missing.");
      return;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://your-domain.com";

    return client.publishJSON({
      url: `${baseUrl}/api/webhooks/qstash`,
      body: {
        type: jobType,
        data: payload,
      },
      retries: 3,
    });
  }
}