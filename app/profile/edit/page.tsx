'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, SaveIcon, CameraIcon } from "lucide-react";

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: ''
  });
  const [imageError, setImageError] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || ''
      });
      setImageError(false);
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'image') {
      setImageError(false);
    }
  };

  const handleImageButtonClick = () => {
    // Pergunta uma URL de imagem e preenche automaticamente o campo
    const url = window.prompt('Cole a URL da sua imagem (https://...)');
    if (url === null) return; // cancelado
    const trimmed = url.trim();
    if (!trimmed) return;
    const isValid = /^(https?:)\/\//i.test(trimmed);
    if (!isValid) {
      setImageError(true);
      return;
    }
    setFormData(prev => ({ ...prev, image: trimmed }));
    setImageError(false);
    // foca o input para permitir ajustes
    imageInputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Atualiza os dados na sessão para refletir imediatamente
        try {
          await update({
            name: formData.name,
            image: formData.image || null
          } as any);
        } catch (err) {
          // Mesmo se falhar, seguimos para a página de perfil
          console.warn('Falha ao atualizar sessão:', err);
        }
        router.push('/profile');
      } else {
        console.error('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Editar Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Atualize suas informações pessoais
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={!imageError && formData.image ? formData.image : undefined}
                      alt={formData.name || "Avatar"}
                      onError={() => setImageError(true)}
                    />
                    <AvatarFallback className="text-xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CameraIcon className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <label htmlFor="image" className="block text-sm font-medium mb-1">URL da Imagem</label>
                  <Input
                    id="image"
                    name="image"
                    type="url"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    className="mt-1"
                    ref={imageInputRef}
                  />
                  {imageError && (
                    <p className="text-sm text-red-600 mt-2">Não foi possível carregar esta imagem. Verifique a URL.</p>
                  )}
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium mb-1">Nome Completo</label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Removido: campo de Biografia */}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <SaveIcon className="w-4 h-4" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
