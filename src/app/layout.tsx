import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "Belo Presente",
  description: "Um site para montagem e compartilhamento de listas de presentes",
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode;}>) {
  return (
    <Providers>
      <html lang="pt-BR">
        {children}
      </html>
    </Providers>
  );
}