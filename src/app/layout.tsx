import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MARQ AI Tech — AI Avatar Voice Agents",
  description:
    "MARQ AI Tech Pvt Ltd — AI avatar voice agents for our products: 3 Boxes HRMS, AI CRM, Virtual Try-On, AI ERP, AI Assist. Voice chat in 5 Indian languages.",
  keywords: [
    "MARQ AI Tech",
    "3 Boxes HRMS",
    "AI CRM",
    "Virtual Try-On",
    "AI ERP",
    "AI avatar",
    "voice agent",
    "voice chat",
    "Hindi TTS",
    "Telugu TTS",
    "Tamil TTS",
    "Next.js",
  ],
  authors: [{ name: "MARQ AI Tech Pvt Ltd" }],
  icons: {
    icon: "/marq-logo.png",
    apple: "/marq-logo.png",
  },
  openGraph: {
    title: "MARQ AI Tech — AI Avatar Voice Agents",
    description:
      "AI avatar voice agents for MARQ AI Tech products. Voice chat with lip-sync in 5 Indian languages.",
    url: "https://marqaitech.com",
    siteName: "MARQ AI Tech",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MARQ AI Tech",
    description:
      "AI avatar voice agents for MARQ AI Tech products with voice chat and 5 Indian languages.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
