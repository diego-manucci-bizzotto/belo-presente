import { NextResponse } from "next/server";
import { Database } from "@/lib/pg/database";
import { ListDAO } from "@/daos/list-dao";
import { ProductDAO } from "@/daos/product-dao";
import { GiftIntentDAO } from "@/daos/gift-intent-dao";
import { ListSelectionEventDAO } from "@/daos/list-selection-event-dao";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";
import { sendSelectionNotificationEmail } from "@/services/notifications/send-selection-notification-email";
import { isPhoneValid, normalizePhone } from "@/lib/phone";

class GiftIntentCancelValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GiftIntentCancelValidationError";
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ shareId: string; productId: string; giftIntentId: string }> }
) {
  const { shareId, productId, giftIntentId } = await context.params;

  if (!shareId || !productId || !giftIntentId) {
    return NextResponse.json({ error: "Dados invalidos para desmarcar presente" }, { status: 400 });
  }

  const list = await ListDAO.getActiveListByShareId(shareId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const flags = await resolveListFeatureFlags(String(list.id));

  if (!flags.share_enabled) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const guestPhone = normalizePhone(typeof body.guest_phone === "string" ? body.guest_phone : "");

  if (!guestPhone || !isPhoneValid(guestPhone)) {
    return NextResponse.json({ error: "Telefone invalido" }, { status: 400 });
  }

  const db = Database.getInstance();

  try {
    const result = await db.transaction(async (client) => {
      const product = await ProductDAO.getPublicProductByIdAndShareId(
        productId,
        shareId,
        client
      );

      if (!product) {
        throw new GiftIntentCancelValidationError("Produto nao encontrado");
      }

      const giftIntent = await GiftIntentDAO.getByIdAndProductAndList(
        giftIntentId,
        product.id,
        product.list_id,
        client
      );

      if (!giftIntent) {
        throw new GiftIntentCancelValidationError("Selecao de presente nao encontrada");
      }

      if (normalizePhone(giftIntent.guest_phone) !== guestPhone) {
        throw new GiftIntentCancelValidationError("Conta sem permissao para desmarcar esta selecao");
      }

      if (giftIntent.status === "cancelled") {
        throw new GiftIntentCancelValidationError("Selecao ja esta cancelada");
      }

      const cancelledGiftIntent = await GiftIntentDAO.cancelByIdAndProductAndList(
        giftIntentId,
        product.id,
        product.list_id,
        client
      );

      if (!cancelledGiftIntent) {
        throw new GiftIntentCancelValidationError("Nao foi possivel cancelar a selecao");
      }

      if (flags.selection_notifications_enabled) {
        await ListSelectionEventDAO.createEvent(
          {
            listId: product.list_id,
            productId: product.id,
            productName: product.name,
            guestName: cancelledGiftIntent.guest_name,
            eventType: "deselected",
          },
          client
        );
      }

      return {
        productName: product.name,
        guestName: cancelledGiftIntent.guest_name,
      };
    });

    if (flags.selection_notifications_enabled) {
      await sendSelectionNotificationEmail({
        userId: String(list.user_id),
        listId: String(list.id),
        listTitle: String(list.title),
        productName: result.productName,
        guestName: result.guestName,
        eventType: "deselected",
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof GiftIntentCancelValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Erro ao desmarcar presente" }, { status: 500 });
  }
}
