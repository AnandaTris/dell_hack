import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { AccessibilityWrapper } from "@/components/AccessibilityWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
  themeColor: "#4a7c50",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={outfit.className}
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
      >
        <AppProvider>
          <AccessibilityWrapper>{children}</AccessibilityWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
