"use client";
import React from "react";
import withPublic from "@/hocs/with-public";

function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <div>
      {children}
    </div>
  );
}

export default withPublic(RootLayout);