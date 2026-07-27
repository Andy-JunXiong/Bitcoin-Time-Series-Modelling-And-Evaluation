import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "Bitcoin Benchmark Report — governed cross-regime evidence",
    description: "A provenance-first Bitcoin forecasting benchmark with JSON-sourced metrics, cross-regime evaluation, feature ablation, and fail-safe release gates.",
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title: "Bitcoin Forecast Benchmark Report",
      description: "Seven market regimes, zero candidate wins, and a release gate that preserved the honest baseline.",
      images: [{ url: `${origin}/og.png`, width: 1672, height: 941, alt: "Bitcoin Forecast Intelligence release decision" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bitcoin Forecast Benchmark Report",
      description: "Seven market regimes, zero candidate wins, and a release gate that preserved the honest baseline.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
