'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send,
  User
} from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    image?: string;
  };
}

interface ArticleInteractionsProps {
  articleId: number;
  initialClaps: number;
  initialComments: number;
  initialHasClapped?: boolean;
}

export default function ArticleInteractions({ 
  articleId, 
  initialClaps, 
  initialComments,
  initialHasClapped = false 
}: ArticleInteractionsProps) {
  const { data: session } = useSession();
  const [claps, setClaps] = useState(initialClaps);
  const [hasClapped, setHasClapped] = useState(initialHasClapped);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, articleId]);

  useEffect(() => {
    if (session?.user) {
      checkUserClapStatus();
    }
  }, [session, articleId]);

  const checkUserClapStatus = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/clap-status`);
      if (response.ok) {
        const { hasClapped } = await response.json();
        setHasClapped(hasClapped);
      }
    } catch (error) {
      console.error('Erro ao verificar status do clap:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const handleClap = async () => {
    if (!session?.user) {
      // Redirecionar para login ou mostrar modal
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}/clap`, {
        method: 'POST'
      });

      if (response.ok) {
        const { action } = await response.json();
        if (action === 'added') {
          setClaps(prev => prev + 1);
          setHasClapped(true);
        } else {
          setClaps(prev => prev - 1);
          setHasClapped(false);
        }
      }
    } catch (error) {
      console.error('Erro ao processar clap:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!session?.user || !newComment.trim()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setCommentCount(prev => prev + 1);
        setNewComment('');
      }
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Artigo compartilhado',
          text: 'Confira este artigo interessante!',
          url: window.location.href
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
      } catch (error) {
        console.error('Erro ao copiar link:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Botões de Interação */}
      <div className="flex items-center gap-4 border-t border-b py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClap}
          disabled={loading}
          className={`flex items-center gap-2 ${hasClapped ? 'text-red-500' : ''}`}
        >
          <Heart className={`w-5 h-5 ${hasClapped ? 'fill-current' : ''}`} />
          <span>{claps}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{commentCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          <span>Compartilhar</span>
        </Button>
      </div>

      {/* Seção de Comentários */}
      {showComments && (
        <Card>
          <CardHeader>
            <CardTitle>Comentários ({commentCount})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulário de novo comentário */}
            {session?.user && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={session.user.image || ''} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleComment}
                      disabled={!newComment.trim() || loading}
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Comentar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de comentários */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user.image || ''} />
                    <AvatarFallback>
                      {comment.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 