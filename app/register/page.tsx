'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta");
      } else {
        setSuccess("Conta criada com sucesso! Redirecionando para login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      setError("Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Cadastro</h1>
        
        <GoogleLoginButton>Cadastrar com Google</GoogleLoginButton>
        
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
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm">
            {success}
          </div>
        )}
        
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Nome</span>
          <Input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome" 
            required 
            disabled={isLoading}
          />
        </label>
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
            placeholder="Crie uma senha" 
            required 
            disabled={isLoading}
            minLength={6}
          />
        </label>
        <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
          {isLoading ? "Criando conta..." : "Cadastrar"}
        </Button>
        <a href="/login" className="text-sm text-primary hover:underline text-center mt-2">
          Já tem conta? Entrar
        </a>
      </form>
    </div>
  );
} 