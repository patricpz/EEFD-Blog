import { prisma } from "@/lib/prisma";
import HeaderBar from "@/components/HeaderBar";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getPublishedArticles() {
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
      take: 20,
    });
    return articles;
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    return [];
  }
}

export default async function Home() {
  const articles = await getPublishedArticles();

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#314E49] to-[#084E6F] text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Compartilhe suas ideias com o mundo
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Uma plataforma para escritores, pensadores e criadores compartilharem suas histórias e conhecimentos.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/write">
              <Button size="lg" className="bg-white text-[#314E49] hover:bg-gray-50">
                Começar a Escrever
              </Button>
            </Link>
            <Link href="/articles">
            <Button size="lg" className="bg-white text-[#314E49] hover:bg-gray-50">
            Explorar Artigos
              </Button>
            </Link>
          </div>
        </div>
        </section>

      {/* Articles Section */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Artigos em Destaque</h2>
          <Link href="/articles">
            <Button variant="outline">Ver Todos</Button>
          </Link>
            </div>

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
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()}  Escola de Extensão. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
