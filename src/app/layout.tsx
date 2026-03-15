import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/app-shell/AppShell";

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
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}