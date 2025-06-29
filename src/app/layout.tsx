import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import React from "react";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner"
import {AuthProvider} from "@/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Belo Presente",
  description: "Um site para montagem e compartilhamento de listas de presentes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <QueryProvider>
        <html lang="pt-BR">
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
            <Toaster richColors/>
          </body>
        </html>
      </QueryProvider>
    </AuthProvider>
  );
}
