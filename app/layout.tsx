import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { TextSettingsProvider } from "@/components/context/text-settings-context";
import { AuthProvider } from "@/components/context/auth-context";
import "./globals.css";

/**
 * app/layout.tsx
 * Updated: Branding set to DrashX.
 * Typography: Enforced 'font-sans' (Segoe UI) at the document level to prevent serif fallbacks.
 */

export const metadata: Metadata = {
  title: "DrashX",
  description: "A collaborative digital sanctuary for deep text exploration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <body className="antialiased bg-paper transition-colors duration-300 min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TextSettingsProvider>{children}</TextSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
