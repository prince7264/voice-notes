import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Notes",
  description: "Capture thoughts instantly with voice — for professionals and personal use.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
