"use client";

import React from "react";
import QueryProvider from "@/providers/query-provider";
import {Toaster} from "@/components/ui/sonner";
import {SessionProvider} from "next-auth/react";

export default function Providers({children,}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <SessionProvider>
      <QueryProvider>
        {children}
        <Toaster richColors/>
      </QueryProvider>
    </SessionProvider>
  );
}