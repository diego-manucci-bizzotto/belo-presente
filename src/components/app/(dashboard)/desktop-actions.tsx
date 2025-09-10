"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSignOut } from "@/hooks/use-sign-out";
import { LogOut, MessageCircle, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

export function DesktopActions() {
  const router = useRouter();
  const signOut = useSignOut();

  return (
    <div className='hidden md:flex items-center justify-end gap-4'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" onClick={() => router.push('/support')} className='bg-[#b1563c] hover:bg-[#a0452f]'>
            <MessageCircle />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Suporte</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" onClick={() => router.push('/profile')} className='bg-[#b1563c] hover:bg-[#a0452f]'>
            <UserRound />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Perfil</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" onClick={() => signOut.mutate()} className='bg-[#b1563c] hover:bg-[#a0452f]'>
            <LogOut />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Sair</p></TooltipContent>
      </Tooltip>
    </div>
  );
}