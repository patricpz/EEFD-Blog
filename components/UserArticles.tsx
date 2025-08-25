'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, CalendarIcon, ClockIcon } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
}

interface UserArticlesProps {
  userId: string;
}

export default function UserArticles({ userId }: UserArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/articles/user/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error('Erro ao carregar artigos:', error);
        setError('Erro ao carregar artigos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchArticles();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Artigos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Carregando artigos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Artigos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (articles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Artigos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <EditIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum artigo publicado ainda</p>
              <p className="text-sm">Comece a escrever seu primeiro artigo!</p>
            </div>
            <Link href="/write">
              <Button>
                <EditIcon className="mr-2 h-4 w-4" />
                Escrever Artigo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Meus Artigos ({articles.length})</CardTitle>
          <Link href="/write">
            <Button size="sm">
              <EditIcon className="mr-2 h-4 w-4" />
              Novo Artigo
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    <Link 
                      href={`/article/${article.id}`}
                      className="hover:text-primary transition-colors line-clamp-2 block"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {article.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>{formatTime(article.createdAt)}</span>
                    </div>
                    {article.viewCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-3 w-3" />
                        <span>{article.viewCount} visualizações</span>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      article.published 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {article.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/article/${article.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <EditIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 