"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dancing_Script } from "next/font/google";

const DancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

export function HeaderLogo() {
  return (
    <Link href="/lists" className='flex items-center'>
      <Image src="/logo.svg" alt="logo" width={1024} height={1024} className="w-10 md:w-12 h-auto" />
      <h1 className={cn(`${DancingScript.className}`, "text-3xl md:text-4xl font-bold ml-4 text-primary")}>
        Belo Presente
      </h1>
    </Link>
  );
}