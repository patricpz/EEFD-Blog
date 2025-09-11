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
    const status = searchParams.get('status');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (q) {
      const query = q.trim();
      if (query.length > 0) {
        whereClause.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { subtitle: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { author: { name: { contains: query, mode: 'insensitive' } } }
        ];
      }
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              claps: true,
              comments: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.article.count({ where: whereClause })
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
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

    const { articleId, status, comments } = await request.json();

    if (!articleId || !status) {
      return NextResponse.json({ error: 'ID do artigo e status são obrigatórios' }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    // Atualizar status do artigo
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        status,
        published_at: status === 'publicado' ? new Date() : null
      }
    });

    // Criar review se houver comentários
    if (comments) {
      await prisma.articleReview.create({
        data: {
          article_id: articleId,
          reviewer_id: user.id,
          status: status === 'publicado' ? 'aprovado' : 'rejeitado',
          comments,
          reviewed_at: new Date()
        }
      });
    }

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error);
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
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json({ error: 'ID do artigo é obrigatório' }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: parseInt(articleId) }
    });

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    // Deletar o artigo (cascade irá deletar comentários, claps, etc.)
    await prisma.article.delete({
      where: { id: parseInt(articleId) }
    });

    return NextResponse.json({ message: 'Artigo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar artigo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 