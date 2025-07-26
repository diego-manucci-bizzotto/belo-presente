import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import Providers from "@/app/providers";
import {Geist, Geist_Mono} from "next/font/google";

export const metadata: Metadata = {
  title: "Belo Presente",
  description: "Um site para montagem e compartilhamento de listas de presentes",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}