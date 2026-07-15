import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metronome - Guitar Exercise",
  description: "A simple, accurate metronome for guitar practice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}