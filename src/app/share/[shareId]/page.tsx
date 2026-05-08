"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Dancing_Script } from "next/font/google";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  AlertCircle,
  Gift,
  Check,
  ExternalLink,
  KeyRound,
  LogOut,
  Images,
  Loader2Icon,
  MessageCircle,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useGetSharedList } from "@/hooks/use-get-shared-list";
import { useGetSharedProducts } from "@/hooks/use-get-shared-products";
import { useGetSharedGallery } from "@/hooks/use-get-shared-gallery";
import { useCreateGiftIntent } from "@/hooks/use-create-gift-intent";
import { useCancelGiftIntent } from "@/hooks/use-cancel-gift-intent";
import { useCreateRsvp } from "@/hooks/use-create-rsvp";
import { useGetSharedNotes } from "@/hooks/use-get-shared-notes";
import { useCreateSharedNote } from "@/hooks/use-create-shared-note";
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
import {
  DEFAULT_LIST_BACKGROUND_THEME,
  ListBackgroundTheme,
  normalizeListBackgroundTheme,
} from "@/lib/list-background-theme";
import { isPhoneValid, normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

type SharedProduct = SharedProductResponse[number];
type GuestAccount = {
  name: string;
  email: string;
  phone: string;
  normalized_phone: string;
};
type SharedTab = {
  value: "presentes" | "galeria" | "recados";
  label: string;
  icon: LucideIcon;
};

const rsvpSchema = z.object({
  note: z.string().max(512, "Recado muito longo").optional().or(z.literal("")),
  status: z.enum(["confirmed", "declined"], {
    errorMap: () => ({ message: "Selecione um status valido" }),
  }),
  attendee_type: z.enum(["adult", "child"], {
    errorMap: () => ({ message: "Selecione um tipo de convidado valido" }),
  }),
  has_companion: z.boolean(),
  companion_name: z.string().max(120, "Nome do acompanhante muito longo").optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (value.has_companion && !(value.companion_name || "").trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["companion_name"],
      message: "Digite o nome do acompanhante",
    });
  }
});

type RsvpSchema = z.infer<typeof rsvpSchema>;

const sharedNoteSchema = z.object({
  author_name: z.string().min(2, "Digite seu nome").max(120, "Nome muito longo"),
  author_contact: z.string().max(255, "Contato muito longo").optional().or(z.literal("")),
  message: z.string().min(2, "Digite seu recado").max(512, "Recado muito longo"),
});

type SharedNoteSchema = z.infer<typeof sharedNoteSchema>;

const shareAccountSchema = z.object({
  name: z.string().min(2, "Digite seu nome").max(120, "Nome muito longo"),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  phone: z.string().min(8, "Digite seu telefone").max(30, "Telefone invalido"),
});

type ShareAccountSchema = z.infer<typeof shareAccountSchema>;

const getRsvpDefaultValues = (): RsvpSchema => ({
  note: "",
  status: "confirmed",
  attendee_type: "adult",
  has_companion: false,
  companion_name: "",
});

const DancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const modeLabels = {
  qrcode: "QR code",
  redirect: "Loja externa",
} as const;

const SHARED_BACKGROUND_LAYER_STYLES: Record<ListBackgroundTheme, CSSProperties> = {
  waves_sides: {
    backgroundImage: "url('/waves.svg')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center top",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  },
  waves_top: {
    backgroundImage: "url('/waves.svg')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top center",
    backgroundSize: "100% auto",
  },
  solid: {
    backgroundImage: "none",
  },
};

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

const getStoreLabel = (product: SharedProduct) => {
  if (product.purchase_type === "qrcode") {
    return "Pagamento direto (PIX)";
  }

  const preferredUrl = product.url || product.affiliate_url;
  if (!preferredUrl) {
    return "Loja nao informada";
  }

  try {
    const hostname = new URL(preferredUrl).hostname.replace(/^www\./i, "");
    return hostname || "Loja nao informada";
  } catch {
    return "Loja nao informada";
  }
};

const getExternalUrl = (product: SharedProduct) => {
  return product.affiliate_url || product.url;
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

function RsvpDialog({
  shareId,
  guestAccount,
  onRequireAccount,
}: {
  shareId: string;
  guestAccount: GuestAccount | null;
  onRequireAccount: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const createRsvp = useCreateRsvp();

  const form = useForm<RsvpSchema>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: getRsvpDefaultValues(),
  });

  useEffect(() => {
    form.reset(getRsvpDefaultValues());
  }, [form, guestAccount]);

  const hasCompanion = form.watch("has_companion");

  const onSubmit = async ({ note, status, attendee_type, has_companion, companion_name }: RsvpSchema) => {
    if (!guestAccount) {
      onRequireAccount();
      return;
    }

    await createRsvp.mutateAsync({
      shareId,
      name: guestAccount.name.trim(),
      email: guestAccount.email.trim() || undefined,
      phone: guestAccount.phone.trim() || undefined,
      note: note?.trim() || undefined,
      status,
      attendee_type,
      has_companion,
      companion_name: has_companion ? companion_name?.trim() || undefined : undefined,
    });

    setIsOpen(false);
    form.reset(getRsvpDefaultValues());
  };

  if (!guestAccount) {
    return (
      <Button type="button" className="bg-[#b1563c] text-white hover:bg-[#a0452f]" onClick={onRequireAccount}>
        <KeyRound className="h-4 w-4" />
        Confirmar presenca
      </Button>
    );
  }

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
            <div className="rounded-lg border border-[#e4e7ed] bg-[#fafbfc] px-3 py-2 text-sm text-muted-foreground">
              Confirmando como <span className="font-medium text-foreground">{guestAccount.name}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="attendee_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adult">Adulto</SelectItem>
                          <SelectItem value="child">Crianca</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="has_companion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acompanhante</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? "yes" : "no"}
                        onValueChange={(value) => field.onChange(value === "yes")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vai com acompanhante?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">Nao</SelectItem>
                          <SelectItem value="yes">Sim</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {hasCompanion ? (
              <FormField
                control={form.control}
                name="companion_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do acompanhante</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o nome do acompanhante" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
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
  guestAccount,
  triggerLabel,
  triggerClassName,
  showTriggerCheckIcon = false,
}: {
  shareId: string;
  product: SharedProduct;
  guestAccount: GuestAccount;
  triggerLabel?: string;
  triggerClassName?: string;
  showTriggerCheckIcon?: boolean;
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
      guest_name: guestAccount.name,
      guest_phone: guestAccount.normalized_phone,
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
      guest_phone: guestAccount.normalized_phone,
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
          className={cn(
            triggerClassName || "bg-[#b1563c] text-white hover:bg-[#a0452f]",
          )}
          disabled={product.remaining_quantity <= 0}
        >
          {showTriggerCheckIcon && product.remaining_quantity > 0 ? <Check className="h-4 w-4" /> : null}
          {product.remaining_quantity <= 0 ? "Indisponivel" : (triggerLabel || "Presentear")}
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
  guestAccount,
  onRequireAccount,
}: {
  shareId: string;
  products: SharedProductResponse;
  guestAccount: GuestAccount | null;
  onRequireAccount: () => void;
}) {
  const cancelGiftIntent = useCancelGiftIntent({ shareId });
  const selectedProducts = useMemo(
    () => products.filter((product) => product.selected_by_me && product.my_gift_intent_id),
    [products]
  );

  const handleUnselect = async (product: SharedProduct) => {
    if (!guestAccount || !product.my_gift_intent_id) {
      return;
    }

    await cancelGiftIntent.mutateAsync({
      shareId,
      productId: product.id,
      giftIntentId: product.my_gift_intent_id,
      guest_phone: guestAccount.normalized_phone,
    });
  };

  const renderProductCard = (product: SharedProduct) => {
    const storeLabel = getStoreLabel(product);
    const externalUrl = getExternalUrl(product);
    const isConfirmed = product.gifted_count > 0;
    const isSelectedByMe = product.selected_by_me && Boolean(product.my_gift_intent_id);

    return (
      <Card key={product.id} className="h-full overflow-hidden p-0 border-[#dde0e6] bg-white shadow-sm">
        <CardContent className="p-3 flex h-full flex-col gap-3">
          <div className="overflow-hidden rounded-lg border border-[#e4e7ed] bg-[#eceff4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url || "https://picsum.photos/640/640"}
              alt={product.name}
              className="h-56 w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="line-clamp-2 break-words text-md font-semibold text-foreground">
              {product.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{modeLabels[product.purchase_type]}</Badge>
              <Badge variant="outline" className={isConfirmed ? "text-emerald-700" : ""}>
                {isConfirmed ? `Confirmado (${product.gifted_count})` : "Nao confirmado"}
              </Badge>
              {isSelectedByMe ? (
                <Badge variant="outline" className="text-blue-700">
                  Selecionado por mim
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">Valor: </span>
              <span className="font-medium">{formatPrice(product.price, product.currency)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Loja: </span>
              <span className="font-medium">{storeLabel}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Metodo: </span>
              <span className="font-medium">{modeLabels[product.purchase_type]}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Restantes: </span>
              <span className="font-medium">{product.remaining_quantity}</span>
            </p>
          </div>
          <div className="mt-auto flex items-center justify-end gap-2">
            {externalUrl ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => window.open(externalUrl, "_blank", "noopener,noreferrer")}
                aria-label="Abrir link da loja"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            ) : null}

            {isSelectedByMe ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleUnselect(product);
                }}
                disabled={cancelGiftIntent.isPending}
              >
                {cancelGiftIntent.isPending && <Loader2Icon className="animate-spin" />}
                Desmarcar
              </Button>
            ) : guestAccount ? (
              <GiftDialog
                shareId={shareId}
                product={product}
                guestAccount={guestAccount}
                triggerLabel="Selecionar"
                showTriggerCheckIcon
                triggerClassName="bg-[#b1563c] text-white hover:bg-[#a0452f]"
              />
            ) : (
              <Button
                type="button"
                className="bg-[#b1563c] text-white hover:bg-[#a0452f]"
                onClick={onRequireAccount}
                disabled={product.remaining_quantity <= 0}
              >
                {product.remaining_quantity > 0 ? <Check className="h-4 w-4" /> : null}
                {product.remaining_quantity <= 0 ? "Indisponivel" : "Selecionar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-[#2c3f58]">Todos os Presentes</h2>
      <Tabs defaultValue="all" className="w-full gap-4">
        <TabsList className="h-auto w-full md:w-fit">
          <TabsTrigger value="all">Todos os produtos ({products.length})</TabsTrigger>
          <TabsTrigger value="selected">Selecionados por mim ({selectedProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => renderProductCard(product))}
          </div>
        </TabsContent>

        <TabsContent value="selected">
          {!guestAccount ? (
            <Card className="border-[#e7d4cd] bg-white">
              <CardContent className="py-10 text-center space-y-4">
                <p className="text-muted-foreground">
                  Entre com nome e telefone para ver e gerenciar seus produtos selecionados.
                </p>
                <Button type="button" variant="outline" onClick={onRequireAccount}>
                  <KeyRound className="h-4 w-4" />
                  Identificar-se
                </Button>
              </CardContent>
            </Card>
          ) : selectedProducts.length === 0 ? (
            <Card className="border-[#e7d4cd] bg-white">
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Voce ainda nao selecionou nenhum produto.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedProducts.map((product) => renderProductCard(product))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Page() {
  const params = useParams<{ shareId: string }>();
  const shareId = params.shareId;
  const accountStorageKey = useMemo(() => `belo-presente:share-account:${shareId}`, [shareId]);
  const [guestAccount, setGuestAccount] = useState<GuestAccount | null>(null);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [accessDialogReason, setAccessDialogReason] = useState<string | null>(null);

  const accountForm = useForm<ShareAccountSchema>({
    resolver: zodResolver(shareAccountSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!shareId) {
      return;
    }

    const raw = window.localStorage.getItem(accountStorageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<GuestAccount>;
      const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
      const email = typeof parsed.email === "string" ? parsed.email.trim() : "";
      const phone = typeof parsed.phone === "string" ? parsed.phone.trim() : "";
      const normalizedPhone = normalizePhone(phone);

      if (!name || !isPhoneValid(normalizedPhone)) {
        window.localStorage.removeItem(accountStorageKey);
        return;
      }

      const account: GuestAccount = {
        name,
        email,
        phone,
        normalized_phone: normalizedPhone,
      };

      setGuestAccount(account);
      accountForm.reset({
        name: account.name,
        email: account.email,
        phone: account.phone,
      });
    } catch {
      window.localStorage.removeItem(accountStorageKey);
    }
  }, [accountForm, accountStorageKey, shareId]);

  const sharedList = useGetSharedList(shareId);
  const sharedProducts = useGetSharedProducts(shareId, guestAccount?.normalized_phone);
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
  const selectedBackgroundTheme = useMemo(
    () => normalizeListBackgroundTheme(sharedList.data?.background_theme),
    [sharedList.data?.background_theme]
  );
  const defaultBackgroundStyle = SHARED_BACKGROUND_LAYER_STYLES[DEFAULT_LIST_BACKGROUND_THEME];
  const selectedBackgroundStyle = SHARED_BACKGROUND_LAYER_STYLES[selectedBackgroundTheme];
  const availableTabs = useMemo<SharedTab[]>(() => {
    const features = sharedList.data?.features;
    const tabs: SharedTab[] = [
      { value: "presentes", label: "Presentes", icon: Gift },
    ];

    if (!features) {
      return tabs;
    }

    tabs.push({ value: "galeria", label: "Galeria", icon: Images });

    if (features.notes_enabled) {
      tabs.push({ value: "recados", label: "Recados", icon: MessageCircle });
    }

    return tabs;
  }, [sharedList.data?.features]);

  const defaultTab = availableTabs[0]?.value ?? "presentes";

  const saveGuestAccount = ({ name, email, phone }: ShareAccountSchema) => {
    const normalizedPhone = normalizePhone(phone);

    if (!isPhoneValid(normalizedPhone)) {
      accountForm.setError("phone", {
        message: "Telefone invalido",
      });
      return;
    }

    const account: GuestAccount = {
      name: name.trim(),
      email: email?.trim().toLowerCase() || "",
      phone: phone.trim(),
      normalized_phone: normalizedPhone,
    };

    setGuestAccount(account);
    window.localStorage.setItem(accountStorageKey, JSON.stringify(account));
    setAccessDialogReason(null);
    setIsAccessDialogOpen(false);
  };

  const clearGuestAccount = () => {
    setGuestAccount(null);
    window.localStorage.removeItem(accountStorageKey);
    accountForm.reset({
      name: "",
      email: "",
      phone: "",
    });
  };

  const requireGuestAccount = (reason = "Identifique-se para continuar.") => {
    setAccessDialogReason(reason);
    setIsAccessDialogOpen(true);
  };

  const requireGuestAccountForProducts = () => {
    requireGuestAccount("Identifique-se para selecionar ou desmarcar presentes.");
  };

  const requireGuestAccountForRsvp = () => {
    requireGuestAccount("Identifique-se para confirmar presenca.");
  };

  if (loading) {
    return (
      <div className="relative min-h-svh overflow-hidden bg-transparent">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={defaultBackgroundStyle} />
        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
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
      <div className="relative min-h-svh overflow-hidden bg-transparent">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={defaultBackgroundStyle} />
        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
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
    <div className="relative min-h-svh overflow-x-hidden bg-transparent">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={selectedBackgroundStyle} />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-4 md:px-6 md:py-8">
        <div className="rounded-3xl border border-[#e6d9d3] bg-white p-4 shadow-sm md:p-6">
          <div className="flex items-start justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="logo" width={40} height={40} className="w-8 h-auto" />
              <p className={`${DancingScript.className} text-3xl leading-none text-primary`}>
                Belo Presente
              </p>
            </div>

            <Dialog
              open={isAccessDialogOpen}
              onOpenChange={(open) => {
                setIsAccessDialogOpen(open);
                if (!open) {
                  setAccessDialogReason(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-9 rounded-full border-[#d8dce3] px-3 text-sm",
                    guestAccount ? "border-[#e8c9bc] bg-[#fff7f3] text-[#7d3f2e] hover:bg-[#fff1ea]" : ""
                  )}
                >
                  <KeyRound className="h-4 w-4" />
                  <span className="hidden sm:inline">{guestAccount ? "Acesso ativo" : "Acessar"}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Acesso da lista
                  </DialogTitle>
                  <DialogDescription>
                    {accessDialogReason || "Use nome, email e telefone para identificar seu acesso."}
                  </DialogDescription>
                </DialogHeader>

                {guestAccount ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-[#e4e7ed] bg-[#fafbfc] p-3">
                      <p className="font-semibold">{guestAccount.name}</p>
                      {guestAccount.email ? (
                        <p className="text-sm text-muted-foreground">{guestAccount.email}</p>
                      ) : null}
                      <p className="text-sm text-muted-foreground">{guestAccount.phone}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" variant="outline" onClick={clearGuestAccount}>
                        <LogOut className="h-4 w-4" />
                        Trocar conta
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Form {...accountForm}>
                    <form onSubmit={accountForm.handleSubmit(saveGuestAccount)} className="space-y-4">
                      <div className="space-y-4">
                        <FormField
                          control={accountForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Digite seu nome" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
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
                          control={accountForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="(11) 99999-9999" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
                          Entrar / cadastrar
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-5 space-y-4">
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
              <h1 className="text-center text-2xl font-bold text-[#22344d] md:text-3xl">
                {sharedList.data.title}
              </h1>
              {sharedList.data.description?.trim() ? (
                <div className="w-full max-w-3xl rounded-xl border border-[#e7d4cd] bg-white px-4 py-3 text-center">
                  <p className="text-sm text-muted-foreground md:text-base">{sharedList.data.description}</p>
                </div>
              ) : null}
              <Badge variant="secondary">{sharedList.data.category}</Badge>
            </div>
          </div>

          {sharedList.data.features.attendance_confirmation_enabled ? (
            <Card className="mt-6 border-[#e8c9bc] bg-[#fff7f3]">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-[#b1563c]" />
                    <div className="space-y-1">
                      <p className="font-semibold text-[#7d3f2e]">Confirme sua presença</p>
                      <p className="text-sm text-[#8f5a4b]">
                        A confirmação de presença é separada do presente. Você pode ir sem comprar
                        ou comprar sem ir.
                      </p>
                    </div>
                  </div>
                  <RsvpDialog
                    shareId={shareId}
                    guestAccount={guestAccount}
                    onRequireAccount={requireGuestAccountForRsvp}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Tabs defaultValue={defaultTab} className="mt-6 w-full gap-4">
            <TabsList className="h-auto w-full md:w-fit">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="inline-flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="presentes">
              <SharedProductsSection
                shareId={shareId}
                products={products}
                guestAccount={guestAccount}
                onRequireAccount={requireGuestAccountForProducts}
              />
            </TabsContent>

            <TabsContent value="galeria">
              <SharedGallerySection items={galleryItems} />
            </TabsContent>

            <TabsContent value="recados">
              <SharedNotesSection shareId={shareId} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
