
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INTRIX | Workspace",
  description: "INTRIX workspace and member portal",
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
