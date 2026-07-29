import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Smriti — A Digital Tribute Wall to My Teachers",
  description: "A heartfelt personal tribute wall dedicated to honoring, remembering, and expressing gratitude to the teachers who shaped my journey.",
  keywords: ["Tribute Wall", "Teachers", "Smriti", "Gratitude", "Guru", "Education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#fffdf5] text-amber-950">
        {children}
      </body>
    </html>
  );
}

