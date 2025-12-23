import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Libre_Franklin } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TextSettingsProvider } from "@/components/context/text-settings-context";
import { AuthProvider } from "@/components/context/auth-context";
import "./globals.css";

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
          <AuthProvider>
            <TextSettingsProvider>{children}</TextSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
