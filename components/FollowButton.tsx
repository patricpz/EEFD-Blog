'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Users } from 'lucide-react';

interface FollowButtonProps {
  userId: number;
  initialFollowersCount: number;
  initialIsFollowing?: boolean;
  showCount?: boolean;
}

export default function FollowButton({ 
  userId, 
  initialFollowersCount, 
  initialIsFollowing = false,
  showCount = true 
}: FollowButtonProps) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!session?.user) {
      // Redirecionar para login ou mostrar modal
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST'
      });

      if (response.ok) {
        const { action } = await response.json();
        if (action === 'followed') {
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
        } else {
          setIsFollowing(false);
          setFollowersCount(prev => prev - 1);
        }
      }
    } catch (error) {
      console.error('Erro ao processar follow:', error);
    } finally {
      setLoading(false);
    }
  };

  // Não mostrar o botão se o usuário está tentando seguir a si mesmo
  // Vamos verificar se o usuário atual tem o mesmo ID
  const currentUserId = session?.user?.id;
  if (currentUserId && typeof currentUserId === 'number' && currentUserId === userId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        onClick={handleFollow}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {isFollowing ? (
          <>
            <UserMinus className="w-4 h-4" />
            Deixar de Seguir
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Seguir
          </>
        )}
      </Button>
      
      {showCount && (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{followersCount}</span>
        </div>
      )}
    </div>
  );
} 