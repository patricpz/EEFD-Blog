'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileTextIcon, 
  EyeIcon, 
  MessageSquareIcon, 
  HeartIcon,
  TrendingUpIcon,
  CalendarIcon
} from 'lucide-react';

interface UserStatsProps {
  userId: string;
}

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
  averageViews: number;
  lastPublished: string | null;
}

export default function UserStats({ userId }: UserStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalComments: 0,
    totalLikes: 0,
    averageViews: 0,
    lastPublished: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/user/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          const articles = data.articles || [];
          
          const publishedArticles = articles.filter((article: any) => article.published);
          const draftArticles = articles.filter((article: any) => !article.published);
          
          const totalViews = articles.reduce((sum: number, article: any) => sum + (article.viewCount || 0), 0);
          const averageViews = publishedArticles.length > 0 ? Math.round(totalViews / publishedArticles.length) : 0;
          
          const lastPublished = publishedArticles.length > 0 
            ? publishedArticles[0].createdAt 
            : null;

          setStats({
            totalArticles: articles.length,
            publishedArticles: publishedArticles.length,
            draftArticles: draftArticles.length,
            totalViews,
            totalComments: 0, // Por enquanto, não temos contador de comentários
            totalLikes: 0, // Por enquanto, não temos contador de likes
            averageViews,
            lastPublished,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Carregando estatísticas...</span>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Estatísticas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalArticles}</div>
            <p className="text-sm text-muted-foreground">Total de Artigos</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.publishedArticles}</div>
            <p className="text-sm text-muted-foreground">Publicados</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <EyeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalViews}</div>
            <p className="text-sm text-muted-foreground">Visualizações</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageSquareIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.totalComments}</div>
            <p className="text-sm text-muted-foreground">Comentários</p>
          </div>
        </div>

        {stats.totalArticles > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{stats.averageViews}</div>
                <p className="text-sm text-muted-foreground">Média de Visualizações</p>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold">{stats.draftArticles}</div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {stats.lastPublished ? formatDate(stats.lastPublished) : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">Última Publicação</p>
              </div>
            </div>
          </div>
        )}

        {stats.totalArticles === 0 && (
          <div className="text-center py-6">
            <div className="text-muted-foreground">
              <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhuma estatística disponível</p>
              <p className="text-xs">Comece a escrever para ver suas estatísticas!</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 