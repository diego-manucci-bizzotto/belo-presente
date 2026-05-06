import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { ProductDAO } from "@/daos/product-dao";
import { ProductPurchaseType } from "@/services/products/create-product";

type ProductRequestBody = {
  name?: unknown;
  description?: unknown;
  url?: unknown;
  image_url?: unknown;
  price?: unknown;
  currency?: unknown;
  quantity?: unknown;
  purchase_type?: unknown;
};

const isValidPurchaseType = (value: unknown): value is ProductPurchaseType => {
  return value === "qrcode" || value === "redirect";
};

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? String(session.user.id) : null;
};

const validateProductPayload = (body: ProductRequestBody) => {
  const name = normalizeOptionalString(body.name);
  const description = normalizeOptionalString(body.description);
  const url = normalizeOptionalString(body.url);
  const imageUrl = normalizeOptionalString(body.image_url);
  const purchaseType = body.purchase_type;
  const currencyRaw = normalizeOptionalString(body.currency);
  const quantityRaw = Number(body.quantity);
  const priceRaw =
    body.price === undefined || body.price === null || body.price === ""
      ? null
      : Number(body.price);

  if (!name) {
    return { error: "Nome do produto e obrigatorio", status: 400 as const };
  }

  if (!isValidPurchaseType(purchaseType)) {
    return { error: "Tipo de compra invalido", status: 400 as const };
  }

  if (!currencyRaw) {
    return { error: "Moeda obrigatoria", status: 400 as const };
  }

  if (!Number.isInteger(quantityRaw) || quantityRaw < 1) {
    return { error: "Quantidade invalida", status: 400 as const };
  }

  if (priceRaw !== null && (Number.isNaN(priceRaw) || priceRaw < 0)) {
    return { error: "Preco invalido", status: 400 as const };
  }

  if (purchaseType === "qrcode" && (priceRaw === null || priceRaw <= 0)) {
    return { error: "Preco obrigatorio para pagamento por QR code", status: 400 as const };
  }

  if (purchaseType === "redirect" && !url) {
    return { error: "URL obrigatoria para redirecionamento", status: 400 as const };
  }

  if (purchaseType === "qrcode" && !imageUrl) {
    return { error: "URL da imagem do QR code obrigatoria", status: 400 as const };
  }

  if (url && !isValidUrl(url)) {
    return { error: "URL do produto invalida", status: 400 as const };
  }

  if (imageUrl && !isValidUrl(imageUrl)) {
    return { error: "URL da imagem invalida", status: 400 as const };
  }

  return {
    name,
    description,
    url,
    imageUrl,
    price: priceRaw === null ? undefined : priceRaw,
    currency: currencyRaw.toUpperCase(),
    quantity: quantityRaw,
    purchaseType,
  };
};

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ listId: string; productId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId, productId } = await context.params;
  const list = await ListDAO.getListByIdAndUserId(listId, userId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const existingProduct = await ProductDAO.getProductByIdAndListId(productId, listId);
  if (!existingProduct) {
    return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });
  }

  const body: ProductRequestBody = await req.json();
  const validatedPayload = validateProductPayload(body);

  if ("error" in validatedPayload) {
    return NextResponse.json({ error: validatedPayload.error }, { status: validatedPayload.status });
  }

  try {
    const updatedProduct = await ProductDAO.updateProduct({
      productId,
      listId,
      name: validatedPayload.name,
      description: validatedPayload.description,
      url: validatedPayload.url,
      imageUrl: validatedPayload.imageUrl,
      price: validatedPayload.price,
      currency: validatedPayload.currency,
      quantity: validatedPayload.quantity,
      purchaseType: validatedPayload.purchaseType,
    });

    if (!updatedProduct) {
      return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ listId: string; productId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId, productId } = await context.params;
  const list = await ListDAO.getListByIdAndUserId(listId, userId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  try {
    const deleted = await ProductDAO.deactivateProduct(productId, listId);

    if (!deleted) {
      return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
