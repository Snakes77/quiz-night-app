import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dalyan Quiz Night",
  description: "🇹🇷 Create and run amazing quiz nights with AI-powered questions, music, films, and more!",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
