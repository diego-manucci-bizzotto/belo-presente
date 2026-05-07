"use client";

import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterActionsToolbarProps {
  filter: string;
  placeholder: string;
  onFilterChangeAction: (value: string) => void;
  action?: ReactNode;
  className?: string;
}

export function FilterActionsToolbar({
  filter,
  placeholder,
  onFilterChangeAction,
  action,
  className,
}: FilterActionsToolbarProps) {
  return (
    <div className={cn("flex flex-col items-stretch gap-3 sm:flex-row sm:items-center", className)}>
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#b1563c]/70" />
        <Input
          value={filter}
          onChange={(event) => onFilterChangeAction(event.target.value)}
          type="text"
          placeholder={placeholder}
          className="h-10 w-full border-[#d7c7c2] bg-white pl-9 text-foreground placeholder:text-[#7b6f6a] focus-visible:border-[#b1563c] focus-visible:ring-[#b1563c]/30"
        />
      </div>
      {action && <div className="sm:ml-auto">{action}</div>}
    </div>
  );
}
