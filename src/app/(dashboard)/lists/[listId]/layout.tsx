"use client";

import React, {use} from "react";
import {usePathname} from "next/navigation";
import {ListHeader} from "@/components/app/lists/[listId]/list-header";
import {ListSidebarNav} from "@/components/app/lists/[listId]/list-sidebar-nav";

export default function RootLayout({ children, params }: Readonly<{ children: React.ReactNode, params: Promise<{ listId: string }>}>) {
  const pathname = usePathname();
  const { listId } = use(params);

  return (
    <div className="flex flex-col items-start gap-4 flex-grow p-4 h-full">
      {listId && (
        <ListHeader listId={Number(listId)} pathname={pathname} />
      )}
      <div className='flex flex-col md:flex-row w-full gap-8 flex-grow min-h-0'>
        {listId && (
          <ListSidebarNav listId={Number(listId)} pathname={pathname}/>
        )}
        {children}
      </div>
    </div>
  );
}