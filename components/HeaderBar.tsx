'use client';

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon, SettingsIcon, LogOutIcon, ChevronDownIcon, Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import FaviconLogo from '../public/images/favicon.png';

export default function HeaderBar() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchUserRole();
    }
  }, [session]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const userData = await response.json();
      setUserRole(userData.role);
    } catch (error) {
      console.error('Erro ao buscar role do usuário:', error);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="w-full bg-white dark:bg-zinc-900 shadow-md py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center">
          <Image
            src={FaviconLogo}
            alt="Logo"
            width={50}
            height={50}
            className="mr-2"
            priority
          />
        </Link>
      </div>
      <nav className="flex gap-6 items-center">
        <Link href="/" className="hover:underline">Início</Link>
        <Link href="/articles" className="hover:underline">Artigos</Link>
        {session && (
          <Link href="/write" className="hover:underline">Escrever</Link>
        )}
        {userRole === 'moderador' || userRole === 'admin' ? (
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Moderador
          </Link>
        ) : null}
        
        {/* <ThemeToggle /> */}

        {status === "loading" ? (
          <div className="text-sm text-muted-foreground">Carregando...</div>
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-auto justify-start rounded-full p-0">
                <span className="text-sm font-medium">{user?.name}</span>

                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || "Avatar do usuário"}
                  />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {userRole && (
                    <p className="text-xs leading-none text-blue-600 dark:text-blue-400">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-primary font-semibold hover:underline">Login</Link>
            <Link href="/register">
              <Button size="sm">Cadastrar</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
} 