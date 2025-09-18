'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">A página que você procura não existe.</p>
      <Link href="/" className="text-primary underline">
        Voltar para a página inicial
      </Link>
    </div>
  );
}


