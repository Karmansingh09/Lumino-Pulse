import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuminoFlow — Site-Driven EPC Stock & Ordering Planner",
  description: "EPC inventory ledger, causal lead-time ordering planner, and assembly set bottleneck detector for Lumino Industries — 1,700 Poles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-[#f8fafc] antialiased selection:bg-blue-600/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
