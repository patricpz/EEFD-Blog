import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const articleId = parseInt(params.id);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário já deu clap neste artigo
    const existingClap = await prisma.clap.findFirst({
      where: {
        article_id: articleId,
        user_id: user.id
      }
    });

    if (existingClap) {
      // Remover o clap se já existe
      await prisma.clap.delete({
        where: {
          id: existingClap.id
        }
      });

      return NextResponse.json({ action: 'removed' });
    } else {
      // Adicionar novo clap
      await prisma.clap.create({
        data: {
          article_id: articleId,
          user_id: user.id
        }
      });

      return NextResponse.json({ action: 'added' });
    }
  } catch (error) {
    console.error('Erro ao processar clap:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 