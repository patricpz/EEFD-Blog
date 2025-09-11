'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Loader2
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  bio?: string;
  profile_picture_url?: string;
  created_at: string;
  _count: {
    articles: number;
    followers: number;
    following: number;
  };
}

interface Article {
  id: number;
  title: string;
  subtitle?: string;
  status: string;
  created_at: string;
  published_at?: string;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  tags: Array<{
    tag: {
      id: number;
      name: string;
    };
  }>;
  _count: {
    claps: number;
    comments: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleStatusFilter, setArticleStatusFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      redirect('/login');
    }

    // Verificar se o usuário é moderador ou admin
    checkUserRole();
  }, [session, status]);

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const userData = await response.json();
      
      if (userData.role !== 'moderador' && userData.role !== 'admin') {
        redirect('/');
      }
      
      loadData();
    } catch (error) {
      console.error('Erro ao verificar role:', error);
      redirect('/');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadArticles(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    const params = new URLSearchParams();
    if (articleStatusFilter) params.append('status', articleStatusFilter);
    if (searchTerm) params.append('q', searchTerm);
    
    const response = await fetch(`/api/admin/articles?${params}`);
    const data = await response.json();
    setArticles(data.articles || []);
  };

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (userRoleFilter) params.append('role', userRoleFilter);
    if (userSearchTerm) params.append('q', userSearchTerm);
    
    const response = await fetch(`/api/admin/users?${params}`);
    const data = await response.json();
    setUsers(data.users || []);
  };

  const handleArticleAction = async (action: 'approve' | 'reject' | 'delete', articleId: number) => {
    try {
      if (action === 'delete') {
        const response = await fetch(`/api/admin/articles?id=${articleId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setArticles(articles.filter(article => article.id !== articleId));
          showToast('success', 'Artigo deletado com sucesso');
        } else {
          showToast('error', 'Falha ao deletar artigo');
        }
      } else {
        const status = action === 'approve' ? 'publicado' : 'rejeitado';
        const response = await fetch('/api/admin/articles', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            articleId,
            status,
            comments: reviewComments
          })
        });
        
        if (response.ok) {
          await loadArticles();
          setReviewComments('');
          setSelectedArticle(null);
          showToast('success', action === 'approve' ? 'Artigo aprovado' : 'Artigo rejeitado');
        } else {
          showToast('error', 'Falha ao atualizar artigo');
        }
      }
    } catch (error) {
      console.error('Erro ao processar ação:', error);
      showToast('error', 'Erro interno ao processar ação');
    }
  };

  const handleUserAction = async (action: 'update' | 'delete', userId: number) => {
    try {
      if (action === 'delete') {
        const response = await fetch(`/api/admin/users?id=${userId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setUsers(users.filter(user => user.id !== userId));
          showToast('success', 'Usuário deletado com sucesso');
        } else {
          showToast('error', 'Falha ao deletar usuário');
        }
      } else if (action === 'update' && newUserRole) {
        const response = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            role: newUserRole
          })
        });
        
        if (response.ok) {
          await loadUsers();
          setNewUserRole('');
          setSelectedUser(null);
          setIsUserDialogOpen(false);
          showToast('success', 'Usuário atualizado com sucesso');
        } else {
          const data = await response.json().catch(() => null);
          showToast('error', data?.error || 'Falha ao atualizar usuário');
        }
      }
    } catch (error) {
      console.error('Erro ao processar ação:', error);
      showToast('error', 'Erro interno ao processar ação');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      rascunho: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      pendente: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      publicado: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejeitado: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.rascunho;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      leitor: { color: 'bg-blue-100 text-blue-800' },
      autor: { color: 'bg-purple-100 text-purple-800' },
      moderador: { color: 'bg-orange-100 text-orange-800' },
      admin: { color: 'bg-red-100 text-red-800' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.leitor;
    
    return (
      <Badge className={config.color}>
        {role}
      </Badge>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-md px-4 py-3 shadow-lg border text-sm ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'}`}>
          {toast.message}
        </div>
      )}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold">Dashboard de Moderador</h1>
          <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Voltar ao Início
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie artigos e usuários da plataforma
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Artigos
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Artigos</CardTitle>
              <CardDescription>
                Aprove, rejeite ou delete artigos da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6 flex-col sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar artigos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {articles.map((article) => (
                  <Card key={article.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{article.title}</h3>
                          {getStatusBadge(article.status)}
                        </div>
                        {article.subtitle && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {article.subtitle}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Por: {article.author.name}</span>
                          <span>👏 {article._count.claps}</span>
                          <span>💬 {article._count.comments}</span>
                          <span>
                            {formatDistanceToNow(new Date(article.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          asChild
                          variant="outline" 
                          size="sm"
                        >
                          <a href={`/article/${article.id}`} target="_blank" rel="noopener noreferrer" aria-label="Ver artigo">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar Artigo</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar este artigo? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleArticleAction('delete', article.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6 flex-col sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar usuários..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="max-w-sm w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          {user.profile_picture_url ? (
                            <img
                              src={user.profile_picture_url}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(user.role)}
                            <span className="text-xs text-gray-500">
                              {user._count.articles} artigos • {user._count.followers} seguidores
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => { setSelectedUser(user); setNewUserRole(user.role); setIsUserDialogOpen(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Alterar tipo de Usuário</DialogTitle>
                              <DialogDescription>
                                {user.name} - {user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select value={newUserRole} onValueChange={setNewUserRole}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o novo tipo de usuário" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="leitor">Leitor</SelectItem>
                                  <SelectItem value="autor">Escritor</SelectItem>
                                  <SelectItem value="moderador">Moderador</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => handleUserAction('update', user.id)}
                                disabled={!newUserRole}
                              >
                                Atualizar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar Usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleUserAction('delete', user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 