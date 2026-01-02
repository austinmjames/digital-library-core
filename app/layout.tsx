import { SideNav } from "@/components/layout/SideNav";
import { Providers } from "@/components/providers/Providers";
import { getCurrentUser } from "@/lib/data/user";

import type { Metadata } from "next";
import { Inter, Noto_Serif_Hebrew } from "next/font/google";
import "./globals.css";

/**
 * Root Layout (DrashX v2.1 - Material Edition)
 * Filepath: app/layout.tsx
 * Role: Global shell and provider orchestrator.
 * Style: Modern Google (Material 3). Clean typography, dynamic theme variables.
 */

const notoSerifHebrew = Noto_Serif_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-hebrew",
  weight: ["300", "400", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DrashX | Digital Beit Midrash",
    template: "%s | DrashX",
  },
  description:
    "High-performance interface for canonical study and communal scholarship.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side user fetch to power SideNav features without flickering
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${notoSerifHebrew.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-[var(--paper)] text-[var(--ink)] transition-colors duration-300">
        {/* Providers wrapper for Auth, QueryClient, and Theme context.
            SideNav utilizes the Zinc-950 Inverse Theme for high-contrast navigation.
        */}
        <Providers>
          <div className="flex h-screen overflow-hidden relative z-10">
            {/* Main Navigation Sidebar */}
            <SideNav user={user || undefined} />

            {/* Global Content Area with standardized scrollbar */}
            <main className="flex-1 relative overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </Providers>

        {/* Global Loading / Transition Overlay could be added here if needed */}
      </body>
    </html>
  );
}
