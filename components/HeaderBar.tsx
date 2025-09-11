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
import { UserIcon, SettingsIcon, LogOutIcon, ChevronDownIcon, Shield, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import FaviconLogo from '../public/images/favicon.png';

export default function HeaderBar() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="w-full bg-white dark:bg-zinc-900 shadow-md py-3 px-4 sm:py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <Image
              src={FaviconLogo}
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-10 sm:h-12 sm:w-12"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex gap-4 md:gap-6 items-center">
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

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div 
        className={`${
          isMobileMenuOpen ? 'max-h-[70vh] py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
        } sm:hidden overflow-hidden transition-all duration-300 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-700`}>
        <div className="px-4">
          <div className="pt-2 space-y-2">
          <Link 
            href="/" 
            className="block px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Início
          </Link>
          <Link 
            href="/articles" 
            className="block px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Artigos
          </Link>
          {session && (
            <Link 
              href="/write" 
              className="block px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Escrever
            </Link>
          )}
          {(userRole === 'moderador' || userRole === 'admin') && (
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Shield className="w-4 h-4" />
              <span>Moderador</span>
            </Link>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

          {status === "loading" ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">Carregando...</div>
          ) : session ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.image || undefined} alt={user?.name || 'Avatar do usuário'} />
                  <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  {userRole && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Link 
                  href="/profile" 
                  className="flex items-center px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserIcon className="mr-3 h-5 w-5" />
                  <span>Meu Perfil</span>
                </Link>
                <Link 
                  href="/profile" 
                  className="flex items-center px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <SettingsIcon className="mr-3 h-5 w-5" />
                  <span>Configurações</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOutIcon className="mr-3 h-5 w-5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Link 
                href="/login" 
                className="block w-full px-4 py-3 text-center rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link 
                href="/register" 
                className="block w-full px-4 py-3 text-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Criar conta
              </Link>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
} 