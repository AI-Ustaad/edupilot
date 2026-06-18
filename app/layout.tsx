import type { Metadata } from "next";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";
import Providers from "./providers";
import ClientWrapper from "./ClientWrapper"; // 🚀 FIX: ClientWrapper امپورٹ کیا گیا ہے
import enMessages from "../messages/en.json";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "EduPilot | School Management System",
    description: "Next-gen school management and administration platform.",
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers
          locale="en"
          messages={enMessages}
        >
          {/* 🚀 FIX: پوری ایپ کو ClientWrapper کے اندر لپیٹ دیا گیا ہے */}
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
