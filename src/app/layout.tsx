import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// Only load Geist Sans — Geist Mono is only needed for code blocks (not used in this app)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Prevent invisible text during font load (improves FCP)
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "AI Spend Audit — Find Where You're Overpaying on AI Tools",
    template: "%s — AI Spend Audit",
  },
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
  // Robots
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Skip to main content — keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
