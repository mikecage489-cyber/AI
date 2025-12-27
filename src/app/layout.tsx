import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Government Bid Scraper",
  description: "Secure, scalable platform for extracting procurement bids from government portals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
