"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Menu, Plus, ScrollText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSignOut } from "@/hooks/use-sign-out";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const signOut = useSignOut();
  const isListsSection = pathname === "/lists" || pathname.startsWith("/lists/");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="h-8 w-8 md:hidden bg-[#b1563c] hover:bg-[#a0452f]">
          <Menu className="size-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 md:hidden">
        <DropdownMenuItem
          className={cn(isListsSection && "text-[#b1563c]")}
          onSelect={() => router.push("/lists")}
        >
          <ScrollText className="mr-2 size-4" />
          Listas
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(pathname === "/lists/new" && "text-[#b1563c]")}
          onSelect={() => router.push("/lists/new")}
        >
          <Plus className="mr-2 size-4" />
          Nova lista
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signOut.isPending}
          onSelect={() => signOut.mutate()}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
