"use client"

import React from "react";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {Check} from "lucide-react";

export default function CategoryButton({onClick, selected, category, icon}: { onClick: () => void; selected: boolean; category: string; icon: string; }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn("w-auto h-30 flex flex-col justify-center itens-center p-4 bg-white rounded-lg border relative hover:bg-gray-50 transition-colors cursor-pointer", selected && "border-blue-500 border-2 cursor-default hover:bg-white")}
    >
      {selected && (
        <Badge className="bg-blue-500 absolute top-3 right-3 size-4 rounded-full p-0"><Check/></Badge>)}
      <span className="text-3xl mb-2">{icon}</span>
      <span>{category}</span>
    </button>
  );
}