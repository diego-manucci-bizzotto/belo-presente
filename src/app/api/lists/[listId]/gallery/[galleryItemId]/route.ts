import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { ListGalleryItemDAO } from "@/daos/list-gallery-item-dao";

type MoveDirection = "up" | "down";

type GalleryItemRequestBody = {
  image_url?: unknown;
  caption?: unknown;
  direction?: unknown;
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

const isValidMoveDirection = (value: unknown): value is MoveDirection => {
  return value === "up" || value === "down";
};

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? String(session.user.id) : null;
};

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ listId: string; galleryItemId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId, galleryItemId } = await context.params;
  const list = await ListDAO.getListByIdAndUserId(listId, userId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const existingItem = await ListGalleryItemDAO.getItemByIdAndListId(galleryItemId, listId);
  if (!existingItem) {
    return NextResponse.json({ error: "Imagem nao encontrada" }, { status: 404 });
  }

  const body: GalleryItemRequestBody = await req.json();
  const direction = normalizeOptionalString(body.direction);

  if (direction !== undefined) {
    if (!isValidMoveDirection(direction)) {
      return NextResponse.json({ error: "Direcao de movimentacao invalida" }, { status: 400 });
    }

    try {
      const result = await ListGalleryItemDAO.moveItemByDirection(galleryItemId, listId, direction);

      if (!result) {
        return NextResponse.json({ error: "Imagem nao encontrada" }, { status: 404 });
      }

      return NextResponse.json(
        {
          ok: true,
          moved: result.moved,
          item: result.item,
        },
        { status: 200 }
      );
    } catch {
      return NextResponse.json({ error: "Erro ao reordenar imagem" }, { status: 500 });
    }
  }

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
    const updatedItem = await ListGalleryItemDAO.updateItemByIdAndListId({
      galleryItemId,
      listId,
      imageUrl,
      caption,
    });

    if (!updatedItem) {
      return NextResponse.json({ error: "Imagem nao encontrada" }, { status: 404 });
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar imagem" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ listId: string; galleryItemId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId, galleryItemId } = await context.params;
  const list = await ListDAO.getListByIdAndUserId(listId, userId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  try {
    const deleted = await ListGalleryItemDAO.deactivateItem(galleryItemId, listId);

    if (!deleted) {
      return NextResponse.json({ error: "Imagem nao encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir imagem" }, { status: 500 });
  }
}
