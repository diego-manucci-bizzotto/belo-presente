import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/next-auth/auth-options";
import {nanoid} from "nanoid";
import {ListDAO} from "@/daos/list-dao";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({error: "Não autorizado"}), { status: 401 });
  }

  try {
    const lists = await ListDAO.getListsByUserId(session.user.id.toString());

    console.log(lists);

    return new Response(JSON.stringify(lists), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({error: "Erro ao buscar listas"}), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({error: "Não autorizado"}), { status: 401 });
  }

  const {title, description, category} = await req.json();

  if (!title || !category) {
    return new Response(JSON.stringify({error: "Título e categoria são obrigatórios"}), {status: 400});
  }

  try {
    const sharedId = nanoid(8);

    const createdList = await ListDAO.createList({title, description, category, userId: session.user.id.toString(), sharedId});

    return new Response(JSON.stringify(createdList), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({error: "Erro ao criar lista"}), {status: 500});
  }
}