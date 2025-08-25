'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
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
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [newUserRole, setNewUserRole] = useState('');

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
    
    const response = await fetch(`/api/admin/articles?${params}`);
    const data = await response.json();
    setArticles(data.articles || []);
  };

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (userRoleFilter) params.append('role', userRoleFilter);
    
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
        }
      }
    } catch (error) {
      console.error('Erro ao processar ação:', error);
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
        }
      }
    } catch (error) {
      console.error('Erro ao processar ação:', error);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Moderador</h1>
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
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar artigos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={articleStatusFilter} onValueChange={setArticleStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  {/* <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent> */}
                </Select>
                <Button onClick={loadArticles} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedArticle(article)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Revisar Artigo</DialogTitle>
                              <DialogDescription>
                                {article.title}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Comentários da revisão (opcional)"
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => handleArticleAction('reject', article.id)}
                                variant="destructive"
                              >
                                Rejeitar
                              </Button>
                              <Button
                                onClick={() => handleArticleAction('approve', article.id)}
                              >
                                Aprovar
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
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por role" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="">Todas as roles</SelectItem>
                    <SelectItem value="leitor">Leitor</SelectItem>
                    <SelectItem value="autor">Autor</SelectItem>
                    <SelectItem value="moderador">Moderador</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem> */}
                  </SelectContent>
                </Select>
                <Button onClick={loadUsers} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Alterar Role do Usuário</DialogTitle>
                              <DialogDescription>
                                {user.name} - {user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select value={newUserRole} onValueChange={setNewUserRole}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a nova role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="leitor">Leitor</SelectItem>
                                  <SelectItem value="autor">Autor</SelectItem>
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