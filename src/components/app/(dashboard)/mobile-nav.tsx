"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ScrollText, HandCoins, MessageCircle, UserRound, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSignOut } from "@/hooks/use-sign-out";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" className="md:hidden bg-[#b1563c] hover:bg-[#a0452f]">
          <Menu className="size-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="md:hidden">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className='px-4 space-y-6'>
          <div className='space-y-2'>
            <p className='text-sm font-semibold text-muted-foreground'>Geral</p>
            <ul className='space-y-1'>
              <li>
                <Link
                  href="/lists"
                  onClick={() => setIsOpen(false)}
                  className={cn("flex w-full items-center gap-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-[#b1563c]", pathname === "/lists" ? "bg-gray-100 text-[#b1563c]" : "")}
                >
                  <ScrollText />
                  Listas
                </Link>
              </li>
              <li>
                <Link
                  href="/withdrawals"
                  onClick={() => setIsOpen(false)}
                  className={cn("flex w-full items-center gap-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-[#b1563c]", pathname === "/withdrawals" ? "bg-gray-100 text-[#b1563c]" : "")}
                >
                  <HandCoins />
                  Saques
                </Link>
              </li>
            </ul>
          </div>
          <div className='space-y-2'>
            <p className='text-sm font-semibold text-muted-foreground'>Utilidade</p>
            <ul className='space-y-1'>
              <li>
                <Link
                  href="/support"
                  onClick={() => setIsOpen(false)}
                  className={cn("flex w-full items-center gap-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-[#b1563c]", pathname === "/support" ? "bg-gray-100 text-[#b1563c]" : "")}
                >
                  <MessageCircle />
                  Suporte
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className={cn("flex w-full items-center gap-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-[#b1563c]", pathname === "/profile" ? "bg-gray-100 text-[#b1563c]" : "")}
                >
                  <UserRound />
                  Perfil
                </Link>
              </li>
              <li className='w-full'>
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut.mutate();
                    setIsOpen(false);
                  }}
                  className="text-md w-full justify-start p-2 px-2! h-auto font-normal text-muted-foreground hover:text-[#b1563c] hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <LogOut className='size-6' />
                  Sair
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}