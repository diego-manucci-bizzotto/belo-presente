"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollText } from "lucide-react";

export function DesktopNav() {
  const pathname = usePathname();
  const isListsSection = pathname === "/lists" || pathname.startsWith("/lists/");

  return (
    <nav className='hidden md:flex items-center justify-center h-full py-2 gap-4'>
      <Link
        href="/lists"
        className={cn(
          "text-muted-foreground hover:text-[#b1563c] transition-colors flex items-center gap-2 pb-1",
          isListsSection ? "text-[#b1563c] border-b-2 border-[#b1563c]" : ""
        )}
      >
        <ScrollText />
        Listas
      </Link>
    </nav>
  );
}
