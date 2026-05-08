import { NextResponse } from "next/server";
import { Database } from "@/lib/pg/database";
import { ProductDAO } from "@/daos/product-dao";
import { GiftIntentDAO } from "@/daos/gift-intent-dao";
import { ListDAO } from "@/daos/list-dao";
import { ListSelectionEventDAO } from "@/daos/list-selection-event-dao";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";
import { sendSelectionNotificationEmail } from "@/services/notifications/send-selection-notification-email";
import { isPhoneValid, normalizePhone } from "@/lib/phone";

type GiftIntentRequestBody = {
  guest_name?: unknown;
  guest_phone?: unknown;
  guest_message?: unknown;
};

class GiftIntentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GiftIntentValidationError";
  }
}

const normalizeString = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

export async function POST(
  req: Request,
  context: { params: Promise<{ shareId: string; productId: string }> }
) {
  const { shareId, productId } = await context.params;

  if (!shareId || !productId) {
    return NextResponse.json({ error: "Dados invalidos para presentear" }, { status: 400 });
  }

  const list = await ListDAO.getActiveListByShareId(shareId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const flags = await resolveListFeatureFlags(String(list.id));

  if (!flags.share_enabled) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const body: GiftIntentRequestBody = await req.json();

  const guestName = normalizeString(body.guest_name);
  const guestPhone = normalizePhone(normalizeString(body.guest_phone));
  const guestMessage = normalizeString(body.guest_message);

  if (!guestName) {
    return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });
  }

  if (!guestPhone || !isPhoneValid(guestPhone)) {
    return NextResponse.json({ error: "Telefone invalido" }, { status: 400 });
  }

  if (guestName.length > 120) {
    return NextResponse.json({ error: "Nome do convidado invalido" }, { status: 400 });
  }

  if (guestPhone.length > 30) {
    return NextResponse.json({ error: "Telefone do convidado invalido" }, { status: 400 });
  }

  if (guestMessage.length > 512) {
    return NextResponse.json({ error: "Recado muito longo" }, { status: 400 });
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
        throw new GiftIntentValidationError("Produto nao encontrado");
      }

      if ((product.remaining_quantity ?? 0) <= 0) {
        throw new GiftIntentValidationError("Este presente nao esta mais disponivel");
      }

      if (product.purchase_type === "redirect" && !product.affiliate_url && !product.url) {
        throw new GiftIntentValidationError("Produto de redirecionamento sem link de compra");
      }

      if (product.purchase_type === "qrcode" && !product.image_url) {
        throw new GiftIntentValidationError("Produto de QR code sem imagem");
      }

      const activeIntent = await GiftIntentDAO.getActiveByProductListAndGuestPhone(
        product.id,
        product.list_id,
        guestPhone,
        client
      );

      if (activeIntent) {
        return {
          giftIntent: activeIntent,
          product,
          alreadySelected: true,
        };
      }

      const giftIntent = await GiftIntentDAO.createGiftIntent(
        {
          listId: product.list_id,
          productId: product.id,
          guestName,
          guestPhone,
          guestMessage: guestMessage || undefined,
          purchaseType: product.purchase_type,
          amount: product.price ?? undefined,
          currency: product.currency,
        },
        client
      );

      if (flags.selection_notifications_enabled) {
        await ListSelectionEventDAO.createEvent(
          {
            listId: product.list_id,
            productId: product.id,
            productName: product.name,
            guestName,
            eventType: "selected",
          },
          client
        );
      }

      return {
        giftIntent,
        product,
        alreadySelected: false,
      };
    });

    if (flags.selection_notifications_enabled && !result.alreadySelected) {
      await sendSelectionNotificationEmail({
        userId: String(list.user_id),
        listId: String(list.id),
        listTitle: String(list.title),
        productName: result.product.name,
        guestName: result.giftIntent.guest_name,
        eventType: "selected",
      });
    }

    if (result.product.purchase_type === "redirect") {
      return NextResponse.json(
        {
          ok: true,
          purchase_type: "redirect",
          redirect_url: result.product.affiliate_url || result.product.url,
          gift_intent_id: String(result.giftIntent.id),
          already_selected: result.alreadySelected,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        purchase_type: "qrcode",
        qr_code_image_url: result.product.image_url,
        amount: result.product.price,
        currency: result.product.currency,
        gift_intent_id: String(result.giftIntent.id),
        already_selected: result.alreadySelected,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof GiftIntentValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Erro ao registrar presente" }, { status: 500 });
  }
}
