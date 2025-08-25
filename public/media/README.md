# Pasta de Mídia

Esta pasta contém todos os arquivos de mídia do blog organizados por categoria.

## Estrutura de Pastas

### `/images/`
- **`articles/`** - Imagens para usar nos artigos do blog
- **`avatars/`** - Fotos de perfil dos usuários
- **`banners/`** - Imagens de banner e cabeçalho

### `/gifs/`
- GIFs animados para usar no blog

### `/videos/`
- Vídeos para incorporar nos artigos

## Como Usar

Para referenciar uma imagem no seu código Next.js:

```jsx
import Image from 'next/image'

// Para uma imagem de artigo
<Image 
  src="/media/images/articles/minha-imagem.jpg" 
  alt="Descrição da imagem"
  width={800}
  height={600}
/>

// Para um GIF
<img src="/media/gifs/meu-gif.gif" alt="Descrição do GIF" />
```

## Formatos Suportados

- **Imagens**: JPG, PNG, WebP, SVG
- **GIFs**: GIF animado
- **Vídeos**: MP4, WebM

## Dicas

1. Use nomes descritivos para os arquivos
2. Otimize as imagens antes de fazer upload
3. Para melhor performance, prefira WebP quando possível
4. Mantenha os arquivos organizados nas subpastas apropriadas
