"use client";

import {HeaderLogo} from "@/components/app/(dashboard)/header-logo";
import {DesktopNav} from "@/components/app/(dashboard)/desktop-nav";
import {DesktopActions} from "@/components/app/(dashboard)/desktop-actions";
import {MobileNav} from "@/components/app/(dashboard)/mobile-nav";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-background text-white border w-full mx-auto h-20 md:grid md:grid-cols-3">
      <div className="flex items-center">
        <HeaderLogo />
      </div>
      <DesktopNav />
      <div className="flex items-center justify-end">
        <DesktopActions />
        <MobileNav />
      </div>
    </header>
  );
}