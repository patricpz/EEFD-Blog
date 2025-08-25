'use client';

interface ArticlePreviewProps {
  title: string;
  subtitle?: string;
  content: string;
  coverImageUrl?: string;
  className?: string;
}

export function ArticlePreview({
  title,
  subtitle,
  content,
  coverImageUrl,
  className = ""
}: ArticlePreviewProps) {
  return (
    <div className={`prose prose-lg max-w-none dark:prose-invert ${className}`}>
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt={title}
          className="w-full h-48 object-cover rounded-lg mb-6"
        />
      )}
      
      <h1 className="text-3xl font-bold mb-4">
        {title || 'Título do Artigo'}
      </h1>
      
      {subtitle && (
        <p className="text-xl text-muted-foreground mb-6">
          {subtitle}
        </p>
      )}
      
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}  