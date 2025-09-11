'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import ArticleInteractions from "./ArticleInteractions";

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    subtitle?: string | null;
    cover_image_url?: string | null;
    content: string;
    created_at: Date;
    published_at?: Date | null;
    author: {
      id: number;
      name: string;
      image?: string | null;
    };
    tags: Array<{
      tag: {
        id: number;
        name: string;
      };
    }>;
    _count: {
      claps: number;
      comments: number;
    };
  };
  showInteractions?: boolean;
}

export default function ArticleCard({ article, showInteractions = true }: ArticleCardProps) {
  const [authorImageError, setAuthorImageError] = useState(false);
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR
    });
  };

  return (
    <article className="py-8 border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors duration-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 min-w-0">
        {/* Content - Left Side */}
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
              {article.author.image && !authorImageError ? (
                <Image
                  src={article.author.image}
                  alt={article.author.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                  onError={() => setAuthorImageError(true)}
                  unoptimized
                />
              ) : (
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {article.author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {article.author.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              · {formatDate(article.published_at || article.created_at)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/article/${article.id}`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors break-words">
              {article.title}
            </h2>
          </Link>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 text-base break-words">
              {article.subtitle}
            </p>
          )}

          {/* Content Preview */}
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed break-words">
            {truncateText(article.content.replace(/<[^>]*>/g, ''), 120)}
          </p>

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            {/* Tags and Stats */}
            <div className="flex items-center gap-4">
              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex gap-2">
                  {article.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.tag.id}
                      className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded-full"
                    >
                      {tag.tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span>👏</span>
                  <span>{article._count.claps}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>💬</span>
                  <span>{article._count.comments}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Interações funcionais */}
          {showInteractions && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
              <ArticleInteractions
                articleId={article.id}
                initialClaps={article._count.claps}
                initialComments={article._count.comments}
              />
            </div>
          )}
        </div>

        {/* Image - Right Side */}
        {article.cover_image_url && (
          <div className="flex-shrink-0 sm:ml-2">
            <div className="relative w-full h-40 sm:w-28 sm:h-28 rounded-md overflow-hidden">
              <Image
                src={article.cover_image_url}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 112px"
                priority={false}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
} 