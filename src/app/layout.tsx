import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Spend Audit — Find Where You're Overpaying on AI Tools",
  description:
    "Free audit tool for startup founders and engineering managers. Discover where you're overspending on AI tools like Cursor, Copilot, Claude, and ChatGPT — and see exactly how much you could save.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://credex-spend-audit.vercel.app"
  ),
  openGraph: {
    type: "website",
    siteName: "AI Spend Audit by Credex",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
