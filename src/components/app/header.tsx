"use client"
import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Separator} from "@/components/ui/separator";
import {HandCoins, LogOut, Menu, MessageCircle, ScrollText, UserRound} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {redirect, usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {useSignOut} from "@/services/auth/logout";
import {Dancing_Script} from "next/font/google";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";

const DancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});


export default function Header() {

  const pathname = usePathname();
  const signOut = useSignOut();

  const handleSupport = () => {
    redirect('/support');
  }

  const handleProfile = () => {
    redirect('/profile');
  }

  const handleSignOut = () => {
    signOut.mutate();
  }

  return (
    <header className="flex items-center justify-between p-4 bg-background text-white border w-full mx-auto h-20 md:grid md:grid-cols-3">
      <div className='flex items-center'>
        <Image src="/logo.svg" alt="logo" width={1024} height={1024} className="w-10 md:w-12 h-auto"/>
        <h1 className={cn(`${DancingScript.className}`, "text-3xl md:text-4xl font-bold ml-4 text-primary")}>
          Belo Presente
        </h1>
      </div>
      <div className='hidden md:flex items-center justify-center h-full py-2 gap-4'>
        <Link
          href="/lists"
          className={cn(
            "text-muted-foreground hover:text-[#b1563c] transition-colors flex items-center gap-2 pb-1",
            pathname === "/lists" ? "text-[#b1563c] border-b-2 border-[#b1563c]" : ""
          )}
        >
          <ScrollText/>
          Listas
        </Link>
        <Separator orientation="vertical" className="mx-2 h-12"/>
        <Link
          href="/withdrawals"
          className={cn(
            "text-muted-foreground hover:text-[#b1563c] transition-colors flex items-center gap-2 pb-1",
            pathname === "/withdrawals" ? "text-[#b1563c] border-b-2 border-[#b1563c]" : ""
          )}
        >
          Saques
          <HandCoins/>
        </Link>
      </div>
      <div className='hidden md:flex items-center justify-end gap-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={handleSupport} className='bg-[#b1563c] hover:bg-[#a0452f]'>
              <MessageCircle/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Suporte</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={handleProfile} className='bg-[#b1563c] hover:bg-[#a0452f]'>
              <UserRound/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Perfil</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={handleSignOut} className='bg-[#b1563c] hover:bg-[#a0452f]'>
              <LogOut/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sair</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Sheet>
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
              <p className='text-sm font-semibold text-muted-foreground'>Opções</p>
              <ul className='space-y-1'>
                <li className='p-2 rounded-md hover:bg-gray-100 transition-colors'>
                  <Link
                    href="/lists"
                    className={cn(
                      "text-muted-foreground hover:text-[#b1563c] transition-colors flex items-center gap-2",
                      pathname === "/lists" ? "text-[#b1563c]" : ""
                    )}
                  >
                    <ScrollText/>
                    Listas
                  </Link>
                </li>
                <li className='p-2 rounded-md hover:bg-gray-100 transition-colors'>
                  <Link
                    href="/withdrawals"
                    className={cn(
                      "text-muted-foreground hover:text-[#b1563c] transition-colors flex items-center gap-2",
                      pathname === "/withdrawals" ? "text-[#b1563c]" : ""
                    )}
                  >
                    <HandCoins/>
                    Saques
                  </Link>
                </li>
              </ul>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-semibold text-muted-foreground'>Utilidade</p>
              <ul className='space-y-1'>
                <li className='p-2 rounded-md hover:bg-gray-100 transition-colors'>
                  <Link
                    href="/support"
                    className={cn(
                      "text-muted-foreground hover:text-[#b1563c] transition-colors flex items-center gap-2",
                      pathname === "/support" ? "text-[#b1563c]" : ""
                    )}
                  >
                    <MessageCircle/>
                    Suporte
                  </Link>
                </li>
                <li className='p-2 rounded-md hover:bg-gray-100 transition-colors'>
                  <Link
                    href="/profile"
                    className={cn(
                      "text-muted-foreground hover:text-[#b1563c] transition-colors flex items-center gap-2",
                      pathname === "/withdrawals" ? "text-[#b1563c]" : ""
                    )}
                  >
                    <UserRound/>
                    Perfil
                  </Link>
                </li>
                <li className='w-full'>
                  <Button
                    variant="ghost" // Makes the button transparent
                    onClick={handleSignOut}
                    className="text-md w-full justify-start p-2 px-2! h-auto font-normal text-muted-foreground hover:text-[#b1563c] hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <LogOut className='size-6'/> {/* More appropriate icon */}
                    Sair
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}