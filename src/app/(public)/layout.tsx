"use client";
import React from "react";
import withPublic from "@/hocs/with-public";

function Layout({children,}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <div className='bg-wave'>
      {children}
    </div>
  );
}

export default withPublic(Layout);