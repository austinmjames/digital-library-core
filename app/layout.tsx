import { SideNav } from "@/components/layout/SideNav";
import type { Metadata } from "next";
import { Inter, Noto_Serif_Hebrew } from "next/font/google";
import "./globals.css";

/**
 * Root Layout
 * Filepath: app/layout.tsx
 * Role: Global shell for DrashX Scriptorium.
 * Context: PRD Section 4 (Typography & Layout).
 */

// Configure Noto Serif Hebrew for primary textual content
const notoSerifHebrew = Noto_Serif_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-hebrew",
  weight: ["300", "400", "700"],
});

// Configure Inter (proxy for Segoe UI style) for interface
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "DrashX | The Digital Beit Midrash",
  description:
    "High-performance interface for Jewish text study, community insights, and translation projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSerifHebrew.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-paper text-ink">
        <div className="flex h-screen overflow-hidden">
          {/* Main Navigation Sidebar */}
          <SideNav />

          {/* Application Content Area */}
          <main className="flex-1 relative overflow-y-auto bg-paper selection:bg-orange-100 selection:text-orange-900">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
