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
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </body>
    </html>
  );
}