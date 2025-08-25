'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha inválidos");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        
        <GoogleLoginButton />
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-2 text-muted-foreground">
              Ou continue com email
            </span>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}
        
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <Input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email" 
            required 
            disabled={isLoading}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Senha</span>
          <Input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha" 
            required 
            disabled={isLoading}
          />
        </label>
        <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
        <a href="/register" className="text-sm text-primary hover:underline text-center mt-2">
          Não tem conta? Cadastre-se
        </a>
      </form>
    </div>
  );
} 