"use client";

import React, {use} from "react";
import {usePathname} from "next/navigation";
import {ListHeader} from "@/components/app/(dashboard)/lists/[listId]/list-header";
import {ListSidebarNav} from "@/components/app/(dashboard)/lists/[listId]/list-sidebar-nav";

export default function RootLayout({ children, params }: Readonly<{ children: React.ReactNode, params: Promise<{ listId: string }>}>) {
  const pathname = usePathname();
  const { listId } = use(params);

  return (
    <div className="flex min-h-full flex-col items-start gap-4 p-3 md:p-4">
      <ListHeader listId={Number(listId)} pathname={pathname} />
      <div className="flex w-full flex-col gap-4 md:flex-row md:gap-8">
        <ListSidebarNav listId={Number(listId)} pathname={pathname}/>
        {children}
      </div>
    </div>
  );
}
