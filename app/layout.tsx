import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metronome",
  description: "A simple metronome for guitar practice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 min-h-screen flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}