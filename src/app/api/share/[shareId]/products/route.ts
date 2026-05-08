import { NextResponse } from "next/server";
import { ProductDAO } from "@/daos/product-dao";
import { ListDAO } from "@/daos/list-dao";
import { GiftIntentDAO } from "@/daos/gift-intent-dao";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";
import { normalizePhone } from "@/lib/phone";

export async function GET(
  req: Request,
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

    const products = await ProductDAO.getPublicProductsByShareId(shareId);
    const { searchParams } = new URL(req.url);
    const guestPhone = normalizePhone(searchParams.get("guest_phone") ?? "");

    if (!guestPhone) {
      return NextResponse.json(
        products.map((product) => ({
          ...product,
          selected_by_me: false,
          my_gift_intent_id: null,
        })),
        { status: 200 }
      );
    }

    const selectedMap = await GiftIntentDAO.getActiveSelectionsMapByListAndGuestPhone(
      String(list.id),
      guestPhone
    );

    return NextResponse.json(
      products.map((product) => {
        const myGiftIntentId = selectedMap[product.id] ?? null;

        return {
          ...product,
          selected_by_me: Boolean(myGiftIntentId),
          my_gift_intent_id: myGiftIntentId,
        };
      }),
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Erro ao buscar produtos da lista publica" }, { status: 500 });
  }
}
