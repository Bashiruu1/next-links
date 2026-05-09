import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { config } from "@/config/links";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: config.meta.title,
  description: config.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <head>
        {process.env.NODE_ENV === "production" && (
          <meta
            httpEquiv="Content-Security-Policy"
            content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tiktokcdn.com; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"
          />
        )}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
