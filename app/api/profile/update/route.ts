import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name, email, bio, image } = await request.json();

    // Validação básica
    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 });
    }

    // Buscar o usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se o novo email já está em uso por outro usuário
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== currentUser.id) {
        return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 });
      }
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        email,
        image: image || null,
        // Adicionar bio se o campo existir no schema
        // bio: bio || null,
      }
    });

    return NextResponse.json({ 
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
