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
  affiliate_url?: unknown;
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
    const products = await ProductDAO.getProductsByListId(listId);
    return NextResponse.json(products, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
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

  const body: ProductRequestBody = await req.json();

  const name = normalizeOptionalString(body.name);
  const description = normalizeOptionalString(body.description);
  const url = normalizeOptionalString(body.url);
  const affiliateUrl = normalizeOptionalString(body.affiliate_url);
  const imageUrl = normalizeOptionalString(body.image_url);
  const purchaseType = body.purchase_type;
  const currencyRaw = normalizeOptionalString(body.currency);
  const quantityRaw = Number(body.quantity);
  const priceRaw =
    body.price === undefined || body.price === null || body.price === ""
      ? null
      : Number(body.price);

  if (!name) {
    return NextResponse.json({ error: "Nome do produto e obrigatorio" }, { status: 400 });
  }

  if (!isValidPurchaseType(purchaseType)) {
    return NextResponse.json({ error: "Tipo de compra invalido" }, { status: 400 });
  }

  if (!currencyRaw) {
    return NextResponse.json({ error: "Moeda obrigatoria" }, { status: 400 });
  }

  if (!Number.isInteger(quantityRaw) || quantityRaw < 1) {
    return NextResponse.json({ error: "Quantidade invalida" }, { status: 400 });
  }

  if (priceRaw !== null && (Number.isNaN(priceRaw) || priceRaw < 0)) {
    return NextResponse.json({ error: "Preco invalido" }, { status: 400 });
  }

  if (purchaseType === "qrcode" && (priceRaw === null || priceRaw <= 0)) {
    return NextResponse.json({ error: "Preco obrigatorio para pagamento por QR code" }, { status: 400 });
  }

  if (purchaseType === "redirect" && !url && !affiliateUrl) {
    return NextResponse.json({ error: "Informe URL da loja ou link de afiliado para redirecionamento" }, { status: 400 });
  }

  if (purchaseType === "qrcode" && !imageUrl) {
    return NextResponse.json({ error: "URL da imagem do QR code obrigatoria" }, { status: 400 });
  }

  if (url && !isValidUrl(url)) {
    return NextResponse.json({ error: "URL do produto invalida" }, { status: 400 });
  }

  if (affiliateUrl && !isValidUrl(affiliateUrl)) {
    return NextResponse.json({ error: "Link de afiliado invalido" }, { status: 400 });
  }

  if (imageUrl && !isValidUrl(imageUrl)) {
    return NextResponse.json({ error: "URL da imagem invalida" }, { status: 400 });
  }

  try {
    const createdProduct = await ProductDAO.createProduct({
      listId,
      name,
      description,
      url,
      affiliateUrl,
      imageUrl,
      price: priceRaw === null ? undefined : priceRaw,
      currency: currencyRaw.toUpperCase(),
      quantity: quantityRaw,
      purchaseType,
    });

    return NextResponse.json(createdProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
