import { prisma } from "@/lib/prisma";
import HeaderBar from "@/components/HeaderBar";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getAllArticles() {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: "publicado",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
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
      orderBy: {
        published_at: "desc",
      },
    });
    return articles;
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    return [];
  }
}

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Todos os Artigos</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Explore artigos sobre diversos temas
          </p>
          <Link href="/write">
            <Button size="lg">
              ✍️ Escrever Artigo
            </Button>
          </Link>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Nenhum artigo publicado ainda</h3>
            <p className="text-muted-foreground mb-6">
              Seja o primeiro a compartilhar suas ideias!
            </p>
            <Link href="/write">
              <Button>Escrever Primeiro Artigo</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-muted-foreground">
              {articles.length} artigo{articles.length !== 1 ? 's' : ''} publicado{articles.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 