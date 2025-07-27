"use client"
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {logout} from "@/lib/firebase/auth";
import Link from "next/link";
import {Separator} from "@/components/ui/separator";
import {HandCoins, LogOut, MessageCircle, ScrollText, UserRound} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {redirect, usePathname} from "next/navigation";
import {cn} from "@/lib/utils";

export default function Header() {

  const pathname = usePathname();

  const handleSupport = () => {
    redirect('/support');
  }

  const handleUser = () => {
    redirect('/user');
  }

  const handleLogout = () => {
    logout().then(() => {
      redirect('/login');
    });
  }

  return (
    <header className="flex items-center p-4 bg-background text-white border w-full mx-auto h-20">
      <div className='flex items-center flex-1'>
        <Image src="/images/logo.svg" alt="logo" width={1024} height={1024} className="w-12 h-auto"/>
        <h1 className="text-3xl font-bold ml-4 text-[#b1563c]">Belo Presente</h1>
      </div>
      <div className='flex items-center flex-1 justify-center h-full py-2 gap-4'>
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
      <div className='flex items-center flex-1 justify-end gap-4'>
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
            <Button size="icon" onClick={handleUser} className='bg-[#b1563c] hover:bg-[#a0452f]'>
              <UserRound/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Perfil</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={handleLogout} className='bg-[#b1563c] hover:bg-[#a0452f]'>
              <LogOut/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sair</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}