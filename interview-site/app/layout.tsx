import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "Bitcoin Forecast Lab — Leakage-aware ML benchmark",
    description: "An honest, reproducible study of whether machine learning can beat Bitcoin price persistence.",
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title: "Can machine learning beat tomorrow = today?",
      description: "A leakage-aware Bitcoin forecasting benchmark where the honest baseline won.",
      images: [{ url: `${origin}/og.png`, width: 1672, height: 941, alt: "Bitcoin Forecast Lab benchmark result" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bitcoin Forecast Lab",
      description: "A leakage-aware Bitcoin forecasting benchmark where the honest baseline won.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geist.variable} ${mono.variable}`}>{children}</body></html>;
}
