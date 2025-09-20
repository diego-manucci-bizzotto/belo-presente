import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/next-auth/auth-options";
import {nanoid} from "nanoid";
import {ListDAO} from "@/daos/list-dao";

export type CreateProductRequest = {
  list_id: string;
  product: {
    name: string;
    description?: string;
    url? : string;
    image_url? : string;
    price: number;
    currency: string;
    quantity: number;
    purchase_type: 'payment' | 'redirect';
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({error: "Não autorizado"}), { status: 401 });
  }

  const {
    name,
    description,
    url,
    image_url,
    price,
    currency,
    quantity,
    purchase_type,
  } = await req.json();

  if (!name || !price || !currency || !quantity || !purchase_type) {
    return new Response(JSON.stringify({error: "Dados incompletos"}), {status: 400});
  }

  try {
    const createdProduct = await ListDAO.createList({title, description, category, userId: session.user.id.toString(), sharedId});

    return new Response(JSON.stringify(createdList), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({error: "Erro ao criar lista"}), {status: 500});
  }
}