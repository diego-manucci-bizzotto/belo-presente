import React from "react";
import QueryProvider from "@/providers/query-provider";
import {Toaster} from "@/components/ui/sonner";

export default function Providers({children,}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <QueryProvider>
      {children}
      <Toaster richColors/>
    </QueryProvider>
  );
}