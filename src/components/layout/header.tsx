"use client"
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {logout} from "@/lib/firebase/auth";

export default function Header() {
  return (
    <header className="flex items-center p-4 bg-background text-white rounded-b-lg border container mx-auto">
      <Image src="/images/logo.svg" alt="logo" width={1024} height={1024} className="w-12 h-auto"/>
      <h1 className="text-3xl font-bold ml-4 text-[#b1563c]">Belo Presente</h1>
      <Button onClick={logout}>
        Sair
      </Button>
    </header>
  );
}