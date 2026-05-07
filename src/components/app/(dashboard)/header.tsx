"use client";

import {HeaderLogo} from "@/components/app/(dashboard)/header-logo";
import {DesktopActions} from "@/components/app/(dashboard)/desktop-actions";
import {MobileNav} from "@/components/app/(dashboard)/mobile-nav";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background px-2.5 md:h-20 md:px-4">
      <div className="flex items-center">
        <HeaderLogo />
      </div>
      <div className="flex items-center justify-end gap-2">
        <DesktopActions />
        <MobileNav />
      </div>
    </header>
  );
}
