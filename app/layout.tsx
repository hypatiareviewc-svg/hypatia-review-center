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
    "Hypatia Review Center prepares aspiring criminologists for the Licensure Examination for Criminologists through disciplined review programs, expert lecturers, and a trusted institutional experience.",
  applicationName: "Hypatia Review Center",
  openGraph: {
    title: "Hypatia Review Center",
    description:
      "Excellence Today. Licensed Tomorrow. A premium review center for aspiring criminologists.",
    url: "/",
    siteName: "Hypatia Review Center",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hypatia Review Center",
    description:
      "Excellence Today. Licensed Tomorrow. A premium review center for aspiring criminologists.",
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
