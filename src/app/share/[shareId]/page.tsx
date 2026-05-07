"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Dancing_Script } from "next/font/google";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import { useGetSharedList } from "@/hooks/use-get-shared-list";
import { useGetSharedProducts } from "@/hooks/use-get-shared-products";
import { useGetSharedGallery } from "@/hooks/use-get-shared-gallery";
import { useCreateGiftIntent } from "@/hooks/use-create-gift-intent";
import { useCancelGiftIntent } from "@/hooks/use-cancel-gift-intent";
import { useCreateRsvp } from "@/hooks/use-create-rsvp";
import { useGetSharedNotes } from "@/hooks/use-get-shared-notes";
import { useCreateSharedNote } from "@/hooks/use-create-shared-note";
import { useCreateSharedContribution } from "@/hooks/use-create-shared-contribution";
import { SharedProductResponse } from "@/services/share/get-shared-products";
import { GetSharedGalleryResponse } from "@/services/share/get-shared-gallery";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type SharedProduct = SharedProductResponse[number];

const rsvpSchema = z.object({
  name: z.string().min(2, "Digite seu nome").max(120, "Nome muito longo"),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  phone: z.string().max(30, "Telefone invalido").optional().or(z.literal("")),
  note: z.string().max(512, "Recado muito longo").optional().or(z.literal("")),
  status: z.enum(["confirmed", "declined"], {
    errorMap: () => ({ message: "Selecione um status valido" }),
  }),
});

type RsvpSchema = z.infer<typeof rsvpSchema>;

const sharedNoteSchema = z.object({
  author_name: z.string().min(2, "Digite seu nome").max(120, "Nome muito longo"),
  author_contact: z.string().max(255, "Contato muito longo").optional().or(z.literal("")),
  message: z.string().min(2, "Digite seu recado").max(512, "Recado muito longo"),
});

type SharedNoteSchema = z.infer<typeof sharedNoteSchema>;

const sharedContributionSchema = z.object({
  contributor_name: z.string().min(2, "Digite seu nome").max(120, "Nome muito longo"),
  contributor_contact: z.string().max(255, "Contato muito longo").optional().or(z.literal("")),
  message: z.string().max(512, "Mensagem muito longa").optional().or(z.literal("")),
  amount: z.coerce.number().positive("Digite um valor maior que zero"),
  currency: z.string().min(3, "Moeda invalida").max(10, "Moeda invalida"),
});

type SharedContributionSchema = z.infer<typeof sharedContributionSchema>;

const DancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const modeLabels = {
  qrcode: "QR code",
  redirect: "Loja externa",
} as const;

const formatPrice = (price: number | null, currency: string) => {
  if (price === null) {
    return "Sem valor definido";
  }

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
};

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const getInitials = (value: string) => {
  const initials = value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "BP";
};

function SharedGallerySection({ items }: { items: GetSharedGalleryResponse }) {
  return (
    <Card className="border-[#e7d4cd] bg-white">
      <CardHeader>
        <CardTitle>Galeria da lista</CardTitle>
        <CardDescription>Confira fotos e referencias escolhidas pelo anfitriao.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda nao ha imagens na galeria.</p>
        ) : (
          <Carousel opts={{ loop: items.length > 1 }} className="w-full">
            <CarouselContent>
              {items.map((item) => (
                <CarouselItem key={item.id}>
                  <div className="w-full flex flex-col gap-3">
                    <div className="overflow-hidden rounded-md border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.caption || "Imagem da galeria"}
                        className="w-full h-[300px] object-cover"
                      />
                    </div>
                    {item.caption ? (
                      <p className="text-sm text-muted-foreground">{item.caption}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem legenda</p>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {items.length > 1 && (
              <>
                <CarouselPrevious className="left-2 bg-white hover:bg-white" />
                <CarouselNext className="right-2 bg-white hover:bg-white" />
              </>
            )}
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}

function SharedNotesSection({ shareId }: { shareId: string }) {
  const sharedNotes = useGetSharedNotes({ shareId });
  const createSharedNote = useCreateSharedNote({ shareId });

  const form = useForm<SharedNoteSchema>({
    resolver: zodResolver(sharedNoteSchema),
    defaultValues: {
      author_name: "",
      author_contact: "",
      message: "",
    },
  });

  const onSubmit = async ({ author_name, author_contact, message }: SharedNoteSchema) => {
    await createSharedNote.mutateAsync({
      shareId,
      author_name: author_name.trim(),
      author_contact: author_contact?.trim() || undefined,
      message: message.trim(),
    });

    form.reset({
      author_name: "",
      author_contact: "",
      message: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recadinhos</CardTitle>
        <CardDescription>Deixe um recado publico para o anfitriao.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="author_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite seu nome" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Email, telefone ou @usuario" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recado</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Escreva seu recado..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={createSharedNote.isPending}>
                {createSharedNote.isPending && <Loader2Icon className="animate-spin" />}
                Enviar recado
              </Button>
            </div>
          </form>
        </Form>

        {sharedNotes.isLoading || sharedNotes.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full bg-gray-200" />
            <Skeleton className="h-24 w-full bg-gray-200" />
          </div>
        ) : sharedNotes.data && sharedNotes.data.length > 0 ? (
          <div className="space-y-3">
            {sharedNotes.data.map((note) => (
              <Card key={note.id}>
                <CardContent className="pt-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{note.author_name}</p>
                      {note.author_contact && (
                        <p className="text-xs text-muted-foreground">{note.author_contact}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(note.created_at)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Ainda nao ha recados nesta lista.</p>
        )}
      </CardContent>
    </Card>
  );
}

function SharedContributionSection({ shareId }: { shareId: string }) {
  const createSharedContribution = useCreateSharedContribution({ shareId });

  const form = useForm<SharedContributionSchema>({
    resolver: zodResolver(sharedContributionSchema),
    defaultValues: {
      contributor_name: "",
      contributor_contact: "",
      message: "",
      amount: 0,
      currency: "BRL",
    },
  });

  const onSubmit = async ({
    contributor_name,
    contributor_contact,
    message,
    amount,
    currency,
  }: SharedContributionSchema) => {
    await createSharedContribution.mutateAsync({
      contributor_name: contributor_name.trim(),
      contributor_contact: contributor_contact?.trim() || undefined,
      message: message?.trim() || undefined,
      amount,
      currency: currency.trim().toUpperCase(),
    });

    form.reset({
      contributor_name: "",
      contributor_contact: "",
      message: "",
      amount: 0,
      currency: "BRL",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribuicoes</CardTitle>
        <CardDescription>
          Contribua com qualquer valor, sem precisar selecionar um presente.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contributor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite seu nome" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contributor_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Email, telefone ou @usuario" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value)}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moeda</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="BRL" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Ex.: Aproveitem bastante!" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={createSharedContribution.isPending}>
                {createSharedContribution.isPending && <Loader2Icon className="animate-spin" />}
                Enviar contribuicao
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function RsvpDialog({ shareId }: { shareId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const createRsvp = useCreateRsvp();

  const form = useForm<RsvpSchema>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      note: "",
      status: "confirmed",
    },
  });

  const onSubmit = async ({ name, email, phone, note, status }: RsvpSchema) => {
    await createRsvp.mutateAsync({
      shareId,
      name: name.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      note: note?.trim() || undefined,
      status,
    });

    setIsOpen(false);
    form.reset({
      name: "",
      email: "",
      phone: "",
      note: "",
      status: "confirmed",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
          Confirmar presenca
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>RSVP do evento</DialogTitle>
          <DialogDescription>
            Sua presenca e independente dos presentes. Voce pode confirmar e nao comprar, ou comprar sem confirmar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite seu nome" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="voce@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(00) 00000-0000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vou ao evento?</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opcao" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Sim, vou</SelectItem>
                        <SelectItem value="declined">Nao vou conseguir ir</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recado (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Mensagem para o anfitriao" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={createRsvp.isPending}>
                {createRsvp.isPending && <Loader2Icon className="animate-spin" />}
                Enviar RSVP
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function GiftDialog({
  shareId,
  product,
}: {
  shareId: string;
  product: SharedProduct;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    imageUrl: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [giftIntentId, setGiftIntentId] = useState<string | null>(null);

  const createGiftIntent = useCreateGiftIntent({ shareId });
  const cancelGiftIntent = useCancelGiftIntent({ shareId });

  const resetDialog = () => {
    setIsOpen(false);
    setQrCodeData(null);
    setRedirectUrl(null);
    setGiftIntentId(null);
  };

  const handleGiftAction = async () => {
    const response = await createGiftIntent.mutateAsync({
      shareId,
      productId: product.id,
    });

    setGiftIntentId(response.gift_intent_id);

    if (response.purchase_type === "redirect") {
      setRedirectUrl(response.redirect_url);
      return;
    }

    setQrCodeData({
      imageUrl: response.qr_code_image_url,
      amount: response.amount,
      currency: response.currency,
    });
  };

  const handleCancelSelection = async () => {
    if (!giftIntentId) {
      return;
    }

    await cancelGiftIntent.mutateAsync({
      shareId,
      productId: product.id,
      giftIntentId,
    });

    resetDialog();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (!value) {
          setQrCodeData(null);
          setRedirectUrl(null);
          setGiftIntentId(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-[#b1563c] text-white hover:bg-[#a0452f]"
          disabled={product.remaining_quantity <= 0}
        >
          {product.remaining_quantity <= 0 ? "Indisponivel" : "Presentear"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            {qrCodeData
              ? "Escaneie o QR code para concluir o presente."
              : "Presentear e confirmar presenca sao acoes separadas."}
          </DialogDescription>
        </DialogHeader>

        {qrCodeData ? (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeData.imageUrl}
              alt="QR code do presente"
              className="w-64 h-64 rounded-md border"
            />
            <p className="text-sm text-muted-foreground">
              Valor: {formatPrice(qrCodeData.amount, qrCodeData.currency)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  void handleCancelSelection();
                }}
                disabled={cancelGiftIntent.isPending}
              >
                {cancelGiftIntent.isPending && <Loader2Icon className="animate-spin" />}
                Desmarcar selecao
              </Button>
              <Button onClick={resetDialog}>Fechar</Button>
            </div>
          </div>
        ) : redirectUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sua selecao foi registrada. Voce pode abrir a loja ou desmarcar esta selecao.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  void handleCancelSelection();
                }}
                disabled={cancelGiftIntent.isPending}
              >
                {cancelGiftIntent.isPending && <Loader2Icon className="animate-spin" />}
                Desmarcar selecao
              </Button>
              <Button
                onClick={() => window.open(redirectUrl, "_blank", "noopener,noreferrer")}
              >
                Abrir loja
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Clique para continuar com a compra do presente.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleGiftAction} disabled={createGiftIntent.isPending}>
                {createGiftIntent.isPending && <Loader2Icon className="animate-spin" />}
                {product.purchase_type === "redirect" ? "Ir para loja" : "Gerar QR code"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SharedProductsSection({
  shareId,
  products,
}: {
  shareId: string;
  products: SharedProductResponse;
}) {
  if (products.length === 0) {
    return (
      <Card className="border-[#e7d4cd] bg-white">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum presente disponivel nesta lista.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden border-[#e7d4cd] bg-white">
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url || "https://picsum.photos/200"}
                alt={product.name}
                className="w-24 h-24 rounded-md object-cover"
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <Badge variant="outline">{modeLabels[product.purchase_type]}</Badge>
                </div>
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                )}
                <p className="text-sm font-medium">{formatPrice(product.price, product.currency)}</p>
                <p className="text-xs text-muted-foreground">
                  Restantes: {product.remaining_quantity}
                </p>
              </div>
            </div>
            <div className="border-t px-4 py-3 flex justify-end">
              <GiftDialog shareId={shareId} product={product} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Page() {
  const params = useParams<{ shareId: string }>();
  const shareId = params.shareId;
  const sharedList = useGetSharedList(shareId);
  const sharedProducts = useGetSharedProducts(shareId);
  const sharedGallery = useGetSharedGallery({ shareId });

  const loading =
    sharedList.isLoading ||
    sharedList.isPending ||
    sharedProducts.isLoading ||
    sharedProducts.isPending ||
    sharedGallery.isLoading ||
    sharedGallery.isPending;

  const products = useMemo(() => sharedProducts.data ?? [], [sharedProducts.data]);
  const galleryItems = useMemo(() => sharedGallery.data ?? [], [sharedGallery.data]);
  const bannerImageUrl = useMemo(() => galleryItems[0]?.image_url || "/waves.svg", [galleryItems]);
  const avatarImageUrl = useMemo(() => {
    const productWithImage = products.find((product) => Boolean(product.image_url));
    return productWithImage?.image_url || galleryItems[0]?.image_url || "";
  }, [galleryItems, products]);
  const listInitials = useMemo(() => getInitials(sharedList.data?.title || ""), [sharedList.data?.title]);
  const availableTabs = useMemo(() => {
    const features = sharedList.data?.features;
    if (!features) {
      return [{ value: "presentes", label: "Presentes" }];
    }

    return [
      { value: "presentes", label: "Presentes" },
      { value: "galeria", label: "Galeria" },
      ...(features.attendance_confirmation_enabled ? [{ value: "presenca", label: "Presenca" }] : []),
      ...(features.notes_enabled ? [{ value: "recados", label: "Recados" }] : []),
      ...(features.contributions_enabled ? [{ value: "contribuicoes", label: "Contribuicoes" }] : []),
    ];
  }, [sharedList.data?.features]);

  const defaultTab = availableTabs[0]?.value ?? "presentes";

  if (loading) {
    return (
      <div className="bg-wave min-h-svh">
        <main className="container mx-auto p-6 md:p-10">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-40 w-full bg-gray-200" />
            <Skeleton className="h-24 w-full bg-gray-200" />
            <Skeleton className="h-24 w-full bg-gray-200" />
            <Skeleton className="h-64 w-full bg-gray-200" />
          </div>
        </main>
      </div>
    );
  }

  if (!sharedList.data) {
    return (
      <div className="bg-wave min-h-svh">
        <main className="container mx-auto p-6 md:p-10">
          <Card>
            <CardHeader>
              <CardTitle>Lista nao encontrada</CardTitle>
              <CardDescription>
                Este link pode estar invalido ou a lista nao esta publica no momento.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-wave min-h-svh">
      <main className="container mx-auto p-4 md:p-8 flex flex-col gap-5 md:gap-6">
        <div className="flex items-center gap-2 px-1">
          <Image src="/logo.svg" alt="logo" width={40} height={40} className="w-8 h-auto" />
          <p className={`${DancingScript.className} text-3xl leading-none text-primary`}>Belo Presente</p>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-[#e7d4cd] bg-white">
            <div className="h-36 w-full sm:h-44 md:h-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerImageUrl}
                alt="Banner da lista"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="-mt-16 flex flex-col items-center gap-3 px-2">
            <Avatar className="size-28 border-4 border-white shadow-sm">
              {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={sharedList.data.title} /> : null}
              <AvatarFallback className="bg-[#f3e1da] text-lg font-semibold text-primary">
                {listInitials}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-center text-2xl font-bold text-primary md:text-3xl">{sharedList.data.title}</h1>
            {sharedList.data.description?.trim() ? (
              <div className="w-full max-w-3xl rounded-xl border border-[#e7d4cd] bg-white px-4 py-3 text-center">
                <p className="text-sm text-muted-foreground md:text-base">{sharedList.data.description}</p>
              </div>
            ) : null}
            <Badge variant="secondary">{sharedList.data.category}</Badge>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full gap-4">
          <TabsList className="flex h-auto w-full flex-wrap items-center justify-start gap-2 rounded-xl bg-transparent p-0">
            {availableTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl border border-[#d8d8dc] bg-white px-4 py-2 text-xs font-semibold text-foreground data-[state=active]:border-[#cfd2d7] data-[state=active]:bg-[#eceff3] data-[state=active]:text-primary md:text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="presentes">
            <SharedProductsSection shareId={shareId} products={products} />
          </TabsContent>

          <TabsContent value="galeria">
            <SharedGallerySection items={galleryItems} />
          </TabsContent>

          <TabsContent value="presenca">
            <Card className="border-[#e7d4cd] bg-white">
              <CardHeader>
                <CardTitle>Confirmacao de presenca</CardTitle>
                <CardDescription>
                  Presenca e presente sao independentes. Confirme sua ida mesmo sem escolher um produto.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <RsvpDialog shareId={shareId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recados">
            <SharedNotesSection shareId={shareId} />
          </TabsContent>

          <TabsContent value="contribuicoes">
            <SharedContributionSection shareId={shareId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

