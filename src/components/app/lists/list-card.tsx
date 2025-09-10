import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {getEmojiByCategory} from "@/utils/utils";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {EllipsisVertical, ExternalLink, Pen, Trash} from "lucide-react";
import Link from "next/link";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";

interface ListProps {
  list: {
    id: string;
    title: string;
    category: string;
    active: boolean;
  };
}

export default function ListCard({list} : ListProps) {
  return (
    <Card className="relative flex bg-white after:content-[''] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-[#b1563c] after:rounded-l">
      <CardHeader>
        <div className='flex gap-4'>
          <span className='text-2xl'>{getEmojiByCategory(list.category)}</span>
          <div className='space-y-1'>
            <CardTitle>{list.title}</CardTitle>
            <CardDescription>
              {list.category}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size='icon'>
                <EllipsisVertical/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-42">
              <div className="">
                <Link href={`/lists/${list.id}/products`}
                      className="flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                  <Pen size={20}/>
                  Editar lista
                </Link>
                <Link href={`/share/${list.id}/`}
                      className="flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                  <ExternalLink size={20}/>
                  Visitar lista
                </Link>
                <Separator/>
                <Button variant="link" onClick={() => {
                }}
                        className="w-full h-10 flex items-center justify-start gap-2 text-red-400 hover:bg-red-100 p-2 transition-colors text-md font-normal rounded-none hover:no-underline">
                  <Trash size={20}/>
                  Excluir lista
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Badge variant='secondary'>
          {list.active ? "Ativa" : "Pausada"}
        </Badge>
      </CardContent>
    </Card>
  )
}