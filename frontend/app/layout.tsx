import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { ChatDock } from "@/components/chat/chat-dock";
import { ThemeInitializer } from "@/components/theme/theme-initializer";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FindMyMate",
  description: "Frontend aplikacji FindMyMate",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeInitializer />
        <Navbar />

        <main className="flex-1">
          <Container>{children}</Container>
        </main>

        <Footer />
        <ChatDock />
      </body>
    </html>
  );
}
