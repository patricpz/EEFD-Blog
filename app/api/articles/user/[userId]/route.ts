import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário está tentando acessar seus próprios artigos
    if (session.user.id !== params.userId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const articles = await prisma.article.findMany({
      where: {
        author_id: parseInt(params.userId),
      },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        published_at: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Transformar os dados para o formato esperado pelo frontend
    const transformedArticles = articles.map(article => ({
      id: article.id.toString(),
      title: article.title,
      content: article.content,
      published: article.status === 'publicado',
      publishedAt: article.published_at,
      createdAt: article.created_at.toISOString(),
      updatedAt: article.updated_at.toISOString(),
      viewCount: 0, // Por enquanto, não temos contador de visualizações
    }));

    return NextResponse.json({
      articles: transformedArticles,
      count: transformedArticles.length,
    });
  } catch (error) {
    console.error('Erro ao buscar artigos do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 