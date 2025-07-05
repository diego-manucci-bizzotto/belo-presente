"use client"

import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {useAuth} from "@/hooks/use-auth";
import {useRouter} from "next/navigation";

export default function Lists() {
  const {user} = useAuth();

  const router = useRouter();

  const navigateToNewList = () => {
    router.push('/lists/new');
  }

  return (
    <main className="flex flex-col gap-4 flex-grow p-4">
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Bem-vindo(a){user?.displayName ? ", " + user?.displayName : "!"} 😁</h2>
          <Button onClick={navigateToNewList} className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
            <Plus/>
            Nova lista
          </Button>
        </div>
        <p className='text-muted-foreground'>
          Aqui você pode gerenciar e acompanhar suas listas de presentes
        </p>
      </div>
      <div className="flex flex-col gap-4">

      </div>
    </main>
  );
}