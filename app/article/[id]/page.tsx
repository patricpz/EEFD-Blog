import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HeaderBar from "@/components/HeaderBar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

interface ArticlePageProps {
  params: {
    id: string;
  };
}

async function getArticle(id: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            claps: true,
            comments: true,
          },
        },
      },
    });

    return article;
  } catch (error) {
    console.error("Erro ao buscar artigo:", error);
    return null;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  // Função simples para converter markdown básico para HTML
  const renderContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^/g, '<p class="mb-4">')
      .replace(/$/g, '</p>');
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag) => (
                <span
                  key={tag.tag.id}
                  className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full"
                >
                  {tag.tag.name}
                </span>
              ))}
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {article.subtitle}
            </p>
          )}
          
          {/* Author Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
              {article.author.image ? (
                <Image
                  src={article.author.image}
                  alt={article.author.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  {article.author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {article.author.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(article.published_at || article.created_at)}
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 border-t border-b border-gray-200 dark:border-gray-700 py-4">
            <span className="flex items-center gap-2">
              <span>👏</span>
              <span>{article._count.claps} claps</span>
            </span>
            <span className="flex items-center gap-2">
              <span>💬</span>
              <span>{article._count.comments} comentários</span>
            </span>
            <span className="flex items-center gap-2">
              <span>📖</span>
              <span>{Math.ceil(article.content.length / 200)} min de leitura</span>
            </span>
          </div>
        </header>

        {/* Cover Image */}
        {article.cover_image_url && (
          <div className="mb-8">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              width={800}
              height={400}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: renderContent(article.content) 
            }}
            className="text-gray-800 dark:text-gray-200 leading-relaxed"
          />
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                👏 Aplaudir
              </Button>
              <Button variant="outline" size="sm">
                💬 Comentar
              </Button>
              <Button variant="outline" size="sm">
                📤 Compartilhar
              </Button>
            </div>
            
            <Link href="/write">
              <Button size="sm">
                ✍️ Escrever Artigo
              </Button>
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
} 