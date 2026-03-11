import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ChatAssistant } from "@/components/chat-assistant";
import { GlobalBackground } from "@/components/backgrounds";
import { ScrollProgress, ScrollToTop } from "@/components/motion";
import { SkipNavigation, SkipNavTarget } from "@/components/accessibility";
import { OfflineIndicator } from "@/components/offline-indicator";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: "CuraSense - AI-Powered Healthcare Assistant",
  description: "Advanced AI-powered medical diagnosis, X-ray analysis, and medicine comparison platform",
  keywords: ["healthcare", "AI", "medical diagnosis", "x-ray analysis", "medicine comparison"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {/* Skip Navigation for Accessibility */}
          <SkipNavigation />
          
          {/* Offline Indicator Banner */}
          <OfflineIndicator />
          
          {/* Premium Multi-Layer Background */}
          <GlobalBackground />
          
          {/* Reading Progress Bar */}
          <ScrollProgress />
          
          <div className="relative flex min-h-screen">
            {/* Desktop Sidebar - Hidden on mobile */}
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex flex-1 flex-col lg:pl-16 transition-all duration-300">
              <Header />
              <SkipNavTarget className="flex-1 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 pb-20 lg:pb-6">
                {children}
              </SkipNavTarget>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <MobileNav />
          
          <ChatAssistant />
          
          {/* Scroll to Top Button */}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
