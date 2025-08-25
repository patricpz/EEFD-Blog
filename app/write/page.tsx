'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArticleEditor } from '@/components/ArticleEditor';
import { ArticlePreview } from '@/components/ArticlePreview';
import { 
  SaveIcon, 
  EyeIcon, 
  ArrowLeftIcon, 
  ImageIcon,
  FileTextIcon,
  AlertCircleIcon
} from 'lucide-react';
import Link from 'next/link';

interface ArticleFormData {
  title: string;
  subtitle: string;
  coverImageUrl: string;
  content: string;
}

export default function WritePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    subtitle: '',
    coverImageUrl: '',
    content: '',
  });

  // Redirecionar se não estiver autenticado
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleInputChange = (field: keyof ArticleFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      alert('Por favor, adicione um título ao artigo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'rascunho',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Rascunho salvo com sucesso!');
        // Opcional: redirecionar para o artigo
        // router.push(`/article/${data.id}`);
      } else {
        throw new Error('Erro ao salvar rascunho');
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      alert('Por favor, adicione um título ao artigo.');
      return;
    }

    if (!formData.content.trim()) {
      alert('Por favor, adicione conteúdo ao artigo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'publicado',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Artigo publicado com sucesso!');
        router.push(`/article/${data.id}`);
      } else {
        throw new Error('Erro ao publicar artigo');
      }
    } catch (error) {
      console.error('Erro ao publicar artigo:', error);
      alert('Erro ao publicar artigo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">
                  Escrever Artigo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Crie e publique seu próximo artigo
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPreview(!isPreview)}
                disabled={isSubmitting}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                {isPreview ? 'Editar' : 'Visualizar'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              
              <Button
                onClick={handlePublish}
                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              >
                <FileTextIcon className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Editor Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Artigo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título *
                  </label>
                  <Input
                    placeholder="Digite o título do seu artigo..."
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subtítulo
                  </label>
                  <Input
                    placeholder="Digite um subtítulo (opcional)..."
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL da Imagem de Capa
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={formData.coverImageUrl}
                      onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editor de Conteúdo */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Artigo</CardTitle>
              </CardHeader>
              <CardContent>
                {isPreview ? (
                  <ArticlePreview
                    title={formData.title}
                    subtitle={formData.subtitle}
                    content={formData.content}
                    coverImageUrl={formData.coverImageUrl}
                  />
                ) : (
                  <ArticleEditor
                    initialContent={formData.content}
                    onContentChange={handleContentChange}
                    placeholder="Comece a escrever seu artigo... Use a barra de ferramentas acima para formatar o texto."
                    className="min-h-[500px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Título:</span>
                  <span className="text-sm font-medium">
                    {formData.title.length}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Palavras:</span>
                  <span className="text-sm font-medium">
                    {formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Caracteres:</span>
                  <span className="text-sm font-medium">
                    {formData.content.replace(/<[^>]*>/g, '').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card>
              <CardHeader>
                <CardTitle>Dicas para um Bom Artigo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Use títulos e subtítulos para organizar seu conteúdo
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Adicione imagens para tornar o artigo mais atrativo
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Revise o conteúdo antes de publicar
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={handlePublish}
                  disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                >
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  Publicar Artigo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 