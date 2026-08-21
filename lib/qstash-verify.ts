import { Receiver } from "@upstash/qstash";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function verifyQStashSignature(req: Request): Promise<string> {
  const signature = req.headers.get("Upstash-Signature") || "";
  const body = await req.text();
  const valid = await receiver.verify({ signature, body });
  if (!valid) throw new Error("Invalid QStash signature");
  return body;
}
