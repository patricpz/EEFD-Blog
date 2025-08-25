import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.role !== 'moderador' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          bio: true,
          profile_picture_url: true,
          created_at: true,
          _count: {
            select: {
              articles: true,
              followers: true,
              following: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.role !== 'moderador' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'ID do usuário e role são obrigatórios' }, { status: 400 });
    }

    // Verificar se o usuário alvo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Não permitir que moderadores alterem admins
    if (targetUser.role === 'admin' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Não é possível alterar usuários admin' }, { status: 403 });
    }

    // Atualizar role do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        profile_picture_url: true,
        created_at: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.role !== 'moderador' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Não permitir deletar a si mesmo
    if (targetUser.id === user.id) {
      return NextResponse.json({ error: 'Não é possível deletar sua própria conta' }, { status: 400 });
    }

    // Não permitir que moderadores deletem admins
    if (targetUser.role === 'admin' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Não é possível deletar usuários admin' }, { status: 403 });
    }

    // Deletar o usuário (cascade irá deletar artigos, comentários, etc.)
    await prisma.user.delete({
      where: { id: parseInt(userId) }
    });

    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 