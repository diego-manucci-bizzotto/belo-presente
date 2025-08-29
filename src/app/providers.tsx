"use client";

import React from "react";
import {Toaster} from "@/components/ui/sonner";
import {SessionProvider} from "next-auth/react";
import {queryClient} from "@/lib/react-query/queryClient";
import {QueryClientProvider} from "@tanstack/react-query";

export default function Providers({children,}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors/>
      </QueryClientProvider>
    </SessionProvider>
  );
}