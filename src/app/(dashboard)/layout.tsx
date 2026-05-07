"use client";
import React from "react";
import Header from "@/components/app/(dashboard)/header";

function RootLayout({children,}: Readonly<{ children: React.ReactNode;}>) {
  return (
    <div className="flex min-h-dvh flex-col">
        <Header />
        <main className="container mx-auto flex-1">
          {children}
        </main>
    </div>
  );
}

export default RootLayout;
