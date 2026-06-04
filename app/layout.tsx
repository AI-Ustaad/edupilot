import type { Metadata } from 'next';
import * as Sentry from '@sentry/nextjs';
import "./globals.css"; // اگر آپ کی سی ایس ایس فائل کا نام کچھ اور ہے تو اسے یہاں اپ ڈیٹ کریں

// Sentry Tracing کے لیے Metadata
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
        {children}
      </body>
    </html>
  );
}
