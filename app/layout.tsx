import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TextSettingsProvider } from "@/components/text-settings-context";
import "@/app/main.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Torah Builder",
  description: "A digital sanctuary for Jewish texts",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Wrap children in the TextSettingsProvider so that 
              InteractiveReader and TextViewOptions can access the context.
          */}
          <TextSettingsProvider>
            {children}
          </TextSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}