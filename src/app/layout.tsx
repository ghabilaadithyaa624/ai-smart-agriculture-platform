import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriPulse AI - Precision Smart Agriculture & Farm Analytics",
  description:
    "AI-powered precision agriculture platform for crop prediction, plant disease image classification, yield forecasting, smart irrigation, and farm telemetry.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-stone-900">
      <body className="h-full bg-stone-900 text-stone-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
