"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollText, HandCoins } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className='hidden md:flex items-center justify-center h-full py-2 gap-4'>
      <Link
        href="/lists"
        className={cn(
          "text-muted-foreground hover:text-[#b1563c] transition-colors flex items-center gap-2 pb-1",
          pathname === "/lists" ? "text-[#b1563c] border-b-2 border-[#b1563c]" : ""
        )}
      >
        <ScrollText />
        Listas
      </Link>
      <Separator orientation="vertical" className="mx-2 h-12" />
      <Link
        href="/withdrawals"
        className={cn(
          "text-muted-foreground hover:text-[#b1563c] transition-colors flex items-center gap-2 pb-1",
          pathname === "/withdrawals" ? "text-[#b1563c] border-b-2 border-[#b1563c]" : ""
        )}
      >
        Saques
        <HandCoins />
      </Link>
    </nav>
  );
}