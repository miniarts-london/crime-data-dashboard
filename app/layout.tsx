import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import Providers from "@/components/ContextRoot/Providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Crime Data Dashboard",
  description: "Search UK street-level crime data by postcode and date range.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
