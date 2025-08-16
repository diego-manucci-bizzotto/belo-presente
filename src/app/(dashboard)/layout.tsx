"use client";
import React from "react";
import Header from "@/components/layout/header";

function RootLayout({children,}: Readonly<{ children: React.ReactNode;}>) {
  return (
    <div className={`flex flex-col min-h-screen`}>
        <Header />
        <main className='container mx-auto h-[calc(100vh-80px)]'>
          {children}
        </main>
    </div>
  );
}

export default RootLayout;