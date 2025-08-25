'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MailIcon, UserIcon, CameraIcon, ArrowLeftIcon } from "lucide-react";
import UserArticles from "@/components/UserArticles";
import UserStats from "@/components/UserStats";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Voltar
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meu Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie suas informações pessoais
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Card do Avatar e Informações Básicas */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage 
                      src={user?.image || undefined} 
                      alt={user?.name || "Avatar do usuário"}
                    />
                    <AvatarFallback className="text-2xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <CameraIcon className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl">{user?.name || "Usuário"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link href="/profile/edit">
                    <Button className="w-full" variant="outline">
                      Editar Perfil
                    </Button>
                  </Link>
                  {/* <Button className="w-full" variant="outline">
                    Alterar Senha
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações Detalhadas e Artigos */}
          <div className="lg:col-span-3 space-y-6">
            {/* Card com Informações Detalhadas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Nome Completo
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border">
                      <p className="text-gray-900 dark:text-white">
                        {user?.name || "Não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <MailIcon className="w-4 h-4" />
                      Email
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border">
                      <p className="text-gray-900 dark:text-white">
                        {user?.email || "Não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Data de Cadastro
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border">
                      <p className="text-gray-900 dark:text-white">
                        {new Date().toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>


                </div>

                {/* <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Preferências</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações por Email</p>
                        <p className="text-sm text-muted-foreground">
                          Receber notificações sobre novos artigos
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tema</p>
                        <p className="text-sm text-muted-foreground">
                          Escolher entre tema claro ou escuro
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Alterar
                      </Button>
                    </div>
                  </div>
                </div> */}
              </CardContent>
            </Card>

            {/* Componente de Estatísticas Detalhadas */}
            {user?.id && <UserStats userId={user.id} />}

            {/* Componente de Artigos do Usuário */}
            {user?.id && <UserArticles userId={user.id} />}
          </div>
        </div>
      </div>
    </div>
  );
} 