import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "0G Twin | Permanent AI Digital Twin",
  description: "Securely store your identity, knowledge, skills, and goals permanently on the 0G Storage network to power your RAG-driven AI clone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-slate-100 bg-[#030303]`}
      >
        {children}
      </body>
    </html>
  );
}
