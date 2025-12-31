import { SideNav } from "@/components/layout/SideNav";
import { Providers } from "@/components/providers/Providers";
import { getCurrentUser } from "@/lib/data/user";

import type { Metadata } from "next";
import { Inter, Noto_Serif_Hebrew } from "next/font/google";
import "./globals.css";

/**
 * Root Layout (DrashX v2.0)
 * Filepath: app/layout.tsx
 * Role: Global shell and provider orchestrator.
 * PRD Alignment: Section 2.1 (Identity), 4.1 (Aesthetics).
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
    default: "DrashX | The Digital Beit Midrash",
    template: "%s | DrashX",
  },
  description:
    "High-performance interface for Jewish text study and community scholarship.",
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
      className={`${notoSerifHebrew.variable} ${inter.variable} paper`}
    >
      <body className="font-sans antialiased bg-paper text-ink selection:bg-zinc-950 selection:text-white">
        {/* Universal Background Texture (Defined in Canvas) */}
        <div className="paper-texture" />

        <Providers>
          <div className="flex h-screen overflow-hidden relative z-10">
            {/* Main Navigation Sidebar
                Design: Zinc-950 Inverse Theme 
            */}
            <SideNav user={user || undefined} />

            {/* Application Content Area */}
            <main className="flex-1 relative overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
