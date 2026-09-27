import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Camo Command",
    template: "%s · Camo Command",
  },
  description:
    "Personal Call of Duty: Mobile camo tracker. Progress stays in your database. This app does not connect to Call of Duty.",
  applicationName: "Camo Command",
  appleWebApp: {
    capable: true,
    title: "Camo Command",
    statusBarStyle: "black",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#171410",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
