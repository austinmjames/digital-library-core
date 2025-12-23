import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Libre_Franklin } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TextSettingsProvider } from "@/components/context/text-settings-context";
import "./globals.css";

/**
 * app/layout.tsx
 * The architectural foundation of TorahPro.
 * Wrapping the children in TextSettingsProvider at the root ensures
 * that preferences (Display Mode, Font Size) are retained as the
 * user navigates between different books and chapters.
 */

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  variable: "--font-frank-ruhl",
  display: "swap",
});

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-libre-franklin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TorahPro",
  description: "A collaborative digital sanctuary for Jewish texts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${frankRuhl.variable} ${libreFranklin.variable} font-english antialiased bg-paper transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* The TextSettingsProvider is placed here so it persists 
            throughout the entire session. By wrapping the children, 
            Next.js preserves the state during client-side transitions.
          */}
          <TextSettingsProvider>{children}</TextSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
