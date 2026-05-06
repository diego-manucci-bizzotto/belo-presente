"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import { useGetSharedList } from "@/hooks/use-get-shared-list";
import { useGetSharedProducts } from "@/hooks/use-get-shared-products";
import { useCreateGiftIntent } from "@/hooks/use-create-gift-intent";
import { useCreateRsvp } from "@/hooks/use-create-rsvp";
import { useGetSharedNotes } from "@/hooks/use-get-shared-notes";
import { useCreateSharedNote } from "@/hooks/use-create-shared-note";
import { SharedProductResponse } from "@/services/share/get-shared-products";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

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

  const createGiftIntent = useCreateGiftIntent({ shareId });

  const resetDialog = () => {
    setIsOpen(false);
    setQrCodeData(null);
  };

  const handleGiftAction = async () => {
    const response = await createGiftIntent.mutateAsync({
      shareId,
      productId: product.id,
    });

    if (response.purchase_type === "redirect") {
      window.open(response.redirect_url, "_blank", "noopener,noreferrer");
      resetDialog();
      return;
    }

    setQrCodeData({
      imageUrl: response.qr_code_image_url,
      amount: response.amount,
      currency: response.currency,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (!value) {
          setQrCodeData(null);
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
            <Button onClick={resetDialog}>Fechar</Button>
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

export default function Page() {
  const params = useParams<{ shareId: string }>();
  const shareId = params.shareId;
  const sharedList = useGetSharedList(shareId);
  const sharedProducts = useGetSharedProducts(shareId);

  const loading = sharedList.isLoading || sharedList.isPending || sharedProducts.isLoading || sharedProducts.isPending;

  const products = useMemo(() => sharedProducts.data ?? [], [sharedProducts.data]);

  if (loading) {
    return (
      <div className="bg-wave min-h-svh">
        <main className="container mx-auto p-6 md:p-10">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-40 w-full bg-gray-200" />
            <Skeleton className="h-24 w-full bg-gray-200" />
            <Skeleton className="h-24 w-full bg-gray-200" />
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
      <main className="container mx-auto p-6 md:p-10 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Image src="/logo.svg" alt="logo" width={64} height={64} className="w-12 h-auto" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Belo Presente</h1>
            <p className="text-sm text-muted-foreground">Lista publica de presentes</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{sharedList.data.title}</CardTitle>
            <CardDescription>
              {sharedList.data.description || "Sem descricao"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Badge variant="secondary">{sharedList.data.category}</Badge>
          </CardContent>
        </Card>

        {sharedList.data.features.attendance_confirmation_enabled && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmacao de presenca</CardTitle>
              <CardDescription>
                Use este botao para registrar se voce vai ao evento. Essa acao nao depende da compra de presentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <RsvpDialog shareId={shareId} />
            </CardContent>
          </Card>
        )}

        {sharedList.data.features.notes_enabled && (
          <SharedNotesSection shareId={shareId} />
        )}

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum presente disponivel nesta lista.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col gap-4">
                <CardContent className="pt-6 flex flex-col gap-4">
                  <div className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image_url || "https://picsum.photos/200"}
                      alt={product.name}
                      className="w-24 h-24 rounded-md object-cover"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant="outline">{modeLabels[product.purchase_type]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.description || "Sem descricao"}
                      </p>
                      <p className="text-sm">
                        {formatPrice(product.price, product.currency)} • Restantes:{" "}
                        {product.remaining_quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <GiftDialog shareId={shareId} product={product} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
