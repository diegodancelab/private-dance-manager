import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Dance Manager",
  description: "Manage private dance lessons, students, charges, and payments.",
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