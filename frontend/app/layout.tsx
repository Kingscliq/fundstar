import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { WalletProvider } from "@/contexts/WalletContext";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FundStar | Fund what matters, transparently",
  description: "Transparent, borderless crowdfunding for the world's most innovative ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", instrumentSerif.variable, dmSans.variable, dmMono.variable)}
      data-theme="light"
    >
      <body className="min-h-full flex flex-col font-sans">
        <WalletProvider>
          {children}
          <Toaster richColors position="top-right" />
        </WalletProvider>
      </body>
    </html>
  );
}
