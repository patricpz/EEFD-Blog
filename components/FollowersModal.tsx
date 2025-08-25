'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import FollowButton from './FollowButton';

interface User {
  id: number;
  name: string;
  image?: string;
  bio?: string;
}

interface FollowersModalProps {
  userId: number;
  initialFollowersCount: number;
  initialFollowingCount: number;
  trigger: React.ReactNode;
}

export default function FollowersModal({ 
  userId, 
  initialFollowersCount, 
  initialFollowingCount,
  trigger 
}: FollowersModalProps) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadFollowersData();
    }
  }, [open, userId]);

  const loadFollowersData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/follow`);
      const data = await response.json();
      
      setFollowers(data.followers || []);
      setFollowing(data.following || []);
      setFollowersCount(data.followersCount || 0);
      setFollowingCount(data.followingCount || 0);
    } catch (error) {
      console.error('Erro ao carregar seguidores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpdate = (targetUserId: number, isFollowing: boolean) => {
    // Atualizar contadores quando o usuário segue/deixa de seguir alguém
    if (isFollowing) {
      setFollowingCount(prev => prev + 1);
    } else {
      setFollowingCount(prev => prev - 1);
    }
  };

  const UserList = ({ users, type }: { users: User[], type: 'followers' | 'following' }) => (
    <div className="space-y-3">
      {users.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {type === 'followers' ? 'Nenhum seguidor ainda' : 'Não está seguindo ninguém ainda'}
        </p>
      ) : (
        users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.image || ''} />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{user.name}</h4>
                {user.bio && (
                  <p className="text-sm text-gray-500 truncate max-w-48">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
            <FollowButton
              userId={user.id}
              initialFollowersCount={0}
              showCount={false}
            />
          </div>
        ))
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seguidores e Seguindo
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="followers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Seguidores ({followersCount})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserMinus className="w-4 h-4" />
              Seguindo ({followingCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-4">
            {loading ? (
              <div className="text-center py-8">
                <p>Carregando seguidores...</p>
              </div>
            ) : (
              <UserList users={followers} type="followers" />
            )}
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            {loading ? (
              <div className="text-center py-8">
                <p>Carregando seguindo...</p>
              </div>
            ) : (
              <UserList users={following} type="following" />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 