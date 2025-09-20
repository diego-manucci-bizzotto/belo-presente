"use client";

import {useSession} from "next-auth/react";

export function ListsTitle() {
  const { data: session } = useSession();

  return (
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Bem-vindo(a){session?.user.name ? ", " + session.user.name : "!"} 😁</h2>
        <p className='text-muted-foreground'>
          Aqui você pode gerenciar e acompanhar suas listas de presentes
        </p>
      </div>
  );
}