import { SideNav } from "@/components/layout/SideNav";
import { getCurrentUser } from "@/lib/data/user";
import type { Metadata } from "next";
import { Inter, Noto_Serif_Hebrew } from "next/font/google";
import "./globals.css";

/**
 * Root Layout
 * Filepath: src/app/layout.tsx
 * Role: Global shell for DrashX Scriptorium.
 * Update: Now fetches server-side user data to power Admin/Pro features in SideNav.
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user session/profile server-side to prevent layout shift
  // This allows the SideNav to immediately show Admin/Pro features if authorized
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${notoSerifHebrew.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-paper text-ink">
        <div className="flex h-screen overflow-hidden">
          {/* Main Navigation Sidebar with User Context */}
          <SideNav user={user || undefined} />

          {/* Application Content Area */}
          <main className="flex-1 relative overflow-y-auto bg-paper selection:bg-orange-100 selection:text-orange-900">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
