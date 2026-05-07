import { NextResponse } from "next/server";
import { ListDAO } from "@/daos/list-dao";
import { ListGalleryItemDAO } from "@/daos/list-gallery-item-dao";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";

export async function GET(
  _req: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await context.params;

  if (!shareId) {
    return NextResponse.json({ error: "Link de compartilhamento invalido" }, { status: 400 });
  }

  try {
    const list = await ListDAO.getActiveListByShareId(shareId);

    if (!list) {
      return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
    }

    const flags = await resolveListFeatureFlags(String(list.id));
    if (!flags.share_enabled) {
      return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
    }

    const items = await ListGalleryItemDAO.getPublicItemsByShareId(shareId);
    return NextResponse.json(items, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar galeria publica" }, { status: 500 });
  }
}

