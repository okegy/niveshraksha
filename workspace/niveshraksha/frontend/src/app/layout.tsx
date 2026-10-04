import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { ChatWidget } from "@/components/chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NiveshRaksha — Pause. Verify. Protect.",
  description:
    "A safety tool that helps Indian investors spot suspicious financial messages, verify advisors against official sources, and take safe next steps. Not investment advice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950">
        <LanguageProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="py-6 text-center text-slate-500 dark:text-slate-400 text-sm border-t bg-white dark:bg-slate-900 px-4">
            <p>NiveshRaksha — Investor Resilience Platform. A Sangyan Hackathon Project.</p>
            <p className="mt-1 text-xs">
              Safety analysis only. Never investment advice. Verify everything through official sources.
            </p>
          </footer>
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
