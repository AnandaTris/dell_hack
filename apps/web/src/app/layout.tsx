import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { AccessibilityWrapper } from "@/components/AccessibilityWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareKaki — Your care buddy that knows where to start",
  description:
    "CareKaki helps seniors and caregivers navigate community care services in Singapore. Personalised pathways, not directories.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CareKaki",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-900`}>
        <AppProvider>
          <AccessibilityWrapper>{children}</AccessibilityWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
