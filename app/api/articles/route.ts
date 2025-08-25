import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, subtitle, content, coverImageUrl, status = 'rascunho' } = body;

    // Validações básicas
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o usuário pelo email da sessão
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Criar o artigo
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        content: content.trim(),
        cover_image_url: coverImageUrl?.trim() || null,
        status: status as any, // 'rascunho' | 'pendente' | 'publicado' | 'rejeitado'
        author_id: user.id,
        published_at: status === 'publicado' ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json({
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      status: article.status,
      author: article.author,
      created_at: article.created_at,
      published_at: article.published_at,
    });

  } catch (error) {
    console.error('Erro ao criar artigo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Buscar o usuário pelo email da sessão
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Construir filtros
    const where: any = {
      author_id: user.id,
    };

    if (status) {
      where.status = status;
    }

    // Buscar artigos
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          }
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        content: article.content,
        status: article.status,
        cover_image_url: article.cover_image_url,
        author: article.author,
        created_at: article.created_at,
        updated_at: article.updated_at,
        published_at: article.published_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 