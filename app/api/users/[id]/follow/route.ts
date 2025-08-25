import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const targetUserId = parseInt(params.id);
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Não permitir seguir a si mesmo
    if (currentUser.id === targetUserId) {
      return NextResponse.json({ error: 'Não é possível seguir a si mesmo' }, { status: 400 });
    }

    // Verificar se o usuário alvo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário alvo não encontrado' }, { status: 404 });
    }

    // Verificar se já está seguindo
    const existingFollow = await prisma.follower.findUnique({
      where: {
        follower_id_followed_id: {
          follower_id: currentUser.id,
          followed_id: targetUserId
        }
      }
    });

    if (existingFollow) {
      // Deixar de seguir
      await prisma.follower.delete({
        where: {
          follower_id_followed_id: {
            follower_id: currentUser.id,
            followed_id: targetUserId
          }
        }
      });

      return NextResponse.json({ action: 'unfollowed' });
    } else {
      // Seguir
      await prisma.follower.create({
        data: {
          follower_id: currentUser.id,
          followed_id: targetUserId
        }
      });

      // Criar notificação
      await prisma.notification.create({
        data: {
          user_id: targetUserId,
          type: 'seguido',
          message: `${currentUser.name} começou a seguir você`,
          link: `/profile/${currentUser.id}`
        }
      });

      return NextResponse.json({ action: 'followed' });
    }
  } catch (error) {
    console.error('Erro ao processar follow:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    // Buscar seguidores e seguindo
    const [followers, following] = await Promise.all([
      prisma.follower.findMany({
        where: { followed_id: userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true
            }
          }
        }
      }),
      prisma.follower.findMany({
        where: { follower_id: userId },
        include: {
          followed: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      followers: followers.map(f => f.follower),
      following: following.map(f => f.followed),
      followersCount: followers.length,
      followingCount: following.length
    });
  } catch (error) {
    console.error('Erro ao buscar seguidores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 