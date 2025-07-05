import {Geist, Geist_Mono} from "next/font/google";
import React from "react";
import Header from "@/components/layout/header";
import AuthenticatedRoute from "@/components/routes/authenticated-route";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode;}>) {
  return (
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased container mx-auto flex flex-col min-h-screen`}>
      <AuthenticatedRoute>
        <Header />
        {children}
      </AuthenticatedRoute>
    </body>
  );
}