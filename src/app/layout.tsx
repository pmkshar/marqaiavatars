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
  title: "Polymath Avatar — One Face, Many Voices",
  description:
    "An AI avatar that transforms into different voice agents for different products. Powered by Z.ai LLM, TTS, and VLM.",
  keywords: [
    "AI avatar",
    "voice agent",
    "Z.ai",
    "Next.js",
    "TTS",
    "LLM",
    "product assistant",
  ],
  authors: [{ name: "Built with Z.ai" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Polymath Avatar — One Face, Many Voices",
    description:
      "An AI avatar that transforms into different voice agents for different products.",
    url: "https://chat.z.ai",
    siteName: "Polymath Avatar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Polymath Avatar",
    description:
      "An AI avatar that transforms into different voice agents for different products.",
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
