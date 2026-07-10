import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { FirstLoadSplash } from "@/components/first-load-splash";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hypatiareviewcenter.edu.ph"),
  title: {
    default: "Hypatia Review Center",
    template: "%s | Hypatia Review Center",
  },
  description:
    "Hypatia Review Center is a premier review institution dedicated to preparing aspiring criminologists for the Licensure Examination for Criminologists (LEC). With expert lecturers, comprehensive review programs, and a results-driven approach, we equip future licensed criminologists with the knowledge, confidence, and discipline needed to excel in the board exam and beyond.",
  applicationName: "Hypatia Review Center",
  openGraph: {
    title: "Hypatia Review Center",
    description:
      "Hypatia Review Center is a premier review institution dedicated to preparing aspiring criminologists for the Licensure Examination for Criminologists (LEC). Expert lecturers, comprehensive programs, and a results-driven approach to help you become a licensed criminologist.",
    url: "/",
    siteName: "Hypatia Review Center",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hypatia Review Center",
    description:
      "Hypatia Review Center is a premier review institution dedicated to preparing aspiring criminologists for the Licensure Examination for Criminologists (LEC). Expert lecturers, comprehensive programs, and a results-driven approach to help you become a licensed criminologist.",
  },
  icons: {
    icon: "/logo1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] antialiased">
        <FirstLoadSplash>{children}</FirstLoadSplash>
      </body>
    </html>
  );
}
