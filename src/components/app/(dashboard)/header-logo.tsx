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
    <Link href="/lists" className='flex min-w-0 items-center'>
      <Image src="/logo.svg" alt="logo" width={1024} height={1024} className="h-auto w-8 md:w-12" />
      <h1 className={cn(`${DancingScript.className}`, "ml-2 max-w-[140px] truncate text-lg font-bold text-primary sm:max-w-none sm:text-2xl md:ml-4 md:text-4xl")}>
        Belo Presente
      </h1>
    </Link>
  );
}
