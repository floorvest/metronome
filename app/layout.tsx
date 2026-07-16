import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metronome",
  description:
    "A simple metronome for guitar practice. Adjust tempo, time signature, and play along with audio and visual beats.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}