"use client";
import React from "react";
import Header from "@/components/layout/header";
import withProtected from "@/hocs/with-protected";

function RootLayout({children,}: Readonly<{ children: React.ReactNode;}>) {
  return (
    <div className={`flex flex-col min-h-screen`}>
        <Header />
        <div className='container mx-auto'>
          {children}
        </div>
    </div>
  );
}

export default withProtected(RootLayout);