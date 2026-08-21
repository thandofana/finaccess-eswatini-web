import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  return {
    metadataBase,
    title: { default: "FinAccess Eswatini", template: "%s · FinAccess Eswatini" },
    description: "Financial-access evidence, model research, and explainable assessment for Eswatini.",
    applicationName: "FinAccess Eswatini",
    keywords: ["financial inclusion", "mobile money", "Eswatini", "machine learning", "explainable AI"],
    openGraph: {
      title: "FinAccess Eswatini",
      description: "Evidence. Prediction. Explanation.",
      type: "website",
      images: [{ url: "/og.png", width: 1734, height: 907, alt: "FinAccess Eswatini — Evidence. Prediction. Explanation." }],
    },
    twitter: { card: "summary_large_image", title: "FinAccess Eswatini", description: "Evidence. Prediction. Explanation.", images: ["/og.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sourceSans.variable} ${sourceSerif.variable}`}>{children}</body></html>;
}
