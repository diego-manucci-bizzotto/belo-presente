"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useGetList } from "@/hooks/use-get-list";
import { useGetListFeatures } from "@/hooks/use-get-list-features";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const [copied, setCopied] = useState(false);
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const list = useGetList({ listId: Number(listId) });
  const listFeatures = useGetListFeatures({ listId });

  const sharePath = useMemo(() => {
    if (!list.data?.share_id) {
      return "";
    }

    return `/share/${list.data.share_id}`;
  }, [list.data?.share_id]);

  const shareUrl = useMemo(() => {
    if (!sharePath) {
      return "";
    }

    if (typeof window === "undefined") {
      return sharePath;
    }

    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const qrCodeUrl = useMemo(() => {
    if (!shareUrl) {
      return "";
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(shareUrl)}`;
  }, [shareUrl]);

  const handleCopy = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copiado com sucesso!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nao foi possivel copiar o link");
    }
  };

  if (list.isLoading || list.isPending || listFeatures.isLoading || listFeatures.isPending) {
    return (
      <div className="w-full flex flex-col gap-4">
        <Skeleton className="h-32 w-full bg-gray-200" />
        <Skeleton className="h-32 w-full bg-gray-200" />
      </div>
    );
  }

  if (!list.data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Lista nao encontrada.</p>
      </div>
    );
  }

  if (listFeatures.data && !listFeatures.data.share_enabled) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          Compartilhamento esta desabilitado para esta lista. Ative em Funcionalidades.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Link publico da lista</CardTitle>
          <CardDescription>
            Compartilhe este link com seus convidados para que eles vejam os presentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground break-all">{shareUrl}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Link copiado" : "Copiar link"}
            </Button>
            <Button
              className="bg-[#b1563c] text-white hover:bg-[#a0452f]"
              onClick={() => window.open(sharePath, "_blank", "noopener,noreferrer")}
            >
              <ExternalLinkIcon />
              Abrir lista publica
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>QR code da lista</CardTitle>
          <CardDescription>
            Compartilhe este QR code para facilitar o acesso da lista no celular.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {qrCodeUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="QR code da lista"
                className="h-56 w-56 rounded-md border"
              />
              <p className="text-xs text-muted-foreground text-center break-all">
                {shareUrl}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Link indisponivel para gerar QR code.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
