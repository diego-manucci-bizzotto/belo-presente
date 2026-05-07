import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { ListGalleryItemDAO } from "@/daos/list-gallery-item-dao";

type GalleryRequestBody = {
  image_url?: unknown;
  caption?: unknown;
};

const MAX_IMAGE_URL_LENGTH = 3_000_000;

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const isValidHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidImageDataUrl = (value: string): boolean => {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(value);
};

const isValidGalleryImageInput = (value: string): boolean => {
  return isValidHttpUrl(value) || isValidImageDataUrl(value);
};

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? String(session.user.id) : null;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ listId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId } = await context.params;
  const list = await ListDAO.getListByIdAndUserId(listId, userId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  try {
    const items = await ListGalleryItemDAO.getItemsByListId(listId);
    return NextResponse.json(items, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar galeria" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ listId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId } = await context.params;
  const list = await ListDAO.getListByIdAndUserId(listId, userId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const body: GalleryRequestBody = await req.json();

  const imageUrl = normalizeOptionalString(body.image_url);
  const caption = normalizeOptionalString(body.caption) ?? "";

  if (!imageUrl) {
    return NextResponse.json({ error: "Imagem e obrigatoria" }, { status: 400 });
  }

  if (imageUrl.length > MAX_IMAGE_URL_LENGTH) {
    return NextResponse.json({ error: "Imagem muito grande" }, { status: 400 });
  }

  if (!isValidGalleryImageInput(imageUrl)) {
    return NextResponse.json({ error: "Imagem invalida" }, { status: 400 });
  }

  if (caption.length > 255) {
    return NextResponse.json({ error: "Legenda deve ter no maximo 255 caracteres" }, { status: 400 });
  }

  try {
    const createdItem = await ListGalleryItemDAO.createItem({
      listId,
      imageUrl,
      caption,
    });

    return NextResponse.json(createdItem, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao adicionar imagem" }, { status: 500 });
  }
}
